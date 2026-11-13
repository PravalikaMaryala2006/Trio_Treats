import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { seedInitialData } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Setup Socket.IO for real-time live cart monitoring and order updates
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve static uploads
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Trio Treats Bakery API',
    tagline: 'A Little Bite of Happiness',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend client build if available
import fs from 'fs';
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Socket.io real-time connection management
io.on('connection', (socket) => {
  // Join admin room
  socket.on('joinAdmin', () => {
    socket.join('admin_room');
  });

  // Customer tracking specific order
  socket.on('trackOrder', (orderId) => {
    socket.join(`order:${orderId}`);
  });

  // Customer cart live updates
  socket.on('clientCartPing', (cartData) => {
    io.emit('liveCartUpdated', {
      cart: cartData,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

const PORT = process.env.PORT || 5001;

// Seed initial data then start server
seedInitialData().then(() => {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`=========================================`);
    console.log(`TRIO TREATS Bakery Server Running on Port ${PORT}`);
    console.log(`Tagline: "A Little Bite of Happiness"`);
    console.log(`Admin Portal: Vinith_treats`);
    console.log(`Database: Persistent Store Active (data/)`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`=========================================`);
  });
}).catch(err => {
  console.error('Failed to seed and start server:', err);
});
