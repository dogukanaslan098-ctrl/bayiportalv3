import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  LayoutDashboard, Package, ShoppingCart, User, LogOut, Menu, X, Bell,
  ChevronDown, Clock, BarChart3, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function DashboardLayout({ children, activePage, onNavigate }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = user?.role === 'administrator';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: isAdmin ? 'Fiyat Yonetimi' : 'Urunler', icon: Package },
    ...(!isAdmin ? [{ id: 'cart', label: 'Sepetim', icon: ShoppingCart, badge: itemCount }] : []),
    ...(!isAdmin ? [{ id: 'orders', label: 'Siparisler', icon: Clock }] : []),
    { id: 'profile', label: 'Profilim', icon: User },
  ];

  if (!user) return null;

  const userInitials = user.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-[280px] bg-navy-900 border-r border-navy-700/50 
        flex flex-col transition-transform duration-300 
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Header */}
        <div className="p-6 border-b border-navy-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-navy-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Bayi<span className="text-gold-400">Portal</span>
              </h1>
              <p className="text-[11px] text-gold-400/60 tracking-widest uppercase font-medium">Provanya</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-5">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-700 to-navy-800 flex items-center justify-center text-gold-400 font-bold text-sm border border-navy-600 shadow-inner">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user.company || user.email}</p>
              </div>
            </div>
            {user.discountRate > 0 && (
              <div className="mt-4 pt-4 border-t border-navy-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Indirim Orani</span>
                  <span className="text-lg font-bold text-gold-400">%{user.discountRate}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
          <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Menu</p>
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }} 
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 group
                ${activePage === item.id 
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-lg shadow-gold-500/5' 
                  : 'text-slate-400 hover:text-white hover:bg-navy-800/80 border border-transparent'
                }
              `}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activePage === item.id ? 'text-gold-400' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="bg-gold-500 text-navy-950 text-[11px] font-bold px-2.5 py-1 rounded-full min-w-[26px] text-center shadow-md">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity ${activePage === item.id ? 'opacity-50' : ''}`} />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-navy-700/50">
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" /> 
            Cikis Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-xl border-b border-navy-700/50">
          <div className="flex items-center justify-between px-6 lg:px-8 py-5">
            <div className="flex items-center gap-5">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="lg:hidden p-3 rounded-xl hover:bg-navy-800 text-slate-400 transition-colors border border-navy-700"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              {/* Page Title */}
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-white">
                  {navItems.find(i => i.id === activePage)?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Hos geldiniz, {user.displayName.split(' ')[0]}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-3 rounded-xl hover:bg-navy-800 text-slate-400 transition-colors border border-navy-700/50">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-gold-500 rounded-full"></span>
              </button>

              {/* Cart (for non-admin) */}
              {!isAdmin && (
                <button 
                  onClick={() => onNavigate('cart')} 
                  className="relative p-3 rounded-xl hover:bg-navy-800 text-slate-400 transition-colors border border-navy-700/50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-950 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </button>
              )}

              {/* Profile Dropdown */}
              <div className="relative ml-2">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className="flex items-center gap-3 py-2 pl-2 pr-4 rounded-xl hover:bg-navy-800 transition-colors border border-navy-700/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-800 flex items-center justify-center text-gold-400 font-bold text-xs border border-navy-600">
                    {userInitials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm text-white font-medium max-w-[100px] truncate">
                      {user.displayName.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {user.role === 'administrator' ? 'Yonetici' : 'Bayi'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-72 bg-navy-800 border border-navy-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                    >
                      <div className="p-5 border-b border-navy-700 bg-navy-900/50">
                        <p className="text-base font-semibold text-white">{user.displayName}</p>
                        <p className="text-sm text-slate-400 mt-1">{user.email}</p>
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20">
                          <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
                            {user.role === 'administrator' ? 'Yonetici' : 'Bayi'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <button 
                          onClick={() => { onNavigate('profile'); setProfileOpen(false); }} 
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-navy-700 transition-colors"
                        >
                          <User className="w-4 h-4" /> Profilim
                        </button>
                        <button 
                          onClick={logout} 
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Cikis Yap
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <motion.div 
            key={activePage} 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-navy-700/50 py-4 px-6 lg:px-8">
          <p className="text-xs text-slate-600 text-center">
            BayiPortal v3.0 &copy; {new Date().getFullYear()} Provanya
          </p>
        </footer>
      </div>
    </div>
  );
}
