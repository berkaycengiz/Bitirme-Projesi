import { useState } from 'react';
import { Clock, CheckCircle2, UtensilsCrossed, Check } from 'lucide-react';
import Navbar from '../layouts/Navbar';

type OrderItem = {
  id: number;
  name: string;
  qty: number;
  note?: string;
  completed: boolean;
};

type Ticket = {
  id: string;
  table: string;
  time: string;
  items: OrderItem[];
  status: 'new' | 'preparing' | 'ready';
  urgent?: boolean;
};

const initialTickets: Ticket[] = [
  {
    id: '#1042',
    table: 'Masa 05',
    time: '12 dk',
    urgent: true,
    status: 'preparing',
    items: [
      { id: 1, name: 'Özel Soslu Makarna', qty: 2, completed: true },
      { id: 2, name: 'Sezar Salata', qty: 1, note: 'Sossuz olsun', completed: false }
    ]
  },
  {
    id: '#1043',
    table: 'Masa 12',
    time: '5 dk',
    status: 'new',
    items: [
      { id: 3, name: 'Klasik Burger Menü', qty: 3, completed: false },
      { id: 4, name: 'Margherita Pizza', qty: 1, completed: false }
    ]
  },
  {
    id: '#1044',
    table: 'Masa 02',
    time: '18 dk',
    urgent: true,
    status: 'preparing',
    items: [
      { id: 5, name: 'Çikolatalı Sufle', qty: 2, completed: false }
    ]
  },
  {
    id: '#1045',
    table: 'Paket',
    time: '2 dk',
    status: 'new',
    items: [
      { id: 6, name: 'Sezar Salata', qty: 2, completed: false }
    ]
  }
];

const Chef = () => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  const toggleItemCompletion = (ticketId: string, itemId: number) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const updatedItems = ticket.items.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...ticket, items: updatedItems, status: 'preparing' };
      }
      return ticket;
    }));
  };

  const markTicketReady = (ticketId: string) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col font-display text-gray-800 relative pb-20">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto">
        <div className="px-5 md:px-8 py-6 mb-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                <UtensilsCrossed className="text-secondary" size={32} />
                Mutfak Ekranı
              </h1>
              <p className="text-gray-500 font-semibold mt-1">Bekleyen Siparişler: {tickets.length}</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Geciken (2)
              </span>
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Yeni (2)
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {tickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`bg-white rounded-3xl shadow-md border-t-8 flex flex-col overflow-hidden transition-all ${ticket.urgent ? 'border-red-500' : 'border-primary'}`}
              >
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-none">{ticket.table}</h3>
                    <span className="text-gray-400 font-bold text-sm">{ticket.id}</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm ${ticket.urgent ? 'bg-red-50 text-red-600' : 'bg-white text-gray-600 border border-gray-100'}`}>
                    <Clock size={16} strokeWidth={2.5} />
                    <span className="font-extrabold text-sm tracking-wide">{ticket.time}</span>
                  </div>
                </div>

                <div className="flex-1 p-2">
                  <div className="flex flex-col gap-1">
                    {ticket.items.map(item => (
                      <button 
                        key={item.id} 
                        onClick={() => toggleItemCompletion(ticket.id, item.id)}
                        className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-colors active:scale-95 ${item.completed ? 'bg-green-50/50 opacity-60' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}>
                          <Check size={14} strokeWidth={4} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between">
                            <span className={`font-bold text-base leading-tight ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {item.name}
                            </span>
                            <span className={`font-black ml-2 ${item.completed ? 'text-gray-400' : 'text-secondary'}`}>
                              x{item.qty}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-xs font-bold text-red-500 mt-1 bg-red-50 px-2 py-1 rounded-lg inline-block">
                              Not: {item.note}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button 
                    onClick={() => markTicketReady(ticket.id)}
                    className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md group disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} className="text-green-400 group-hover:scale-110 transition-transform" />
                    SİPARİŞ HAZIR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chef;
