import "./ProductDetail.css";

function ProductDetail({ product, onAddToCart, onClose }) {
  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-card" onClick={e => e.stopPropagation()}>

        {/* زر الإغلاق */}
        <button className="detail-close" onClick={onClose}>✕</button>

        {/* صورة المنتج */}
        <div className="detail-image">{product.image}</div>

        {/* معلومات المنتج */}
        <div className="detail-info">
          <h2>{product.name}</h2>
          <p className="detail-category">📁 {product.category}</p>
          <p className="detail-price">${product.price}</p>

          <div className="detail-description">
            <h4>وصف المنتج:</h4>
            <p>
              {product.name} من أفضل المنتجات المتوفرة لدينا.
              يتميز بجودة عالية وسعر منافس. متوفر الآن وجاهز للشحن.
            </p>
          </div>

          <div className="detail-features">
            <h4>المميزات:</h4>
            <ul>
              <li>✅ ضمان سنة كاملة</li>
              <li>✅ شحن مجاني</li>
              <li>✅ إمكانية الإرجاع خلال 30 يوم</li>
              <li>✅ دعم فني 24/7</li>
            </ul>
          </div>

          <button
            className="detail-add-btn"
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
          >
            🛒 أضف للسلة — ${product.price}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProductDetail;