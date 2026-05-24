import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  LayoutDashboard, Package, ShoppingCart, User, LogOut, Menu, X, Bell, Search,
  ChevronDown, Clock, BarChart3
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-navy-900/95 backdrop-blur-xl border-r border-navy-700/50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-navy-700/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <BarChart3 className="w-6 h-6 text-navy-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Bayi<span className="text-gold-400">Portal</span>
              </h1>
              <p className="text-[10px] text-gold-400/60 tracking-widest uppercase font-medium">Provanya</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-navy-700 to-navy-800 flex items-center justify-center text-gold-400 font-bold text-sm border border-navy-600">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.company || user.email}</p>
              </div>
            </div>
            {user.discountRate > 0 && (
              <div className="mt-3 pt-3 border-t border-navy-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Indirim Orani</span>
                  <span className="text-sm font-bold text-gold-400">%{user.discountRate}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                activePage === item.id 
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-navy-800/80'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activePage === item.id ? 'text-gold-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {item.label}
              {item.badge ? (
                <span className="ml-auto bg-gold-500 text-navy-950 text-[10px] font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-navy-700/50">
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" /> 
            Cikis Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-navy-950/80 backdrop-blur-xl border-b border-navy-700/50">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="lg:hidden p-2.5 rounded-xl hover:bg-navy-800 text-slate-400 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Urun ara..." 
                  className="bg-navy-800/80 border border-navy-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 focus:bg-navy-800 w-64 transition-all" 
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-navy-800 text-slate-400 transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* Cart (for non-admin) */}
              {!isAdmin && (
                <button 
                  onClick={() => onNavigate('cart')} 
                  className="relative p-2.5 rounded-xl hover:bg-navy-800 text-slate-400 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-navy-950 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/30">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </button>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-navy-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-700 to-navy-800 flex items-center justify-center text-gold-400 font-bold text-xs border border-navy-600">
                    {userInitials}
                  </div>
                  <span className="hidden md:block text-sm text-white font-medium max-w-[120px] truncate">
                    {user.company || user.displayName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-navy-800/95 backdrop-blur-xl border border-navy-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-navy-700">
                        <p className="text-sm font-semibold text-white">{user.displayName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gold-500/10 border border-gold-500/20">
                          <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider">
                            {user.role === 'administrator' ? 'Yonetici' : 'Bayi'}
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => { onNavigate('profile'); setProfileOpen(false); }} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-navy-700 transition-colors"
                        >
                          <User className="w-4 h-4" /> Profilim
                        </button>
                        <button 
                          onClick={logout} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
        <main className="flex-1 p-4 sm:p-6">
          <motion.div 
            key={activePage} 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
