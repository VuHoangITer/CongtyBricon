/**
 * ==================== XỬ LÝ ẢNH RESPONSIVE ====================
 * File: 09-responsive-images.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:52:42
 * ==========================================================================
 * 

        📍 Vị trí: Banner carousel (dùng <picture> tag)
        🎯 Chức năng: Force browser đánh giá lại <source> khi resize
        📄 Sử dụng tại:
           - public/index.html (banner với <picture><source media="...">)
        🔧 Hoạt động:
           - Listen resize event (debounced 250ms)
           - Tìm tất cả <picture> trong carousel
           - Set img.src = img.src để trigger re-evaluation
           - Browser tự chọn <source> phù hợp theo media query
        ⚠️ Cần thiết cho Safari/iOS không auto-update picture sources
        
 * ==========================================================================
 */

// ==================== RESPONSIVE IMAGE SOURCE HANDLER ====================
// Force browser to re-evaluate <picture> on resize (debounced)
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    const carousel = document.getElementById('bannerCarousel');
    if (!carousel) return;
    
    const pictures = carousel.querySelectorAll('picture');
    pictures.forEach(picture => {
      const img = picture.querySelector('img');
      if (img) {
        // Force browser to re-check <source> media queries
        img.src = img.src; // Trigger re-evaluation
      }
    });
  }, 250);
});
