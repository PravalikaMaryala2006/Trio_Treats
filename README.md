# 🧁 TRIO TREATS – Online Bakery Ordering Website
### *"A Little Bite of Happiness"*

A modern, responsive, full-stack online bakery ordering platform inspired by Swiggy and Zomato, built with a unique homemade bakery aesthetic. Includes complete database persistence, real-time live cart monitoring, interactive GPS delivery map, online payment verification, customer order tracking, and a dedicated admin portal for bakery owner **Vinith**.

---

## 🎨 Brand Identity & Theme
- **Official Brand Mark:** Illustrated cupcake with swirl frosting, cherry on top, cookies & hearts from the official Trio Treats stickers.
- **Tagline:** *"A Little Bite of Happiness"*
- **Official Instagram:** `@TRIO_TREATS_03`
- **Owner Contact:** Vinith – `+91 70758 81265`
- **Palette:** Warm Cream (`#FDFBF7`), Chocolate Brown (`#3D2314`, `#5C3419`), Warm Beige (`#EEDDC9`, `#F5EBE1`), and Pastel Pink (`#FAD2E1`, `#FCE4EC`).

---

## 🚀 Key Functional Modules

### 1. 🔐 Customer Login & Registration
- **Customer Registration:** Full name, Mobile number, Email address, Password, Confirm password.
- **Login Options:** Login using 10-digit Mobile number OR Email address + Password.
- **Duplicate Prevention:** Strictly checks and enforces mobile number uniqueness.
- **Persistent Session:** JWT authentication saved in browser so returning customers never have to register again.
- **Security:** Password hashing with `bcryptjs`, protected routes.
- **Forgot Password:** Automated verification code and password reset flow.

### 2. 🏠 Home Page & Menu
- **Swiggy/Zomato Search Bar:** "What are you craving today?" with instant search filtering.
- **Categories:** Cupcakes, Cookies, Chocolates, Brownies, and Special Treats.
- **Pre-seeded Bakery Menu:**
  - **Cupcakes:** Chocolate Cupcakes (₹80), Vanilla Cupcakes (₹70), Red Velvet Cupcakes (₹90).
  - **Cookies:** Red Velvet Cookies (₹65), Choco Chip Cookies (₹55), Butter Cookies (₹45), Mini Butter + Choco Dip (₹140), Mini Choco Chip + Choco Dip (₹160), Mini Red Velvet (₹170).
  - **Chocolates:** Milk Chocolate 100g (₹130), Dark Chocolate 70% 100g (₹150), White Chocolate 100g (₹140), Mix Marble Swirl 100g (₹140).
  - **Brownies:** Fudgy Triple-Chocolate Brownie (₹95).
  - **Special Treats:** Teddy Bear Lollipops (₹120), Bento Mini Cakes (₹299), Customised Cakes (₹599), Luxury Chocolate Gift Boxes (₹349).
- **Product Cards:** Image zoom on hover, ratings, weights, quantity selector (`+` / `-`), Add to Cart animations, and Wishlist hearts.

### 3. 🛍️ Customer Cart & 🔴 Admin Live Cart Monitoring
- Customer-specific cart with real-time database synchronization.
- Subtotal, delivery fee calculation (Free above ₹300, or flat ₹40), coupon discount, and final total.
- **Live Cart Monitoring in Admin:**
  - Real-time updates via Socket.io when any customer modifies items in their bag.
  - Shows customer name, phone number, email, and exact item breakdown.
  - Computes status: **Active Browsing**, **In Checkout**, or **Abandoned Cart** (>15 mins inactivity).
  - 1-Click WhatsApp nudge button to send customer a recovery offer!

### 4. 🎟️ First Order Coupon – `FIRST30`
- Gives flat **₹30 OFF** on the customer's first successful order.
- Verified per mobile number: permanently disabled for that mobile once order is placed.
- Prominently displayed in banner on Home Page with 1-click copy & auto-apply in cart.

### 5. 📍 Delivery Address & Interactive GPS Map
- Customer name, mobile, House/Flat number, Street, Area, City, PIN code, Landmark, and Rider instructions.
- **"Use Current GPS Location"** button with automated reverse geocoding via OpenStreetMap.
- Interactive Leaflet map with draggable door pin.
- Saves multiple addresses to customer profile for fast 1-click selection during future checkouts.

### 6. 💳 Online Payment System (Razorpay & Verified UPI)
- Configured for bakery owner **Vinith** (+91 70758 81265).
- Supports:
  - **Direct Merchant UPI & QR Code:** Dynamic QR code generated with `upi://pay?pa=7075881265@upi` for Google Pay, PhonePe, Paytm, BHIM.
  - **Credit / Debit Cards:** Cardholder name, 16-digit card number, Expiry, CVV (256-bit SSL encrypted).
  - **Razorpay Merchant Gateway:** Server-side verification endpoint (`/api/payment/verify`).
- Server verifies transaction signature and marks order as `Payment Successful`.

### 7. 📦 Live 7-Step Order Tracking & WhatsApp Notifications
1. Order Placed
2. Payment Successful
3. Order Accepted
4. Preparing Your Treats (Baking & Decorating)
5. Ready for Delivery (Packaged with Ribbon)
6. Out for Delivery (Rider dispatched)
7. Delivered (Sweetly Delivered)
- Connected to real-time WebSockets: when the admin changes kitchen status, customer tracking updates immediately without page reload!
- 1-Click WhatsApp order notification ready to send to Vinith with formatted item breakdown and address.

### 8. 🛡️ Admin Dashboard (Dedicated Owner Portal)
- **Login Credentials:**
  - **URL:** `/admin/login`
  - **Username:** `Vinith_treats`
  - **Password:** `Vinith@TrioTreats2026`
- **Sections:**
  - **Overview:** Total Customers, Total Orders, Today's Orders, Total Revenue, Pending Orders, Completed Orders, Cancelled Orders.
  - **Live Cart Monitoring:** Real-time visibility into active bags and abandoned carts.
  - **Order Management:** Filter by status, change kitchen status with live broadcast, view GPS delivery location.
  - **Product Management:** Add new treats (with image upload), edit prices, edit descriptions, toggle in-stock / sold out.
  - **Customer Directory:** Patrons list, registration timestamps, last login activity, lifetime spend.
  - **Revenue Analytics:** 7-day revenue trend chart, transaction records, and settlement references.

### 9. 🎁 Innovative Features
1. **Build Your Own Treat Box:** Interactive 4-treat, 6-treat, or 12-treat custom box builder with visual slot filling and gift ribbon!
2. **Surprise Gift Ordering:** Toggle "Surprise Gift" at checkout to conceal invoice price, add recipient name, and attach a luxury greeting card.
3. **Personalised Greeting Card:** Free sweet message printed on Trio Treats bakery card.
4. **Wishlist:** Heart favorite treats to save for later.
5. **1-Click Order Again:** Instantly re-adds all items from previous orders.
6. **Customer Reviews & Ratings:** Star rating and verified reviews on product pages.
7. **Floating WhatsApp Assistance:** Always available on bottom right (+91 70758 81265).

---

## 🛠️ Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, Canvas Confetti.
- **Backend:** Node.js, Express.js, Socket.IO, Bcrypt.js, JsonWebToken, Multer.
- **Database:** Persistent Datastore (`server/data/`) with MongoDB / Mongoose compatibility and JSON atomic file persistence.
- **Payment Gateway:** Razorpay SDK + Dynamic UPI Merchant QR integration for Vinith.

---

## 💻 Quick Start & Running Locally

### Step 1: Start the Server & Application
From the project root:
```bash
npm start
```
This runs the full-stack backend on port `5001` and automatically serves the production-built React frontend!

Open your browser at:
👉 **`http://localhost:5001`**

### Step 2: Access Admin Portal
- Navigate to: **`http://localhost:5001/admin/login`**
- **Username:** `Vinith_treats`
- **Password:** `Vinith@TrioTreats2026`

---

## 🌐 Production Deployment Guide
- **Frontend (Vercel):** Connect git repo, set Root Directory to `client`, build command `npm run build`, output directory `dist`.
- **Backend (Render / Railway):** Set Root Directory to `server`, build command `npm install`, start command `npm start`. Set environment variables:
  - `PORT=5000`
  - `JWT_SECRET=your_jwt_secret`
  - `RAZORPAY_KEY_ID=your_key`
  - `RAZORPAY_KEY_SECRET=your_secret`
