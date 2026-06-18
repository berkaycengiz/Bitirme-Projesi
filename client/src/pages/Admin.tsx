import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderPlus, 
  Plus, 
  Trash2, 
  UserPlus, 
  Settings, 
  QrCode, 
  LogOut, 
  Utensils, 
  Tags, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Upload
} from 'lucide-react';
import Navbar from '../layouts/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { Product } from '../store/useCartStore';

interface Category {
  categoryID: number;
  categoryName: string;
  description: string;
}

interface StaffUser {
  id: number;
  username: string;
  role: string;
}

interface TableInfo {
  tableID: number;
  tableNumber: number;
  qrCode: string;
  isOccupied: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuthStore();

  // Route protection
  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, role, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'users' | 'tables' | 'settings'>('products');

  // Cloudinary Settings State (with defaults)
  const [cloudName, setCloudName] = useState(() => localStorage.getItem('cloudinary_cloud_name') || 'dqv9m8cjg');
  const [uploadPreset, setUploadPreset] = useState(() => localStorage.getItem('cloudinary_upload_preset') || 'preset_restaurant');

  // API Lists State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Success / Error alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Forms State
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [productForm, setProductForm] = useState({ name: '', price: '', categoryId: '', imageUrl: '' });
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'waiter' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes, userRes, tableRes] = await Promise.all([
        api.get('/api/category'),
        api.get('/api/product'),
        api.get('/api/user'),
        api.get('/api/table')
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setStaffUsers(userRes.data);
      setTables(tableRes.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      showAlert('error', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      loadData();
    }
  }, [isAuthenticated, role]);

  // Save Cloudinary settings to localStorage
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('cloudinary_cloud_name', cloudName);
    localStorage.setItem('cloudinary_upload_preset', uploadPreset);
    showAlert('success', 'Cloudinary ayarları başarıyla kaydedildi.');
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();

      if (data.secure_url) {
        setProductForm(prev => ({ ...prev, imageUrl: data.secure_url }));
        showAlert('success', 'Resim başarıyla yüklendi.');
      } else {
        showAlert('error', 'Görsel yüklenemedi. Cloudinary ayarlarınızı kontrol edin.');
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      showAlert('error', 'Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  // Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/api/category', {
        categoryName: categoryForm.name,
        description: categoryForm.description
      });
      if (response.status === 200 || response.status === 201) {
        showAlert('success', 'Kategori başarıyla eklendi.');
        setCategoryForm({ name: '', description: '' });
        loadData();
      }
    } catch (err: any) {
      const msg = err.response?.data || 'Kategori eklenemedi.';
      showAlert('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Delete
  const handleCategoryDelete = async (id: number) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/api/category/${id}`);
      showAlert('success', 'Kategori başarıyla silindi.');
      loadData();
    } catch (err: any) {
      showAlert('error', 'Kategori silinemedi (Bağlı ürünler olabilir).');
    }
  };

  // Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.categoryId) {
      showAlert('error', 'Lütfen bir kategori seçin.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post('/api/product', {
        productName: productForm.name,
        price: parseFloat(productForm.price),
        imageUrl: productForm.imageUrl,
        categoryID: parseInt(productForm.categoryId, 10)
      });
      if (response.data.isSuccess) {
        showAlert('success', 'Ürün başarıyla eklendi.');
        setProductForm({ name: '', price: '', categoryId: '', imageUrl: '' });
        loadData();
      } else {
        showAlert('error', response.data.message);
      }
    } catch (err: any) {
      showAlert('error', 'Ürün eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Product Delete
  const handleProductDelete = async (id: number) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      const response = await api.delete(`/api/product/${id}`);
      if (response.data.isSuccess) {
        showAlert('success', 'Ürün başarıyla silindi.');
        loadData();
      } else {
        showAlert('error', response.data.message);
      }
    } catch (err: any) {
      showAlert('error', 'Ürün silinemedi.');
    }
  };

  // User Submit
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/api/user', {
        username: userForm.username,
        password: userForm.password,
        role: userForm.role
      });
      if (response.data.isSuccess) {
        showAlert('success', 'Personel başarıyla kaydedildi.');
        setUserForm({ username: '', password: '', role: 'waiter' });
        loadData();
      } else {
        showAlert('error', response.data.message);
      }
    } catch (err: any) {
      showAlert('error', 'Kullanıcı eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // User Delete
  const handleUserDelete = async (id: number) => {
    if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
    try {
      const response = await api.delete(`/api/user/${id}`);
      if (response.data.isSuccess) {
        showAlert('success', 'Personel başarıyla silindi.');
        loadData();
      } else {
        showAlert('error', response.data.message);
      }
    } catch (err: any) {
      showAlert('error', 'Personel silinemedi.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col font-display text-gray-800 relative pb-20">
      <Navbar />

      {/* Floating Logout Button */}
      <button 
        onClick={handleLogout}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl z-40 active:scale-95 transition-transform flex items-center gap-2 font-black text-sm"
      >
        <LogOut size={20} />
        <span>Çıkış Yap</span>
      </button>

      {/* Toast Alert */}
      {alert && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 z-50 w-[90%] max-w-md ${
          alert.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {alert.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-bold text-sm leading-tight">{alert.message}</span>
        </div>
      )}

      {/* Header Tabs */}
      <div className="bg-white px-5 md:px-10 py-4 border-b border-gray-100 flex gap-3 overflow-x-auto scrollbar-hide sticky top-16 z-30">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'products' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Utensils size={18} />
          Yemek Yönetimi
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'categories' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Tags size={18} />
          Kategoriler
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Users size={18} />
          Personel Yönetimi
        </button>
        <button 
          onClick={() => setActiveTab('tables')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'tables' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <QrCode size={18} />
          Masa QR Kodları
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'settings' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Settings size={18} />
          Ayarlar
        </button>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto mt-6 px-5 md:px-10">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-gray-500 font-bold">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary mb-4"></div>
            Yükleniyor...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">
            
            {/* Products Tab */}
            {activeTab === 'products' && (
              <>
                {/* Product Creation Form */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Plus className="text-secondary" />
                    Yeni Yemek Ekle
                  </h3>
                  <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Yemek Adı</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Örn: Kebap"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Fiyat (₺)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Örn: 250"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Kategori</label>
                      <select
                        value={productForm.categoryId}
                        onChange={e => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold text-gray-700"
                        required
                      >
                        <option value="">Seçin...</option>
                        {categories.map(c => (
                          <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cloudinary Image Upload */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Görsel Yükle</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          id="file-upload"
                          className="hidden"
                          disabled={isUploading}
                        />
                        <label 
                          htmlFor="file-upload"
                          className="w-full border-2 border-dashed border-gray-200 hover:border-secondary/30 rounded-xl py-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gray-50 hover:bg-white transition-all text-xs font-extrabold text-gray-500"
                        >
                          <Upload size={20} className={isUploading ? 'animate-bounce text-secondary' : 'text-gray-400'} />
                          {isUploading ? 'Yükleniyor...' : 'Görsel Seç'}
                        </label>
                      </div>
                      {productForm.imageUrl && (
                        <div className="mt-2 relative rounded-2xl overflow-hidden h-24 border border-gray-100">
                          <img src={productForm.imageUrl} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="w-full bg-secondary text-white py-3 mt-2 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Ekleniyor...' : 'Yemeği Kaydet'}
                    </button>
                  </form>
                </div>

                {/* Product List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Utensils className="text-secondary" />
                    Mevcut Yemekler ({products.length})
                  </h3>
                  <div className="flex flex-col gap-3">
                    {products.map(p => (
                      <div key={p.productID} className="p-3 border border-gray-100 hover:border-gray-200 rounded-2xl flex items-center justify-between gap-4 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-black/5 shrink-0">
                            <img src={p.imageUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-gray-900 truncate">{p.productName}</h4>
                            <span className="bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              {p.categoryName}
                            </span>
                            <p className="text-xs font-black text-secondary mt-0.5">₺{p.price}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleProductDelete(p.productID)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <>
                {/* Category Creation Form */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <FolderPlus className="text-secondary" />
                    Yeni Kategori Ekle
                  </h3>
                  <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Kategori Adı</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Örn: Ara Sıcaklar"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Açıklama</label>
                      <textarea
                        value={categoryForm.description}
                        onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Örn: Lezzetli ara sıcaklarımız."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-secondary text-white py-3 mt-2 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Ekleniyor...' : 'Kategoriyi Kaydet'}
                    </button>
                  </form>
                </div>

                {/* Category List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Tags className="text-secondary" />
                    Mevcut Kategoriler ({categories.length})
                  </h3>
                  <div className="flex flex-col gap-3">
                    {categories.map(c => (
                      <div key={c.categoryID} className="p-4 border border-gray-100 hover:border-gray-200 rounded-2xl flex items-center justify-between gap-4 transition-all">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-base text-gray-900">{c.categoryName}</h4>
                          <p className="text-xs font-medium text-gray-400 mt-1 leading-relaxed">{c.description}</p>
                        </div>
                        <button
                          onClick={() => handleCategoryDelete(c.categoryID)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Users/Staff Tab */}
            {activeTab === 'users' && (
              <>
                {/* User Creation Form */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <UserPlus className="text-secondary" />
                    Yeni Personel Kaydı
                  </h3>
                  <form onSubmit={handleUserSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Kullanıcı Adı</label>
                      <input
                        type="text"
                        value={userForm.username}
                        onChange={e => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Kullanıcı adı"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Şifre</label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Şifre belirleyin"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Rol</label>
                      <select
                        value={userForm.role}
                        onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold text-gray-700"
                        required
                      >
                        <option value="waiter">Garson (waiter)</option>
                        <option value="chef">Aşçı (chef)</option>
                        <option value="admin">Yönetici (admin)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-secondary text-white py-3 mt-2 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Personeli Kaydet'}
                    </button>
                  </form>
                </div>

                {/* User List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="text-secondary" />
                    Kayıtlı Personel ({staffUsers.length})
                  </h3>
                  <div className="flex flex-col gap-3">
                    {staffUsers.map(u => (
                      <div key={u.id} className="p-3.5 border border-gray-100 hover:border-gray-200 rounded-2xl flex items-center justify-between gap-4 transition-all">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-gray-900">{u.username}</h4>
                          <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-red-100 text-red-600' :
                            u.role === 'waiter' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <button
                          onClick={() => handleUserDelete(u.id)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tables Tab */}
            {activeTab === 'tables' && (
              <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <QrCode className="text-secondary" />
                  Masa QR Kodları ve Linkleri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tables.map(t => {
                    const tableName = t.tableNumber === 8 ? 'Bahçe 01' : t.tableNumber === 9 ? 'Bahçe 02' : `Masa 0${t.tableNumber}`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(t.qrCode)}`;
                    return (
                      <div key={t.tableID} className="p-5 border border-gray-100 hover:border-gray-250 rounded-3xl flex flex-col items-center gap-4 transition-all shadow-sm">
                        <div className="text-center">
                          <h4 className="font-black text-lg text-gray-900">{tableName}</h4>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-1 ${
                            t.isOccupied ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {t.isOccupied ? 'Dolu' : 'Boş'}
                          </span>
                        </div>
                        
                        {/* Render QR code */}
                        <div className="w-44 h-44 border border-gray-100 rounded-2xl overflow-hidden p-2 bg-white flex items-center justify-center">
                          <img src={qrUrl} alt={`${tableName} QR Code`} className="w-full h-full object-contain" />
                        </div>

                        <div className="w-full text-center">
                          <p className="text-[10px] font-mono text-gray-400 break-all select-all select-none p-1.5 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                            {t.qrCode}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-xl">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="text-secondary" />
                  Cloudinary Upload Yapılandırması
                </h3>
                <p className="text-xs text-gray-500 font-semibold mb-6 leading-relaxed">
                  Admin panelinden yeni yemek eklerken seçtiğiniz görsellerin sunuculara yüklenebilmesi için geçerli bir Cloudinary hesabı girmeniz gerekir. 
                  Aşağıdaki test ayarlarını varsayılan olarak kullanabilir veya kendi bilgilerinizi girebilirsiniz.
                </p>
                <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-gray-700 ml-1">Cloud Name</label>
                    <input
                      type="text"
                      value={cloudName}
                      onChange={e => setCloudName(e.target.value)}
                      placeholder="Cloud Name girin"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-gray-700 ml-1">Upload Preset (Unsigned)</label>
                    <input
                      type="text"
                      value={uploadPreset}
                      onChange={e => setUploadPreset(e.target.value)}
                      placeholder="Upload Preset girin"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-secondary text-white py-3.5 mt-2 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all"
                  >
                    Ayarları Kaydet
                  </button>
                </form>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
