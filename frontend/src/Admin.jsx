import { useState, useEffect } from "react";
import "./Admin.css";

const ADMIN_TOKEN = "admin-token-2024";

function Admin({ onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("adminToken") === ADMIN_TOKEN
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState({
    name: "", price: "", category: "", description: "",
    images: [], is_pack: false, pack_items: [""]
  });
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) { loadProducts(); loadOrders(); }
  }, [isLoggedIn]);

  const loadProducts = () =>
    fetch("https://top-magic-production.up.railway.app/api/products").then(r => r.json()).then(setProducts);

  const loadOrders = () =>
    fetch("https://top-magic-production.up.railway.app/api/orders").then(r => r.json()).then(setOrders);

  const handleLogin = async () => {
    const res = await fetch("https://top-magic-production.up.railway.app/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) { localStorage.setItem("adminToken", ADMIN_TOKEN); setIsLoggedIn(true); }
    else setError("Mot de passe incorrect!");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, images: [...form.images, ...files] });
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (i) => {
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  // Pack items handlers
  const addPackItem = () => setForm({ ...form, pack_items: [...form.pack_items, ""] });
  const removePackItem = (i) => setForm({ ...form, pack_items: form.pack_items.filter((_, idx) => idx !== i) });
  const updatePackItem = (i, val) => {
    const items = [...form.pack_items];
    items[i] = val;
    setForm({ ...form, pack_items: items });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) { setMessage("Remplissez tous les champs!"); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("is_pack", form.is_pack ? "1" : "0");
    if (form.is_pack) {
      const items = form.pack_items.filter(i => i.trim() !== "");
      formData.append("pack_items", JSON.stringify(items));
    }
    form.images.forEach(img => formData.append("images", img));

    const res = await fetch("https://top-magic-production.up.railway.app/api/products", { method: "POST", body: formData });
    const data = await res.json();
    setMessage(data.message);
    setForm({ name: "", price: "", category: "", description: "", images: [], is_pack: false, pack_items: [""] });
    setPreviews([]);
    loadProducts();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit?")) return;
    await fetch(`https://top-magic-production.up.railway.app/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  };

  const updateOrderStatus = async (id, status) => {
    await fetch(`https://top-magic-production.up.railway.app/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    loadOrders();
  };

  const downloadConfirmedOrders = () => {
    const confirmed = orders.filter(o => o.status === "Confirmé");
    if (confirmed.length === 0) { alert("Aucune commande confirmée!"); return; }

    // Build CSV content (Excel-compatible UTF-8)
    const rows = [
      ["#", "Client", "Téléphone", "Wilaya", "Produits", "Total (DA)", "Date"],
      ...confirmed.map((o, i) => [
        i + 1,
        o.customer_name,
        o.customer_phone,
        o.wilaya || "",
        o.products,
        o.total,
        new Date(o.created_at).toLocaleString("fr-DZ")
      ])
    ];
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes_confirmees_${new Date().toLocaleDateString("fr-DZ").replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = orders.filter(o => o.status === "Confirmé").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "En attente").length;
  const confirmedOrders = orders.filter(o => o.status === "Confirmé").length;

  if (!isLoggedIn) {
    return (
      <div className="admin-overlay">
        <div className="admin-login">
          <div className="login-logo">✨</div>
          <h2>Admin Panel</h2>
          <p>Top Magic Cosmétique</p>
          <input type="password" placeholder="Mot de passe"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
          {error && <p className="admin-error">{error}</p>}
          <button className="login-submit" onClick={handleLogin}>Se connecter</button>
          <button className="cancel-btn" onClick={onClose}>Annuler</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overlay">
      <div className="admin-panel">

        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="sidebar-logo">
            <span>✨</span>
            <div><h3>Top Magic</h3><p>Admin Panel</p></div>
          </div>
          <nav className="sidebar-nav">
            <button className={activeTab === "dashboard" ? "nav-active" : ""} onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
            <button className={activeTab === "products" ? "nav-active" : ""} onClick={() => setActiveTab("products")}>
              📦 Produits <span className="nav-badge">{products.length}</span>
            </button>
            <button className={activeTab === "orders" ? "nav-active" : ""} onClick={() => setActiveTab("orders")}>
              📋 Commandes <span className="nav-badge">{orders.length}</span>
            </button>
            <button className={activeTab === "add" ? "nav-active" : ""} onClick={() => setActiveTab("add")}>➕ Ajouter produit</button>
          </nav>
          <div className="sidebar-footer">
            <button className="sidebar-logout" onClick={() => { localStorage.removeItem("adminToken"); setIsLoggedIn(false); onClose(); }}>🚪 Déconnexion</button>
            <button className="sidebar-close" onClick={onClose}>✕ Fermer</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main">

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="admin-section">
              <h2>📊 Dashboard</h2>
              <div className="stats-grid">
                <div className="stat-card stat-blue"><span>📦</span><div><h3>{products.length}</h3><p>Produits</p></div></div>
                <div className="stat-card stat-yellow"><span>⏳</span><div><h3>{pendingOrders}</h3><p>En attente</p></div></div>
                <div className="stat-card stat-green"><span>✅</span><div><h3>{confirmedOrders}</h3><p>Confirmées</p></div></div>
                <div className="stat-card stat-pink"><span>💰</span><div><h3>{totalRevenue} DA</h3><p>Chiffre d'affaires</p></div></div>
              </div>
              <div className="recent-orders">
                <h3>📋 Dernières commandes</h3>
                <table className="admin-table">
                  <thead><tr><th>#</th><th>Client</th><th>Téléphone</th><th>Total</th><th>Statut</th><th>Date</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer_name}</td>
                        <td>{order.customer_phone}</td>
                        <td><strong>{order.total} DA</strong></td>
                        <td><span className={`badge ${order.status === "En attente" ? "badge-yellow" : order.status === "Confirmé" ? "badge-green" : order.status === "Livré" ? "badge-blue" : "badge-red"}`}>{order.status}</span></td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Table */}
          {activeTab === "products" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>📦 Produits ({products.length})</h2>
                <button className="btn-add" onClick={() => setActiveTab("add")}>+ Ajouter</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Type</th><th>Action</th></tr></thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        <div className="table-img">
                          {product.image && product.image.startsWith("http") ? (
                            <img src={product.image} alt={product.name} />
                          ) : <span>{product.image}</span>}
                        </div>
                      </td>
                      <td><strong>{product.name}</strong></td>
                      <td><span className="badge badge-pink">{product.category}</span></td>
                      <td><strong>{product.price} DA</strong></td>
                      <td>
                        {product.is_pack ? (
                          <span className="badge badge-green">🎁 Pack</span>
                        ) : (
                          <span className="badge badge-blue">📦 Simple</span>
                        )}
                      </td>
                      <td><button className="btn-delete" onClick={() => handleDelete(product.id)}>🗑️ Supprimer</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders Table */}
          {activeTab === "orders" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>📋 Commandes ({orders.length})</h2>
                <button className="btn-download" onClick={downloadConfirmedOrders}>⬇️ Télécharger confirmées</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Client</th><th>Téléphone</th><th>Produits</th><th>Total</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td><strong>{order.customer_name}</strong></td>
                      <td><a href={`tel:${order.customer_phone}`} className="phone-link">📞 {order.customer_phone}</a></td>
                      <td className="products-cell">{order.products}</td>
                      <td><strong>{order.total} DA</strong></td>
                      <td><span className={`badge ${order.status === "En attente" ? "badge-yellow" : order.status === "Confirmé" ? "badge-green" : order.status === "Livré" ? "badge-blue" : "badge-red"}`}>{order.status}</span></td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <select className="status-select" value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}>
                          <option>En attente</option>
                          <option>Confirmé</option>
                          <option>Livré</option>
                          <option>Annulé</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Product */}
          {activeTab === "add" && (
            <div className="admin-section">
              <h2>➕ Ajouter un produit</h2>
              {message && <div className="success-msg">✅ {message}</div>}
              <div className="add-form">

                {/* Type Toggle */}
                <div className="form-group">
                  <label>Type de produit</label>
                  <div className="type-toggle">
                    <button
                      className={!form.is_pack ? "type-btn active" : "type-btn"}
                      onClick={() => setForm({ ...form, is_pack: false })}>
                      📦 Produit Simple
                    </button>
                    <button
                      className={form.is_pack ? "type-btn active" : "type-btn"}
                      onClick={() => setForm({ ...form, is_pack: true })}>
                      🎁 Pack / Gamme
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nom {form.is_pack ? "du Pack" : "du produit"}</label>
                    <input placeholder={form.is_pack ? "Ex: Gamme Avocado Complète" : "Ex: Shampoing Argan"}
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Prix total (DA)</label>
                    <input type="number" placeholder="Ex: 5500" value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Catégorie</label>
                    <input placeholder="Ex: Soins Capillaires" value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input placeholder="Description du produit" value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>

                {/* Pack Items */}
                {form.is_pack && (
                  <div className="form-group">
                    <label>🎁 Contenu du Pack ({form.pack_items.filter(i => i.trim()).length} produits)</label>
                    <div className="pack-items-list">
                      {form.pack_items.map((item, i) => (
                        <div key={i} className="pack-item-row">
                          <span className="drag-handle">⋮⋮</span>
                          <div className="pack-thumb">📦</div>
                          <input
                            placeholder={`Ex: Shampoing Avocado`}
                            value={item}
                            onChange={e => updatePackItem(i, e.target.value)}
                          />
                          <div className="pack-actions">
                            {form.pack_items.length > 1 && (
                              <button className="remove-pack-item" onClick={() => removePackItem(i)}>🗑️</button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button className="add-pack-item-btn" onClick={addPackItem}>
                        + Ajouter un produit au pack
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>📷 Photos du produit ({previews.length} photo{previews.length > 1 ? "s" : ""})</label>
                  <label className="upload-label">
                    <div className="upload-placeholder">
                      <span>📤</span>
                      <p>Cliquez ou glissez une image ici</p>
                      <small>PNG, JPG, WEBP (Max. 5MB)</small>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} hidden />
                  </label>

                  <div className="multi-upload">
                    {previews.map((src, i) => (
                      <div key={i} className="preview-thumb">
                        <img src={src} alt={`photo ${i+1}`} />
                        {i === 0 && <span className="main-badge">Principale</span>}
                        <button className="remove-thumb" onClick={() => removeImage(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => { setForm({ name: "", price: "", category: "", description: "", images: [], is_pack: false, pack_items: [""] }); setPreviews([]); setActiveTab('products'); }}>
                    Annuler
                  </button>
                  <div style={{marginLeft:'auto'}}>
                    <button className="btn-save" onClick={handleSubmit} disabled={loading}>
                      {loading ? "Enregistrement..." : form.is_pack ? "Enregistrer le Pack" : "Enregistrer"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="admin-footer">
            <a href="https://wa.me/213560938555" target="_blank" rel="noreferrer">💬 WhatsApp: 05 60 93 85 55</a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Admin;
