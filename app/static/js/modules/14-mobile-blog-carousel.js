/**
 * ==================== CAROUSEL BLOG MOBILE/TABLET ====================
 * File: 14-mobile-blog-carousel.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 29/10/2025 18:44:48
 * ==========================================================================
 * 

    📍 Vị trí: Trang chủ section "Tin tức nổi bật" (chỉ mobile/tablet)
    🎯 Chức năng: Carousel tùy chỉnh cho blog cards ở màn hình nhỏ
    📄 Sử dụng tại:
       - public/index.html (section #featured-blogs-section)
       - CSS: 13-mobile-blog-carousel.css
    🔧 Các tính năng:
       - ✅ CHỈ HOẠT ĐỘNG: Trang index + màn hình ≤ 991px
       - ✅ AUTO DETECT: Tự động phát hiện trang index qua:
            • URL pathname (/, /index.html, /index)
            • Blog section ID (#featured-blogs-section)
            • Body class/attribute (page-index, data-page="index")
       - ✅ TOUCH/MOUSE DRAG: Vuốt/kéo để chuyển slide
       - ✅ AUTO SLIDE: Tự động chuyển sau 5 giây
       - ✅ DOTS NAVIGATION: Click vào dot để jump slide
       - ✅ PREV/NEXT BUTTONS: Nút điều hướng 2 bên
       - ✅ KEYBOARD: Arrow keys điều khiển
       - ✅ PAUSE ON HOVER: Dừng auto khi hover (desktop/tablet)
       - ✅ TAB HIDDEN: Dừng khi tab ẩn (visibilitychange)
       - ✅ RESPONSIVE: Tự động init/destroy khi resize
       - ✅ NO CONFLICT: Namespace riêng window.MobileBlogCarousel

    🎨 Cursor: grab → grabbing khi drag
    ⚠️ Threshold: 50px để trigger chuyển slide
    🔄 Transition: 400ms cubic-bezier(0.4, 0, 0.2, 1)
    ⏱️ Auto slide interval: 5000ms (5 giây)

    💡 Cách hoạt động:
       1. Kiểm tra shouldActivate() = width ≤ 991px + isIndexPage()
       2. Tìm blog section (#featured-blogs-section)
       3. Tìm blog grid (.row.g-4)
       4. Clone tất cả blog cards vào carousel structure
       5. Ẩn grid gốc (display: none)
       6. Hiển thị carousel với navigation
       7. Khi resize > 991px: destroy carousel, hiện lại grid

    🚀 API Public:
       - window.MobileBlogCarousel.init()
       - window.MobileBlogCarousel.destroy()
       - window.MobileBlogCarousel.nextSlide()
       - window.MobileBlogCarousel.prevSlide()
       - window.MobileBlogCarousel.goToSlide(index)

    ⚠️ Lưu ý quan trọng:
       - Module này CHỈ hoạt động khi có #featured-blogs-section
       - Không ảnh hưởng đến trang khác (products, blogs, contact...)
       - Tự động cleanup khi chuyển trang hoặc resize về desktop
       - Không xung đột với projects-carousel đã có
    
 * ==========================================================================
 */

/*** ==================== MOBILE BLOG CAROUSEL  ============================*/
(function() {
  'use strict';

  // Namespace riêng để tránh xung đột
  window.MobileBlogCarousel = window.MobileBlogCarousel || {};

  const MBC = window.MobileBlogCarousel;

  // State management
  MBC.state = {
    currentSlide: 0,
    totalSlides: 0,
    isDragging: false,
    startX: 0,
    currentX: 0,
    translateX: 0,
    finalTranslateX: 0,
    autoSlideInterval: null,
    isInitialized: false
  };

  // Configuration
  MBC.config = {
    breakpoint: 991,
    autoSlideDelay: 5000,
    transitionDuration: 400,
    dragThreshold: 50
  };

  // DOM Elements
  MBC.elements = {
    wrapper: null,
    track: null,
    slides: [],
    prevBtn: null,
    nextBtn: null,
    dots: []
  };

  /**
   * Kiểm tra xem có phải trang index không
   */
  MBC.isIndexPage = function() {
    // Kiểm tra nhiều cách để xác định trang index
    const body = document.body;
    const hasBlogSection = document.querySelector('#featured-blogs-section');
    const isRootPath = window.location.pathname === '/' ||
                       window.location.pathname === '/index.html' ||
                       window.location.pathname === '/index';

    return body.classList.contains('page-index') ||
           body.getAttribute('data-page') === 'index' ||
           body.getAttribute('data-page') === 'main.index' ||
           isRootPath ||
           hasBlogSection !== null; // Nếu có blog section thì chắc chắn là trang index
  };

  /**
   * Kiểm tra xem có nên kích hoạt carousel không
   */
  MBC.shouldActivate = function() {
    return window.innerWidth <= this.config.breakpoint && this.isIndexPage();
  };

  /**
   * Khởi tạo carousel
   */
  MBC.init = function() {
    if (!this.shouldActivate()) {
      console.log('📱 Mobile Blog Carousel: Skipped (Desktop mode or not index page)');
      return;
    }

    // Tìm blog section trong index
    const blogSection = document.querySelector('section.py-5.bg-gray-dark:has(.blog-card)');
    if (!blogSection) {
      console.log('📱 Mobile Blog Carousel: Blog section not found');
      return;
    }

    const blogGrid = blogSection.querySelector('.row.g-4');
    if (!blogGrid) {
      console.log('📱 Mobile Blog Carousel: Blog grid not found');
      return;
    }

    // Lấy tất cả blog cards
    const blogCards = blogGrid.querySelectorAll('.col-lg-4.col-md-4');
    if (blogCards.length === 0) {
      console.log('📱 Mobile Blog Carousel: No blog cards found');
      return;
    }

    this.state.totalSlides = blogCards.length;

    // Tạo cấu trúc carousel
    this.createCarouselStructure(blogGrid, blogCards);

    // Khởi tạo event listeners
    this.setupEventListeners();

    // Khởi tạo auto slide
    this.startAutoSlide();

    this.state.isInitialized = true;
    console.log(`📱 Mobile Blog Carousel: Initialized with ${this.state.totalSlides} slides`);
  };

  /**
   * Tạo cấu trúc HTML cho carousel
   */
  MBC.createCarouselStructure = function(blogGrid, blogCards) {
    // Tạo wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'mobile-blog-carousel-wrapper';

    // Tạo track
    const track = document.createElement('div');
    track.className = 'mobile-blog-carousel-track';

    // Chuyển các blog cards thành slides
    blogCards.forEach((card, index) => {
      const slide = document.createElement('div');
      slide.className = 'mobile-blog-slide';
      slide.setAttribute('data-slide', index);

      // Di chuyển blog card vào slide
      const blogCard = card.querySelector('.blog-card');
      if (blogCard) {
        slide.appendChild(blogCard.cloneNode(true));
      }

      track.appendChild(slide);
    });

    // Tạo navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'mobile-blog-carousel-btn mobile-blog-carousel-prev';
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.setAttribute('aria-label', 'Previous slide');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'mobile-blog-carousel-btn mobile-blog-carousel-next';
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.setAttribute('aria-label', 'Next slide');

    // Tạo dots navigation
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'mobile-blog-carousel-dots';

    for (let i = 0; i < this.state.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'mobile-blog-carousel-dot';
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.setAttribute('data-slide', i);
      dotsContainer.appendChild(dot);
      this.elements.dots.push(dot);
    }

    // Lắp ráp
    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);
    wrapper.appendChild(track);
    wrapper.appendChild(dotsContainer);

    // Thay thế grid cũ bằng carousel
    blogGrid.style.display = 'none';
    blogGrid.parentNode.insertBefore(wrapper, blogGrid);

    // Lưu references
    this.elements.wrapper = wrapper;
    this.elements.track = track;
    this.elements.slides = Array.from(track.querySelectorAll('.mobile-blog-slide'));
    this.elements.prevBtn = prevBtn;
    this.elements.nextBtn = nextBtn;
  };

  /**
   * Setup event listeners
   */
  MBC.setupEventListeners = function() {
    // Navigation buttons
    this.elements.prevBtn.addEventListener('click', () => this.prevSlide());
    this.elements.nextBtn.addEventListener('click', () => this.nextSlide());

    // Dots navigation
    this.elements.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Touch/Mouse drag
    this.elements.track.addEventListener('mousedown', (e) => this.handleDragStart(e));
    this.elements.track.addEventListener('mousemove', (e) => this.handleDragMove(e));
    this.elements.track.addEventListener('mouseup', () => this.handleDragEnd());
    this.elements.track.addEventListener('mouseleave', () => this.handleDragEnd());

    this.elements.track.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: true });
    this.elements.track.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: true });
    this.elements.track.addEventListener('touchend', () => this.handleDragEnd());

    // Prevent context menu
    this.elements.track.addEventListener('contextmenu', (e) => e.preventDefault());

    // Pause auto slide on hover/touch
    this.elements.wrapper.addEventListener('mouseenter', () => this.stopAutoSlide());
    this.elements.wrapper.addEventListener('mouseleave', () => this.startAutoSlide());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Visibility change
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
  };

  /**
   * Chuyển đến slide cụ thể
   */
  MBC.goToSlide = function(index, animate = true) {
    if (index < 0 || index >= this.state.totalSlides) return;

    this.state.currentSlide = index;
    this.updateSlidePosition(animate);
    this.updateNavigation();
    this.updateDots();
  };

  /**
   * Slide tiếp theo
   */
  MBC.nextSlide = function() {
    const nextIndex = (this.state.currentSlide + 1) % this.state.totalSlides;
    this.goToSlide(nextIndex);
    this.resetAutoSlide();
  };

  /**
   * Slide trước
   */
  MBC.prevSlide = function() {
    const prevIndex = (this.state.currentSlide - 1 + this.state.totalSlides) % this.state.totalSlides;
    this.goToSlide(prevIndex);
    this.resetAutoSlide();
  };

  /**
   * Cập nhật vị trí slide
   */
  MBC.updateSlidePosition = function(animate = true) {
    const translateX = -this.state.currentSlide * 100;
    this.elements.track.style.transition = animate ?
      `transform ${this.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` :
      'none';
    this.elements.track.style.transform = `translateX(${translateX}%)`;
    this.state.finalTranslateX = translateX;
  };

  /**
   * Cập nhật trạng thái navigation buttons
   */
  MBC.updateNavigation = function() {
    // Enable/disable buttons based on current slide
    // (Hoặc để luôn enable nếu muốn infinite loop)
    this.elements.prevBtn.disabled = false;
    this.elements.nextBtn.disabled = false;
  };

  /**
   * Cập nhật dots
   */
  MBC.updateDots = function() {
    this.elements.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.state.currentSlide);
    });
  };

  /**
   * Handle drag start
   */
  MBC.handleDragStart = function(e) {
    if (e.target.closest('a, button')) return; // Không drag nếu click vào link/button

    this.state.isDragging = true;
    this.state.startX = this.getPositionX(e);
    this.state.currentX = this.state.startX;

    this.elements.track.style.cursor = 'grabbing';
    this.elements.track.classList.add('dragging');

    this.stopAutoSlide();
  };

  /**
   * Handle drag move
   */
  MBC.handleDragMove = function(e) {
    if (!this.state.isDragging) return;

    this.state.currentX = this.getPositionX(e);
    const diff = this.state.currentX - this.state.startX;
    const currentTranslate = this.state.finalTranslateX + (diff / this.elements.wrapper.offsetWidth * 100);

    this.elements.track.style.transition = 'none';
    this.elements.track.style.transform = `translateX(${currentTranslate}%)`;
  };

  /**
   * Handle drag end
   */
  MBC.handleDragEnd = function() {
    if (!this.state.isDragging) return;

    this.state.isDragging = false;
    this.elements.track.style.cursor = 'grab';
    this.elements.track.classList.remove('dragging');

    const diff = this.state.currentX - this.state.startX;

    if (Math.abs(diff) > this.config.dragThreshold) {
      if (diff < 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    } else {
      this.updateSlidePosition(true);
    }

    this.startAutoSlide();
  };

  /**
   * Get position X from event
   */
  MBC.getPositionX = function(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  };

  /**
   * Handle keyboard navigation
   */
  MBC.handleKeyboard = function(e) {
    if (!this.state.isInitialized) return;

    // Chỉ xử lý khi carousel đang visible
    const rect = this.elements.wrapper.getBoundingClientRect();
    if (rect.top >= window.innerHeight || rect.bottom <= 0) return;

    if (e.key === 'ArrowLeft') {
      this.prevSlide();
      this.resetAutoSlide();
    } else if (e.key === 'ArrowRight') {
      this.nextSlide();
      this.resetAutoSlide();
    }
  };

  /**
   * Handle visibility change
   */
  MBC.handleVisibilityChange = function() {
    if (document.hidden) {
      this.stopAutoSlide();
    } else {
      this.startAutoSlide();
    }
  };

  /**
   * Start auto slide
   */
  MBC.startAutoSlide = function() {
    this.stopAutoSlide();
    this.state.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.config.autoSlideDelay);
  };

  /**
   * Stop auto slide
   */
  MBC.stopAutoSlide = function() {
    if (this.state.autoSlideInterval) {
      clearInterval(this.state.autoSlideInterval);
      this.state.autoSlideInterval = null;
    }
  };

  /**
   * Reset auto slide
   */
  MBC.resetAutoSlide = function() {
    this.stopAutoSlide();
    this.startAutoSlide();
  };

  /**
   * Destroy carousel
   */
  MBC.destroy = function() {
    if (!this.state.isInitialized) return;

    this.stopAutoSlide();

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyboard);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    // Remove carousel structure
    if (this.elements.wrapper && this.elements.wrapper.parentNode) {
      const blogGrid = this.elements.wrapper.nextElementSibling;
      if (blogGrid) {
        blogGrid.style.display = '';
      }
      this.elements.wrapper.remove();
    }

    // Reset state
    this.state = {
      currentSlide: 0,
      totalSlides: 0,
      isDragging: false,
      startX: 0,
      currentX: 0,
      translateX: 0,
      finalTranslateX: 0,
      autoSlideInterval: null,
      isInitialized: false
    };

    this.elements = {
      wrapper: null,
      track: null,
      slides: [],
      prevBtn: null,
      nextBtn: null,
      dots: []
    };

    console.log('📱 Mobile Blog Carousel: Destroyed');
  };

  /**
   * Handle window resize
   */
  MBC.handleResize = function() {
    if (this.shouldActivate() && !this.state.isInitialized) {
      this.init();
    } else if (!this.shouldActivate() && this.state.isInitialized) {
      this.destroy();
    }
  };

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MBC.init());
  } else {
    MBC.init();
  }

  // Handle window resize với debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => MBC.handleResize(), 250);
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => MBC.destroy());

})();

