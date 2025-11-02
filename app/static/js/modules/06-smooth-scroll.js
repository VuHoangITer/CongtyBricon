/**
 * ==================== CUỘN MỀM MẠI ANCHOR ====================
 * File: 06-smooth-scroll.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:52:42
 * ==========================================================================
 * 

        📍 Vị trí: Tất cả link có href="#..."
        🎯 Chức năng: Cuộn mượt mà đến section thay vì nhảy đột ngột
        📄 Sử dụng tại:
           - Navbar menu links (href="#about", "#products")
           - Banner CTA buttons (href="#featured-projects")
           - Footer quick links
        🔧 Hoạt động:
           - BỎ QUA nếu có data-bs-toggle (Bootstrap tabs)
           - BỎ QUA nếu href chỉ là "#" đơn thuần
           - Kiểm tra element có tồn tại trước khi scroll
           - Offset: -120px (tránh bị che bởi navbar fixed)
           - behavior: "smooth"
        ⚠️ Lưu ý: Fixed để không conflict với Bootstrap components
        
 * ==========================================================================
 */

// ==================== SMOOTH SCROLL - FIXED ====================
// Chỉ áp dụng cho links KHÔNG phải Bootstrap tabs
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      // BỎ QUA nếu là Bootstrap tab hoặc có data-bs-toggle
      if (this.hasAttribute("data-bs-toggle")) {
        return;
      }

      const href = this.getAttribute("href");

      // BỎ QUA nếu href chỉ là "#" đơn thuần
      if (href === "#") {
        return;
      }

      // Kiểm tra nếu target element tồn tại
      const targetId = href.includes("#") ? href.split("#")[1] : null;

      if (targetId) {
        const target = document.getElementById(targetId);

        // Chỉ scroll nếu element thực sự tồn tại
        if (target) {
          e.preventDefault();
          const offsetTop = target.offsetTop - 120;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      }
    });
  });
});

