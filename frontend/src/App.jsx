import { useState, useEffect, useRef } from "react";
import Admin from "./Admin";
import "./App.css";

// ===== ICONS =====
const Icons = {
  home: "🏠", products: "📦", categories: "⊞", contact: "📞", cart: "🛒",
  search: "🔍", menu: "☰", heart: "♡", heartFull: "♥", star: "★",
  delivery: "🚚", certified: "✅", payment: "💳", satisfaction: "😊",
  whatsapp: "💬", phone: "📞", email: "📧", instagram: "📸",
  arrow: "→", close: "✕", trash: "🗑️", minus: "−", plus: "+",
};

// ===== CATEGORY ICONS =====
const CAT_ICONS = {
  "Tous": "⊞", "Soins Capillaires": "🧴", "Sérums": "💧", "Serums": "💧",
  "Protection": "🛡️", "Nutrition": "🥑", "Soins Corps": "🌿",
  "Protection Solaire": "☀️", "Coiffage": "✂️", "Soins Visage": "✨",
};

// ===== PRODUCT CARD =====
function ProductCard({ product, onAdd, onOpen }) {
  const [wish, setWish] = useState(false);
  const [added, setAdded] = useState(false);
  const items = product.pack_items ? JSON.parse(product.pack_items) : [];

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`product-card ${product.is_pack ? "pack-card" : ""}`} onClick={() => onOpen && onOpen(product)} style={{cursor:"pointer"}}>
      {product.is_pack && <div className="pack-badge">🎁 Pack</div>}
      <button className={`wish-btn ${wish ? "wished" : ""}`} onClick={() => setWish(!wish)}>
        {wish ? Icons.heartFull : Icons.heart}
      </button>
      <div className="product-img-wrap">
        {product.image && product.image.startsWith("http") ? (
          <img src={product.image} alt={product.name} className="product-img" />
        ) : (
          <span className="product-emoji">{product.image}</span>
        )}
      </div>
      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="stars">★★★★★</div>
        {product.is_pack && items.length > 0 && (
          <ul className="pack-items-preview">
            {items.map((item, i) => <li key={i}>✓ {item}</li>)}
          </ul>
        )}
        {!product.is_pack && product.description && product.description !== "0" && (
          <p className="product-desc">{product.description}</p>
        )}
        <div className="product-footer">
          <span className="price">{Number(product.price).toLocaleString()} DA</span>
          <button className={`add-btn ${added ? "added" : ""}`} onClick={handleAdd}>
            {added ? "✓" : "🛒"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== PRODUCT DETAIL MODAL =====
function ProductDetailModal({ product, onClose, onAdd }) {
  const [imgIdx, setImgIdx] = useState(0);
  const allImgs = (() => {
    try {
      const imgs = product.images ? JSON.parse(product.images) : null;
      return imgs && imgs.length > 0 ? imgs : (product.image && product.image.startsWith("http") ? [product.image] : null);
    } catch { return product.image && product.image.startsWith("http") ? [product.image] : null; }
  })();

  return (
    <div className="overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <button className="icon-btn detail-close-btn" onClick={onClose}>✕</button>
        <div className="detail-img-wrap">
          {allImgs ? (
            <>
              <img src={allImgs[imgIdx]} alt={product.name} />
              {allImgs.length > 1 && (
                <>
                  <button className="gallery-btn gallery-prev" onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length); }}>‹</button>
                  <button className="gallery-btn gallery-next" onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % allImgs.length); }}>›</button>
                  <div className="gallery-dots">
                    {allImgs.map((_, i) => (
                      <span key={i} className={`gallery-dot ${i === imgIdx ? "active" : ""}`} onClick={e => { e.stopPropagation(); setImgIdx(i); }} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <span style={{fontSize:"80px"}}>{product.image}</span>
          )}
        </div>
        <div className="detail-body">
          <span className="product-category">{product.category}</span>
          <h2>{product.name}</h2>
          <div className="stars" style={{fontSize:"18px", margin:"8px 0"}}>★★★★★</div>
          {product.description && product.description !== "0" && (
            <p className="detail-desc">{product.description}</p>
          )}
          <div className="detail-price">{Number(product.price).toLocaleString()} DA</div>
          <div className="detail-features">
            <span>✅ Produit Authentique</span>
            <span>🚚 Livraison Rapide</span>
            <span>↩️ Retour 30 jours</span>
          </div>
          <button className="order-btn" style={{marginTop:"16px"}} onClick={() => { onAdd(product); onClose(); }}>
            🛒 Ajouter au panier — {Number(product.price).toLocaleString()} DA
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN APP =====
function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [notification, setNotification] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [wilayas, setWilayas] = useState([]);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    fetch("https://top-magic-production.up.railway.app/api/products").then(r => r.json()).then(setProducts).catch(console.error);
    fetch("https://top-magic-production.up.railway.app/api/delivery").then(r => r.json()).then(setWilayas).catch(console.error);
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setNotification(`✅ ${product.name} ajouté au panier!`);
    setTimeout(() => setNotification(""), 2000);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  const handleWilayaChange = (e) => {
    const w = wilayas.find(w => w.id === parseInt(e.target.value, 10));
    setSelectedWilaya(w);
    setDeliveryPrice(w ? w.price : 0);
  };

  const handleOrder = async () => {
    if (!customerName || !customerPhone) { alert("Veuillez entrer votre nom et téléphone!"); return; }
    if (!selectedWilaya) { alert("Veuillez choisir une wilaya."); return; }
    const res = await fetch("https://top-magic-production.up.railway.app/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName, customer_phone: customerPhone,
        wilaya: selectedWilaya.wilaya_name, products: cart.map(i => i.name),
        total: total + deliveryPrice
      })
    });
    const result = await res.json();
    if (!res.ok) { setNotification(result?.message || "Erreur!"); return; }
    setCart([]); setCustomerName(""); setCustomerPhone(""); setSelectedWilaya(null); setDeliveryPrice(0);
    setOrderConfirmed(true);
  };

  const categories = ["Tous", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    (selectedCategory === "Tous" || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const navigate = (p) => { setPage(p); setShowMenu(false); window.scrollTo(0, 0); };

  return (
    <div className="app">

      {/* Notification Toast */}
      {notification && (
        <div className="toast">
          <span>{notification}</span>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-inner">
          <button className="icon-btn menu-btn" onClick={() => setShowMenu(true)}>☰</button>

          <div className="logo" onClick={() => navigate("home")}>
            <span>✨</span>
            <div>
              <span className="logo-name">Top Magic</span>
              <span className="logo-sub">Cosmétiques</span>
            </div>
          </div>

          <nav className="desktop-nav">
            <button onClick={() => navigate("home")} className={page === "home" ? "nav-active" : ""}>Accueil</button>
            <button onClick={() => navigate("products")} className={page === "products" ? "nav-active" : ""}>Produits</button>
            <button onClick={() => navigate("products")} className="">Catégories</button>
            <button onClick={() => navigate("contact")} className={page === "contact" ? "nav-active" : ""}>Contact</button>
          </nav>

          <div className="header-right">
            <button className="icon-btn" onClick={() => setShowSearch(!showSearch)}>🔍</button>
            <button className="icon-btn admin-trigger" onClick={() => setShowAdmin(true)}>⚙️</button>
            <button className="cart-btn" onClick={() => setShowCart(true)}>
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="search-bar">
            <input
              autoFocus
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) navigate("products"); }}
            />
            <button onClick={() => { setShowSearch(false); setSearch(""); }}>✕</button>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {showMenu && (
        <div className="menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="menu-header">
              <div className="logo"><span>✨</span><span className="logo-name">Top Magic</span></div>
              <button onClick={() => setShowMenu(false)}>✕</button>
            </div>
            <nav className="menu-nav">
              <button onClick={() => navigate("home")}>🏠 Accueil</button>
              <button onClick={() => navigate("products")}>📦 Produits</button>
              <button onClick={() => navigate("contact")}>📞 Contact</button>
              <button onClick={() => { setShowAdmin(true); setShowMenu(false); }}>⚙️ Admin</button>
            </nav>
          </div>
        </div>
      )}

      {/* ===== HOME PAGE ===== */}
      {page === "home" && (
        <main className="home">

          {/* Hero */}
          <section className="hero" ref={heroRef}>
            <div className="hero-content">
              <p className="hero-eyebrow">✨ Laboratoires Top Magic</p>
              <h1>Révélez Votre<br /><span className="gradient-text">Beauté Naturelle</span></h1>
              <p className="hero-desc">Des soins luxueux pour sublimer votre peau et révéler votre éclat au quotidien.</p>
              <button className="btn-primary" onClick={() => navigate("products")}>
                Découvrir Maintenant ✨
              </button>
              <div className="hero-stats">
                <div className="stat"><strong>100%</strong><span>Produits Authentiques</span></div>
                <div className="stat"><strong>5000+</strong><span>Clients Satisfaits</span></div>
                <div className="stat"><strong>24/7</strong><span>Support Dédié</span></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-blob"></div>
              <div className="hero-circle">
                <span>💄</span>
              </div>
              <div className="float-el f1">🌸</div>
              <div className="float-el f2">✨</div>
              <div className="float-el f3">💎</div>
            </div>
          </section>

          {/* Trust Badges */}
          <section className="trust-strip">
            {[
              { icon: "🚚", title: "Livraison Rapide", sub: "Partout en Algérie" },
              { icon: "✅", title: "Produits Certifiés", sub: "100% Authentiques" },
              { icon: "💳", title: "Paiement Sécurisé", sub: "Transactions Protégées" },
              { icon: "😊", title: "Satisfaction Garantie", sub: "Remboursement Facile" },
            ].map((b, i) => (
              <div key={i} className="trust-item">
                <span className="trust-icon">{b.icon}</span>
                <div><strong>{b.title}</strong><p>{b.sub}</p></div>
              </div>
            ))}
          </section>

          {/* Promo Banner */}
          <section className="promo-banner">
            <div className="promo-content">
              <p className="promo-label">Offre Spéciale</p>
              <h2>-30% SUR TOUTE<br />LA COLLECTION ÉTÉ</h2>
              <p>Profitez de notre offre exclusive pour une beauté éclatante</p>
              <button className="btn-primary" onClick={() => navigate("products")}>En Profiter ✨</button>
            </div>
            <div className="promo-visual">
              <div className="promo-badge">-30%</div>
              <span style={{fontSize:"80px"}}>🌟</span>
            </div>
          </section>

          {/* Featured Products */}
          <section className="featured-section">
            <div className="section-head">
              <h2>Produits Phares</h2>
              <span className="section-line"></span>
            </div>
            <div className="products-grid">
              {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onOpen={setSelectedProduct} />)}
            </div>
            <div style={{textAlign:"center", marginTop:"32px"}}>
              <button className="btn-outline" onClick={() => navigate("products")}>
                Voir Tous Les Produits →
              </button>
            </div>
          </section>

          {/* Categories */}
          <section className="categories-section">
            <div className="section-head">
              <h2>Catégories Populaires</h2>
              <span className="section-line"></span>
            </div>
            <div className="cat-grid">
              {categories.filter(c => c !== "Tous").slice(0, 6).map(cat => (
                <button key={cat} className="cat-card" onClick={() => { setSelectedCategory(cat); navigate("products"); }}>
                  <span className="cat-icon">{CAT_ICONS[cat] || "📦"}</span>
                  <span className="cat-name">{cat}</span>
                </button>
              ))}
            </div>
            <div style={{textAlign:"center", marginTop:"24px"}}>
              <button className="btn-outline" onClick={() => navigate("products")}>
                Voir Toutes Les Catégories
              </button>
            </div>
          </section>

          {/* Reviews */}
          <section className="reviews-section">
            <div className="section-head">
              <h2>Avis de Nos Clientes</h2>
              <span className="section-line"></span>
            </div>
            <div className="reviews-grid">
              {[
                { name: "Sarah B.", text: "Les produits TopMagic sont incroyables! Mes cheveux n'ont jamais été aussi doux et brillants.", stars: 5 },
                { name: "Nadia K.", text: "Livraison rapide et produits de qualité. Je recommande à 100%! Le sérum est juste parfait.", stars: 5 },
                { name: "Lina D.", text: "Enfin des soins qui donnent de vrais résultats. Ma peau est éclatante et hydratée!", stars: 5 },
              ].map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-stars">{"★".repeat(r.stars)}</div>
                  <p className="review-text">"{r.text}"</p>
                  <div className="reviewer">
                    <div className="reviewer-avatar">{r.name[0]}</div>
                    <strong>{r.name}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="logo" style={{marginBottom:"12px"}}>
                  <span>✨</span>
                  <div><span className="logo-name">Top Magic</span><span className="logo-sub">Cosmétiques</span></div>
                </div>
                <p>Votre destination beauté pour des produits cosmétiques de qualité supérieure.</p>
                <div className="social-row">
                  <a href="https://www.instagram.com/laboratoires_topmagic" target="_blank" className="social-btn">📸</a>
                  <a href="https://wa.me/213560938555" target="_blank" className="social-btn">💬</a>
                  <a href="mailto:topmagic.laboratoires@gmail.com" className="social-btn">📧</a>
                </div>
              </div>
              <div className="footer-col">
                <h4>Liens Rapides</h4>
                <button onClick={() => navigate("home")}>Accueil</button>
                <button onClick={() => navigate("products")}>Produits</button>
                <button onClick={() => navigate("contact")}>Contact</button>
              </div>
              <div className="footer-col">
                <h4>Catégories</h4>
                {categories.slice(1, 5).map(c => (
                  <button key={c} onClick={() => { setSelectedCategory(c); navigate("products"); }}>{c}</button>
                ))}
              </div>
              <div className="footer-col">
                <h4>Contact</h4>
                <p>📞 +213 560 938 555</p>
                <p>✉️ topmagic.laboratoires@gmail.com</p>
                <p>📍 Alger, Algérie</p>
                <p>🕐 Lun - Sam: 9h00 - 18h00</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2024 TopMagic. Tous droits réservés.</p>
            </div>
          </footer>
        </main>
      )}

      {/* ===== PRODUCTS PAGE ===== */}
      {page === "products" && (
        <main className="products-page">
          <div className="page-header">
            <h1>Nos Produits</h1>
            <p className="breadcrumb"><span onClick={() => navigate("home")}>Accueil</span> / Produits</p>
          </div>

          <div className="products-layout">
            {/* Filters */}
            <div className="filters-bar">
              <div className="cat-pills">
                {categories.map(cat => (
                  <button key={cat}
                    className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="filter-actions">
                <button className="filter-btn">⚙️ Filtres</button>
                <button className="filter-btn">↕️ Trier</button>
              </div>
            </div>

            {/* Grid */}
            <div className="products-grid">
              {filtered.length === 0 ? (
                <div className="no-results">
                  <span>🔍</span>
                  <p>Aucun produit trouvé</p>
                </div>
              ) : (
                filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onOpen={setSelectedProduct} />)
              )}
            </div>
          </div>
        </main>
      )}

      {/* ===== CONTACT PAGE ===== */}
      {page === "contact" && (
        <main className="contact-page">
          <div className="page-header">
            <h1>Contactez-nous</h1>
            <p>Notre équipe est disponible pour vous aider 7j/7</p>
          </div>

          <div className="contact-grid">
            <a href="https://wa.me/213560938555" className="contact-card whatsapp-card">
              <div className="contact-icon">💬</div>
              <h3>WhatsApp</h3>
              <p>05 60 93 85 55</p>
              <span className="contact-cta">Envoyer un message →</span>
            </a>
            <a href="tel:+213560938555" className="contact-card phone-card">
              <div className="contact-icon">📞</div>
              <h3>Téléphone</h3>
              <p>05 60 93 85 55</p>
              <span className="contact-cta">Appeler maintenant →</span>
            </a>
            <a href="mailto:topmagic.laboratoires@gmail.com" className="contact-card email-card">
              <div className="contact-icon">📧</div>
              <h3>Email</h3>
              <p>topmagic.laboratoires@gmail.com</p>
              <span className="contact-cta">Envoyer un email →</span>
            </a>
            <a href="https://www.instagram.com/laboratoires_topmagic" target="_blank" className="contact-card insta-card">
              <div className="contact-icon">📸</div>
              <h3>Instagram</h3>
              <p>@laboratoires_topmagic</p>
              <span className="contact-cta">Nous suivre →</span>
            </a>
          </div>

          {/* Contact Info */}
          <div className="contact-info-box">
            <div className="info-item"><span>📍</span><div><strong>Adresse</strong><p>Alger, Algérie</p></div></div>
            <div className="info-item"><span>🕐</span><div><strong>Horaires</strong><p>Lun - Sam: 9h00 - 18h00</p></div></div>
            <div className="info-item"><span>📞</span><div><strong>Téléphone</strong><p>+213 560 938 555</p></div></div>
            <div className="info-item"><span>✉️</span><div><strong>Email</strong><p>topmagic.laboratoires@gmail.com</p></div></div>
          </div>
        </main>
      )}

      {/* ===== CART DRAWER ===== */}
      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>🛒 Mon Panier {cartCount > 0 && <span className="count-pill">{cartCount}</span>}</h2>
              <button className="icon-btn" onClick={() => setShowCart(false)}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div className="drawer-empty">
                <span>🛒</span>
                <p>Votre panier est vide</p>
                <button className="btn-primary" onClick={() => { setShowCart(false); navigate("products"); }}>
                  Découvrir nos produits
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-img">
                        {item.image && item.image.startsWith("http")
                          ? <img src={item.image} alt={item.name} />
                          : <span>{item.image}</span>}
                      </div>
                      <div className="cart-info">
                        <h4>{item.name}</h4>
                        <p className="cart-price">{(item.price * item.qty).toLocaleString()} DA</p>
                      </div>
                      <div className="qty-box">
                        <button onClick={() => updateQty(item.id, -1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, +1)}>+</button>
                      </div>
                      <button className="rm-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
                    </div>
                  ))}
                </div>

                <div className="cart-form">
                  <label>👤 Vos informations</label>
                  <input placeholder="Nom complet" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  <input placeholder="Numéro de téléphone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                  <select onChange={handleWilayaChange} defaultValue="">
                    <option value="" disabled>🏙️ Choisir votre wilaya</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.wilaya_code} - {w.wilaya_name}</option>)}
                  </select>
                  {selectedWilaya && (
                    <div className="delivery-row">
                      <span>🚚 Livraison {selectedWilaya.wilaya_name}</span>
                      <strong>{deliveryPrice} DA</strong>
                    </div>
                  )}
                </div>

                <div className="cart-summary">
                  <div className="sum-row"><span>Sous-total</span><span>{total.toLocaleString()} DA</span></div>
                  <div className="sum-row"><span>Livraison</span><span>{deliveryPrice > 0 ? `${deliveryPrice} DA` : "—"}</span></div>
                  <div className="sum-row sum-total"><span>Total</span><span>{(total + deliveryPrice).toLocaleString()} DA</span></div>
                </div>

                <button className="order-btn" onClick={handleOrder}>
                  ✅ Confirmer la commande
                </button>
              </>
            )}

            {/* Confirmation screen */}
            {orderConfirmed && (
              <div className="order-success">
                <div className="success-icon">✅</div>
                <h3>Commande confirmée!</h3>
                <p>Merci pour votre commande.<br />Notre équipe vous contactera bientôt pour confirmer la livraison.</p>
                <button className="btn-primary" onClick={() => { setOrderConfirmed(false); setShowCart(false); }}>
                  Continuer les achats
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        <button className={page === "home" ? "bnav-active" : ""} onClick={() => navigate("home")}>
          <span>🏠</span><span>Accueil</span>
        </button>
        <button className={page === "products" ? "bnav-active" : ""} onClick={() => navigate("products")}>
          <span>📦</span><span>Produits</span>
        </button>
        <button onClick={() => navigate("products")}>
          <span>⊞</span><span>Catégories</span>
        </button>
        <button className={page === "contact" ? "bnav-active" : ""} onClick={() => navigate("contact")}>
          <span>📞</span><span>Contact</span>
        </button>
        <button onClick={() => setShowCart(true)}>
          <span style={{position:"relative", display:"inline-block"}}>
            🛒
            {cartCount > 0 && <span className="bnav-badge">{cartCount}</span>}
          </span>
          <span>Panier</span>
        </button>
      </nav>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
        />
      )}

      {showAdmin && <Admin onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

export default App;
