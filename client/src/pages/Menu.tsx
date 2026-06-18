import { Search, Plus, Minus, ChevronRight, Flame, ClipboardEdit, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '../layouts/Navbar';
import api from '../services/api';
import { useCartStore } from '../store/useCartStore';
import type { Product } from '../store/useCartStore';

interface Category {
  categoryID: number;
  categoryName: string;
  description: string;
}

const Menu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tüm Lezzetler');
  const [isLoading, setIsLoading] = useState(true);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [notes, setNotes] = useState<Record<number, string>>({}); // Temp state for notes per product

  // Zustand Store
  const { cartItems, addToCart, removeFromCart, submitOrder, setTableNumber } = useCartStore();

  // Read table number from URL query string on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = parseInt(params.get('table') || '5', 10);
    setTableNumber(table);
  }, [setTableNumber]);

  // Load Categories & Products from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/api/category'),
          api.get('/api/product'),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error('Failed to load menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNoteChange = (productId: number, text: string) => {
    setNotes(prev => ({ ...prev, [productId]: text }));
  };

  const handleAddItem = (product: Product) => {
    const note = notes[product.productID] || '';
    addToCart(product, note);
  };

  const handleRemoveItem = (productID: number) => {
    removeFromCart(productID);
  };

  const handleOrderSubmit = async () => {
    setOrderSubmitting(true);
    const result = await submitOrder();
    setOrderSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setNotes({}); // Clear local notes input
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      alert(result.message);
    }
  };

  // Find quantity of product in cart
  const getItemQuantity = (productID: number) => {
    const item = cartItems.find((c) => c.product.productID === productID);
    return item ? item.quantity : 0;
  };

  // Filter products by category & search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'Tüm Lezzetler' || p.categoryName === activeCategory;
    const matchesSearch =
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-dvh bg-background flex flex-col font-display text-gray-800 relative">
      <Navbar />

      {/* Success Notification Toast */}
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-bold px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 z-50 w-[90%] max-w-md">
          <CheckCircle className="text-secondary shrink-0" size={24} strokeWidth={2.5} />
          <span className="leading-tight">{successMsg}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto pb-32">
        {/* Header and Search */}
        <div className="px-5 md:px-10 pt-6 pb-6 bg-background md:rounded-3xl z-10 relative">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight leading-tight mb-2">
            Nefis lezzetleri <br /> <span className="text-secondary">keşfetmeye başla!</span>
          </h2>
          <div className="relative mt-5 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Yemek veya içecek ara..."
              className="w-full pl-11 pr-4 py-3 bg-white/60 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-secondary/30 focus:ring-4 focus:ring-secondary/10 shadow-inner transition-all text-gray-700 font-semibold placeholder:text-gray-400 placeholder:font-medium text-base"
            />
          </div>
        </div>

        {/* Categories Horizontal Bar */}
        <div className="mt-2 px-5 md:px-10">
          <h3 className="font-extrabold text-gray-800 text-lg mb-3 tracking-tight">Kategoriler</h3>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5 md:mx-0 md:px-0">
            {/* Tüm Lezzetler artificial category */}
            <button
              onClick={() => setActiveCategory('Tüm Lezzetler')}
              className={`flex flex-col items-center justify-center min-w-20 h-24 rounded-3xl transition-all duration-300 ${
                activeCategory === 'Tüm Lezzetler'
                  ? 'bg-secondary text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 shadow-sm border border-gray-100 active:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-1">🍽️</span>
              <span className={`text-[10px] uppercase tracking-wider font-black text-center px-1 ${
                activeCategory === 'Tüm Lezzetler' ? 'text-white' : 'text-gray-500'
              }`}>
                Tüm
              </span>
            </button>

            {categories.map((cat) => {
              // Deduce emoji icon based on category name
              let icon = '🍔';
              if (cat.categoryName.includes('Yemek')) icon = '🥩';
              else if (cat.categoryName.includes('Tatlı')) icon = '🍰';
              else if (cat.categoryName.includes('İçecek')) icon = '🥤';

              return (
                <button
                  key={cat.categoryID}
                  onClick={() => setActiveCategory(cat.categoryName)}
                  className={`flex flex-col items-center justify-center min-w-20 h-24 rounded-3xl transition-all duration-300 ${
                    activeCategory === cat.categoryName
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'bg-white text-gray-600 shadow-sm border border-gray-100 active:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mb-1">{icon}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-black text-center px-1 truncate max-w-full ${
                    activeCategory === cat.categoryName ? 'text-white' : 'text-gray-500'
                  }`}>
                    {cat.categoryName.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="px-5 md:px-10 mt-6">
          <h3 className="font-extrabold text-gray-800 text-lg mb-4 tracking-tight">{activeCategory}</h3>

          {isLoading ? (
            <div className="flex flex-col items-center py-20 text-gray-500 font-bold">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary mb-4"></div>
              Yükleniyor...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-bold">
              Kriterlere uygun ürün bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 md:gap-6 animate-in fade-in duration-300">
              {filteredProducts.map((item) => {
                const quantity = getItemQuantity(item.productID);
                return (
                  <div key={item.productID} className="bg-white p-4 rounded-3xl shadow-md hover:shadow-lg border border-gray-100/50 flex flex-col gap-3 transition-all">
                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden relative shrink-0 shadow-inner border border-black/5">
                        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.productName} />
                        {item.price > 250 && (
                          <div className="absolute top-0 right-0 bg-gradient-to-tr from-orange-500 to-red-500 text-white p-1 rounded-bl-xl shadow-md">
                            <Flame size={12} fill="currentColor" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 py-1 flex flex-col justify-between h-24 min-w-0">
                        <div>
                          <h4 className="font-extrabold text-gray-800 leading-tight mb-1 text-base truncate">{item.productName}</h4>
                          <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className="flex items-start">
                            <span className="text-xs font-bold text-gray-400 mt-1 mr-0.5">₺</span>
                            <span className="text-lg font-black text-secondary leading-none">{item.price}</span>
                          </div>

                          {quantity > 0 ? (
                            <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200/50 shadow-inner">
                              <button onClick={() => handleRemoveItem(item.productID)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-secondary active:scale-90 transition-transform font-bold">
                                <Minus size={16} strokeWidth={2.5} />
                              </button>
                              <span className="w-8 text-center text-base font-black text-gray-800">{quantity}</span>
                              <button onClick={() => handleAddItem(item)} className="w-8 h-8 flex items-center justify-center bg-secondary rounded-full shadow-sm text-white active:scale-90 transition-transform font-bold">
                                <Plus size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => handleAddItem(item)} className="bg-primary/20 text-secondary p-2.5 rounded-xl hover:bg-secondary hover:text-white active:scale-90 transition-all">
                              <Plus size={18} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Note Input if item in cart */}
                    {quantity > 0 && (
                      <div className="border-t border-gray-100 pt-3 flex gap-2 items-center animate-in slide-in-from-top-2 duration-250">
                        <ClipboardEdit size={16} className="text-gray-400 shrink-0" />
                        <input
                          type="text"
                          value={notes[item.productID] || ''}
                          onChange={(e) => handleNoteChange(item.productID, e.target.value)}
                          placeholder="Sipariş notu (ör: sossuz olsun)"
                          className="flex-1 text-xs font-semibold bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-secondary/30 text-gray-700"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center opacity-60 pb-6">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mb-1"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mb-1"></div>
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-6 inset-x-5 md:inset-x-auto md:w-96 md:right-8 z-45 animate-in slide-in-from-bottom-8 duration-300">
          <button
            onClick={handleOrderSubmit}
            disabled={orderSubmitting}
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-3xl shadow-2xl flex items-center justify-between px-6 active:scale-95 transition-all outline-none ring-2 ring-gray-900/50 ring-offset-2 ring-offset-background group disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="bg-secondary px-3 py-1.5 rounded-xl text-sm font-black tracking-wide shadow-inner text-white">
                {totalItemsCount} Ürün
              </div>
              <span className="font-extrabold text-base">
                {orderSubmitting ? 'Sipariş İletiliyor...' : 'Sepeti Onayla'}
              </span>
            </div>
            <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span className="font-black text-xl tracking-tight text-primary">
                ₺{totalCartPrice}
              </span>
              <ChevronRight size={20} className="ml-1 opacity-80 text-primary" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Menu;