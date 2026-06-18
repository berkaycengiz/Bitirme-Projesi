import { create } from 'zustand';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import api, { API_BASE_URL } from '../services/api';

export interface OrderDetailModel {
  productId: number;
  productName: string;
  quantity: number;
  note: string | null;
}

export interface ActiveOrderModel {
  orderId: number;
  tableNumber: number;
  status: string; // "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled"
  orderTime: string;
  totalAmount: number;
  details: OrderDetailModel[];
}

export interface TableModel {
  tableID: number;
  tableNumber: number;
  qrCode: string;
  isOccupied: boolean;
  activeOrderId: number | null;
  activeOrderTotalPrice: number | null;
  status: 'empty' | 'dining' | 'waiting_bill'; // UI local status
}

export interface ServiceRequestModel {
  tableNumber: number;
  requestType: 'CallWaiter' | 'RequestBill';
  requestTime: string;
}

interface OrderState {
  activeOrders: ActiveOrderModel[];
  tables: TableModel[];
  deliveries: ActiveOrderModel[];
  serviceRequests: ServiceRequestModel[];
  connection: HubConnection | null;
  isConnecting: boolean;

  fetchActiveOrders: () => Promise<void>;
  fetchTables: () => Promise<void>;
  connectSignalR: (role: string) => Promise<void>;
  disconnectSignalR: () => void;

  updateOrderStatus: (orderId: number, newStatus: number) => Promise<void>;
  updateTableStatus: (tableNumber: number, isOccupied: boolean) => Promise<void>;
  sendServiceRequest: (tableNumber: number, requestType: string) => Promise<boolean>;
  dismissServiceRequest: (tableNumber: number, requestType: string) => void;
}

export const useOrderStore = create<OrderState>((set, get) => {
  return {
    activeOrders: [],
    tables: [],
    deliveries: [],
    serviceRequests: [],
    connection: null,
    isConnecting: false,

    fetchActiveOrders: async () => {
      try {
        const response = await api.get('/api/order/active');
        const orders: ActiveOrderModel[] = response.data;
        
        // Deliveries are active orders with status "Ready"
        const deliveries = orders.filter(o => o.status === 'Ready');

        set({ 
          activeOrders: orders,
          deliveries: deliveries
        });
      } catch (error) {
        console.error('Fetch active orders failed:', error);
      }
    },

    fetchTables: async () => {
      try {
        const response = await api.get('/api/table');
        const data = response.data;

        const mappedTables: TableModel[] = data.map((t: any) => {
          // Deduce initial UI status
          let status: 'empty' | 'dining' | 'waiting_bill' = 'empty';
          if (t.isOccupied) {
            status = 'dining';
          }
          return {
            tableID: t.tableID,
            tableNumber: t.tableNumber,
            qrCode: t.qrCode,
            isOccupied: t.isOccupied,
            activeOrderId: t.activeOrderId,
            activeOrderTotalPrice: t.activeOrderTotalPrice,
            status: status
          };
        });

        set({ tables: mappedTables });
      } catch (error) {
        console.error('Fetch tables failed:', error);
      }
    },

    connectSignalR: async (role) => {
      if (get().connection || get().isConnecting) return;

      set({ isConnecting: true });

      const conn = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/orderHub`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Setup Listeners
      conn.on('ReceiveNewOrder', (newOrder) => {
        console.log('SignalR: ReceiveNewOrder', newOrder);
        set((state) => {
          // If already in list, do nothing
          if (state.activeOrders.some(o => o.orderId === newOrder.orderId)) return state;
          
          // Map backend casing to frontend casing
          const mappedOrder: ActiveOrderModel = {
            orderId: newOrder.orderId,
            tableNumber: newOrder.tableNumber,
            status: newOrder.status,
            orderTime: newOrder.orderTime,
            totalAmount: newOrder.totalAmount,
            details: newOrder.details.map((d: any) => ({
              productId: d.productId,
              productName: d.productName || 'Yemek', // productName might not be in event, but we'll fetch it or fall back
              quantity: d.quantity,
              note: d.note
            }))
          };

          // Also update the table info to occupied/dining
          const updatedTables: TableModel[] = state.tables.map(t => {
            if (t.tableNumber === newOrder.tableNumber) {
              return {
                ...t,
                isOccupied: true,
                status: t.status === 'waiting_bill' ? 'waiting_bill' : 'dining',
                activeOrderId: newOrder.orderId,
                activeOrderTotalPrice: newOrder.totalAmount
              };
            }
            return t;
          });

          return {
            activeOrders: [...state.activeOrders, mappedOrder],
            tables: updatedTables
          };
        });

        // Trigger refetch of products details if product names are missing in SignalR payload
        get().fetchActiveOrders();
      });

      conn.on('OrderStatusChanged', (data) => {
        console.log('SignalR: OrderStatusChanged', data);
        const { orderId, tableNumber, newStatus } = data;

        set((state) => {
          // Update order status in activeOrders list
          const updatedActive = state.activeOrders.map(o => {
            if (o.orderId === orderId) {
              return { ...o, status: newStatus };
            }
            return o;
          });

          // Check if order is completed or cancelled
          const isFinished = newStatus === 'Completed' || newStatus === 'Cancelled';
          
          // Filter out finished orders from activeOrders and deliveries
          const activeOrders = isFinished 
            ? updatedActive.filter(o => o.orderId !== orderId)
            : updatedActive;

          // Manage Deliveries
          let deliveries = [...state.deliveries];
          if (newStatus === 'Ready') {
            const readyOrder = updatedActive.find(o => o.orderId === orderId);
            if (readyOrder && !deliveries.some(d => d.orderId === orderId)) {
              deliveries.push(readyOrder);
            }
          } else if (isFinished) {
            deliveries = deliveries.filter(d => d.orderId !== orderId);
          } else {
            // Update status of delivery if it's there
            deliveries = deliveries.map(d => d.orderId === orderId ? { ...d, status: newStatus } : d);
          }

          // Update Table active order status
          const updatedTables: TableModel[] = state.tables.map(t => {
            if (t.tableNumber === tableNumber) {
              if (isFinished) {
                return {
                  ...t,
                  isOccupied: false,
                  status: 'empty',
                  activeOrderId: null,
                  activeOrderTotalPrice: null
                };
              } else {
                return {
                  ...t,
                  activeOrderId: orderId
                };
              }
            }
            return t;
          });

          return {
            activeOrders,
            deliveries,
            tables: updatedTables
          };
        });
      });

      conn.on('ReceiveServiceRequest', (data) => {
        console.log('SignalR: ReceiveServiceRequest', data);
        const { tableNumber, requestType, requestTime } = data;

        set((state) => {
          const newRequest: ServiceRequestModel = { tableNumber, requestType, requestTime };
          
          // Update table status if it's bill request
          const updatedTables: TableModel[] = state.tables.map(t => {
            if (t.tableNumber === tableNumber) {
              return {
                ...t,
                status: requestType === 'RequestBill' ? 'waiting_bill' : t.status
              };
            }
            return t;
          });

          return {
            serviceRequests: [newRequest, ...state.serviceRequests],
            tables: updatedTables
          };
        });
      });

      conn.on('TableStatusChanged', (data) => {
        console.log('SignalR: TableStatusChanged', data);
        const { tableNumber, isOccupied } = data;

        set((state) => {
          const updatedTables: TableModel[] = state.tables.map(t => {
            if (t.tableNumber === tableNumber) {
              return {
                ...t,
                isOccupied: isOccupied,
                status: isOccupied 
                  ? (t.status === 'waiting_bill' ? 'waiting_bill' : 'dining')
                  : 'empty',
                activeOrderId: isOccupied ? t.activeOrderId : null,
                activeOrderTotalPrice: isOccupied ? t.activeOrderTotalPrice : null
              };
            }
            return t;
          });

          return { tables: updatedTables };
        });
      });

      try {
        await conn.start();
        console.log('SignalR Connected!');

        // Join appropriate group
        if (role === 'chef') {
          await conn.invoke('JoinKitchenGroup');
          console.log('SignalR: Joined KitchenGroup');
        } else if (role === 'waiter' || role === 'admin') {
          await conn.invoke('JoinWaiterGroup');
          console.log('SignalR: Joined WaiterGroup');
        }

        set({ connection: conn, isConnecting: false });
      } catch (error) {
        console.error('SignalR Connection Failed:', error);
        set({ isConnecting: false });
      }
    },

    disconnectSignalR: () => {
      const { connection } = get();
      if (connection) {
        connection.stop();
        set({ connection: null, serviceRequests: [] });
        console.log('SignalR Disconnected!');
      }
    },

    updateOrderStatus: async (orderId, newStatus) => {
      try {
        await api.patch('/api/order/UpdateStatus', { orderId, newStatus });
        // The local state will be updated by the OrderStatusChanged SignalR event
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    },

    updateTableStatus: async (tableNumber, isOccupied) => {
      try {
        await api.patch(`/api/table/${tableNumber}/status`, isOccupied);
        // The local state will be updated by the TableStatusChanged SignalR event
      } catch (error) {
        console.error('Failed to update table status:', error);
      }
    },

    sendServiceRequest: async (tableNumber, requestType) => {
      try {
        const response = await api.post(`/api/table/${tableNumber}/service-request`, JSON.stringify(requestType), {
          headers: { 'Content-Type': 'application/json' }
        });
        return response.data.isSuccess;
      } catch (error) {
        console.error('Failed to send service request:', error);
        return false;
      }
    },

    dismissServiceRequest: (tableNumber, requestType) => {
      set((state) => ({
        serviceRequests: state.serviceRequests.filter(
          (r) => !(r.tableNumber === tableNumber && r.requestType === requestType)
        )
      }));
    }
  };
});
