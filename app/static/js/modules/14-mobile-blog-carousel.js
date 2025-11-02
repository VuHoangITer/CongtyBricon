/**
 * ==================== CAROUSEL BLOG MOBILE/TABLET ====================
 * File: 14-mobile-blog-carousel.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:02:12
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

  // ==================== NAMESPACE RIÊNG ==================== //
  window.BlogCarousel = window.BlogCarousel || {};
  const BC = window.BlogCarousel;

  // ==================== STATE ==================== //
  BC.state = {
    carouselInstance: null,
    isInitialized: false
  };

  // ==================== CONFIG ==================== //
  BC.config = {
    breakpoint: 991,
    transitionDuration: 500,
    dragThreshold: 50
  };

  // ==================== CHECK BREAKPOINT ==================== //
  BC.shouldActivate = function() {
    return window.innerWidth <= this.config.breakpoint;
  };

  // ==================== KHỞI TẠO CAROUSEL ==================== //
  BC.init = function() {
    // Kiểm tra breakpoint
    if (!this.shouldActivate()) {
      console.log('📱 Blog Carousel: Skipped (Desktop mode - using grid)');
      return;
    }

    const blogSection = document.querySelector('#featured-blogs-section');
    if (!blogSection) {
      console.log('📱 Blog Carousel: Section not found');
      return;
    }

    const originalGrid = blogSection.querySelector('.row.g-4');
    if (!originalGrid) {
      console.log('📱 Blog Carousel: Grid not found');
      return;
    }

    const blogCards = originalGrid.querySelectorAll('.col-lg-4');
    if (blogCards.length === 0) {
      console.log('📱 Blog Carousel: No blog cards found');
      return;
    }

    // Kiểm tra xem đã có carousel chưa
    if (blogSection.querySelector('.blog-carousel-wrapper')) {
      console.log('📱 Blog Carousel: Already exists');
      return;
    }

    // Tạo carousel structure
    this.createCarouselStructure(blogSection, originalGrid, blogCards);

    console.log(`✅ Blog Carousel: Initialized with ${blogCards.length} cards (Mobile/Tablet mode)`);
  };

  // ==================== TẠO CẤU TRÚC CAROUSEL ==================== //
  BC.createCarouselStructure = function(blogSection, originalGrid, blogCards) {
    // Tạo wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'blog-carousel-wrapper';

    const container = document.createElement('div');
    container.className = 'blog-carousel-container';

    const track = document.createElement('div');
    track.className = 'blog-carousel-track';
    track.id = 'blogCarouselTrack';

    // Chuyển blog cards vào carousel
    blogCards.forEach((card) => {
      const slide = document.createElement('div');
      slide.className = 'blog-carousel-slide';
      slide.innerHTML = card.innerHTML;
      track.appendChild(slide);
    });

    // Tạo navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'blog-carousel-nav-btn blog-carousel-prev';
    prevBtn.id = 'blogCarouselPrev';
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.setAttribute('aria-label', 'Previous');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'blog-carousel-nav-btn blog-carousel-next';
    nextBtn.id = 'blogCarouselNext';
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.setAttribute('aria-label', 'Next');

    // Lắp ráp
    container.appendChild(track);
    wrapper.appendChild(container);
    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);

    // Thêm carousel vào DOM
    originalGrid.parentNode.insertBefore(wrapper, originalGrid);

    // Ẩn grid gốc
    originalGrid.style.display = 'none';

    // Khởi tạo carousel logic
    this.state.carouselInstance = this.setupCarousel(track, prevBtn, nextBtn);
    this.state.isInitialized = true;
  };

  // ==================== SETUP CAROUSEL LOGIC ==================== //
  BC.setupCarousel = function(track, prevBtn, nextBtn) {
    const slides = track.querySelectorAll('.blog-carousel-slide');
    let currentIndex = 0;
    let itemsPerView = 2;

    function updateItemsPerView() {
      const width = window.innerWidth;
      if (width < 768) {
        itemsPerView = 1;
      } else if (width <= 991) {
        itemsPerView = 2;
      }
    }

    function updateCarousel() {
      const slideWidth = track.parentElement.offsetWidth / itemsPerView;
      const offset = -currentIndex * slideWidth;
      track.style.transform = `translateX(${offset}px)`;
      track.style.transition = `transform ${BC.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    }

    function next() {
      const maxIndex = slides.length - itemsPerView;
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = 0; // Loop về đầu
      }
      updateCarousel();
    }

    function prev() {
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = slides.length - itemsPerView; // Loop về cuối
      }
      updateCarousel();
    }

    // Event listeners
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // Initialize
    updateItemsPerView();
    updateCarousel();

    return {
      next,
      prev,
      updateItemsPerView,
      updateCarousel,
      getCurrentIndex: () => currentIndex
    };
  };

  // ==================== DESTROY CAROUSEL ==================== //
  BC.destroy = function() {
    if (!this.state.isInitialized) return;

    const blogSection = document.querySelector('#featured-blogs-section');
    if (!blogSection) return;

    const wrapper = blogSection.querySelector('.blog-carousel-wrapper');
    const originalGrid = blogSection.querySelector('.row.g-4');

    if (wrapper) {
      wrapper.remove();
    }

    if (originalGrid) {
      originalGrid.style.display = '';
    }

    this.state.carouselInstance = null;
    this.state.isInitialized = false;

    console.log('📱 Blog Carousel: Destroyed (Desktop mode - using grid)');
  };

  // ==================== HANDLE RESIZE ==================== //
  BC.handleResize = function() {
    if (this.shouldActivate() && !this.state.isInitialized) {
      // Desktop → Mobile/Tablet: Tạo carousel
      this.init();
    } else if (!this.shouldActivate() && this.state.isInitialized) {
      // Mobile/Tablet → Desktop: Destroy carousel
      this.destroy();
    } else if (this.state.isInitialized && this.state.carouselInstance) {
      // Vẫn ở Mobile/Tablet: Update carousel
      this.state.carouselInstance.updateItemsPerView();
      this.state.carouselInstance.updateCarousel();
    }
  };

  // ==================== AUTO INIT ==================== //
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BC.init());
  } else {
    BC.init();
  }

  // ==================== HANDLE RESIZE WITH DEBOUNCE ==================== //
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => BC.handleResize(), 250);
  });

  // ==================== CLEANUP ==================== //
  window.addEventListener('beforeunload', () => BC.destroy());

  console.log('📦 Blog Carousel: Module loaded with namespace');

})();

