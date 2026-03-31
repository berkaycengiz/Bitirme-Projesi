import { User, Lock, ChefHat, LogIn } from 'lucide-react';
import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center font-display p-5 relative overflow-hidden z-0">
      <div className="absolute -top-1/4 -left-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none -z-10 md:scale-150" />
      <div className="absolute -bottom-1/4 -right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none -z-10 md:scale-150" />

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-2xl shadow-gray-200/50 relative z-10 border border-white">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-5 shadow-inner rotate-3">
            <ChefHat size={40} className="text-secondary -rotate-3" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight text-center leading-none">Personel Girişi</h1>
          <p className="text-gray-500 mt-2 text-sm font-semibold text-center px-4 leading-relaxed">Sadece yetkili restoran çalışanları giriş yapabilir.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-gray-700 ml-1 tracking-wide">Kullanıcı Adı</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} strokeWidth={2.5} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adı"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-100 rounded-2xl focus:outline-none focus:bg-white focus:border-secondary/30 focus:ring-4 focus:ring-secondary/10 shadow-inner transition-all text-gray-800 font-bold placeholder:text-gray-400 placeholder:font-medium text-base tracking-widest font-sans"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-gray-700 ml-1 tracking-wide">Şifre</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} strokeWidth={2.5} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-100 rounded-2xl focus:outline-none focus:bg-white focus:border-secondary/30 focus:ring-4 focus:ring-secondary/10 shadow-inner transition-all text-gray-800 font-bold placeholder:text-gray-400 placeholder:font-medium text-base tracking-widest font-sans"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-secondary text-white py-4 mt-4 rounded-2xl shadow-xl shadow-secondary/30 flex items-center justify-center gap-2 active:scale-95 transition-all outline-none ring-2 ring-secondary/50 ring-offset-2 ring-offset-white font-black text-base tracking-wide hover:bg-hover hover:shadow-secondary/40"
          >
            Sisteme Giriş Yap
            <LogIn size={20} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
