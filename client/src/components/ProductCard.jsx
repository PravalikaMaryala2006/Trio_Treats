import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Minus, Star, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onOpenCustomBox }) {
  const { addToCart, items, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);

  // Check if item is currently in cart
  const cartItem = items.find(i => i.productId === productId && !i.boxSelections);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const isSpecialBox = product.name?.toLowerCase().includes('build your own') ||
                       product.category?.toLowerCase() === 'build your own box';

  const handleAdd = () => {
    if (isSpecialBox && onOpenCustomBox) {
      onOpenCustomBox(product);
      return;
    }

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="bakery-card rounded-3xl overflow-hidden flex flex-col justify-between group relative bg-white border border-[#EEDDC9]/70">
      {/* Top Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-[#FFF9F2]">
        <Link to={`/product/${productId}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#3D2314] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#EEDDC9] shadow-xs">
          {product.category}
        </span>

        {/* Custom Badge (e.g. Best Seller / Chef Special) */}
        {product.badge && (
          <span className="absolute bottom-3 left-3 bg-[#3D2314] text-[#FAD2E1] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FAD2E1]" />
            {product.badge}
          </span>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
            isWishlisted
              ? 'bg-[#D68C98] text-white'
              : 'bg-white/80 hover:bg-white text-[#7B4B29]'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Availability Badge */}
        {product.isAvailable === false && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Weight */}
          <div className="flex items-center justify-between text-xs text-[#7B4B29] mb-1.5">
            <div className="flex items-center gap-1 bg-[#FFF3E7] px-2 py-0.5 rounded-md font-bold text-[#3D2314]">
              <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
              <span>{product.rating || '4.9'}</span>
              <span className="text-[10px] text-[#A78A7F] font-normal">({product.reviewsCount || 25})</span>
            </div>
            <span className="text-[11px] font-medium text-[#A78A7F]">{product.weight}</span>
          </div>

          {/* Product Name */}
          <Link to={`/product/${productId}`}>
            <h3 className="font-serif font-bold text-lg text-[#3D2314] group-hover:text-[#5C3419] transition-colors leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-[#7B4B29]/90 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-[#F5EBE1] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-[#A78A7F] block uppercase font-medium">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-lg text-[#3D2314]">₹{product.price}</span>
            </div>
          </div>

          {/* Action / Stepper */}
          {product.isAvailable === false ? (
            <button
              disabled
              className="text-xs bg-gray-100 text-gray-400 font-semibold px-4 py-2 rounded-full cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : isSpecialBox ? (
            <button
              onClick={() => onOpenCustomBox && onOpenCustomBox(product)}
              className="btn-pink text-xs !py-2 !px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customise Box</span>
            </button>
          ) : currentQty > 0 ? (
            <div className="flex items-center bg-[#3D2314] text-white rounded-full px-2 py-1 gap-2 shadow-sm">
              <button
                onClick={() => updateQuantity(productId, currentQty - 1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold w-4 text-center">{currentQty}</span>
              <button
                onClick={() => updateQuantity(productId, currentQty + 1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-xs ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FFF3E7] hover:bg-[#3D2314] text-[#3D2314] hover:text-[#FFF9F2] border border-[#EEDDC9]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
