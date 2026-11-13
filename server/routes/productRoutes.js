import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/db.js';
import { verifyAdmin, optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Setup Multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 1. Get all products with optional filters
router.get('/', optionalAuth, (req, res) => {
  try {
    const { category, search, availableOnly } = req.query;
    let products = db.products.find();

    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (availableOnly === 'true') {
      products = products.filter(p => p.isAvailable !== false);
    }

    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// 2. Get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
});

// 3. Admin: Create new product
router.post('/', verifyAdmin, upload.single('imageFile'), (req, res) => {
  try {
    const { name, category, price, description, weight, badge, isBestSeller } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80';
    }

    const newProduct = db.products.insertOne({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      description: (description || '').trim(),
      weight: (weight || '1 piece').trim(),
      image: imageUrl,
      badge: badge || '',
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isAvailable: true,
      rating: 5.0,
      reviewsCount: 0
    });

    if (req.io) {
      req.io.emit('productUpdated', { action: 'created', product: newProduct });
    }

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
});

// 4. Admin: Update product
router.put('/:id', verifyAdmin, upload.single('imageFile'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.products.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.isAvailable !== undefined) {
      updates.isAvailable = updates.isAvailable === 'true' || updates.isAvailable === true;
    }
    if (updates.isBestSeller !== undefined) {
      updates.isBestSeller = updates.isBestSeller === 'true' || updates.isBestSeller === true;
    }

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updated = db.products.updateById(id, updates);

    if (req.io) {
      req.io.emit('productUpdated', { action: 'updated', product: updated });
    }

    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
});

// 5. Admin: Toggle availability
router.patch('/:id/toggle-availability', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const product = db.products.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = db.products.updateById(id, { isAvailable: !product.isAvailable });

    if (req.io) {
      req.io.emit('productUpdated', { action: 'availabilityToggled', product: updated });
    }

    res.json({ message: 'Product availability changed', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle availability', error: err.message });
  }
});

// 6. Admin: Delete product
router.delete('/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.products.deleteById(id);

    if (req.io) {
      req.io.emit('productUpdated', { action: 'deleted', productId: id });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
});

export default router;
