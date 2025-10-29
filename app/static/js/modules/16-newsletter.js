/**
 * ==================== Đăng kí nhận khuyến mãi ====================
 * File: 16-newsletter.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 29/10/2025 19:18:29
 * ==========================================================================
 * 

            Đăng kí nhận khuyến mãi
    
 * ==========================================================================
 */

/* ==================== Newsletter ==================== */
(function() {
  'use strict';

  window.Newsletter = window.Newsletter || {};
  const newsletter = window.Newsletter;

  newsletter.init = function() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', this.handleSubmit.bind(this));

    console.log('✅ Newsletter: Initialized');
  };

  newsletter.handleSubmit = async function(e) {
    e.preventDefault();

    const form = e.target;
    const emailInput = form.querySelector('#newsletter-email');
    const consentCheckbox = form.querySelector('#newsletter-consent');
    const messageEl = document.getElementById('newsletterMessage');
    const submitBtn = form.querySelector('#newsletter-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    // Clear previous messages
    messageEl.className = 'newsletter-message';
    messageEl.textContent = '';

    // Validation
    if (!emailInput.value.trim()) {
      this.showMessage(messageEl, 'Vui lòng nhập email!', 'error');
      emailInput.focus();
      return;
    }

    if (!consentCheckbox.checked) {
      this.showMessage(messageEl, 'Vui lòng đồng ý nhận email marketing!', 'error');
      return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    btnText.classList.add('d-none');
    btnIcon.classList.add('d-none');
    btnSpinner.classList.remove('d-none');

    try {
      const response = await fetch('/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          consent: consentCheckbox.checked
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showMessage(messageEl, data.message, 'success');
        form.reset();

        // Google Analytics event (nếu có)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'newsletter_signup', {
            'event_category': 'Newsletter',
            'event_label': 'Success'
          });
        }
      } else {
        this.showMessage(messageEl, data.message || 'Có lỗi xảy ra!', 'error');
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.showMessage(
        messageEl,
        'Không thể kết nối đến server. Vui lòng thử lại!',
        'error'
      );
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnIcon.classList.remove('d-none');
      btnSpinner.classList.add('d-none');
    }
  };

  newsletter.showMessage = function(element, message, type) {
    element.textContent = message;
    element.className = `newsletter-message ${type}`;

    // Auto-hide success message after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        element.style.opacity = '0';
        setTimeout(() => {
          element.className = 'newsletter-message';
          element.textContent = '';
          element.style.opacity = '1';
        }, 300);
      }, 5000);
    }
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => newsletter.init());
  } else {
    newsletter.init();
  }

})();

