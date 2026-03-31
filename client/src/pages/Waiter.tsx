import { useState } from 'react';
import { LayoutGrid, ClipboardCheck, ArrowRight, BellRing } from 'lucide-react';
import Navbar from '../layouts/Navbar';

type Table = {
  id: string;
  name: string;
  status: 'empty' | 'dining' | 'waiting_bill';
  people?: number;
  total?: number;
};

type Delivery = {
  id: string;
  table: string;
  items: string;
  time: string;
};

const mockTables: Table[] = [
  { id: '1', name: 'Masa 01', status: 'empty' },
  { id: '2', name: 'Masa 02', status: 'dining', people: 4, total: 1450 },
  { id: '3', name: 'Masa 03', status: 'empty' },
  { id: '4', name: 'Masa 04', status: 'waiting_bill', people: 2, total: 420 },
  { id: '5', name: 'Masa 05', status: 'dining', people: 3, total: 890 },
  { id: '6', name: 'Masa 06', status: 'empty' },
  { id: '7', name: 'Masa 07', status: 'dining', people: 6, total: 3200 },
  { id: '8', name: 'Bahçe 01', status: 'empty' },
  { id: '9', name: 'Bahçe 02', status: 'waiting_bill', people: 4, total: 1100 },
];

const mockDeliveries: Delivery[] = [
  { id: '#1044', table: 'Masa 02', items: '2x Çikolatalı Sufle', time: 'Şimdi' },
  { id: '#1041', table: 'Masa 05', items: '1x Kutu Kola, 1x Ayran', time: '2 dk önce' },
];

const Waiter = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'deliveries'>('tables');

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col font-display text-gray-800 relative pb-24">
      <Navbar />

      <div className="bg-white px-5 md:px-10 py-4 border-b border-gray-100 flex gap-4 sticky top-16 z-40">
        <button 
          onClick={() => setActiveTab('tables')}
          className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'tables' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-gray-100 text-gray-500'}`}
        >
          <LayoutGrid size={18} />
          Masa Düzeni
        </button>
        <button 
          onClick={() => setActiveTab('deliveries')}
          className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 relative ${activeTab === 'deliveries' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-gray-100 text-gray-500'}`}
        >
          <ClipboardCheck size={18} />
          Hazır Teslimatlar
          {mockDeliveries.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white items-center justify-center p-2">
                {mockDeliveries.length}
              </span>
            </span>
          )}
        </button>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto mt-6">
        
        {activeTab === 'tables' && (
          <div className="px-5 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mockTables.map(table => (
                <button 
                  key={table.id}
                  className={`relative p-5 rounded-3xl shadow-sm border transition-all active:scale-95 flex flex-col items-center justify-center gap-2 h-32 ${
                    table.status === 'empty' ? 'bg-white border-gray-100' :
                    table.status === 'dining' ? 'bg-primary/10 border-primary shadow-primary/20' :
                    'bg-secondary/10 border-secondary shadow-secondary/20 animate-pulse'
                  }`}
                >
                  <span className={`font-black text-lg ${
                    table.status === 'empty' ? 'text-gray-400' :
                    table.status === 'dining' ? 'text-primary' :
                    'text-secondary'
                  }`}>
                    {table.name}
                  </span>
                  
                  {table.status !== 'empty' && (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-gray-500">{table.people} Kişi</span>
                      <span className="text-sm font-black text-gray-800 mt-1">₺{table.total}</span>
                    </div>
                  )}

                  {table.status === 'waiting_bill' && (
                    <div className="absolute -top-2 -right-2 bg-secondary text-white p-1.5 rounded-xl shadow-md">
                      <BellRing size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="px-5 md:px-10">
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              {mockDeliveries.map(delivery => (
                <div key={delivery.id} className="bg-white p-5 rounded-3xl shadow-md border-l-8 border-green-500 flex justify-between items-center group active:scale-95 transition-transform">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-lg">{delivery.table}</span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{delivery.id}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-600 leading-tight pr-4">{delivery.items}</p>
                    <span className="text-xs font-bold text-red-500 mt-1">{delivery.time}</span>
                  </div>
                  <button className="w-12 h-12 shrink-0 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <ArrowRight size={24} strokeWidth={3} />
                  </button>
                </div>
              ))}
              
              {mockDeliveries.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                    <ClipboardCheck size={40} />
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
