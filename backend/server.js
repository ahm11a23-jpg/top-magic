const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
app.use(cors({
  origin: ["https://top-magic.vercel.app", "http://localhost:5173"]
}));
app.use(express.json());

// مجلد الصور
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// إعداد رفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
const uploadMany = multer({ storage }).array('images', 10);

// جلب المنتجات
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

// إضافة منتج مع صور متعددة
app.post('/api/products', (req, res) => {
  uploadMany(req, res, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    try {
      const { name, price, category, description, is_pack, pack_items } = req.body;
      const files = req.files || [];
      // أول صورة هي الرئيسية
      const image = files.length > 0
        ? `http://localhost:5000/uploads/${files[0].filename}`
        : req.body.image || '🧴';
      // كل الصور كـ JSON array
      const imagesArr = files.map(f => `http://localhost:5000/uploads/${f.filename}`);
      const imagesStr = imagesArr.length > 0 ? JSON.stringify(imagesArr) : null;
      const isPack = is_pack === "1" ? 1 : 0;
      const packItemsStr = isPack && pack_items ? pack_items : null;
      db.prepare(
        'INSERT INTO products (name, price, image, category, description, is_pack, pack_items, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(name, parseFloat(price), image, category, description, isPack, packItemsStr, imagesStr);
      res.json({ message: 'Product added!' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// حذف منتج
app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// تسجيل دخول Admin
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'MVRtopmagic@2024MVR') {
    res.json({ success: true, token: 'admin-token-2024' });
  } else {
    res.status(401).json({ success: false, message: 'Wrong password!' });
  }
});
// حفظ طلب جديد
app.post('/api/orders', (req, res) => {
  try {
    const { customer_name, customer_phone, products, total } = req.body;
    db.prepare(
      'INSERT INTO orders (customer_name, customer_phone, products, total) VALUES (?, ?, ?, ?)'
    ).run(customer_name, customer_phone, JSON.stringify(products), total);
    res.json({ message: 'Order saved!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// جلب كل الطلبات
app.get('/api/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// تغيير حالة الطلب
app.put('/api/orders/:id', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Order updated!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// جلب كل الولايات
app.get('/api/delivery', (req, res) => {
  try {
    const wilayas = db.prepare('SELECT * FROM delivery ORDER BY wilaya_code').all();
    res.json(wilayas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// تحديث سعر توصيل ولاية
app.put('/api/delivery/:id', (req, res) => {
  try {
    const { price } = req.body;
    db.prepare('UPDATE delivery SET price = ? WHERE id = ?').run(price, req.params.id);
    res.json({ message: 'Prix mis à jour!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});