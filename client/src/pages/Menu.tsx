import { Search, Plus, Minus, ChevronRight, Flame } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../layouts/Navbar';

const categories = [
  { name: 'Tüm Lezzetler', icon: '🍽️' },
  { name: 'Ana Yemekler', icon: '🥩' },
  { name: 'Tatlılar', icon: '🍰' },
  { name: 'İçecekler', icon: '🥤' }
];

const mockItems = [
  { id: 1, name: 'Özel Soslu Makarna', desc: 'Fesleğen, krema ve parmesan peyniri ile harmanlanmış enfes lezzet.', price: 240, image: 'food,pasta', popular: true },
  { id: 2, name: 'Klasik Burger Menü', desc: '150g ev yapımı dana köfte, patates kızartması ve içecek.', price: 320, image: 'burger' },
  { id: 3, name: 'Margherita Pizza', desc: 'İtalyan usulü ince hamur, taze mozzarella.', price: 280, image: 'pizza' },
  { id: 4, name: 'Çikolatalı Sufle', desc: 'Akışkan sıcak çikolata ve yanında vanilyalı top dondurma.', price: 150, image: 'dessert,chocolate' },
  { id: 5, name: 'Buzlu Latte', desc: 'Taze kavrulmuş espresso çekirdekleri ve soğuk süt.', price: 90, image: 'iced,coffee' },
  { id: 6, name: 'Sezar Salata', desc: 'Özel sezar sosu, ızgara tavuk ve kıtır kruton ekmekleri.', price: 180, image: 'salad' },
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('Tüm Lezzetler');
  const [cartCount, setCartCount] = useState<Record<number, number>>({});

  const handleAdd = (id: number) => {
    setCartCount(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemove = (id: number) => {
    setCartCount(prev => {
      const newCount = { ...prev };
      if (newCount[id] > 0) newCount[id] -= 1;
      return newCount;
    });
  };

  const totalItems = Object.values(cartCount).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-dvh bg-background flex flex-col font-display text-gray-800 relative">
      
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto pb-24">

        <div className="px-5 md:px-10 pt-6 pb-6 bg-background md:rounded-3xl z-10 relative">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight leading-tight mb-2">
              Nefis lezzetleri <br /> <span className="text-secondary">keşfetmeye başla!</span>
            </h2>
            <div className="relative mt-5 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Yemek veya içecek ara..."
                className="w-full pl-11 pr-4 py-3 bg-white/60 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-secondary/30 focus:ring-4 focus:ring-secondary/10 shadow-inner transition-all text-gray-700 font-semibold placeholder:text-gray-400 placeholder:font-medium text-base"
              />
            </div>
          </div>

          <div className="mt-6 px-5 md:px-10">
            <h3 className="font-extrabold text-gray-800 text-lg mb-3 tracking-tight">Kategoriler</h3>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5 md:mx-0 md:px-0">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex flex-col items-center justify-center min-w-20 h-24 rounded-3xl transition-all duration-300 ${activeCategory === cat.name
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'bg-white text-gray-600 shadow-sm border border-gray-100 active:bg-gray-50'
                    }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className={`text-xs uppercase tracking-wider font-extrabold text-center px-1 ${activeCategory === cat.name ? 'text-white' : 'text-gray-500'}`}>
                    {cat.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 md:px-10">
            <h3 className="font-extrabold text-gray-800 text-lg mb-4 tracking-tight">{activeCategory}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {mockItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-center active:scale-95 transition-transform">

                  <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden relative shrink-0 shadow-inner border border-black/5">
                    <img src={`https://source.unsplash.com/random/200x200/?${item.image}&sig=${item.id}`} className="w-full h-full object-cover"/>
                    {item.popular && (
                      <div className="absolute top-0 right-0 bg-linear-to-tr from-orange-500 to-red-500 text-white p-1 rounded-bl-xl shadow-md">
                        <Flame size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 py-1 flex flex-col justify-between h-full min-w-0">
                    <div>
                      <h4 className="font-extrabold text-gray-800 leading-tight mb-1 text-base truncate">{item.name}</h4>
                      <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="flex items-start">
                        <span className="text-xs font-bold text-gray-400 mt-1 mr-0.5">₺</span>
                        <span className="text-lg font-black text-secondary leading-none">{item.price}</span>
                      </div>

                      {cartCount[item.id] ? (
                        <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200/50 shadow-inner">
                          <button onClick={() => handleRemove(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-secondary active:scale-90 transition-transform">
                            <Minus size={16} strokeWidth={2.5} />
                          </button>
                          <span className="w-8 text-center text-base font-black text-gray-800">{cartCount[item.id]}</span>
                          <button onClick={() => handleAdd(item.id)} className="w-8 h-8 flex items-center justify-center bg-secondary rounded-full shadow-sm text-white active:scale-90 transition-transform">
                            <Plus size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleAdd(item.id)} className="bg-primary/20 text-secondary p-2.5 rounded-xl hover:bg-secondary hover:text-white active:scale-90 transition-all">
                          <Plus size={18} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center opacity-60 pb-6">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mb-1"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mb-1"></div>
              <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </main>

        {totalItems > 0 && (
          <div className="fixed bottom-6 inset-x-5 md:inset-x-auto md:w-96 md:right-8 z-50 animate-in slide-in-from-bottom-8 duration-300">
            <button className="w-full bg-gray-900 text-white py-4 rounded-3xl shadow-xl flex items-center justify-between px-6 active:scale-95 transition-transform outline-none ring-2 ring-gray-900/50 ring-offset-2 ring-offset-background group">
              <div className="flex items-center gap-3">
                <div className="bg-secondary px-3 py-1.5 rounded-xl text-sm font-black tracking-wide shadow-inner">
                  {totalItems} Ürün
                </div>
                <span className="font-extrabold text-base">Sepeti Onayla</span>
              </div>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span className="font-black text-xl tracking-tight">
                  ₺{mockItems.reduce((acc, item) => acc + (item.price * (cartCount[item.id] || 0)), 0)}
                </span>
                <ChevronRight size={20} className="ml-1 opacity-80" strokeWidth={2.5} />
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