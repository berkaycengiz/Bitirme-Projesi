import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, UtensilsCrossed, Check, LogOut } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';

const Chef = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuthStore();
  const { activeOrders, connectSignalR, disconnectSignalR, fetchActiveOrders, updateOrderStatus } = useOrderStore();
  
  // Keep track of which items are checked in the kitchen checklist locally
  // Key format: `${orderId}-${productId}` -> boolean
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Route protection
  useEffect(() => {
    if (!isAuthenticated || role !== 'Kitchen') {
      navigate('/login');
    }
  }, [isAuthenticated, role, navigate]);

  // SignalR & Data fetching
  useEffect(() => {
    if (isAuthenticated && role === 'Kitchen') {
      fetchActiveOrders();
      connectSignalR('Kitchen');
    }
    return () => {
      disconnectSignalR();
    };
  }, [isAuthenticated, role, fetchActiveOrders, connectSignalR, disconnectSignalR]);

  const toggleItemCheck = async (orderId: number, productId: number, currentStatus: string) => {
    const key = `${orderId}-${productId}`;
    const newCheckedState = !checkedItems[key];
    
    setCheckedItems(prev => ({
      ...prev,
      [key]: newCheckedState
    }));

    // If order is Pending and we start checking items, update overall status to Preparing (1)
    if (currentStatus === 'Pending' && newCheckedState) {
      await updateOrderStatus(orderId, 1); // 1 = Preparing
    }
  };

  const handleOrderReady = async (orderId: number) => {
    await updateOrderStatus(orderId, 2); // 2 = Ready
  };

  // Helper to parse "HH:mm" time and get elapsed minutes
  const getElapsedMinutes = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const now = new Date();
      const orderDate = new Date();
      orderDate.setHours(hours, minutes, 0, 0);
      
      // Handle day wrap-around
      if (now.getTime() < orderDate.getTime()) {
        orderDate.setDate(orderDate.getDate() - 1);
      }
      
      const diffMs = now.getTime() - orderDate.getTime();
      return Math.floor(diffMs / 60000);
    } catch {
      return 0;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter out any orders that are already Ready, Completed, or Cancelled (Chef only cooks Pending and Preparing)
  const cookingOrders = activeOrders.filter(
    (o) => o.status === 'Pending' || o.status === 'Preparing'
  );

  // Determine delay count (waiting > 10 minutes)
  const delayedCount = cookingOrders.filter(o => getElapsedMinutes(o.orderTime) > 10).length;
  const newCount = cookingOrders.filter(o => o.status === 'Pending').length;

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col font-display text-gray-800 relative pb-20">
      <Navbar />

      {/* Floating Logout Button for Staff */}
      <button 
        onClick={handleLogout}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl z-40 active:scale-95 transition-transform flex items-center gap-2 font-black text-sm"
      >
        <LogOut size={20} />
        <span>Çıkış Yap</span>
      </button>

      <main className="flex-1 w-full max-w-[1600px] mx-auto">
        <div className="px-5 md:px-8 py-6 mb-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                <UtensilsCrossed className="text-secondary" size={32} />
                Mutfak Ekranı
              </h1>
              <p className="text-gray-500 font-semibold mt-1">Bekleyen Siparişler: {cookingOrders.length}</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Geciken ({delayedCount})
              </span>
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                Yeni ({newCount})
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-8">
          {cookingOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/20 text-secondary rounded-full flex items-center justify-center mb-4">
                <UtensilsCrossed size={40} />
              </div>
              <h2 className="text-xl font-black text-gray-800">Tüm Siparişler Hazır!</h2>
              <p className="text-gray-500 font-semibold mt-2">Mutfakta hazırlanmayı bekleyen yeni bir sipariş yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {cookingOrders.map(ticket => {
                const elapsedMins = getElapsedMinutes(ticket.orderTime);
                const isUrgent = elapsedMins > 10;
                
                // Check if all items in this ticket are checked
                const allChecked = ticket.details.every(
                  d => checkedItems[`${ticket.orderId}-${d.productId}`]
                );

                return (
                  <div 
                    key={ticket.orderId} 
                    className={`bg-white rounded-3xl shadow-md border-t-8 flex flex-col overflow-hidden transition-all duration-300 ${
                      isUrgent 
                        ? 'border-red-500 ring-4 ring-red-100 animate-pulse' 
                        : ticket.status === 'Preparing' 
                          ? 'border-amber-400' 
                          : 'border-primary'
                    }`}
                  >
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 leading-none">Masa {ticket.tableNumber < 10 ? `0${ticket.tableNumber}` : ticket.tableNumber}</h3>
                        <span className="text-gray-400 font-bold text-sm">#{ticket.orderId}</span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm ${
                        isUrgent ? 'bg-red-50 text-red-600' : 'bg-white text-gray-600 border border-gray-100'
                      }`}>
                        <Clock size={16} strokeWidth={2.5} />
                        <span className="font-extrabold text-sm tracking-wide">{elapsedMins} dk</span>
                      </div>
                    </div>

                    <div className="flex-1 p-2">
                      <div className="flex flex-col gap-1">
                        {ticket.details.map(item => {
                          const itemKey = `${ticket.orderId}-${item.productId}`;
                          const isItemCompleted = !!checkedItems[itemKey];

                          return (
                            <button 
                              key={item.productId} 
                              onClick={() => toggleItemCheck(ticket.orderId, item.productId, ticket.status)}
                              className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all active:scale-95 ${
                                isItemCompleted ? 'bg-green-50/50 opacity-60' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${
                                isItemCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'
                              }`}>
                                <Check size={14} strokeWidth={4} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between">
                                  <span className={`font-bold text-base leading-tight truncate ${
                                    isItemCompleted ? 'line-through text-gray-500' : 'text-gray-800'
                                  }`}>
                                    {item.productName}
                                  </span>
                                  <span className={`font-black ml-2 ${isItemCompleted ? 'text-gray-400' : 'text-secondary'}`}>
                                    x{item.quantity}
                                  </span>
                                </div>
                                {item.note && (
                                  <p className="text-[10px] font-black text-red-500 mt-1 bg-red-50 px-2 py-0.5 rounded-lg inline-block uppercase tracking-wider">
                                    Not: {item.note}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button 
                        onClick={() => handleOrderReady(ticket.orderId)}
                        disabled={!allChecked}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md group disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 size={18} className="text-green-400 group-hover:scale-110 transition-transform" />
                        SİPARİŞ HAZIR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chef;
