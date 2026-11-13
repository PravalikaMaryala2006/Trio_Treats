import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Collection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error(`Error reading ${this.name}:`, err);
      return [];
    }
  }

  _write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error(`Error writing ${this.name}:`, err);
      return false;
    }
  }

  find(filter = {}) {
    const all = this._read();
    return all.filter(item => {
      for (const key of Object.keys(filter)) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(filter = {}) {
    const all = this._read();
    return all.find(item => {
      for (const key of Object.keys(filter)) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  findById(id) {
    const all = this._read();
    return all.find(item => item._id === id || item.id === id) || null;
  }

  insertOne(doc) {
    const all = this._read();
    const newDoc = {
      _id: doc._id || doc.id || uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    all.push(newDoc);
    this._write(all);
    return newDoc;
  }

  updateOne(filter, update) {
    const all = this._read();
    const index = all.findIndex(item => {
      for (const key of Object.keys(filter)) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (index === -1) return null;

    const current = all[index];
    const updated = {
      ...current,
      ...(update.$set || update),
      updatedAt: new Date().toISOString()
    };
    all[index] = updated;
    this._write(all);
    return updated;
  }

  updateById(id, update) {
    return this.updateOne({ _id: id }, update);
  }

  deleteOne(filter) {
    const all = this._read();
    const initialLen = all.length;
    const filtered = all.filter(item => {
      for (const key of Object.keys(filter)) {
        if (filter[key] !== undefined && item[key] === filter[key]) {
          return false;
        }
      }
      return true;
    });
    this._write(filtered);
    return { deletedCount: initialLen - filtered.length };
  }

  deleteById(id) {
    return this.deleteOne({ _id: id });
  }

  count(filter = {}) {
    return this.find(filter).length;
  }
}

export const db = {
  users: new Collection('users'),
  products: new Collection('products'),
  carts: new Collection('carts'),
  orders: new Collection('orders'),
  coupons: new Collection('coupons'),
  reviews: new Collection('reviews'),
  settings: new Collection('settings')
};

export async function seedInitialData() {
  console.log('Checking and seeding initial bakery data...');

  // 1. Seed Admin user
  const adminExists = db.users.findOne({ username: 'Vinith_treats' }) || db.users.findOne({ role: 'admin' });
  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Vinith@TrioTreats2026', salt);
    db.users.insertOne({
      username: 'Vinith_treats',
      fullName: 'Vinith (Trio Treats Owner)',
      email: 'vinith@triotreats.com',
      mobile: '7075881265',
      password: hashedPassword,
      role: 'admin',
      usedFirst30Coupon: false,
      savedAddresses: [],
      wishlist: []
    });
    console.log('Admin account seeded: Vinith_treats / Vinith@TrioTreats2026');
  }

  // 2. Seed Coupons
  const couponExists = db.coupons.findOne({ code: 'FIRST30' });
  if (!couponExists) {
    db.coupons.insertOne({
      code: 'FIRST30',
      discount: 30,
      description: 'Flat ₹30 OFF on your first Trio Treats bakery order!',
      minOrder: 100,
      isActive: true,
      usedByMobiles: []
    });
    console.log('Coupon FIRST30 seeded.');
  }

  // 3. Seed Menu Products
  if (db.products.count() === 0) {
    const initialProducts = [
      // CUPCAKES
      {
        name: 'Chocolate Cupcakes',
        category: 'Cupcakes',
        price: 80,
        description: 'Rich Dutch-cocoa sponge with fluffy chocolate fudge swirl frosting, chocolate crispies, and edible gold flakes.',
        image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
        weight: '1 piece',
        isAvailable: true,
        isBestSeller: true,
        rating: 4.9,
        reviewsCount: 38,
        badge: 'Best Seller'
      },
      {
        name: 'Vanilla Cupcakes',
        category: 'Cupcakes',
        price: 70,
        description: 'Light-as-air Madagascar vanilla sponge crowned with silky smooth buttercream and pastel sugar pearls.',
        image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80',
        weight: '1 piece',
        isAvailable: true,
        isBestSeller: false,
        rating: 4.8,
        reviewsCount: 24,
        badge: 'Classic'
      },
      {
        name: 'Red Velvet Cupcakes',
        category: 'Cupcakes',
        price: 90,
        description: 'Signature crimson sponge with subtle cocoa undertones, layered with decadent Philadelphia-style cream cheese frosting.',
        image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80',
        weight: '1 piece',
        isAvailable: true,
        isBestSeller: true,
        rating: 5.0,
        reviewsCount: 52,
        badge: 'Customer Favorite'
      },

      // COOKIES
      {
        name: 'Red Velvet Cookies',
        category: 'Cookies',
        price: 65,
        description: 'Melt-in-mouth crimson cookie baked with generous chunks of imported Belgian white chocolate buttons.',
        image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
        weight: '1 large cookie',
        isAvailable: true,
        isBestSeller: true,
        rating: 4.9,
        reviewsCount: 41,
        badge: 'Trending'
      },
      {
        name: 'Choco Chip Cookies',
        category: 'Cookies',
        price: 55,
        description: 'Golden crispy edges with an irresistible gooey, chewy center brimming with molten milk and dark chocolate chips.',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
        weight: '1 large cookie',
        isAvailable: true,
        isBestSeller: true,
        rating: 4.9,
        reviewsCount: 65,
        badge: 'Must Try'
      },
      {
        name: 'Butter Cookies',
        category: 'Cookies',
        price: 45,
        description: 'Traditional European shortbread recipe made with 100% pure dairy butter. Melts instantly in your mouth.',
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
        weight: '1 large cookie',
        isAvailable: true,
        isBestSeller: false,
        rating: 4.7,
        reviewsCount: 19,
        badge: ''
      },
      {
        name: 'Mini Butter Cookies + Chocolate Dip',
        category: 'Cookies',
        price: 140,
        description: 'A tub of crunchy golden mini butter cookie bites served with a warm, glossy bowl of homemade chocolate ganache dip.',
        image: 'https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=800&q=80',
        weight: '8 mini cookies + dip',
        isAvailable: true,
        isBestSeller: true,
        rating: 5.0,
        reviewsCount: 47,
        badge: 'Top Pick'
      },
      {
        name: 'Mini Choco Chip + Chocolate Dip',
        category: 'Cookies',
        price: 160,
        description: 'Irresistible bite-sized chocolate chip cookies paired with thick, warm Trio Treats signature chocolate fondue dip.',
        image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
        weight: '8 mini cookies + dip',
        isAvailable: true,
        isBestSeller: true,
        rating: 5.0,
        reviewsCount: 39,
        badge: 'Chef Special'
      },
      {
        name: 'Mini Red Velvet + Dip',
        category: 'Cookies',
        price: 170,
        description: 'Petite red velvet cookie bites with white chocolate chunks, served alongside rich velvet chocolate dip.',
        image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
        weight: '8 mini cookies + dip',
        isAvailable: true,
        isBestSeller: false,
        rating: 4.8,
        reviewsCount: 22,
        badge: ''
      },

      // CHOCOLATES
      {
        name: 'Milk Chocolate (100g)',
        category: 'Chocolates',
        price: 130,
        description: 'Artisanal hand-tempered creamy milk chocolate bar made with pure cocoa butter and sweetened milk essence.',
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
        weight: '100g bar',
        isAvailable: true,
        isBestSeller: false,
        rating: 4.8,
        reviewsCount: 31,
        badge: ''
      },
      {
        name: 'Dark Chocolate (100g)',
        category: 'Chocolates',
        price: 150,
        description: '70% single-origin dark chocolate bar with intense nutty floral notes and lingering smooth bittersweet finish.',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80',
        weight: '100g bar',
        isAvailable: true,
        isBestSeller: true,
        rating: 4.9,
        reviewsCount: 44,
        badge: 'Artisanal 70%'
      },
      {
        name: 'White Chocolate (100g)',
        category: 'Chocolates',
        price: 140,
        description: 'Silky, fragrant ivory chocolate bar infused with Madagascar vanilla pods and real cocoa butter.',
        image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
        weight: '100g bar',
        isAvailable: true,
        isBestSeller: false,
        rating: 4.7,
        reviewsCount: 18,
        badge: ''
      },
      {
        name: 'Mix (Milk + White) (100g)',
        category: 'Chocolates',
        price: 140,
        description: 'Artisan marble slab featuring delicate swirls of rich milk chocolate and fragrant sweet white chocolate.',
        image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
        weight: '100g bar',
        isAvailable: true,
        isBestSeller: true,
        rating: 4.9,
        reviewsCount: 29,
        badge: 'Marble Swirl'
      },

      // BROWNIES
      {
        name: 'Chocolate Brownie',
        category: 'Brownies',
        price: 95,
        description: 'Fudgy, dense triple-chocolate brownie with a shiny crinkled top, loaded with molten chocolate pockets.',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        weight: '1 generous square',
        isAvailable: true,
        isBestSeller: true,
        rating: 5.0,
        reviewsCount: 76,
        badge: 'Bestseller'
      },

      // SPECIAL TREATS
      {
        name: 'Teddy Bear Lollipops',
        category: 'Special Treats',
        price: 120,
        description: 'Cute handcrafted teddy-shaped solid chocolate lollipops decorated with pastel bows. Loved by kids and sweethearts.',
        image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
        weight: 'Set of 2 pops',
        isAvailable: true,
        isBestSeller: true,
        rating: 4.9,
        reviewsCount: 35,
        badge: 'Kids Favorite'
      },
      {
        name: 'Mini Cakes (Bento)',
        category: 'Special Treats',
        price: 299,
        description: 'Korean-style aesthetic 4-inch mini bento celebration cake in chocolate or vanilla with custom pastel piping.',
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
        weight: '300g bento cake',
        isAvailable: true,
        isBestSeller: true,
        rating: 5.0,
        reviewsCount: 58,
        badge: 'Instagram Sensation'
      },
      {
        name: 'Customised Cakes',
        category: 'Special Treats',
        price: 599,
        description: 'Handcrafted custom theme cakes for birthdays, anniversaries, and milestones. Direct WhatsApp consultation included.',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        weight: '500g (Upgradable)',
        isAvailable: true,
        isBestSeller: false,
        rating: 5.0,
        reviewsCount: 42,
        badge: 'Custom Made'
      },
      {
        name: 'Chocolate Gift Boxes',
        category: 'Special Treats',
        price: 349,
        description: 'Elegant satin-ribboned gift box containing an assortment of handcrafted milk, dark, marble, and stuffed pralines.',
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
        weight: 'Box of 9 chocolates',
        isAvailable: true,
        isBestSeller: true,
        rating: 4.9,
        reviewsCount: 49,
        badge: 'Perfect Gift'
      },

      // BUILD YOUR OWN TREAT BOX
      {
        name: 'Build Your Own Treat Box (4 Treats)',
        category: 'Special Treats',
        price: 299,
        description: 'Choose your own custom combination of 4 bakery treats: mix cookies, brownies, cupcakes and chocolates in a gift box!',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        weight: 'Custom 4-Pack',
        isAvailable: true,
        isBestSeller: true,
        rating: 5.0,
        reviewsCount: 63,
        badge: 'Interactive'
      }
    ];

    for (const p of initialProducts) {
      db.products.insertOne(p);
    }
    console.log(`Seeded ${initialProducts.length} bakery products.`);
  }
}
