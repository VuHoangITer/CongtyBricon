/**
 * ==================== CAROUSEL BLOG MOBILE/TABLET ====================
 * File: 14-mobile-blog-carousel.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:52:42
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

  // ==================== NAMESPACE ==================== //
  window.BlogCarousel = window.BlogCarousel || {};
  const BC = window.BlogCarousel;

  // ==================== STATE ==================== //
  BC.state = {
    isCreated: false,
    carouselInstance: null
  };

  // ==================== CONFIG ==================== //
  BC.config = {
    transitionDuration: 500,
    dragThreshold: 50
  };

  // ==================== TẠO CAROUSEL 1 LẦN DUY NHẤT ==================== //
  BC.createOnce = function() {
    // Đã tạo rồi thì thôi
    if (this.state.isCreated) {
      console.log('📱 Blog Carousel: Already created');
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

    // Tạo carousel structure
    const wrapper = document.createElement('div');
    wrapper.className = 'blog-carousel-wrapper';

    const container = document.createElement('div');
    container.className = 'blog-carousel-container';

    const track = document.createElement('div');
    track.className = 'blog-carousel-track';

    // Clone blog cards vào carousel
    blogCards.forEach((card) => {
      const slide = document.createElement('div');
      slide.className = 'blog-carousel-slide';
      slide.innerHTML = card.innerHTML;
      track.appendChild(slide);
    });

    // Tạo navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'blog-carousel-nav-btn blog-carousel-prev';
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.setAttribute('aria-label', 'Previous');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'blog-carousel-nav-btn blog-carousel-next';
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.setAttribute('aria-label', 'Next');

    // Lắp ráp
    container.appendChild(track);
    wrapper.appendChild(container);
    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);

    // Thêm vào DOM
    originalGrid.parentNode.insertBefore(wrapper, originalGrid);

    // Setup carousel logic
    this.state.carouselInstance = this.setupCarousel(track, container, prevBtn, nextBtn);
    this.state.isCreated = true;

    console.log(`✅ Blog Carousel: Created with ${blogCards.length} cards (PERMANENT)`);
  };

  // ==================== SETUP CAROUSEL LOGIC ==================== //
  BC.setupCarousel = function(track, container, prevBtn, nextBtn) {
    const slides = track.querySelectorAll('.blog-carousel-slide');
    let currentIndex = 0;
    let itemsPerView = 1;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    function updateItemsPerView() {
      const width = window.innerWidth;
      if (width < 768) {
        itemsPerView = 1;
      } else if (width <= 991) {
        itemsPerView = 2;
      }
    }

    function getSlideWidth() {
      return container.offsetWidth / itemsPerView;
    }

    function updateCarousel(animate = true) {
      const slideWidth = getSlideWidth();
      const offset = -currentIndex * slideWidth;

      if (animate) {
        track.style.transition = `transform ${BC.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      } else {
        track.style.transition = 'none';
      }

      track.style.transform = `translateX(${offset}px)`;
      currentTranslate = offset;
      prevTranslate = offset;

      // Update buttons state
      updateButtonsState();
    }

    function updateButtonsState() {
      const maxIndex = slides.length - itemsPerView;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    }

    function next() {
      const maxIndex = slides.length - itemsPerView;
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    }

    function prev() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }

    function goToSlide(index) {
      const maxIndex = slides.length - itemsPerView;
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();
    }

    // ==================== TOUCH/DRAG EVENTS ==================== //
    function getPositionX(event) {
      return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function dragStart(event) {
      isDragging = true;
      startPos = getPositionX(event);
      track.style.cursor = 'grabbing';
      track.style.transition = 'none';
    }

    function dragMove(event) {
      if (!isDragging) return;

      const currentPosition = getPositionX(event);
      const diff = currentPosition - startPos;
      currentTranslate = prevTranslate + diff;

      track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function dragEnd() {
      if (!isDragging) return;

      isDragging = false;
      track.style.cursor = 'grab';

      const movedBy = currentTranslate - prevTranslate;

      // Nếu kéo đủ xa (threshold), chuyển slide
      if (Math.abs(movedBy) > BC.config.dragThreshold) {
        if (movedBy < 0) {
          // Kéo sang trái = next
          next();
        } else {
          // Kéo sang phải = prev
          prev();
        }
      } else {
        // Không đủ xa, quay về vị trí cũ
        updateCarousel();
      }
    }

    // Mouse events
    track.addEventListener('mousedown', dragStart);
    track.addEventListener('mousemove', dragMove);
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', dragEnd);

    // Touch events
    track.addEventListener('touchstart', dragStart, { passive: true });
    track.addEventListener('touchmove', dragMove, { passive: true });
    track.addEventListener('touchend', dragEnd);

    // Prevent click when dragging
    track.addEventListener('click', function(e) {
      if (Math.abs(currentTranslate - prevTranslate) > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Button events
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // Cursor style
    track.style.cursor = 'grab';

    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateItemsPerView();
        goToSlide(currentIndex); // Recalculate position
      }, 250);
    });

    // Initialize
    updateItemsPerView();
    updateCarousel();

    return {
      next,
      prev,
      goToSlide,
      updateItemsPerView,
      updateCarousel,
      getCurrentIndex: () => currentIndex
    };
  };

  // ==================== AUTO INIT ==================== //
  function init() {
    BC.createOnce();
  }

  // DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // pageshow - Quan trọng cho bfcache
  window.addEventListener('pageshow', function(event) {
    console.log('📱 pageshow:', event.persisted ? 'from cache' : 'normal load');
    init();
  });

  console.log('📦 Blog Carousel: Module loaded with touch/drag support');

})();

