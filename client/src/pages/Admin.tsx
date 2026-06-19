import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderPlus, 
  Plus, 
  Trash2, 
  UserPlus, 
  QrCode, 
  LogOut, 
  Utensils, 
  Tags, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  Edit
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
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'users' | 'tables'>('products');

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
  const [productForm, setProductForm] = useState({ name: '', price: '', categoryId: '', imageUrl: '', description: '' });
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'waiter' });
  const [addTableForm, setAddTableForm] = useState({ tableNumber: '', qrCode: '' });
  const [tableForm, setTableForm] = useState({ tableNumber: '', qrCode: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingTable, setEditingTable] = useState<TableInfo | null>(null);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Edit Forms State
  const [editProductForm, setEditProductForm] = useState({ name: '', price: '', categoryId: '', imageUrl: '', description: '' });
  const [editUserForm, setEditUserForm] = useState({ username: '', password: '', role: 'waiter' });
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '', description: '' });

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

  // Image upload handler using our backend secure upload endpoint
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.isSuccess && response.data.url) {
        if (isEdit) {
          setEditProductForm(prev => ({ ...prev, imageUrl: response.data.url }));
        } else {
          setProductForm(prev => ({ ...prev, imageUrl: response.data.url }));
        }
        showAlert('success', 'Resim başarıyla yüklendi.');
      } else {
        showAlert('error', response.data?.message || 'Görsel yüklenemedi.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || 'Görsel yüklenirken bir hata oluştu.';
      showAlert('error', msg);
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

  // Category Edit Actions
  const startCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryForm({
      name: category.categoryName,
      description: category.description || ''
    });
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setEditCategoryForm({ name: '', description: '' });
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSubmitting(true);
    try {
      const response = await api.put(`/api/category/${editingCategory.categoryID}`, {
        categoryID: editingCategory.categoryID,
        categoryName: editCategoryForm.name,
        description: editCategoryForm.description
      });
      if (response.status === 200 || response.status === 204 || response.data?.isSuccess) {
        showAlert('success', 'Kategori başarıyla güncellendi.');
        cancelCategoryEdit();
        loadData();
      } else {
        showAlert('error', response.data?.message || 'Kategori güncellenemedi.');
      }
    } catch (err: any) {
      console.error('Category update error:', err);
      const msg = err.response?.data || err.response?.data?.message || 'İşlem sırasında bir hata oluştu.';
      showAlert('error', typeof msg === 'string' ? msg : 'Kategori güncellenemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Product Start Edit
  const startProductEdit = (product: Product) => {
    setEditingProduct(product);
    const cat = categories.find(c => c.categoryName === product.categoryName);
    setEditProductForm({
      name: product.productName,
      price: product.price.toString(),
      categoryId: cat ? cat.categoryID.toString() : '',
      imageUrl: product.imageUrl,
      description: product.description || ''
    });
  };

  const cancelProductEdit = () => {
    setEditingProduct(null);
    setEditProductForm({ name: '', price: '', categoryId: '', imageUrl: '', description: '' });
  };

  // Product Submit (Add only)
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
        categoryID: parseInt(productForm.categoryId, 10),
        description: productForm.description
      });
      if (response.data.isSuccess) {
        showAlert('success', 'Ürün başarıyla eklendi.');
        setProductForm({ name: '', price: '', categoryId: '', imageUrl: '', description: '' });
        loadData();
      } else {
        showAlert('error', response.data.message);
      }
    } catch (err: any) {
      showAlert('error', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Product Edit Submit
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProductForm.categoryId) {
      showAlert('error', 'Lütfen bir kategori seçin.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.put(`/api/product/${editingProduct.productID}`, {
        productID: editingProduct.productID,
        productName: editProductForm.name,
        price: parseFloat(editProductForm.price),
        imageUrl: editProductForm.imageUrl,
        categoryID: parseInt(editProductForm.categoryId, 10),
        description: editProductForm.description,
        isAvailable: true
      });
      if (response.data.isSuccess) {
        showAlert('success', 'Ürün başarıyla güncellendi.');
        cancelProductEdit();
        loadData();
      } else {
        showAlert('error', response.data.message);
      }
    } catch (err: any) {
      showAlert('error', 'İşlem sırasında bir hata oluştu.');
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

  // Table Helpers
  const startTableEdit = (table: TableInfo) => {
    setEditingTable(table);
    setTableForm({
      tableNumber: table.tableNumber.toString(),
      qrCode: table.qrCode
    });
  };

  const cancelTableEdit = () => {
    setEditingTable(null);
    setTableForm({ tableNumber: '', qrCode: '' });
  };

  // Table Submit (Add/Edit)
  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingTable) {
        // Edit Table
        const tableNumVal = parseInt(tableForm.tableNumber, 10);
        const qrCodeUrl = `${window.location.origin}/?table=${tableNumVal}`;
        const response = await api.put(`/api/table/${editingTable.tableID}`, {
          tableNumber: tableNumVal,
          qrCode: qrCodeUrl
        });
        if (response.status === 200 || response.status === 204 || response.data?.isSuccess) {
          showAlert('success', 'Masa başarıyla güncellendi.');
          setTableForm({ tableNumber: '', qrCode: '' });
          setEditingTable(null);
          loadData();
        } else {
          showAlert('error', response.data?.message || 'Masa güncellenemedi.');
        }
      } else {
        // Add Table
        const tableNumVal = parseInt(addTableForm.tableNumber, 10);
        const qrCodeUrl = `${window.location.origin}/?table=${tableNumVal}`;
        const response = await api.post('/api/table', {
          tableNumber: tableNumVal,
          qrCode: qrCodeUrl
        });
        if (response.status === 200 || response.status === 201 || response.data?.isSuccess) {
          showAlert('success', 'Masa başarıyla eklendi.');
          setAddTableForm({ tableNumber: '', qrCode: '' });
          loadData();
        } else {
          showAlert('error', response.data?.message || 'Masa eklenemedi.');
        }
      }
    } catch (err: any) {
      console.error('Table submit error:', err);
      const msg = err.response?.data || err.response?.data?.message || 'İşlem sırasında bir hata oluştu.';
      showAlert('error', typeof msg === 'string' ? msg : 'Masa kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Delete
  const handleTableDelete = async (id: number) => {
    if (!window.confirm('Bu masayı silmek istediğinize emin misiniz?')) return;
    try {
      const response = await api.delete(`/api/table/${id}`);
      if (response.status === 200 || response.status === 204 || response.data?.isSuccess) {
        showAlert('success', 'Masa başarıyla silindi.');
        loadData();
      } else {
        showAlert('error', response.data?.message || 'Masa silinemedi.');
      }
    } catch (err: any) {
      console.error('Table delete error:', err);
      showAlert('error', 'Masa silinemedi (Masaya ait siparişler olabilir).');
    }
  };

  // User Submit (Add only)
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

  // User Edit Actions
  const startUserEdit = (user: StaffUser) => {
    setEditingUser(user);
    setEditUserForm({
      username: user.username,
      password: '', // blank by default, only updated if filled
      role: user.role
    });
  };

  const cancelUserEdit = () => {
    setEditingUser(null);
    setEditUserForm({ username: '', password: '', role: 'waiter' });
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const response = await api.put(`/api/user/${editingUser.id}`, {
        username: editUserForm.username,
        password: editUserForm.password || null,
        role: editUserForm.role
      });
      if (response.data.isSuccess) {
        showAlert('success', 'Personel başarıyla güncellendi.');
        cancelUserEdit();
        loadData();
      } else {
        showAlert('error', response.data.message);
      }
    } catch (err: any) {
      console.error('User update error:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Personel güncellenirken bir hata oluştu.';
      showAlert('error', typeof msg === 'string' ? msg : 'Personel güncellenemedi.');
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
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="w-full max-w-7xl mx-auto px-5 md:px-10 py-4 flex gap-3 overflow-x-auto scrollbar-hide">
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
        </div>
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

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Açıklama</label>
                      <textarea
                        value={productForm.description}
                        onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Örn: Leziz dana kıyma ve özel baharatlar."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                        required
                      />
                    </div>

                    {/* Cloudinary Image Upload */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Görsel Yükle</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageUpload(e, false)}
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

                    <div className="flex gap-2.5 mt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="flex-1 bg-secondary text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Kaydediliyor...' : 'Yemeği Kaydet'}
                      </button>
                    </div>
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
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => startProductEdit(p)}
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                            title="Düzenle"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleProductDelete(p.productID)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => startCategoryEdit(c)}
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                            title="Düzenle"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleCategoryDelete(c.categoryID)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
                    Kayılı Personel ({staffUsers.length})
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
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => startUserEdit(u)}
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                            title="Düzenle"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleUserDelete(u.id)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tables Tab */}
            {activeTab === 'tables' && (
              <>
                {/* Table Form (Only Add Table) */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Plus className="text-secondary" />
                    Yeni Masa Ekle
                  </h3>
                  <form onSubmit={handleTableSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-700 ml-1">Masa Numarası</label>
                      <input
                        type="number"
                        value={addTableForm.tableNumber}
                        onChange={e => setAddTableForm(prev => ({ ...prev, tableNumber: e.target.value }))}
                        placeholder="Örn: 5"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                        required
                      />
                    </div>

                    {/* QR Code link generated automatically based on table number */}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-secondary text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Masayı Kaydet'}
                    </button>
                  </form>
                </div>

                {/* Tables List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <QrCode className="text-secondary" />
                    Masa QR Kodları ve Linkleri ({tables.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tables.map(t => {
                      const tableName = `Masa ${t.tableNumber < 10 ? '0' + t.tableNumber : t.tableNumber}`;
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(t.qrCode)}`;
                      return (
                        <div key={t.tableID} className="p-5 border border-gray-100 hover:border-gray-250 rounded-3xl flex flex-col items-center gap-4 transition-all shadow-sm relative group">
                          {/* Edit / Delete Buttons overlay */}
                          <div className="absolute top-3 right-3 flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-sm border border-gray-100/50">
                            <button
                              onClick={() => startTableEdit(t)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                              title="Düzenle"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleTableDelete(t.tableID)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="text-center mt-2">
                            <h4 className="font-black text-lg text-gray-900">{tableName}</h4>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-1 ${
                              t.isOccupied ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {t.isOccupied ? 'Dolu' : 'Boş'}
                            </span>
                          </div>
                          
                          {/* Render QR code */}
                          <div className="w-36 h-36 border border-gray-100 rounded-2xl overflow-hidden p-2 bg-white flex items-center justify-center">
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
              </>
            )}



          </div>
        )}
      </main>

      {editingTable && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Edit className="text-secondary" />
              Masayı Düzenle
            </h3>
            
            <form onSubmit={handleTableSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Masa Numarası</label>
                <input
                  type="number"
                  value={tableForm.tableNumber}
                  onChange={e => setTableForm(prev => ({ ...prev, tableNumber: e.target.value }))}
                  placeholder="Örn: 5"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                  required
                />
              </div>

              {/* QR Code link generated automatically based on table number */}

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={cancelTableEdit}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-secondary text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Masayı Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4 max-h-[90dvh] overflow-y-auto">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Edit className="text-secondary" />
              Yemeği Düzenle
            </h3>
            <form onSubmit={handleEditProductSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Yemek Adı</label>
                <input
                  type="text"
                  value={editProductForm.name}
                  onChange={e => setEditProductForm(prev => ({ ...prev, name: e.target.value }))}
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
                  value={editProductForm.price}
                  onChange={e => setEditProductForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Örn: 250"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Kategori</label>
                <select
                  value={editProductForm.categoryId}
                  onChange={e => setEditProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold text-gray-700"
                  required
                >
                  <option value="">Seçin...</option>
                  {categories.map(c => (
                    <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Açıklama</label>
                <textarea
                  value={editProductForm.description}
                  onChange={e => setEditProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Örn: Leziz dana kıyma ve özel baharatlar."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                  required
                />
              </div>

              {/* Cloudinary Image Upload for Edit */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Görsel Değiştir</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, true)}
                    id="edit-file-upload"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="edit-file-upload"
                    className="w-full border-2 border-dashed border-gray-200 hover:border-secondary/30 rounded-xl py-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gray-50 hover:bg-white transition-all text-xs font-extrabold text-gray-500"
                  >
                    <Upload size={20} className={isUploading ? 'animate-bounce text-secondary' : 'text-gray-400'} />
                    {isUploading ? 'Yükleniyor...' : 'Görsel Seç'}
                  </label>
                </div>
                {editProductForm.imageUrl && (
                  <div className="mt-2 relative rounded-2xl overflow-hidden h-24 border border-gray-100">
                    <img src={editProductForm.imageUrl} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={cancelProductEdit}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-1 bg-secondary text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Yemeği Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Edit className="text-secondary" />
              Personel Düzenle
            </h3>
            
            <form onSubmit={handleEditUserSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={editUserForm.username}
                  onChange={e => setEditUserForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Kullanıcı adı"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Yeni Şifre (İsteğe Bağlı)</label>
                <input
                  type="password"
                  value={editUserForm.password}
                  onChange={e => setEditUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Değiştirmek istemiyorsanız boş bırakın"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Rol</label>
                <select
                  value={editUserForm.role}
                  onChange={e => setEditUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold text-gray-700"
                  required
                >
                  <option value="waiter">Garson (waiter)</option>
                  <option value="chef">Aşçı (chef)</option>
                  <option value="admin">Yönetici (admin)</option>
                </select>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={cancelUserEdit}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-secondary text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Personeli Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Edit className="text-secondary" />
              Kategoriyi Düzenle
            </h3>
            
            <form onSubmit={handleEditCategorySubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Kategori Adı</label>
                <input
                  type="text"
                  value={editCategoryForm.name}
                  onChange={e => setEditCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Ara Sıcaklar"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 ml-1">Açıklama</label>
                <textarea
                  value={editCategoryForm.description}
                  onChange={e => setEditCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Örn: Lezzetli ara sıcaklarımız."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-secondary/30 text-sm font-bold"
                  required
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={cancelCategoryEdit}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-secondary text-white py-3 rounded-2xl font-black text-sm tracking-wide shadow-md hover:bg-hover active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kategoriyi Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
