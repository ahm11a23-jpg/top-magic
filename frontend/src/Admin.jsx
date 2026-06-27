import { useState, useEffect, useRef } from "react";
import "./Admin.css";

const API = "https://mvr-luxe-production.up.railway.app";
const TOKEN = "admin-token-2024";
const EMPTY = { name:"", price:"", category:"", description:"", is_pack:false, pack_items:[""] };

export default function Admin({ onClose }) {
  const [auth, setAuth] = useState(localStorage.getItem("adminToken") === TOKEN);
  const [pwd, setPwd] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);      // null = add, number = edit
  const [currentImg, setCurrentImg] = useState(""); // existing image when editing
  const [newFile, setNewFile] = useState(null);     // new file to upload
  const [preview, setPreview] = useState("");       // preview URL of new file
  const [msg, setMsg] = useState({ text:"", ok:true });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => { if (auth) { load(); } }, [auth]);

  const load = () => {
    fetch(`${API}/api/products`).then(r=>r.json()).then(setProducts).catch(()=>{});
    fetch(`${API}/api/orders`).then(r=>r.json()).then(setOrders).catch(()=>{});
  };

  // ===== AUTH =====
  const login = async () => {
    const r = await fetch(`${API}/api/admin/login`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ password: pwd })
    });
    const d = await r.json();
    if (d.success) { localStorage.setItem("adminToken", TOKEN); setAuth(true); }
    else setAuthErr("Mot de passe incorrect !");
  };

  const logout = () => { localStorage.removeItem("adminToken"); setAuth(false); onClose(); };

  // ===== FORM HELPERS =====
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => {
    setEditId(null); setForm(EMPTY); setCurrentImg(""); setNewFile(null); setPreview(""); setMsg({text:"",ok:true}); setTab("form");
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ name:p.name, price:p.price, category:p.category, description:p.description||"", is_pack:!!p.is_pack, pack_items: p.pack_items ? JSON.parse(p.pack_items) : [""] });
    setCurrentImg(p.image || "");
    setNewFile(null); setPreview(""); setMsg({text:"",ok:true}); setTab("form");
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setNewFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => { setNewFile(null); setPreview(""); if(fileRef.current) fileRef.current.value=""; };

  const save = async () => {
    if (!form.name.trim() || !form.price || !form.category.trim()) {
      setMsg({text:"Remplissez nom, prix et catégorie !", ok:false}); return;
    }
    setSaving(true); setMsg({text:"",ok:true});
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("price", form.price);
      fd.append("category", form.category.trim());
      fd.append("description", form.description.trim());
      fd.append("is_pack", form.is_pack ? "1" : "0");
      if (form.is_pack) {
        const items = form.pack_items.filter(i=>i.trim());
        fd.append("pack_items", JSON.stringify(items));
      }
      if (newFile) fd.append("images", newFile);

      const url = editId ? `${API}/api/products/${editId}` : `${API}/api/products`;
      const method = editId ? "PUT" : "POST";
      const r = await fetch(url, { method, body: fd });
      const d = await r.json();

      if (!r.ok) throw new Error(d.message || "Erreur serveur");
      setMsg({ text: editId ? "✅ Produit modifié !" : "✅ Produit ajouté !", ok:true });
      load();
      setTimeout(() => { setTab("products"); setEditId(null); setForm(EMPTY); setCurrentImg(""); setNewFile(null); setPreview(""); setMsg({text:"",ok:true}); }, 1200);
    } catch(e) {
      setMsg({text:`❌ ${e.message}`, ok:false});
    }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    await fetch(`${API}/api/products/${id}`, { method:"DELETE" });
    load();
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/api/orders/${id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status})
    });
    load();
  };

  const downloadCSV = () => {
    const confirmed = orders.filter(o=>o.status==="Confirmé");
    if (!confirmed.length) { alert("Aucune commande confirmée !"); return; }
    const rows = [["#","Client","Téléphone","Wilaya","Produits","Total (DA)","Date"],
      ...confirmed.map((o,i)=>[i+1,o.customer_name,o.customer_phone,o.wilaya||"",o.products,o.total,new Date(o.created_at).toLocaleString("fr-DZ")])
    ];
    const csv = "\uFEFF"+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(";")).join("\n");
    const a = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})),download:`commandes_${Date.now()}.csv`});
    a.click();
  };

  const revenue = orders.filter(o=>o.status==="Confirmé").reduce((s,o)=>s+o.total,0);

  // ===== LOGIN SCREEN =====
  if (!auth) return (
    <div className="admin-overlay">
      <div className="admin-login">
        <div className="login-logo">✨</div>
        <h2>Admin Panel</h2>
        <p>MVR LUXE Cosmétique</p>
        <input type="password" placeholder="Mot de passe" value={pwd}
          onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
        {authErr && <p className="admin-error">{authErr}</p>}
        <button className="login-submit" onClick={login}>Se connecter</button>
        <button className="cancel-btn" onClick={onClose}>Annuler</button>
      </div>
    </div>
  );

  // ===== MAIN PANEL =====
  return (
    <div className="admin-overlay">
      <div className="admin-panel">

        {/* SIDEBAR */}
        <div className="admin-sidebar">
          <div className="sidebar-logo"><span>✨</span><div><h3>MVR LUXE</h3><p>Admin Panel</p></div></div>
          <nav className="sidebar-nav">
            {[
              { id:"dashboard", label:"📊 Dashboard" },
              { id:"products",  label:`📦 Produits`, badge: products.length },
              { id:"orders",    label:`📋 Commandes`, badge: orders.length },
            ].map(({id,label,badge}) => (
              <button key={id} className={tab===id?"nav-active":""} onClick={()=>setTab(id)}>
                {label} {badge!==undefined && <span className="nav-badge">{badge}</span>}
              </button>
            ))}
            <button className={tab==="form"&&!editId?"nav-active":""} onClick={openAdd}>➕ Ajouter produit</button>
          </nav>
          <div className="sidebar-footer">
            <button className="sidebar-logout" onClick={logout}>🚪 Déconnexion</button>
            <button className="sidebar-close" onClick={onClose}>✕ Fermer</button>
          </div>
        </div>

        {/* MAIN */}
        <div className="admin-main">

          {/* DASHBOARD */}
          {tab==="dashboard" && (
            <div className="admin-section">
              <h2>📊 Dashboard</h2>
              <div className="stats-grid">
                <div className="stat-card stat-blue"><span>📦</span><div><h3>{products.length}</h3><p>Produits</p></div></div>
                <div className="stat-card stat-yellow"><span>⏳</span><div><h3>{orders.filter(o=>o.status==="En attente").length}</h3><p>En attente</p></div></div>
                <div className="stat-card stat-green"><span>✅</span><div><h3>{orders.filter(o=>o.status==="Confirmé").length}</h3><p>Confirmées</p></div></div>
                <div className="stat-card stat-pink"><span>💰</span><div><h3>{revenue.toLocaleString()} DA</h3><p>Revenus</p></div></div>
              </div>
              <div className="recent-orders">
                <h3>📋 Dernières commandes</h3>
                <table className="admin-table">
                  <thead><tr><th>#</th><th>Client</th><th>Téléphone</th><th>Total</th><th>Statut</th><th>Date</th></tr></thead>
                  <tbody>{orders.slice(0,5).map(o=>(
                    <tr key={o.id}>
                      <td>{o.id}</td><td>{o.customer_name}</td>
                      <td><a href={`tel:${o.customer_phone}`} className="phone-link">{o.customer_phone}</a></td>
                      <td><strong>{o.total} DA</strong></td>
                      <td><span className={`badge badge-${o.status==="En attente"?"yellow":o.status==="Confirmé"?"green":o.status==="Livré"?"blue":"red"}`}>{o.status}</span></td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab==="products" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>📦 Produits ({products.length})</h2>
                <button className="btn-add" onClick={openAdd}>+ Ajouter</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Type</th><th>Actions</th></tr></thead>
                <tbody>{products.map(p=>(
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><div className="table-img">{p.image?.startsWith("http")?<img src={p.image} alt={p.name}/>:<span>{p.image}</span>}</div></td>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="badge badge-pink">{p.category}</span></td>
                    <td><strong>{p.price} DA</strong></td>
                    <td>{p.is_pack?<span className="badge badge-green">🎁 Pack</span>:<span className="badge badge-blue">📦 Simple</span>}</td>
                    <td className="actions-cell">
                      <button className="btn-edit" onClick={()=>openEdit(p)}>✏️ Modifier</button>
                      <button className="btn-delete" onClick={()=>del(p.id)}>🗑️ Supprimer</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* ORDERS */}
          {tab==="orders" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>📋 Commandes ({orders.length})</h2>
                <button className="btn-download" onClick={downloadCSV}>⬇️ Télécharger confirmées</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Client</th><th>Téléphone</th><th>Produits</th><th>Total</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>{orders.map(o=>(
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td><strong>{o.customer_name}</strong></td>
                    <td><a href={`tel:${o.customer_phone}`} className="phone-link">📞 {o.customer_phone}</a></td>
                    <td className="products-cell">{o.products}</td>
                    <td><strong>{o.total} DA</strong></td>
                    <td><span className={`badge badge-${o.status==="En attente"?"yellow":o.status==="Confirmé"?"green":o.status==="Livré"?"blue":"red"}`}>{o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <select className="status-select" value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>
                        <option>En attente</option><option>Confirmé</option><option>Livré</option><option>Annulé</option>
                      </select>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* FORM (ADD / EDIT) */}
          {tab==="form" && (
            <div className="admin-section">
              <h2>{editId ? "✏️ Modifier le produit" : "➕ Ajouter un produit"}</h2>

              {msg.text && <div className={msg.ok?"success-msg":"error-msg"}>{msg.text}</div>}

              <div className="add-form">

                {/* TYPE */}
                <div className="form-group">
                  <label>TYPE DE PRODUIT</label>
                  <div className="type-toggle">
                    <button className={!form.is_pack?"type-btn active":"type-btn"} onClick={()=>setF("is_pack",false)}>📦 Produit Simple</button>
                    <button className={form.is_pack?"type-btn active":"type-btn"} onClick={()=>setF("is_pack",true)}>🎁 Pack / Gamme</button>
                  </div>
                </div>

                {/* NAME + PRICE */}
                <div className="form-row">
                  <div className="form-group">
                    <label>NOM DU PRODUIT *</label>
                    <input placeholder="Ex: Shampoing Argan" value={form.name} onChange={e=>setF("name",e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>PRIX (DA) *</label>
                    <input type="number" placeholder="Ex: 1200" value={form.price} onChange={e=>setF("price",e.target.value)} />
                  </div>
                </div>

                {/* CATEGORY + DESCRIPTION */}
                <div className="form-row">
                  <div className="form-group">
                    <label>CATÉGORIE *</label>
                    <input placeholder="Ex: Soins Capillaires" value={form.category} onChange={e=>setF("category",e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>DESCRIPTION</label>
                    <input placeholder="Description du produit" value={form.description} onChange={e=>setF("description",e.target.value)} />
                  </div>
                </div>

                {/* PACK ITEMS */}
                {form.is_pack && (
                  <div className="form-group">
                    <label>🎁 CONTENU DU PACK</label>
                    <div className="pack-items-list">
                      {form.pack_items.map((item,i)=>(
                        <div key={i} className="pack-item-row">
                          <span className="drag-handle">⋮⋮</span>
                          <div className="pack-thumb">📦</div>
                          <input placeholder="Ex: Shampoing Avocado" value={item}
                            onChange={e=>{ const a=[...form.pack_items]; a[i]=e.target.value; setF("pack_items",a); }} />
                          {form.pack_items.length>1 &&
                            <button className="remove-pack-item" onClick={()=>setF("pack_items",form.pack_items.filter((_,j)=>j!==i))}>🗑️</button>}
                        </div>
                      ))}
                      <button className="add-pack-item-btn" onClick={()=>setF("pack_items",[...form.pack_items,""])}>+ Ajouter un produit au pack</button>
                    </div>
                  </div>
                )}

                {/* IMAGE SECTION */}
                <div className="form-group">
                  <label>📷 IMAGE DU PRODUIT</label>

                  {/* Current image (edit mode) */}
                  {editId && currentImg && (
                    <div className="current-image-box">
                      <div className="current-image">
                        {currentImg.startsWith("http")
                          ? <img src={currentImg} alt="actuelle" />
                          : <span className="current-emoji">{currentImg}</span>}
                        <div>
                          <p className="current-label">Image actuelle</p>
                          <p className="current-hint">Sélectionnez une nouvelle image ci-dessous pour la remplacer</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New image picker */}
                  {!preview ? (
                    <label className="upload-label">
                      <div className="upload-placeholder">
                        <span>📤</span>
                        <p>{editId ? "Cliquez pour changer l'image" : "Cliquez ou glissez une image ici"}</p>
                        <small>PNG, JPG, WEBP (Max. 5MB)</small>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />
                    </label>
                  ) : (
                    <div className="new-image-preview">
                      <div className="preview-thumb large">
                        <img src={preview} alt="nouvelle" />
                        <span className="main-badge">{editId ? "Nouvelle image" : "Principale"}</span>
                        <button className="remove-thumb" onClick={clearFile}>✕</button>
                      </div>
                      <p className="preview-hint">✅ Nouvelle image sélectionnée — sera enregistrée au clic sur Enregistrer</p>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="form-actions">
                  <button className="btn-cancel" onClick={()=>{ setTab(editId?"products":"products"); setEditId(null); setForm(EMPTY); setNewFile(null); setPreview(""); setMsg({text:"",ok:true}); }}>
                    Annuler
                  </button>
                  <button className="btn-save" onClick={save} disabled={saving}>
                    {saving ? "Enregistrement..." : editId ? "💾 Enregistrer les modifications" : "✅ Enregistrer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="admin-footer">
            <a href="https://wa.me/213799031951" target="_blank" rel="noreferrer">💬 WhatsApp: +213 799 031 951</a>
          </div>
        </div>
      </div>
    </div>
  );
}

