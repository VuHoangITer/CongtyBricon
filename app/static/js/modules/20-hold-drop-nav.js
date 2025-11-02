/**
 * ==================== Hold Drop Nav ====================
 * File: 20-hold-drop-nav.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:52:42
 * ==========================================================================
 * 

        Chức năng: Giữ chuột vào nav-link sẽ hiện dropdown
    
 * ==========================================================================
 */

/* ==================== NavLink Hold Drop ==================== */
(function() {
  'use strict';

  // Namespace riêng
  const holdHienDropdown = {
    holdTimer: null,
    holdDelay: 200, // ms - thời gian giữ để hiện dropdown

    init: function() {
      this.setupEventListeners();
    },

    setupEventListeners: function() {
      // Tìm tất cả nav-item có dropdown
      const dropdownItems = document.querySelectorAll('.nav-item.dropdown');

      dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link.dropdown-toggle');
        const menu = item.querySelector('.dropdown-menu');

        if (!link || !menu) return;

        // Thêm class để styling
        item.classList.add('hold-hien-dropdown');

        // Mouse enter - bắt đầu đếm thời gian
        link.addEventListener('mouseenter', () => {
          this.startHoldTimer(item);
        });

        // Mouse leave - hủy timer
        link.addEventListener('mouseleave', () => {
          this.cancelHoldTimer();
        });

        // Giữ dropdown mở khi hover vào menu
        menu.addEventListener('mouseenter', () => {
          this.cancelHoldTimer();
        });

        menu.addEventListener('mouseleave', () => {
          this.hideDropdown(item);
        });

        // Click vẫn hoạt động bình thường (toggle)
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleDropdown(item);
        });
      });

      // Click ra ngoài để đóng dropdown
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item.hold-hien-dropdown')) {
          this.hideAllDropdowns();
        }
      });
    },

    startHoldTimer: function(item) {
      this.cancelHoldTimer();
      this.holdTimer = setTimeout(() => {
        this.showDropdown(item);
      }, this.holdDelay);
    },

    cancelHoldTimer: function() {
      if (this.holdTimer) {
        clearTimeout(this.holdTimer);
        this.holdTimer = null;
      }
    },

    showDropdown: function(item) {
      this.hideAllDropdowns();
      item.classList.add('show');
    },

    hideDropdown: function(item) {
      item.classList.remove('show');
    },

    toggleDropdown: function(item) {
      const isShown = item.classList.contains('show');
      this.hideAllDropdowns();
      if (!isShown) {
        item.classList.add('show');
      }
    },

    hideAllDropdowns: function() {
      document.querySelectorAll('.nav-item.hold-hien-dropdown.show').forEach(item => {
        item.classList.remove('show');
      });
    }
  };

  // Khởi chạy khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      holdHienDropdown.init();
    });
  } else {
    holdHienDropdown.init();
  }

  // Export namespace (nếu cần truy cập từ bên ngoài)
  window.holdHienDropdown = holdHienDropdown;

})();