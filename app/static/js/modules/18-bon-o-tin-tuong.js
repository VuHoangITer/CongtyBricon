/**
 * ==================== 4 ô tạo niềm tin ====================
 * File: 18-bon-o-tin-tuong.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:52:42
 * ==========================================================================
 * 

        bốn ô tạo niềm tin , hiệu ứng fade-in
    
 * ==========================================================================
 */

/* ==================== Trust Badges / Certifications ==================== */
(function() {
  'use strict';

  window.TrustBadges = {
    init: function() {
      const badges = document.querySelectorAll('.trust-badge');
      if (badges.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, index * 100); // Stagger effect
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      badges.forEach(badge => observer.observe(badge));

      console.log('✅ Trust Badges: Initialized');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TrustBadges.init());
  } else {
    TrustBadges.init();
  }

})();
