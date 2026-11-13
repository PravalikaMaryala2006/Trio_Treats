import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Get reviews for a product
router.get('/product/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = db.reviews.find({ productId })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
});

// 2. Add a review
router.post('/', verifyToken, (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    const product = db.products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newReview = db.reviews.insertOne({
      productId,
      userId: req.user._id,
      customerName: req.user.fullName,
      rating: Number(rating),
      comment: (comment || '').trim(),
      createdAt: new Date().toISOString()
    });

    // Recalculate product rating
    const allProductReviews = db.reviews.find({ productId });
    const avgRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length;

    db.products.updateById(productId, {
      rating: Number(avgRating.toFixed(1)),
      reviewsCount: allProductReviews.length
    });

    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
});

export default router;
