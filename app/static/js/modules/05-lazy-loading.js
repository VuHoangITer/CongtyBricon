/**
 * ==================== TẢI ẢNH CHẬM (LAZY LOAD) ====================
 * File: 05-lazy-loading.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:52:42
 * ==========================================================================
 * 

        📍 Vị trí: Tất cả ảnh có attribute loading="lazy"
        🎯 Chức năng: Chỉ tải ảnh khi sắp vào viewport, tiết kiệm băng thông
        📄 Sử dụng tại:
           - components/card_product.html (ảnh sản phẩm)
           - components/card_blog.html (ảnh bài viết)
           - public/products.html, blogs.html
        🔧 Hoạt động:
           - Kiểm tra browser có hỗ trợ native lazy loading
           - Nếu CÓ: Dùng img[data-src] → img.src
           - Nếu KHÔNG: Tải lazysizes.min.js từ CDN làm fallback
        
 * ==========================================================================
 */

// ==================== IMAGE LAZY LOADING ====================
if ("loading" in HTMLImageElement.prototype) {
  const images = document.querySelectorAll("img[data-src]");
  images.forEach((img) => {
    img.src = img.dataset.src;
  });
} else {
  // Fallback for browsers that don't support lazy loading
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js";
  document.body.appendChild(script);
}

