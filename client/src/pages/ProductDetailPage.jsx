import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronLeft,
  Check,
  MessageSquare
} from 'lucide-react';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, items, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadProductAndReviews() {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.product);

        // Fetch reviews
        const revRes = await api.get(`/reviews/product/${id}`);
        setReviews(revRes.reviews || []);

        // Track recently viewed
        if (res.product) {
          try {
            const currentRecent = JSON.parse(localStorage.getItem('trio_treats_recent') || '[]');
            const updated = [res.product, ...currentRecent.filter(p => (p._id || p.id) !== id)].slice(0, 6);
            localStorage.setItem('trio_treats_recent', JSON.stringify(updated));
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProductAndReviews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D2314]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <h2 className="font-serif font-bold text-2xl text-[#3D2314]">Treat not found</h2>
        <p className="text-xs text-[#7B4B29] mt-2">The product might have been moved or removed.</p>
        <Link to="/menu" className="btn-primary text-xs !py-2 !px-4 mt-4 inline-block">
          Back to Bakery Menu
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id || product.id);

  const handleAddToCart = () => {
    addToCart(product, qty, customNote);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit a review!');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product._id || product.id,
        rating: newRating,
        comment: newComment
      });
      if (res.review) {
        setReviews([res.review, ...reviews]);
        setNewComment('');
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <Link
        to="/menu"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B4B29] hover:text-[#3D2314] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Bakery Menu</span>
      </Link>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-[#EEDDC9] shadow-soft relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-[#3D2314] text-[#FAD2E1] text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {product.badge}
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition-all ${
                isWishlisted
                  ? 'bg-[#D68C98] text-white'
                  : 'bg-white/80 hover:bg-white text-[#7B4B29]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Details & Add to Cart */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 text-xs text-[#7B4B29] mb-2">
              <span className="bg-[#FFF3E7] px-2.5 py-1 rounded-full font-bold text-[#5C3419] border border-[#EEDDC9]">
                {product.category}
              </span>
              <div className="flex items-center gap-1 font-bold text-[#3D2314]">
                <Star className="w-4 h-4 fill-[#D4A373] text-[#D4A373]" />
                <span>{product.rating || '4.9'}</span>
                <span className="text-gray-400 font-normal">({reviews.length || product.reviewsCount || 25} reviews)</span>
              </div>
              <span>•</span>
              <span className="text-[#A78A7F] font-medium">{product.weight}</span>
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3D2314] leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-bold text-3xl text-[#3D2314]">₹{product.price}</span>
              <span className="text-xs text-[#7B4B29]">inclusive of all bakery taxes</span>
            </div>
          </div>

          <p className="text-sm text-[#5C3419] leading-relaxed border-t border-b border-[#F5EBE1] py-4">
            {product.description}
          </p>

          {/* Special Custom Notes for Bakery */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#7B4B29] block mb-1.5">
              Special Bakery Instructions / Flavour Preference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less sweet, extra sprinkles, warm packaging..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
            />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center bg-white border border-[#EEDDC9] rounded-full p-1 shadow-xs">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FFF3E7] text-[#3D2314] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-[#3D2314]">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FFF3E7] text-[#3D2314] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 btn-primary text-xs sm:text-sm !py-3.5 flex items-center justify-center gap-2 shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-[#FAD2E1]" />
              <span>Add to Cart • ₹{product.price * qty}</span>
            </button>
          </div>

          {/* Bakery Promises */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F5EBE1]">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FFF9F2] border border-[#EEDDC9]">
              <Award className="w-4 h-4 text-[#D68C98] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#5C3419]">100% Pure Dairy Butter</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FFF9F2] border border-[#EEDDC9]">
              <ShieldCheck className="w-4 h-4 text-[#D68C98] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#5C3419]">Freshly Baked to Order</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EEDDC9] shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-[#F5EBE1] pb-4">
          <div>
            <h3 className="font-serif font-bold text-2xl text-[#3D2314] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#D68C98]" />
              Customer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-[#7B4B29]">Feedback from verified dessert lovers</p>
          </div>
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-[#FFF9F2] p-5 rounded-2xl border border-[#EEDDC9] space-y-3">
          <h4 className="font-bold text-sm text-[#3D2314]">Leave a Review for this Bake</h4>

          {reviewSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Thank you! Your sweet review has been posted.</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7B4B29]">Your Rating:</span>
            <div className="flex gap-1 text-[#D4A373]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            placeholder={isAuthenticated ? "How was the taste, texture, and sweetness?" : "Please log in to write a review"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!isAuthenticated}
            className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl p-3 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingReview || !isAuthenticated}
              className="btn-primary text-xs !py-2 !px-5 disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Post Sweet Review'}
            </button>
          </div>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-[#7B4B29] text-center py-6">
              Be the first sweet lover to review this treat!
            </p>
          ) : (
            reviews.map((r, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#F5EBE1] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#3D2314]">{r.customerName}</span>
                  <div className="flex text-[#D4A373]">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#5C3419]">{r.comment}</p>
                <span className="text-[10px] text-[#A78A7F] block">
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
