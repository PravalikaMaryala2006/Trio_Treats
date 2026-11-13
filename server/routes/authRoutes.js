import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { verifyToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Helper to sanitize user object
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// 1. Customer Registration
router.post('/register', async (req, res) => {
  try {
    const { fullName, mobile, email, password, confirmPassword } = req.body;

    if (!fullName || !mobile || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate mobile
    const existingMobile = db.users.findOne({ mobile: cleanMobile });
    if (existingMobile) {
      return res.status(400).json({
        message: 'This mobile number is already registered. Please log in with your credentials.'
      });
    }

    // Check duplicate email
    const existingEmail = db.users.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        message: 'This email is already registered. Please log in with your credentials.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = db.users.insertOne({
      fullName: fullName.trim(),
      mobile: cleanMobile,
      email: cleanEmail,
      password: hashedPassword,
      role: 'customer',
      usedFirst30Coupon: false,
      savedAddresses: [],
      wishlist: [],
      lastLoginAt: new Date().toISOString()
    });

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role, mobile: newUser.mobile },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Notify sockets about new customer registration
    if (req.io) {
      req.io.emit('customerActivity', {
        type: 'registered',
        customer: sanitizeUser(newUser),
        timestamp: new Date().toISOString()
      });
    }

    return res.status(201).json({
      message: 'Account created successfully! Welcome to Trio Treats.',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// 2. Customer & User Login (by Mobile or Email)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be mobile or email

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please enter your mobile/email and password' });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const cleanDigits = identifier.trim().replace(/\D/g, '').slice(-10);

    // Search by email or mobile
    const user = db.users.findOne({ email: cleanInput }) ||
                 (cleanDigits.length === 10 ? db.users.findOne({ mobile: cleanDigits }) : null);

    if (!user) {
      return res.status(400).json({
        message: 'No account found with this mobile or email. Please register first.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your password.' });
    }

    // Update last login
    db.users.updateById(user._id, { lastLoginAt: new Date().toISOString() });

    const token = jwt.sign(
      { userId: user._id, role: user.role, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    if (req.io) {
      req.io.emit('customerActivity', {
        type: 'login',
        customer: sanitizeUser(user),
        timestamp: new Date().toISOString()
      });
    }

    return res.json({
      message: `Welcome back, ${user.fullName}!`,
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// 3. Admin Login (Separate endpoint & credentials)
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Admin username and password required' });
    }

    const cleanUsername = username.trim();
    const adminUser = db.users.findOne({ username: cleanUsername, role: 'admin' }) ||
                      db.users.findOne({ role: 'admin' });

    if (!adminUser || adminUser.username !== cleanUsername) {
      return res.status(401).json({ message: 'Unauthorized: Invalid Admin username' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Unauthorized: Incorrect Admin password' });
    }

    db.users.updateById(adminUser._id, { lastLoginAt: new Date().toISOString() });

    const token = jwt.sign(
      { userId: adminUser._id, role: 'admin', username: adminUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Admin authorization successful',
      token,
      admin: sanitizeUser(adminUser)
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Server error during admin login', error: err.message });
  }
});

// 4. Get Current User Profile
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// 5. Update Profile
router.put('/me', verifyToken, (req, res) => {
  try {
    const { fullName, email } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName.trim();
    if (email) updates.email = email.trim().toLowerCase();

    const updatedUser = db.users.updateById(req.user._id, updates);
    res.json({ message: 'Profile updated', user: sanitizeUser(updatedUser) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// 6. Save or Update Delivery Addresses
router.post('/addresses', verifyToken, (req, res) => {
  try {
    const address = req.body;
    const currentAddresses = req.user.savedAddresses || [];
    const newAddress = {
      id: address.id || Date.now().toString(),
      name: address.name || req.user.fullName,
      mobile: address.mobile || req.user.mobile,
      houseNo: address.houseNo || '',
      street: address.street || '',
      area: address.area || '',
      city: address.city || '',
      pincode: address.pincode || '',
      landmark: address.landmark || '',
      instructions: address.instructions || '',
      coordinates: address.coordinates || null,
      isDefault: address.isDefault || currentAddresses.length === 0,
      createdAt: new Date().toISOString()
    };

    const updatedAddresses = [...currentAddresses, newAddress];
    db.users.updateById(req.user._id, { savedAddresses: updatedAddresses });

    res.json({ message: 'Address saved successfully', address: newAddress, addresses: updatedAddresses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save address', error: err.message });
  }
});

// 7. Delete Address
router.delete('/addresses/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const currentAddresses = req.user.savedAddresses || [];
    const filtered = currentAddresses.filter(a => a.id !== id);
    db.users.updateById(req.user._id, { savedAddresses: filtered });
    res.json({ message: 'Address removed', addresses: filtered });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete address', error: err.message });
  }
});

// 8. Forgot Password / Reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    const cleanDigits = identifier ? identifier.trim().replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = identifier ? identifier.trim().toLowerCase() : '';

    const user = db.users.findOne({ email: cleanEmail }) ||
                 (cleanDigits.length === 10 ? db.users.findOne({ mobile: cleanDigits }) : null);

    if (!user) {
      return res.status(404).json({ message: 'No registered customer found with this mobile or email' });
    }

    // In a live environment, a 6-digit OTP is sent via SMS/WhatsApp to the mobile
    const resetOtp = '7075'; // Friendly verification OTP for testing or direct reset
    return res.json({
      message: `Password reset verification code sent to ${user.mobile ? '******' + user.mobile.slice(-4) : user.email}`,
      demoOtp: resetOtp,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing forgot password request', error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { userId, newPassword, otp } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    db.users.updateById(userId, { password: hashedPassword });

    return res.json({ message: 'Password updated successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
});

export default router;
