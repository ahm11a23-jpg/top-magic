import { useState, useEffect, useCallback, memo } from "react";
import Admin from "./Admin";
import "./App.css";

const API = "https://mvr-luxe-production.up.railway.app";

const CAT_ICONS = {
  "Tous": "⊞", "Soins Capillaires": "🧴", "Sérums": "💧", "Serums": "💧",
  "Protection": "🛡️", "Nutrition": "🥑", "Soins Corps": "🌿",
  "Protection Solaire": "☀️", "Coiffage": "✂️", "Soins Visage": "✨",
};

/* ===== SKELETON CARD ===== */
function SkeletonCard() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="product-body">
        <div className="skeleton skeleton-text short" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text medium" />
        <div className="skeleton skeleton-price" />
      </div>
    </div>
  );
}

/* ===== PRODUCT CARD ===== */
const ProductCard = memo(function ProductCard({ product, onAdd, onOpen }) {
  const [wish, setWish] = useState(false);
  const [added, setAdded] = useState(false);
  const items = product.pack_items ? JSON.parse(product.pack_items) : [];

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    setWish(w => !w);
  };

  const price = parseInt(product.price);

  return (
    <div
      className={`product-card${!!product.is_pack ? " pack-card" : ""}`}
      onClick={() => onOpen(product)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onOpen(product)}
    >
      {!!product.is_pack && <div className="pack-badge">🎁 Pack</div>}
      <button className={`wish-btn${wish ? " wished" : ""}`} onClick={handleWish} aria-label="Favoris">
        {wish ? "♥" : "♡"}
      </button>
      <div className="product-img-wrap">
        {product.image && product.image.startsWith("http") ? (
          <img src={product.image} alt={product.name} className="product-img" loading="lazy" />
        ) : (
          <span className="product-emoji">{product.image}</span>
        )}
      </div>
      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="stars">★★★★★</div>
        {!!product.is_pack && items.length > 0 && (
          <ul className="pack-items-preview">
            {items.map((item, i) => <li key={i}>✓ {item}</li>)}
          </ul>
        )}
        {!product.is_pack && <p className="product-desc">{product.description}</p>}
        <div className="product-footer">
          <span className="price">{price > 0 ? price.toLocaleString() + " DA" : ""}</span>
          <button className={`add-btn${added ? " added" : ""}`} onClick={handleAdd} aria-label="Ajouter au panier">
            {added ? "✓" : "🛒"}
          </button>
        </div>
      </div>
    </div>
  );
});

/* ===== SEARCH BAR ===== */
function SearchBar({ value, onChange, suggestions, onSelect, onClose }) {
  return (
    <div className="search-panel">
      <div className="search-input-wrap">
        <span className="search-icon-inner">🔍</span>
        <input
          autoFocus
          type="text"
          placeholder="Rechercher un produit..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="search-input"
        />
        <button className="search-close" onClick={onClose}>✕</button>
      </div>
      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.slice(0, 6).map(p => (
            <li key={p.id} onClick={() => onSelect(p)}>
              <span className="sug-emoji">{p.image && !p.image.startsWith("http") ? p.image : "🛍️"}</span>
              <div>
                <span className="sug-name">{p.name}</span>
                <span className="sug-cat">{p.category}</span>
              </div>
              <span className="sug-price">{parseInt(p.price) > 0 ? parseInt(p.price).toLocaleString() + " DA" : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ===== MAIN APP ===== */
export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [wilayas, setWilayas] = useState([]);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [deliveryPrice, setDeliveryPrice] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products`).then(r => r.json()),
      fetch(`${API}/api/delivery`).then(r => r.json()),
    ]).then(([prods, wils]) => {
      setProducts(prods);
      setWilayas(wils);
    }).catch(() => {
      showToast("Erreur de connexion au serveur", "error");
    }).finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 2500);
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`✓ ${product.name} ajouté!`);
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  }, []);

  const removeFromCart = useCallback((id) => setCart(c => c.filter(i => i.id !== id)), []);

  const handleWilayaChange = (e) => {
    const w = wilayas.find(w => w.id === parseInt(e.target.value, 10));
    setSelectedWilaya(w || null);
    setDeliveryPrice(w ? w.price : 0);
  };

  const handleOrder = async () => {
    if (!customerName.trim()) { showToast("Veuillez entrer votre nom", "error"); return; }
    if (!customerPhone.trim()) { showToast("Veuillez entrer votre téléphone", "error"); return; }
    if (!selectedWilaya) { showToast("Veuillez choisir une wilaya", "error"); return; }
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName, customer_phone: customerPhone,
          wilaya: selectedWilaya.wilaya_name, products: cart.map(i => i.name),
          total: total + deliveryPrice
        })
      });
      if (!res.ok) throw new Error();
      setCart([]); setCustomerName(""); setCustomerPhone(""); setSelectedWilaya(null); setDeliveryPrice(0);
      setOrderConfirmed(true);
    } catch {
      showToast("Erreur lors de la commande. Réessayez.", "error");
    }
  };

  const categories = ["Tous", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    (selectedCategory === "Tous" || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const searchSuggestions = search.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : [];

  const navigate = (p) => { setPage(p); setShowMenu(false); setShowSearch(false); window.scrollTo(0, 0); };

  const handleSearchSelect = (product) => {
    setSelectedProduct(product);
    setShowSearch(false);
    setSearch("");
  };

  return (
    <div className="app">

      {/* ===== TOAST ===== */}
      {toast.msg && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-inner">
          <button className="hamburger" onClick={() => setShowMenu(true)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <div className="logo" onClick={() => navigate("home")}>
            <div className="logo-mark">M</div>
            <div>
              <span className="logo-name">MVR LUXE</span>
              <span className="logo-sub">Cosmétiques</span>
            </div>
          </div>
          <nav className="nav-links">
            <button onClick={() => navigate("home")} className={page === "home" ? "active" : ""}>Accueil</button>
            <button onClick={() => navigate("products")} className={page === "products" ? "active" : ""}>Produits</button>
            <button onClick={() => navigate("products")}>Catégories</button>
            <button onClick={() => navigate("contact")} className={page === "contact" ? "active" : ""}>Contact</button>
          </nav>
          <div className="nav-actions">
            <button className="search-btn" onClick={() => setShowSearch(s => !s)} aria-label="Recherche">🔍</button>
            <button className="admin-btn" onClick={() => setShowAdmin(true)} aria-label="Admin">⚙️</button>
            <button className="cart-btn" onClick={() => setShowCart(true)} aria-label="Panier">
              Panier
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
        {showSearch && (
          <SearchBar
            value={search}
            onChange={setSearch}
            suggestions={searchSuggestions}
            onSelect={handleSearchSelect}
            onClose={() => { setShowSearch(false); setSearch(""); }}
          />
        )}
      </header>

      {/* ===== MOBILE MENU ===== */}
      {showMenu && (
        <div className="menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="menu-header">
              <div className="logo">
                <div className="logo-mark">M</div>
                <div><span className="logo-name">MVR LUXE</span><span className="logo-sub">Cosmétiques</span></div>
              </div>
              <button className="menu-close" onClick={() => setShowMenu(false)}>✕</button>
            </div>
            <nav className="menu-nav">
              <button onClick={() => navigate("home")}>
                <span>🏠</span> Accueil
              </button>
              <button onClick={() => navigate("products")}>
                <span>📦</span> Produits
              </button>
              <button onClick={() => navigate("contact")}>
                <span>📞</span> Contact
              </button>
              <button onClick={() => setShowCart(true)}>
                <span>🛒</span> Panier {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </nav>
            <div className="menu-footer">
              <p>📞 +213 799 031 951</p>
              <p>✉️ lamraniissam9@gmail.com</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== HOME PAGE ===== */}
      {page === "home" && (
        <main className="home">
          <section className="hero">
            <div className="hero-content">
              <p className="hero-eyebrow">Laboratoires MVR LUXE</p>
              <h1>La beauté qui<br />vous <em className="hero-em">sublime</em></h1>
              <p className="hero-desc">Des produits authentiques pour prendre soin de vous chaque jour.</p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => navigate("products")}>🛍️ Découvrir nos produits</button>
                <button className="btn-outline-white" onClick={() => navigate("products")}>🎁 Voir les offres</button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-badge-pill"><span className="hero-badge-dot"></span> Livraison partout en Algérie</div>
              <div className="hero-stats-grid">
                {[["50+","Produits"],["4.9","Note / 5"],["48h","Livraison"],["100%","Authentique"]].map(([n,l]) => (
                  <div key={l} className="hero-stat">
                    <div className="hero-stat-num">{n}</div>
                    <div className="hero-stat-label">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="marquee-strip" aria-hidden="true">
            <div className="marquee-inner">
              {["Soins Capillaires","Sérums Visage","Crèmes Hydratantes","Nutrition Corps","Protection Solaire","Coiffage Premium",
                "Soins Capillaires","Sérums Visage","Crèmes Hydratantes","Nutrition Corps","Protection Solaire","Coiffage Premium"].map((t,i) => (
                <span key={i} className="marquee-item">{t} <span className="marquee-sep">·</span></span>
              ))}
            </div>
          </div>

          <section className="trust-strip">
            {[
              { icon: "🛡️", title: "Produit Authentique", sub: "100% garanti" },
              { icon: "🚚", title: "Livraison Rapide", sub: "Partout en Algérie" },
              { icon: "↩️", title: "Retour 30 jours", sub: "Satisfait ou remboursé" },
              { icon: "💳", title: "Paiement à la livraison", sub: "Payez à la réception" },
            ].map((b, i) => (
              <div key={i} className="trust-item">
                <span className="trust-icon">{b.icon}</span>
                <div><strong>{b.title}</strong><p>{b.sub}</p></div>
              </div>
            ))}
          </section>

          <section className="promo-banner">
            <div className="promo-content">
              <p className="promo-label">Offre Spéciale</p>
              <h2>-30% sur toute<br />la collection <span>été</span></h2>
              <p>Profitez de notre offre exclusive pour une beauté éclatante</p>
              <button className="btn-primary" onClick={() => navigate("products")}>En Profiter ✨</button>
            </div>
            <div className="promo-visual"><span aria-hidden="true">🌸</span></div>
          </section>

          <section className="featured-section">
            <div className="section-head">
              <div><span className="section-label">Sélection exclusive</span><h2>Produits Phares</h2></div>
              <button className="btn-outline" onClick={() => navigate("products")}>Voir tout →</button>
            </div>
            <div className="products-grid">
              {loading
                ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onOpen={setSelectedProduct} />)
              }
            </div>
            <div className="center-btn">
              <button className="btn-outline" onClick={() => navigate("products")}>Voir Tous Les Produits →</button>
            </div>
          </section>

          <section className="categories-section">
            <div className="section-head">
              <div><span className="section-label">Nos univers</span><h2>Catégories</h2></div>
            </div>
            <div className="cat-grid">
              {categories.filter(c => c !== "Tous").slice(0, 6).map(cat => (
                <button key={cat} className="cat-card" onClick={() => { setSelectedCategory(cat); navigate("products"); }}>
                  <span className="cat-icon">{CAT_ICONS[cat] || "📦"}</span>
                  <span className="cat-name">{cat}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="reviews-section">
            <div className="section-head">
              <div><span className="section-label">Témoignages</span><h2>Avis de Nos Clientes</h2></div>
            </div>
            <div className="reviews-grid">
              {[
                { name: "Sarah B.", text: "Les produits MVR LUXE sont incroyables! Mes cheveux n'ont jamais été aussi doux et brillants.", stars: 5 },
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

          <footer className="footer">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="logo" style={{marginBottom:"16px"}}>
                  <div className="logo-mark">M</div>
                  <div><span className="logo-name">MVR LUXE</span><span className="logo-sub">Cosmétiques</span></div>
                </div>
                <p>Votre destination beauté pour des produits cosmétiques de qualité supérieure.</p>
                <div className="social-row">
                  <a href="https://wa.me/213799031951" target="_blank" rel="noreferrer" className="social-btn" aria-label="WhatsApp">💬</a>
                  <a href="mailto:lamraniissam9@gmail.com" className="social-btn" aria-label="Email">📧</a>
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
                <p>📞 +213 799 031 951</p>
                <p>✉️ lamraniissam9@gmail.com</p>
                <p>📍 Alger, Algérie</p>
                <p>🕐 Lun – Sam : 9h – 18h</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2025 <span>MVR LUXE</span>. Tous droits réservés.</p>
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
            <div className="filters-bar">
              <h3>Catégories</h3>
              <div className="cat-pills">
                {categories.map(cat => (
                  <button key={cat} className={`cat-pill${selectedCategory === cat ? " active" : ""}`} onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="products-main">
              <div className="products-toolbar">
                <span className="products-count">{filtered.length} produit{filtered.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="products-grid">
                {loading
                  ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
                  : filtered.length === 0
                    ? <div className="no-results"><span>🔍</span><p>Aucun produit trouvé</p><button className="btn-outline" onClick={() => setSelectedCategory("Tous")}>Voir tout</button></div>
                    : filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onOpen={setSelectedProduct} />)
                }
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ===== CONTACT PAGE ===== */}
      {page === "contact" && (
        <main className="contact-page">
          <div className="page-header">
            <h1>Contactez-nous</h1>
            <p className="breadcrumb"><span onClick={() => navigate("home")}>Accueil</span> / Contact</p>
          </div>
          <div className="contact-layout">
            <div className="contact-info">
              <h2>Nous sommes là pour vous</h2>
              <p>Notre équipe est disponible du lundi au samedi, de 9h à 18h, pour répondre à toutes vos questions.</p>
              <div className="contact-items">
                {[
                  { icon:"📞", label:"Téléphone", val:"+213 799 031 951", href:"tel:+213799031951" },
                  { icon:"✉️", label:"Email", val:"lamraniissam9@gmail.com", href:"mailto:lamraniissam9@gmail.com" },
                  { icon:"💬", label:"WhatsApp", val:"+213 799 031 951", href:"https://wa.me/213799031951" },
                  { icon:"📍", label:"Adresse", val:"Alger, Algérie", href:null },
                ].map(({ icon, label, val, href }) => (
                  <div key={label} className="contact-item">
                    <div className="contact-icon">{icon}</div>
                    <div>
                      <h4>{label}</h4>
                      {href ? <a href={href}>{val}</a> : <p>{val}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ===== CART DRAWER ===== */}
      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Mon Panier {cartCount > 0 && <span className="count-pill">{cartCount}</span>}</h2>
              <button className="icon-btn" onClick={() => setShowCart(false)}>✕</button>
            </div>

            {orderConfirmed ? (
              <div className="order-success">
                <div className="success-icon">🎉</div>
                <h3>Commande confirmée!</h3>
                <p>Merci! Notre équipe vous contactera bientôt pour confirmer la livraison.</p>
                <button className="btn-primary" onClick={() => { setOrderConfirmed(false); setShowCart(false); }}>
                  Continuer les achats
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="drawer-empty">
                <span>🛍️</span>
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
                          ? <img src={item.image} alt={item.name} loading="lazy" />
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
                      <button className="rm-btn" onClick={() => removeFromCart(item.id)} aria-label="Supprimer">🗑️</button>
                    </div>
                  ))}
                </div>
                <div className="cart-form">
                  <label>Vos informations</label>
                  <input placeholder="Nom complet *" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  <input placeholder="Numéro de téléphone *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                  <select onChange={handleWilayaChange} defaultValue="">
                    <option value="" disabled>Choisir votre wilaya *</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.wilaya_code} — {w.wilaya_name}</option>)}
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
                <button className="order-btn" onClick={handleOrder}>Confirmer la commande →</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== PRODUCT DETAIL ===== */}
      {selectedProduct && (
        <div className="overlay" onClick={() => setSelectedProduct(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <button className="icon-btn detail-close-btn" onClick={() => setSelectedProduct(null)}>✕</button>
            <div className="detail-img-wrap">
              {selectedProduct.image && selectedProduct.image.startsWith("http")
                ? <img src={selectedProduct.image} alt={selectedProduct.name} loading="lazy" />
                : <span>{selectedProduct.image}</span>}
            </div>
            <div className="detail-body">
              <span className="product-category">{selectedProduct.category}</span>
              <h2>{selectedProduct.name}</h2>
              <div className="stars detail-stars">★★★★★</div>
              <p className="detail-desc">{selectedProduct.description || "Produit de haute qualité, disponible maintenant."}</p>
              <div className="detail-price">{parseInt(selectedProduct.price) > 0 ? parseInt(selectedProduct.price).toLocaleString() + " DA" : ""}</div>
              <div className="detail-features">
                <span>✅ Produit Authentique</span>
                <span>🚚 Livraison Rapide</span>
                <span>↩️ Retour 30 jours</span>
              </div>
              <button className="order-btn" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                Ajouter au panier →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOTTOM NAV (Mobile) ===== */}
      <nav className="bottom-nav">
        <button className={page === "home" ? "bnav-active" : ""} onClick={() => navigate("home")}>
          <span>🏠</span><span>Accueil</span>
        </button>
        <button className={page === "products" ? "bnav-active" : ""} onClick={() => navigate("products")}>
          <span>📦</span><span>Produits</span>
        </button>
        <button className={page === "contact" ? "bnav-active" : ""} onClick={() => navigate("contact")}>
          <span>📞</span><span>Contact</span>
        </button>
        <button onClick={() => setShowCart(true)}>
          <span className="bnav-cart-wrap">🛒{cartCount > 0 && <span className="bnav-badge">{cartCount}</span>}</span>
          <span>Panier</span>
        </button>
      </nav>

      {showAdmin && <Admin onClose={() => setShowAdmin(false)} />}
    </div>
  );
}