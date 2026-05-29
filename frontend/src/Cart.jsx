import "./Cart.css";

function Cart({ cart, onRemove, onClose }) {
  // حساب المجموع الكلي
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-overlay">
      <div className="cart-drawer">

        {/* رأس السلة */}
        <div className="cart-header">
          <h2>🛍️ سلة التسوق</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* إذا السلة فارغة */}
        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>😅 السلة فارغة!</p>
            <p>أضف بعض المنتجات</p>
          </div>
        ) : (
          <>
            {/* قائمة المنتجات */}
            <div className="cart-items">
              {cart.map((item, index) => (
                <div className="cart-item" key={index}>
                  <span className="item-image">{item.image}</span>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="item-price">${item.price}</p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => onRemove(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* المجموع الكلي */}
            <div className="cart-footer">
              <div className="cart-total">
                <span>المجموع:</span>
                <span className="total-price">${total}</span>
              </div>
              <button className="checkout-btn">
                إتمام الشراء ✓
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Cart;