import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { api } from '../utils/api';
import ProductCard from '../components/ProductCard';
import BuildBoxModal from '../components/BuildBoxModal';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const queryParam = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended', 'price-low', 'price-high', 'rating'
  const [isBuildBoxOpen, setIsBuildBoxOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get('/products');
        setProducts(res.products || []);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      }
    }
    fetchProducts();
  }, []);

  const categories = [
    'All',
    'Cupcakes',
    'Cookies',
    'Chocolates',
    'Brownies',
    'Special Treats'
  ];

  // Filtering
  let displayed = [...products];

  if (selectedCategory !== 'All') {
    displayed = displayed.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    displayed = displayed.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === 'price-low') {
    displayed.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    displayed.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    displayed.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#D68C98] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Fresh from the Oven
        </span>
        <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#3D2314]">
          Our Artisanal Bakery Menu
        </h1>
        <p className="text-xs sm:text-sm text-[#7B4B29]">
          Browse our freshly prepared cupcakes, artisan cookies, handcrafted chocolates, and brownies.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7B4B29] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-full pl-10 pr-4 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#7B4B29] font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2 text-[#3D2314] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#F5EBE1] pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#3D2314] text-[#FFF9F2]'
                  : 'bg-[#FFF9F2] hover:bg-[#FFF3E7] text-[#3D2314] border border-[#EEDDC9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EEDDC9] p-8 space-y-3">
          <span className="text-4xl">🧁</span>
          <h3 className="font-serif font-bold text-xl text-[#3D2314]">No bakery treats found</h3>
          <p className="text-xs text-[#7B4B29]">Try clearing your search or selecting a different category.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
            className="btn-primary text-xs !py-2 !px-4 mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayed.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onOpenCustomBox={() => setIsBuildBoxOpen(true)}
            />
          ))}
        </div>
      )}

      {/* Build Box Modal */}
      <BuildBoxModal
        isOpen={isBuildBoxOpen}
        onClose={() => setIsBuildBoxOpen(false)}
      />
    </div>
  );
}
