import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Package, ShoppingCart, Clock, ArrowUpRight, TrendingUp, Users, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { fetchProducts, fetchOrders, formatPrice } from '../lib/woocommerce';

export default function DashboardPage() {
  const { user } = useAuth();
  const { total, itemCount } = useCart();
  
  const { data: products = [] } = useSWR(user ? 'products' : null, fetchProducts);
  const { data: orders = [] } = useSWR(user ? ['orders', user.id] : null, () => fetchOrders(user!.id));

  if (!user) return null;

  const isAdmin = user.role === 'administrator';

  const stats = isAdmin ? [
    { label: 'Toplam Urun', value: products.length.toString(), icon: Package, color: 'blue', trend: '+12%' },
    { label: 'Toplam Siparis', value: orders.length.toString(), icon: Clock, color: 'gold', trend: '+8%' },
    { label: 'Aktif Bayiler', value: '24', icon: Users, color: 'green', trend: '+3%' },
  ] : [
    { label: 'Toplam Urun', value: products.length.toString(), icon: Package, color: 'blue', trend: null },
    { label: 'Sepet Tutari', value: formatPrice(total), icon: ShoppingCart, color: 'gold', trend: null },
    { label: 'Sepetteki Urun', value: itemCount.toString(), icon: CreditCard, color: 'green', trend: null },
    { label: 'Siparislerim', value: orders.length.toString(), icon: Clock, color: 'purple', trend: null },
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    gold: { bg: 'bg-gold-500/10', text: 'text-gold-400', border: 'border-gold-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Hos Geldiniz, <span className="text-gold-gradient">{user.displayName.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 text-lg">{user.company}</p>
            {user.discountRate > 0 && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20">
                <TrendingUp className="w-4 h-4 text-gold-400" />
                <span className="text-sm text-gold-400 font-semibold">%{user.discountRate} Ozel Indirim</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
              className="btn btn-primary"
            >
              <Package className="w-5 h-5" />
              Urunlere Git
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const colors = colorClasses[stat.color as keyof typeof colorClasses];
          return (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }} 
              className="stat-card"
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`p-4 rounded-2xl ${colors.bg} border ${colors.border}`}>
                  <stat.icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                {stat.trend && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />{stat.trend}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders / Admin Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {!isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-7"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Son Siparisler</h3>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'orders' }))}
                className="text-sm text-gold-400 hover:text-gold-300 font-medium"
              >
                Tumunu Gor
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium">Henuz siparisiniz yok</p>
                <p className="text-sm text-slate-500 mt-1">Urun katalogundan siparis verebilirsiniz</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between bg-navy-800/50 rounded-xl p-4 border border-navy-700/50 hover:border-navy-600/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-white">#{order.number}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(order.date_created).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-white">{formatPrice(parseFloat(order.total))}</span>
                      <p className={`text-xs mt-1 font-medium ${
                        order.status === 'completed' ? 'text-green-400' : 
                        order.status === 'processing' ? 'text-blue-400' : 'text-slate-500'
                      }`}>
                        {order.status === 'completed' ? 'Tamamlandi' : order.status === 'processing' ? 'Hazirlaniyor' : 'Beklemede'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-7"
        >
          <h3 className="text-lg font-bold text-white mb-6">
            {isAdmin ? 'Yonetici Paneli' : 'Hizli Erisim'}
          </h3>
          
          {isAdmin ? (
            <>
              <p className="text-slate-400 mb-6">
                Sol menuden Fiyat Yonetimi sayfasina giderek her bayi icin ozel fiyatlandirma yapabilirsiniz.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-navy-800/50 rounded-xl p-5 border border-navy-700/50">
                  <p className="text-sm text-slate-400 mb-2">Toplam Urun</p>
                  <p className="text-3xl font-bold text-white">{products.length}</p>
                </div>
                <div className="bg-navy-800/50 rounded-xl p-5 border border-navy-700/50">
                  <p className="text-sm text-slate-400 mb-2">Toplam Siparis</p>
                  <p className="text-3xl font-bold text-white">{orders.length}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-navy-800/50 border border-navy-700/50 hover:border-gold-500/30 hover:bg-navy-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white group-hover:text-gold-400 transition-colors">Urunleri Incele</p>
                  <p className="text-xs text-slate-500">{products.length} urun mevcut</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-gold-400 transition-colors" />
              </button>
              
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'cart' }))}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-navy-800/50 border border-navy-700/50 hover:border-gold-500/30 hover:bg-navy-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-gold-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white group-hover:text-gold-400 transition-colors">Sepete Git</p>
                  <p className="text-xs text-slate-500">{itemCount} urun, {formatPrice(total)}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-gold-400 transition-colors" />
              </button>
              
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'profile' }))}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-navy-800/50 border border-navy-700/50 hover:border-gold-500/30 hover:bg-navy-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white group-hover:text-gold-400 transition-colors">Profil Ayarlari</p>
                  <p className="text-xs text-slate-500">Hesap bilgilerinizi yonetin</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-gold-400 transition-colors" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
