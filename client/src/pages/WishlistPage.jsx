import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-16 h-16 text-[#D68C98] mx-auto animate-pulse" />
        <h2 className="font-serif font-bold text-3xl text-[#3D2314]">Your Wishlist is Empty</h2>
        <p className="text-xs sm:text-sm text-[#7B4B29]">
          Save your favourite cupcakes, cookies, chocolates, and gift boxes to order them anytime!
        </p>
        <Link to="/menu" className="btn-primary text-xs !py-2.5 !px-6 inline-block mt-3 shadow-sm">
          Browse Sweet Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-[#F5EBE1] pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-3xl text-[#3D2314]">My Treat Wishlist</h1>
          <p className="text-xs text-[#7B4B29] mt-0.5">{wishlist.length} saved bakery favorites</p>
        </div>
        <Link to="/menu" className="text-xs font-bold text-[#5C3419] hover:underline flex items-center gap-1">
          <span>Explore More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id || product.id}
            className="bakery-card rounded-3xl overflow-hidden bg-white border border-[#EEDDC9] flex flex-col justify-between"
          >
            <div className="relative aspect-square">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-red-500 shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D68C98] block">{product.category}</span>
                <h3 className="font-serif font-bold text-base text-[#3D2314] line-clamp-1">{product.name}</h3>
                <p className="font-bold text-sm text-[#3D2314] mt-1">₹{product.price}</p>
              </div>

              <button
                onClick={() => addToCart(product, 1)}
                className="w-full btn-primary text-xs !py-2 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#FAD2E1]" />
                <span>Move to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
