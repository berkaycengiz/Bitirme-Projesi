import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, ClipboardCheck, ArrowRight, BellRing, LogOut, Coffee } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';
import type { TableModel, ActiveOrderModel, OrderDetailModel } from '../store/useOrderStore';
import api from '../services/api';

interface AggregatedItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

const Waiter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tables' | 'deliveries'>('tables');
  const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedItemsToPay, setSelectedItemsToPay] = useState<Record<number, number>>({});

  const { isAuthenticated, role, logout } = useAuthStore();
  const { 
    tables, 
    activeOrders,
    deliveries, 
    serviceRequests,
    dismissServiceRequest,
    fetchTables, 
    fetchActiveOrders, 
    connectSignalR, 
    disconnectSignalR,
    updateOrderStatus,
    updateTableStatus
  } = useOrderStore();

  // Route protection
  useEffect(() => {
    if (!isAuthenticated || (role !== 'waiter' && role !== 'admin')) {
      navigate('/login');
    }
  }, [isAuthenticated, role, navigate]);

  // SignalR and data loading
  useEffect(() => {
    if (isAuthenticated && (role === 'waiter' || role === 'admin')) {
      fetchTables();
      fetchActiveOrders();
      connectSignalR('waiter');
    }
    return () => {
      disconnectSignalR();
    };
  }, [isAuthenticated, role, fetchTables, fetchActiveOrders, connectSignalR, disconnectSignalR]);

  const handleTableClick = (table: TableModel) => {
    setSelectedTable(table);
    setSelectedItemsToPay({});
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
    setSelectedItemsToPay({});
  };

  const handleToggleOccupied = async (table: TableModel) => {
    setActionLoading(true);
    await updateTableStatus(table.tableNumber, !table.isOccupied);
    setSelectedTable(null);
    setSelectedItemsToPay({});
    setActionLoading(false);
    // Refresh tables list
    fetchTables();
  };

  const handleSettleBill = async (table: TableModel) => {
    if (!table.activeOrderId) return;
    setActionLoading(true);
    
    // Complete the active order (which will update table status to unoccupied)
    await updateOrderStatus(table.activeOrderId, 3); // 3 = Completed
    
    // Also explicitly set table as empty
    await updateTableStatus(table.tableNumber, false);
    
    setSelectedTable(null);
    setSelectedItemsToPay({});
    setActionLoading(false);
    
    // Refresh
    fetchTables();
    fetchActiveOrders();
  };

  const handleDeliverOrder = async (orderId: number) => {
    // Delivery complete means status becomes Served (5)
    await updateOrderStatus(orderId, 5);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleIncrement = (productId: number, maxQty: number) => {
    setSelectedItemsToPay(prev => {
      const current = prev[productId] || 0;
      if (current < maxQty) {
        return { ...prev, [productId]: current + 1 };
      }
      return prev;
    });
  };

  const handleDecrement = (productId: number) => {
    setSelectedItemsToPay(prev => {
      const current = prev[productId] || 0;
      if (current > 0) {
        const updated = { ...prev, [productId]: current - 1 };
        if (updated[productId] === 0) {
          delete updated[productId];
        }
        return updated;
      }
      return prev;
    });
  };

  const handlePaySelectedItems = async () => {
    if (!selectedTable) return;

    const items = Object.entries(selectedItemsToPay)
      .map(([productIdStr, quantity]) => ({
        productId: parseInt(productIdStr, 10),
        quantity
      }))
      .filter(item => item.quantity > 0);

    if (items.length === 0) return;

    setActionLoading(true);
    try {
      const response = await api.post('/api/order/pay-items', {
        tableNumber: selectedTable.tableNumber,
        items
      });

      if (response.data.isSuccess) {
        setSelectedItemsToPay({});
        await fetchTables();
        await fetchActiveOrders();

        // Check if the table became empty/unoccupied
        const updatedTable = useOrderStore.getState().tables.find(t => t.tableNumber === selectedTable.tableNumber);
        if (!updatedTable || !updatedTable.isOccupied) {
          setSelectedTable(null);
        }
      } else {
        alert(response.data.message || 'Ödeme başarısız.');
      }
    } catch (error: any) {
      console.error('Ödeme hatası:', error);
      alert(error.response?.data?.message || 'Ödeme sırasında bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  // Format table name visually (e.g. TableNumber = 8 -> Masa 08, 10 -> Masa 10, etc.)
  const formatTableName = (num: number) => {
    return num < 10 ? `Masa 0${num}` : `Masa ${num}`;
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col font-display text-gray-800 relative pb-24">
      <Navbar />

      {/* Floating Logout Button */}
      <button 
        onClick={handleLogout}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl z-40 active:scale-95 transition-transform flex items-center gap-2 font-black text-sm"
      >
        <LogOut size={20} />
        <span>Çıkış Yap</span>
      </button>

      {/* Header Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="w-full max-w-7xl mx-auto px-5 md:px-10 py-4 flex gap-4">
          <button 
            onClick={() => { setActiveTab('tables'); setSelectedTable(null); }}
            className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
              activeTab === 'tables' 
                ? 'bg-secondary text-white shadow-lg shadow-secondary/30' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid size={18} />
            Masa Düzeni
          </button>
          <button 
            onClick={() => { setActiveTab('deliveries'); setSelectedTable(null); }}
            className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 relative ${
              activeTab === 'deliveries' 
                ? 'bg-secondary text-white shadow-lg shadow-secondary/30' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <ClipboardCheck size={18} />
            Hazır Teslimatlar
            {deliveries.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white items-center justify-center p-2 font-black">
                  {deliveries.length}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto mt-6">
        
        {/* Masa Düzeni Tab */}
        {activeTab === 'tables' && (
          <div className="px-5 md:px-10">
            {/* Active Service Requests / Alerts */}
            {serviceRequests.length > 0 && (
              <div className="mb-6 flex flex-col gap-2 max-w-xl animate-in fade-in duration-300">
                <h4 className="font-extrabold text-amber-600 text-xs tracking-wider uppercase flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Aktif Çağrılar ({serviceRequests.length})
                </h4>
                {serviceRequests.map((req, idx) => (
                  <div key={idx} className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex justify-between items-center shadow-xs">
                    <span className="font-bold text-sm text-amber-900">
                      {formatTableName(req.tableNumber)} - {req.requestType === 'CallWaiter' ? 'Garson Çağırıyor 🔔' : 'Hesap İstiyor 🧾'} ({req.requestTime})
                    </span>
                    <button 
                      onClick={() => dismissServiceRequest(req.tableNumber, req.requestType)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl active:scale-95 transition-all shadow-sm"
                    >
                      Kapat
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map(table => {
                const totalBill = table.activeOrderTotalPrice;
                return (
                  <button 
                    key={table.tableID}
                    onClick={() => handleTableClick(table)}
                    className={`relative p-5 rounded-3xl shadow-sm border transition-all active:scale-95 flex flex-col items-center justify-center gap-2 h-32 ${
                      table.status === 'empty' ? 'bg-white border-gray-100 hover:border-gray-300' :
                      table.status === 'dining' ? 'bg-primary/10 border-primary shadow-primary/10' :
                      'bg-secondary/15 border-secondary shadow-secondary/10 ring-4 ring-secondary/10 animate-pulse'
                    }`}
                  >
                    <span className={`font-black text-lg ${
                      table.status === 'empty' ? 'text-gray-400' :
                      table.status === 'dining' ? 'text-primary-foreground font-black' :
                      'text-secondary'
                    }`}>
                      {formatTableName(table.tableNumber)}
                    </span>
                    
                    {table.status !== 'empty' && totalBill !== null && (
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-gray-800 mt-1">₺{totalBill}</span>
                      </div>
                    )}

                    {table.status === 'waiting_bill' && (
                      <div className="absolute -top-2 -right-2 bg-secondary text-white p-1.5 rounded-xl shadow-md">
                        <BellRing size={16} className="animate-bounce" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Table Details / Actions Modal */}
            {selectedTable && (() => {
              const currentTable = tables.find(t => t.tableNumber === selectedTable.tableNumber) || selectedTable;
              const tableOrders = activeOrders.filter((o: ActiveOrderModel) => o.tableNumber === currentTable.tableNumber);
              
              const aggregatedItems = tableOrders.reduce((acc: AggregatedItem[], order: ActiveOrderModel) => {
                order.details.forEach((detail: OrderDetailModel) => {
                  const existing = acc.find((item: AggregatedItem) => item.productId === detail.productId);
                  if (existing) {
                    existing.quantity += detail.quantity;
                  } else {
                    acc.push({
                      productId: detail.productId,
                      productName: detail.productName,
                      quantity: detail.quantity,
                      unitPrice: detail.unitPrice
                    });
                  }
                });
                return acc;
              }, [] as AggregatedItem[]);

              const selectedTotal = Object.entries(selectedItemsToPay).reduce((sum: number, [prodIdStr, qty]: [string, number]) => {
                const prodId = parseInt(prodIdStr, 10);
                const item = aggregatedItems.find((i: AggregatedItem) => i.productId === prodId);
                if (item) {
                  return sum + (item.unitPrice * qty);
                }
                return sum;
              }, 0);

              return (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-5 z-50 animate-in fade-in duration-200">
                  <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{formatTableName(currentTable.tableNumber)}</h3>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">Masa ID: #{currentTable.tableID}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                        currentTable.status === 'empty' ? 'bg-gray-100 text-gray-500' :
                        currentTable.status === 'dining' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {currentTable.status === 'empty' ? 'Boş' :
                         currentTable.status === 'dining' ? 'Dolu' : 'Hesap Bekliyor'}
                      </span>
                    </div>

                    {currentTable.isOccupied && tableOrders.length > 0 && (
                      <>
                        {/* Ürün Seçerek Ödeme */}
                        <div className="flex flex-col gap-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Ürün Seçerek Öde</span>
                          <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                            {aggregatedItems.map((item: AggregatedItem) => {
                              const selectedQty = selectedItemsToPay[item.productId] || 0;
                              return (
                                <div key={item.productId} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs font-display">
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-extrabold text-sm text-gray-800 truncate">{item.productName}</span>
                                    <span className="text-xs font-bold text-gray-400">₺{item.unitPrice} × {item.quantity} adet</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleDecrement(item.productId)}
                                      disabled={selectedQty === 0}
                                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-gray-100 active:scale-90 cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className="w-5 text-center font-black text-sm text-gray-800">{selectedQty}</span>
                                    <button
                                      onClick={() => handleIncrement(item.productId, item.quantity)}
                                      disabled={selectedQty === item.quantity}
                                      className="w-7 h-7 rounded-lg bg-secondary hover:bg-hover text-white font-extrabold flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-secondary active:scale-90 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sipariş Geçmişi / Notlar */}
                        <div className="flex flex-col gap-3 max-h-36 overflow-y-auto bg-gray-50/70 p-4 rounded-2xl border border-gray-100 font-display">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Sipariş Notları ve Detayları</span>
                          <div className="flex flex-col gap-3">
                            {tableOrders.map((order: ActiveOrderModel) => (
                              <div key={order.orderId} className="border-b border-gray-200/50 last:border-0 pb-2 last:pb-0">
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-extrabold mb-1">
                                  <span>Sipariş #{order.orderId} • {order.orderTime}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {order.details.map((item: OrderDetailModel, idx: number) => (
                                    <div key={idx} className="flex flex-col text-xs">
                                      <div className="flex justify-between font-bold text-gray-600">
                                        <span>{item.quantity}x {item.productName}</span>
                                      </div>
                                      {item.note && (
                                        <p className="text-[10px] text-amber-600 font-medium italic mt-0.5 ml-2">
                                          Not: {item.note}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {currentTable.activeOrderTotalPrice !== null && (
                      <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100 font-display">
                        <span className="font-extrabold text-sm text-gray-500">Mevcut Toplam Hesap</span>
                        <span className="font-black text-xl text-secondary">₺{currentTable.activeOrderTotalPrice}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2.5 mt-2 font-display">
                      {selectedTotal > 0 && (
                        <button
                          onClick={handlePaySelectedItems}
                          disabled={actionLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          Seçilenleri Öde (₺{selectedTotal})
                        </button>
                      )}

                      {currentTable.status === 'waiting_bill' && (
                        <button
                          onClick={() => handleSettleBill(currentTable)}
                          disabled={actionLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          Hesabı Al ve Masayı Boşalt
                        </button>
                      )}

                      {currentTable.status === 'dining' && (
                        <button
                          onClick={() => handleSettleBill(currentTable)}
                          disabled={actionLoading}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md active:scale-95 transition-all mb-1 cursor-pointer"
                        >
                          Hesap Kapat (₺{currentTable.activeOrderTotalPrice})
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleOccupied(currentTable)}
                        disabled={actionLoading}
                        className={`w-full py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition-all cursor-pointer ${
                          currentTable.isOccupied 
                            ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
                            : 'bg-secondary text-white shadow-md hover:bg-hover'
                        }`}
                      >
                        {currentTable.isOccupied ? 'Masayı Boşalt (Hesapsız)' : 'Masayı Dolu Yap'}
                      </button>

                      <button
                        onClick={handleCloseModal}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition-all mt-1 cursor-pointer"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Hazır Teslimatlar Tab */}
        {activeTab === 'deliveries' && (
          <div className="px-5 md:px-10">
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              {deliveries.map(delivery => (
                <div 
                  key={delivery.orderId} 
                  className="bg-white p-5 rounded-3xl shadow-md border-l-8 border-green-500 flex justify-between items-center group hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-lg">
                        {formatTableName(delivery.tableNumber)}
                      </span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                        #{delivery.orderId}
                      </span>
                    </div>
                    {/* List of foods ready to deliver */}
                    <div className="text-sm font-semibold text-gray-600 leading-tight pr-4">
                      {delivery.details.map(d => `${d.quantity}x ${d.productName}`).join(', ')}
                    </div>
                    <span className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      Mutfakta Hazırlandı • {delivery.orderTime}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeliverOrder(delivery.orderId)}
                    className="w-12 h-12 shrink-0 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-green-500 group-hover:text-white active:scale-90 transition-all cursor-pointer"
                    title="Teslim Et ve Kapat"
                  >
                    <ArrowRight size={24} strokeWidth={3} />
                  </button>
                </div>
              ))}
              
              {deliveries.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                    <Coffee size={40} />
                  </div>
                  <h3 className="text-xl font-black text-gray-800">Bekleyen Teslimat Yok</h3>
                  <p className="text-gray-500 font-semibold mt-2 text-sm">Mutfaktan çıkan yeni siparişler burada görünecek.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Waiter;
