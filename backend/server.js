const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const db = require('./database');

const app = express();

app.use(cors({
  origin: ["https://mvr-luxe.vercel.app", "http://localhost:5173"]
}));
app.use(express.json());

// ── Cloudinary Config ──────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer: الذاكرة مباشرة (بدون حفظ محلي) ────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

// ── Helper: رفع buffer على Cloudinary ─────────────────────────────
function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'top-magic', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// ── Routes ─────────────────────────────────────────────────────────

// جلب المنتجات
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

// إضافة منتج مع صور متعددة
app.post('/api/products', upload.array('images', 10), async (req, res) => {
  try {
    const { name, price, category, description, is_pack, pack_items } = req.body;
    const files = req.files || [];

    // رفع كل الصور على Cloudinary بالتوازي
    const uploadedUrls = await Promise.all(
      files.map(f => uploadToCloudinary(f.buffer, f.mimetype))
    );

    const image    = uploadedUrls.length > 0 ? uploadedUrls[0] : (req.body.image || '🧴');
    const imagesStr = uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null;
    const isPack   = is_pack === "1" ? 1 : 0;
    const packItemsStr = isPack && pack_items ? pack_items : null;

    db.prepare(
      'INSERT INTO products (name, price, image, category, description, is_pack, pack_items, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, parseFloat(price), image, category, description, isPack, packItemsStr, imagesStr);

    res.json({ message: 'Product added!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// حذف منتج

// ===== UPDATE PRODUCT =====
app.put('/api/products/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, is_pack, pack_items } = req.body;
    
    let image = null;
    if (req.files && req.files.length > 0) {
      const result = await cloudinary.uploader.upload(req.files[0].path, { folder: 'mvr-luxe', resource_type: 'image' });
      image = result.secure_url;
    }

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Produit non trouvé' });

    const finalImage = image || existing.image;
    
    db.prepare(
      'UPDATE products SET name=?, price=?, category=?, description=?, is_pack=?, pack_items=?, image=? WHERE id=?'
    ).run(name, price, category, description, is_pack || '0', pack_items || null, finalImage, id);

    res.json({ message: 'Produit modifié avec succès!' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
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
    const { customer_name, customer_phone, wilaya, products, total } = req.body;
    // إضافة عمود wilaya إذا لم يكن موجوداً
    try { db.prepare('ALTER TABLE orders ADD COLUMN wilaya TEXT').run(); } catch {}
    db.prepare(
      'INSERT INTO orders (customer_name, customer_phone, wilaya, products, total) VALUES (?, ?, ?, ?, ?)'
    ).run(customer_name, customer_phone, wilaya || "", JSON.stringify(products), total);
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



