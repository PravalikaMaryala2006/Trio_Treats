import React, { useState, useEffect } from 'react';
import {
  Cake,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Check,
  X,
  Upload,
  Search,
  Sparkles
} from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cupcakes',
    price: '',
    description: '',
    weight: '1 piece',
    badge: '',
    isBestSeller: false,
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Cupcakes',
      price: '',
      description: '',
      weight: '1 piece',
      badge: '',
      isBestSeller: false,
      imageUrl: ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description || '',
      weight: p.weight || '1 piece',
      badge: p.badge || '',
      isBestSeller: Boolean(p.isBestSeller),
      imageUrl: p.image || ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/products/${id}/toggle-availability`);
      if (res.product) {
        setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? res.product : p));
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bakery treat?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('category', formData.category);
      form.append('price', formData.price);
      form.append('description', formData.description);
      form.append('weight', formData.weight);
      form.append('badge', formData.badge);
      form.append('isBestSeller', formData.isBestSeller);

      if (selectedFile) {
        form.append('imageFile', selectedFile);
      } else if (formData.imageUrl) {
        form.append('imageUrl', formData.imageUrl);
      }

      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id;
        const res = await api.put(`/products/${id}`, form);
        if (res.product) {
          setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? res.product : p));
        }
      } else {
        const res = await api.post('/products', form);
        if (res.product) {
          setProducts([res.product, ...products]);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEDDC9] pb-6">
        <div>
          <h1 className="font-serif font-bold text-3xl text-[#3D2314]">
            Bakery Product Management
          </h1>
          <p className="text-xs text-[#7B4B29]">
            Add new treats, update prices, change descriptions, and toggle stock availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#FAD2E1]" />
            <span>Add New Treat</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-white border border-[#EEDDC9] rounded-full pl-9 pr-4 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
        />
        <Search className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.map((p) => {
          const id = p._id || p.id;
          const isAvailable = p.isAvailable !== false;

          return (
            <div
              key={id}
              className={`bg-white rounded-3xl overflow-hidden border transition-all ${
                isAvailable ? 'border-[#EEDDC9] shadow-soft' : 'border-red-200 opacity-75'
              }`}
            >
              <div className="relative aspect-video overflow-hidden bg-[#FFF9F2]">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-[#3D2314] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {p.category}
                </span>

                {!isAvailable && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sold Out
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3D2314] line-clamp-1">{p.name}</h3>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="font-bold text-[#3D2314] text-sm">₹{p.price}</span>
                    <span className="text-[#A78A7F]">{p.weight}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F5EBE1] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleAvailability(id)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-red-50 text-red-800 border-red-300'
                    }`}
                  >
                    {isAvailable ? 'In Stock' : 'Mark In Stock'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg text-[#7B4B29] hover:bg-[#FFF3E7] hover:text-[#3D2314]"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#EEDDC9] overflow-hidden my-6">
            <div className="bg-[#3D2314] text-white p-5 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#FFF9F2]">
                {editingProduct ? 'Edit Bakery Treat' : 'Add New Bakery Treat'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="font-bold text-[#7B4B29] block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belgian Truffle Cupcake"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-[#EEDDC9] rounded-xl p-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#7B4B29] block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-[#EEDDC9] rounded-xl p-2.5 text-[#3D2314]"
                  >
                    <option value="Cupcakes">Cupcakes</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Chocolates">Chocolates</option>
                    <option value="Brownies">Brownies</option>
                    <option value="Special Treats">Special Treats</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#7B4B29] block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="80"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white border border-[#EEDDC9] rounded-xl p-2.5 text-[#3D2314]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#7B4B29] block mb-1">Weight / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 piece, 100g bar, box of 6"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full bg-white border border-[#EEDDC9] rounded-xl p-2.5 text-[#3D2314]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#7B4B29] block mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller, Trending"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-white border border-[#EEDDC9] rounded-xl p-2.5 text-[#3D2314]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#7B4B29] block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Ingredients, taste profile, and allergen info..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#EEDDC9] rounded-xl p-2.5 text-[#3D2314]"
                />
              </div>

              {/* Image Upload or URL */}
              <div>
                <label className="font-bold text-[#7B4B29] block mb-1">Product Photo</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-white border border-[#EEDDC9] hover:bg-[#FFF3E7] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#7B4B29]" />
                      <span>Upload Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    {selectedFile && (
                      <span className="text-[11px] text-[#3D2314] font-medium truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-[#A78A7F] block">Or enter external image URL:</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-white border border-[#EEDDC9] rounded-xl p-2 text-[#3D2314]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EEDDC9] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full font-semibold text-[#7B4B29] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary !py-2 !px-6"
                >
                  {submitting ? 'Saving Treat...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
