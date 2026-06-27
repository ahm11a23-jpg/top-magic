# Project Structure Report

## 1. Project Overview

This project is a React + Vite storefront for MVR LUXE cosmetics with a lightweight Express + SQLite backend. The frontend renders product pages, a shopping cart, a contact page, and an admin dashboard. The backend exposes product, order, delivery, and admin routes and stores data in SQLite.

### Runtime stack
- Frontend: React 19, Vite 8, CSS modules-style component styling
- Backend: Express.js, better-sqlite3, multer, cors, Cloudinary
- Data storage: SQLite database at backend/store.db

### Verified status
- Frontend build verification: successful with Vite (`npm --prefix frontend run build`)

---

## 2. File-by-file structure and purpose

### Root project
- [package.json](package.json) — root scripts for running frontend, backend, and both together.
- [backend/](backend/) — Express/SQLite server and data layer.
- [frontend/](frontend/) — Vite React application.

### Frontend
- [frontend/package.json](frontend/package.json) — frontend dependencies and scripts.
- [frontend/index.html](frontend/index.html) — Vite HTML entry point.
- [frontend/vite.config.js](frontend/vite.config.js) — Vite configuration.
- [frontend/README.md](frontend/README.md) — default Vite template notes.
- [frontend/public/favicon.svg](frontend/public/favicon.svg) — site favicon.
- [frontend/public/icons.svg](frontend/public/icons.svg) — shared SVG icons asset.
- [frontend/public/WEB.png](frontend/public/WEB.png) — image asset.
- [frontend/src/main.jsx](frontend/src/main.jsx) — React entry point.
- [frontend/src/App.jsx](frontend/src/App.jsx) — main storefront UI and business logic.
- [frontend/src/App.css](frontend/src/App.css) — main storefront styles.
- [frontend/src/Admin.jsx](frontend/src/Admin.jsx) — admin panel UI and product/order management.
- [frontend/src/Admin.css](frontend/src/Admin.css) — admin panel styles.
- [frontend/src/Auth.jsx](frontend/src/Auth.jsx) — auth form component (legacy/unused in the current flow).
- [frontend/src/Auth.css](frontend/src/Auth.css) — auth form styles.
- [frontend/src/Cart.jsx](frontend/src/Cart.jsx) — cart component (legacy/unused in the current flow).
- [frontend/src/Cart.css](frontend/src/Cart.css) — cart component styles.
- [frontend/src/ProductDetail.jsx](frontend/src/ProductDetail.jsx) — product-detail modal component (legacy/unused in the current flow).
- [frontend/src/ProductDetail.css](frontend/src/ProductDetail.css) — detail-component styles.
- [frontend/src/index.css](frontend/src/index.css) — base/global CSS variables and reset styles.
- [frontend/src/assets/hero.png](frontend/src/assets/hero.png) — hero image asset.
- [frontend/src/assets/react.svg](frontend/src/assets/react.svg) — default asset.
- [frontend/src/assets/vite.svg](frontend/src/assets/vite.svg) — default asset.

### Backend
- [backend/server.js](backend/server.js) — Express API routes for products, orders, admin login, delivery pricing, and Cloudinary uploads.
- [backend/database.js](backend/database.js) — SQLite connection, schema creation, seed data, and delivery pricing initialization.
- [backend/models/Product.js](backend/models/Product.js) — Mongoose-style product schema (not actively used by the current server implementation).
- [backend/nixpacks.toml](backend/nixpacks.toml) — deployment config for Nixpacks.
- [backend/uploads/](backend/uploads/) — upload directory used by the app’s asset flow.
- [backend/store.db](backend/store.db) — SQLite database file.

---

## 3. React components and their props

### Root component
- App
  - Props: none
  - Responsibilities: manages products, cart, page navigation, order submission, admin modal, product-detail modal, and UI rendering.

### Local helper component inside App.jsx
- ProductCard
  - Props:
    - product: product object from the API
    - onAdd: callback for adding the product to the cart
    - onOpen: callback for opening the product detail modal
  - Responsibilities: renders a single product card with image/emoji, category, name, pack preview, description, price, and add-to-cart action.

### Other components
- Admin
  - Props:
    - onClose: callback to close the modal
  - Responsibilities: admin login, product CRUD, order listing, order status updates, CSV export of confirmed orders, and product upload form.

- Auth
  - Props:
    - onLogin: callback that receives the user name after login
  - Responsibilities: login/register form UI (currently not wired into the app flow).

- Cart
  - Props:
    - cart: array of cart items
    - onRemove: callback to remove an item from the cart
    - onClose: callback to close the cart drawer
  - Responsibilities: renders a side cart UI (legacy/unused in the current flow).

- ProductDetail
  - Props:
    - product: product object to display
    - onAddToCart: callback to add a product to the cart
    - onClose: callback to close the detail view
  - Responsibilities: shows a product detail modal (legacy/unused in the current flow).

---

## 4. CSS classes used

The frontend uses the following CSS classes across JSX files. They are defined in the project stylesheets and are the classes referenced by the current UI implementation.

### Global / app shell classes
- app
- toast
- header
- header-inner
- logo
- logo-mark
- logo-name
- logo-sub
- nav-links
- nav-actions
- search-btn
- cart-btn
- cart-badge
- admin-btn
- search-bar
- hero
- hero-content
- hero-eyebrow
- hero-desc
- hero-btns
- btn-primary
- btn-outline-white
- hero-visual
- hero-badge-pill
- hero-badge-dot
- hero-stats-grid
- hero-stat
- hero-stat-num
- hero-stat-label
- marquee-strip
- marquee-inner
- marquee-item
- marquee-sep
- trust-strip
- trust-item
- trust-icon
- section-head
- section-label
- btn-outline
- featured-section
- products-grid
- product-card
- pack-card
- pack-badge
- wish-btn
- wished
- product-img-wrap
- product-img
- product-emoji
- product-body
- product-category
- product-name
- stars
- product-desc
- product-footer
- price
- add-btn
- added
- pack-items-preview
- categories-section
- cat-grid
- cat-card
- cat-icon
- cat-name
- promo-banner
- promo-content
- promo-label
- promo-visual
- reviews-section
- reviews-grid
- review-card
- review-stars
- review-text
- reviewer
- reviewer-avatar
- footer
- footer-grid
- footer-brand
- social-row
- social-btn
- footer-col
- footer-bottom
- products-page
- page-header
- breadcrumb
- products-layout
- filters-bar
- cat-pills
- cat-pill
- filter-actions
- filter-btn
- no-results
- overlay
- cart-drawer
- drawer-header
- drawer-empty
- cart-items
- cart-item
- cart-img
- cart-info
- qty-box
- rm-btn
- cart-form
- delivery-row
- cart-summary
- sum-row
- sum-total
- order-btn
- order-success
- success-icon
- count-pill
- icon-btn
- detail-modal
- detail-img-wrap
- detail-body
- detail-close-btn
- detail-price
- detail-desc
- detail-features
- bottom-nav
- bnav-active
- bnav-badge

### Admin classes
- admin-overlay
- admin-login
- login-logo
- admin-error
- login-submit
- cancel-btn
- admin-panel
- admin-sidebar
- sidebar-logo
- sidebar-nav
- nav-active
- nav-badge
- sidebar-footer
- sidebar-logout
- sidebar-close
- admin-main
- admin-section
- stats-grid
- stat-card
- stat-blue
- stat-yellow
- stat-green
- stat-pink
- recent-orders
- admin-table
- table-img
- products-cell
- badge
- badge-yellow
- badge-green
- badge-blue
- badge-red
- badge-pink
- btn-add
- btn-download
- btn-delete
- phone-link
- status-select
- add-form
- form-row
- form-group
- type-toggle
- type-btn
- upload-label
- upload-placeholder
- multi-upload
- preview-thumb
- remove-thumb
- main-badge
- form-actions
- btn-cancel
- btn-save
- success-msg
- pack-items-list
- pack-item-row
- drag-handle
- pack-thumb
- pack-actions
- remove-pack-item
- add-pack-item-btn
- admin-footer

### Auth classes
- auth-overlay
- auth-card
- auth-message
- auth-switch

### Cart classes
- cart-overlay
- cart-drawer
- cart-header
- cart-empty
- cart-items
- cart-item
- cart-img
- item-info
- qty-controls
- remove-btn
- cart-footer
- cart-total
- total-row
- total-final
- order-btn
- customer-form

### Product detail/classes
- detail-overlay
- detail-card
- detail-close
- detail-image
- detail-info
- detail-category
- detail-price
- detail-description
- detail-features
- detail-add-btn

---

## 5. API endpoints called

### Frontend to backend API

#### Product endpoints
- GET /api/products
  - Used by App and Admin to load the product catalog.
- POST /api/products
  - Used by Admin to add a product and upload images.
- DELETE /api/products/:id
  - Used by Admin to delete a product.

#### Order endpoints
- POST /api/orders
  - Used by App when a customer confirms an order.
- GET /api/orders
  - Used by Admin to load order history.
- PUT /api/orders/:id
  - Used by Admin to update order status.

#### Delivery endpoints
- GET /api/delivery
  - Used by App to load delivery prices by wilaya.
- PUT /api/delivery/:id
  - Used by Admin to update a wilaya delivery price (not currently surfaced in UI).

#### Admin auth endpoint
- POST /api/admin/login
  - Used by Admin login flow.

#### Customer auth endpoints (frontend-only, backend mismatch)
- POST /api/login
- POST /api/register
  - Called by Auth.jsx, but the backend does not implement these routes.

### External URLs used
- https://mvr-luxe-production.up.railway.app/api/products
- https://mvr-luxe-production.up.railway.app/api/delivery
- https://mvr-luxe-production.up.railway.app/api/orders
- https://mvr-luxe-production.up.railway.app/api/admin/login

---

## 6. State variables

### App component state
- products: array of products loaded from the API
- cart: array of cart items with quantity
- page: current page view (`home`, `products`, `contact`)
- showCart: controls cart drawer visibility
- showAdmin: controls admin modal visibility
- showMenu: mobile menu overlay toggle state
- search: search term for filtering products
- showSearch: controls search UI visibility
- selectedCategory: currently active category filter
- notification: toast message text
- selectedProduct: currently chosen product for detail modal
- orderConfirmed: shows order success state
- customerName: customer full name for order form
- customerPhone: customer phone for order form
- wilayas: list of delivery regions from the API
- selectedWilaya: currently selected delivery region
- deliveryPrice: shipping price for selected wilaya
- heroRef: ref used for the hero section (currently unused in rendering logic)

### ProductCard local state
- wish: toggles heart button state
- added: toggles add-to-cart button feedback state

### Admin component state
- isLoggedIn: admin login status from localStorage
- password: password input field
- error: login error message
- products: list of products in admin view
- orders: list of orders in admin view
- activeTab: selected admin tab (`dashboard`, `products`, `orders`, `add`)
- form: admin product form fields
- previews: image preview URLs for the upload form
- message: success/error message after product submission
- loading: form submission loading state

### Auth component state
- isLogin: toggles between login and register views
- form: auth form fields (`name`, `email`, `password`)
- message: auth form feedback
- loading: submit loading state

---

## 7. Known bugs and issues

### Functional issues
1. The customer auth component is wired to non-existent backend routes.
   - [frontend/src/Auth.jsx](frontend/src/Auth.jsx) posts to `/api/login` and `/api/register`.
   - The backend in [backend/server.js](backend/server.js) only defines `/api/admin/login` and does not implement customer auth.

2. The search UI is incomplete.
   - The App component has `showSearch` and `search` state, but no actual search input is rendered in the UI.
   - The header also includes a “Recherche” button that only toggles state.

3. The mobile menu state is never triggered by the UI.
   - There is `showMenu` state and a mobile menu overlay block in [frontend/src/App.jsx](frontend/src/App.jsx), but no button or trigger actually sets it to true.

4. The cart remove logic uses a stale state value.
   - `removeFromCart` uses `setCart(cart.filter(...))` rather than the functional state form.
   - This can lead to stale-cart removal bugs when multiple updates happen quickly.

5. The admin order export function assumes the `status` field exists and is in a specific format.
   - It filters orders by `status === "Confirmé"` and uses `new Date(o.created_at)` without guarding for missing values.

### Styling / class mismatch issues
6. Several JSX class names do not match the stylesheet definitions.
   - The ProductCard component uses classes like `price`, `add-btn`, `product-desc`, and `pack-items-preview`, but the CSS defines `product-price`, `add-to-cart-btn`, and does not define `pack-items-preview`.
   - This means some product-card styles will not apply as intended.

7. The mobile menu classes referenced in JSX are not styled in the current stylesheet.
   - Classes such as `menu-overlay`, `menu-drawer`, `menu-header`, and `menu-nav` are used in [frontend/src/App.jsx](frontend/src/App.jsx) but are not defined in the CSS files.

8. Some modal classes used in the app do not have matching CSS blocks.
   - The app uses `detail-modal`, but the styles are defined under different names such as `selected-product-card`/`selected-product-overlay`.

### Architecture / maintainability issues
9. The project mixes legacy components with the active main app flow.
   - [frontend/src/Auth.jsx](frontend/src/Auth.jsx), [frontend/src/Cart.jsx](frontend/src/Cart.jsx), and [frontend/src/ProductDetail.jsx](frontend/src/ProductDetail.jsx) are present but not used by the main App flow.
   - This makes the structure more confusing and increases maintenance overhead.

10. The frontend uses hardcoded production API URLs.
   - This reduces portability across environments and makes local development harder.
   - A configuration layer using environment variables would be more maintainable.

11. The backend and frontend are not using a single consistent authentication model.
   - The admin panel uses a hardcoded token and password, while the customer-side auth UI expects a different auth system.

---

## 8. Summary

The project is structurally sound for a small e-commerce storefront, with a clear split between a React frontend and an Express/SQLite backend. The main app flow is centered around [frontend/src/App.jsx](frontend/src/App.jsx), while the admin experience lives in [frontend/src/Admin.jsx](frontend/src/Admin.jsx). The biggest gaps are incomplete UI features, a few class/style mismatches, and some backend/frontend route inconsistencies.
