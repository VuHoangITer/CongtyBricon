/**
 * ==================== Lịch sử công ty ====================
 * File: 19-lich-su-cong-ty.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:02:12
 * ==========================================================================
 * 

        Lịch sử công ty
    
 * ==========================================================================
 */

/* ==================== TIMELINE ==================== */
(function() {
  'use strict';

  window.Timeline = {
    init: function() {
      const items = document.querySelectorAll('.timeline-item');
      if (items.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      items.forEach(item => observer.observe(item));

      console.log('✅ Timeline: Initialized');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Timeline.init());
  } else {
    Timeline.init();
  }

})();

