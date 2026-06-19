import { ShoppingBag, Bell, Receipt, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { useState } from 'react';

const Navbar = () => {
  const { cartItems, tableNumber } = useCartStore();
  const { sendServiceRequest } = useOrderStore();
  const { isAuthenticated, role } = useAuthStore();
  const [toastMsg, setToastMsg] = useState('');

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleService = async (type: 'CallWaiter' | 'RequestBill') => {
    if (tableNumber === null) return;
    const success = await sendServiceRequest(tableNumber, type);
    if (success) {
      setToastMsg(type === 'CallWaiter' ? 'Garson çağrısı iletildi!' : 'Hesap talebi iletildi!');
      setTimeout(() => setToastMsg(''), 3000);
    } else {
      setToastMsg('Talebiniz iletilemedi, lütfen tekrar deneyin.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  // Format table number with leading zero if appropriate
  const formattedTable = tableNumber === null ? '--' : (tableNumber < 10 ? `0${tableNumber}` : tableNumber.toString());

  const isStaff = isAuthenticated && (role === 'admin' || role === 'waiter' || role === 'chef' || role === 'kitchen');

  return (
    <nav className="h-16 bg-white border-b border-primary/10 sticky top-0 z-50 shadow-sm font-display">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 inset-x-5 md:inset-x-auto md:right-8 bg-gray-900 text-white text-sm font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <CheckCircle size={18} className="text-primary" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto h-full px-5 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tight text-secondary">
            Akıllı<span className="text-gray-800 font-extrabold">Restoran</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isStaff ? (
            <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-black shadow-sm tracking-wide uppercase">
              {role === 'admin' ? 'Yönetici' : role === 'waiter' ? 'Garson' : 'Mutfak / Chef'}
            </span>
          ) : (
            <>
              {/* Table Number Badge */}
              <span className="bg-primary/20 text-secondary px-3 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-sm tracking-wide">
                Masa: {formattedTable}
              </span>

              {/* Call Waiter Button */}
              <button 
                onClick={() => handleService('CallWaiter')}
                title="Garson Çağır"
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-colors active:scale-95 shadow-sm border border-amber-100 flex items-center gap-1 text-xs font-bold"
              >
                <Bell size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Garson Çağır</span>
              </button>

              {/* Request Bill Button */}
              <button 
                onClick={() => handleService('RequestBill')}
                title="Hesap İste"
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors active:scale-95 shadow-sm border border-emerald-100 flex items-center gap-1 text-xs font-bold"
              >
                <Receipt size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Hesap İste</span>
              </button>

              {/* Cart Bag Indicator */}
              <button className="relative p-2 text-secondary hover:text-hover transition-colors active:scale-95">
                <ShoppingBag size={24} strokeWidth={2.5} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
