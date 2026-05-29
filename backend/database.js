const Database = require('better-sqlite3');
const path = require('path');
 
const dbPath = path.join(__dirname, 'store.db');
let db;
 
try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
} catch (error) {
  console.error('Failed to open SQLite database:', dbPath, error);
  process.exit(1);
}
 
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_pack INTEGER DEFAULT 0,
    pack_items TEXT DEFAULT NULL,
    images TEXT DEFAULT NULL
  )
`);
 
// إضافة الأعمدة الجديدة إذا لم تكن موجودة (للقاعدة القديمة)
try { db.exec(`ALTER TABLE products ADD COLUMN is_pack INTEGER DEFAULT 0`); } catch(e) {}
try { db.exec(`ALTER TABLE products ADD COLUMN pack_items TEXT DEFAULT NULL`); } catch(e) {}
try { db.exec(`ALTER TABLE products ADD COLUMN images TEXT DEFAULT NULL`); } catch(e) {}
 
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
  const insert = db.prepare(
    'INSERT INTO products (name, price, image, category, description, is_pack, pack_items) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insert.run('Shampoing Argan & Aloe Vera', 1200, '🧴', 'Soins Capillaires', 'Sans sulfate, hydratation extreme pour cheveux secs', 0, null);
  insert.run('Masque Lisse-Intense', 1500, '💆', 'Soins Capillaires', 'Nourrit en profondeur et facilite le lissage', 0, null);
  insert.run('Serum Keratine', 1800, '✨', 'Serums', 'Repare les longueurs cassantes et sensibilisees', 0, null);
  insert.run('Serum Botox Jojoba & Argan', 2000, '💎', 'Serums', 'Sans sulfate, revitalise et redonne de la masse', 0, null);
  insert.run('Serum 24K Anti-frizz', 2200, '🌟', 'Serums', 'Dompte les frisottis sans film gras', 0, null);
  insert.run('Spray Thermoprotecteur', 1400, '🔥', 'Protection', 'Protege jusqu a 230C contre la chaleur', 0, null);
  insert.run('Gamme Avocado', 1600, '🥑', 'Nutrition', 'Nutrition intense pour cheveux abimes', 0, null);
  insert.run('Gel Aloe Vera 99%', 900, '🌿', 'Soins Corps', 'Apaisant et hydratant pour corps et visage', 0, null);
  insert.run('Lait Solaire SPF50', 1100, '☀️', 'Protection Solaire', 'Protection solaire haute performance', 0, null);
  insert.run('Creme Coiffante', 1300, '💅', 'Coiffage', 'Discipliner la chevelure au quotidien', 0, null);
}
 
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    customer_phone TEXT,
    products TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'En attente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
 
db.exec(`
  CREATE TABLE IF NOT EXISTS delivery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wilaya_code INTEGER NOT NULL,
    wilaya_name TEXT NOT NULL,
    price REAL DEFAULT 400
  )
`);
 
const deliveryCount = db.prepare('SELECT COUNT(*) as count FROM delivery').get();
if (deliveryCount.count === 0) {
  const ins = db.prepare('INSERT INTO delivery (wilaya_code, wilaya_name, price) VALUES (?, ?, ?)');
  const wilayas = [
    [1,'Adrar',600],[2,'Chlef',400],[3,'Laghouat',500],[4,'Oum El Bouaghi',450],
    [5,'Batna',450],[6,'Béjaïa',400],[7,'Biskra',500],[8,'Béchar',600],
    [9,'Blida',350],[10,'Bouira',400],[11,'Tamanrasset',700],[12,'Tébessa',450],
    [13,'Tlemcen',500],[14,'Tiaret',450],[15,'Tizi Ouzou',400],[16,'Alger',350],
    [17,'Djelfa',500],[18,'Jijel',450],[19,'Sétif',400],[20,'Saïda',500],
    [21,'Skikda',450],[22,'Sidi Bel Abbès',500],[23,'Annaba',400],[24,'Guelma',450],
    [25,'Constantine',400],[26,'Médéa',400],[27,'Mostaganem',450],[28,'M\'Sila',450],
    [29,'Mascara',450],[30,'Ouargla',600],[31,'Oran',450],[32,'El Bayadh',550],
    [33,'Illizi',700],[34,'Bordj Bou Arréridj',400],[35,'Boumerdès',350],
    [36,'El Tarf',450],[37,'Tindouf',700],[38,'Tissemsilt',450],[39,'El Oued',550],
    [40,'Khenchela',450],[41,'Souk Ahras',450],[42,'Tipaza',350],[43,'Mila',450],
    [44,'Aïn Defla',400],[45,'Naâma',550],[46,'Aïn Témouchent',450],[47,'Ghardaïa',550],
    [48,'Relizane',450],[49,'Timimoun',650],[50,'Bordj Badji Mokhtar',700],
    [51,'Ouled Djellal',550],[52,'Béni Abbès',650],[53,'In Salah',700],
    [54,'In Guezzam',700],[55,'Touggourt',580],[56,'Djanet',700],
    [57,'El M\'Ghair',570],[58,'El Menia',650]
  ];
  wilayas.forEach(w => ins.run(w[0], w[1], w[2]));
}
 
module.exports = db;