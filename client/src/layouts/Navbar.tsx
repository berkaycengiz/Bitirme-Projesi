import { ShoppingBag, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="h-16 bg-white border-b border-primary/10 flex items-center justify-between px-4 xl:px-24 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-secondary hover:text-hover transition-colors">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <span className="bg-primary/30 text-secondary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
          Masa: 05
        </span>
        <button className="relative p-2 text-secondary hover:text-hover transition-colors">
          <ShoppingBag size={24} />
          <span className="absolute top-0 right-0 sm:-top-1 sm:-right-1 bg-secondary text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold shadow-md">
            3
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
