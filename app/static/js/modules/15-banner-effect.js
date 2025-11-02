/**
 * ==================== BANNER EFFECTS (ANIMATION + DRAG/SWIPE) ====================
 * File: 15-banner-effect.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 02/11/2025 21:52:42
 * ==========================================================================
 * 

    📍 Vị trí: Trang chủ (section #bannerCarousel)
    🎯 Chức năng: Hiệu ứng chuyển cảnh và animation chữ trên banner chính
    
    📄 Sử dụng tại:
       - public/index.html (phần đầu trang: banner chính)
       - CSS: 15-banner-effect.css (chứa các animation như fade, slide, zoom)
       - JS: 15-banner-effect.js (namespace riêng BannerEffect)
    
    🔧 Các tính năng:
       - ✅ Hiệu ứng chữ (caption) tự động khi banner xuất hiện
       - ✅ Animation đa dạng: fade-in, slide-up, slide-left, zoom-in
       - ✅ Tùy chọn delay animation (config.animationDelay)
       - ✅ Hoạt động mượt với Bootstrap Carousel
       - ✅ Hỗ trợ IntersectionObserver (chỉ animate khi vào viewport)
       - ✅ Tích hợp drag/swipe (kéo chuột hoặc vuốt để đổi slide)
       - ✅ Tạm dừng auto-slide khi drag hoặc tab ẩn
       - ✅ Resume lại sau khi thả drag
       - ✅ Không xung đột với main.js (namespace: window.BannerEffect)
    
    🎨 Hiệu ứng caption:
       - Xuất hiện mượt với opacity + transform
       - Có thể đặt riêng animation qua data-animation="banner-slide-up"...
    
    ⚙️ Cấu hình chính (BannerEffect.config):
       - carouselId: 'bannerCarousel'
       - animationDelay: 100ms
       - animationTypes: [fade-in, slide-up, slide-left, zoom-in]
       - observerThreshold: 0.2
       - enableDrag: true
       - dragThreshold: 50px
    
    🚀 API Public:
       - BannerEffect.init() → Khởi tạo
       - BannerEffect.destroy() → Cleanup khi rời trang
       - BannerEffect.refresh() → Làm mới caption hiện tại
       - BannerEffect.setAnimationType(type) → Đặt animation mặc định
       - BannerEffect.toggleDrag(true/false) → Bật/tắt drag
    
    ⚠️ Lưu ý quan trọng:
       - Chỉ áp dụng cho section có id="bannerCarousel"
       - Không dùng chung namespace với main.js
       - Nên load sau Bootstrap JS
       - Có cleanup tự động khi unload trang
    
    💡 Mục tiêu:
          1. Thay đổi animation type:
            BannerEffect.setAnimationType('banner-slide-up');
            BannerEffect.refresh();
          2. Bật/tắt drag:
            BannerEffect.toggleDrag(false); // Tắt
            BannerEffect.toggleDrag(true);  // Bật
          3. Refresh animations:
            BannerEffect.refresh();
          4. Destroy (cleanup):
            BannerEffect.destroy();
          5. Set animation per slide (trong HTML):
            <div class="carousel-caption" data-animation="banner-zoom-in">
    
 * ==========================================================================
 */

/* ==================== BANNER EFFECTS WITH DRAG/SWIPE ==================== */

(function() {
  'use strict';

  // Namespace để tránh xung đột
  window.BannerEffect = window.BannerEffect || {};

  const BannerEffect = window.BannerEffect;

  // ==================== CONFIGURATION ====================
  BannerEffect.config = {
    carouselId: 'bannerCarousel',
    animationDelay: 100, // Delay trước khi animation chạy (ms)
    animationTypes: ['banner-fade-in', 'banner-slide-up', 'banner-slide-left', 'banner-zoom-in'],
    defaultAnimation: 'banner-fade-in', // Animation mặc định
    observerThreshold: 0.2, // % banner visible để trigger animation
    enableIntersectionObserver: true, // Bật animation khi scroll vào view
    dragThreshold: 50, // Khoảng cách tối thiểu để trigger slide (px)
    enableDrag: true // Bật/tắt tính năng kéo
  };

  // ==================== STATE ====================
  BannerEffect.state = {
    carousel: null,
    captions: [],
    hasAnimated: false,
    isInitialized: false,
    currentAnimation: null,
    bsCarousel: null, // Bootstrap Carousel instance
    // Drag/Swipe state
    isDragging: false,
    startX: 0,
    currentX: 0,
    dragStartTime: 0
  };

  // ==================== INITIALIZATION ====================
  BannerEffect.init = function() {
    console.log('🎬 Banner Effect: Initializing...');

    // Tìm carousel element
    this.state.carousel = document.getElementById(this.config.carouselId);

    if (!this.state.carousel) {
      console.warn('Banner Effect: Carousel not found');
      return;
    }

    // Lấy Bootstrap Carousel instance
    if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
      this.state.bsCarousel = bootstrap.Carousel.getInstance(this.state.carousel) ||
                              new bootstrap.Carousel(this.state.carousel, {
                                ride: 'carousel',
                                interval: 5000,
                                pause: 'hover'
                              });
    }

    // Lấy tất cả captions
    this.state.captions = Array.from(
      this.state.carousel.querySelectorAll('.carousel-caption')
    );

    if (this.state.captions.length === 0) {
      console.warn('Banner Effect: No captions found');
      return;
    }

    // Setup animation cho caption đầu tiên
    this.setupInitialAnimation();

    // Setup carousel slide event listener
    this.setupCarouselEvents();

    // Setup Intersection Observer (nếu enabled)
    if (this.config.enableIntersectionObserver) {
      this.setupIntersectionObserver();
    } else {
      // Nếu không dùng observer, animate ngay
      this.animateCaption(this.state.captions[0]);
    }

    // Setup Drag/Swipe (nếu enabled)
    if (this.config.enableDrag) {
      this.setupDragEvents();
    }

    this.state.isInitialized = true;
    console.log('✅ Banner Effect: Initialized successfully (with drag/swipe)');
  };

  // ==================== SETUP INITIAL ANIMATION ====================
  BannerEffect.setupInitialAnimation = function() {
    // Đặt animation type cho từng caption (có thể random hoặc theo thứ tự)
    this.state.captions.forEach((caption, index) => {
      // Lấy animation type từ data attribute hoặc dùng mặc định
      const animationType = caption.dataset.animation ||
                          this.config.defaultAnimation;

      caption.dataset.animationType = animationType;

      // Reset về trạng thái ban đầu
      caption.classList.remove(...this.config.animationTypes);
      caption.style.opacity = '0';
      caption.style.visibility = 'hidden';
    });
  };

  // ==================== ANIMATE CAPTION ====================
  BannerEffect.animateCaption = function(caption) {
    if (!caption) return;

    const animationType = caption.dataset.animationType ||
                         this.config.defaultAnimation;

    // Remove old animations
    caption.classList.remove(...this.config.animationTypes);

    // Small delay để đảm bảo CSS được apply
    setTimeout(() => {
      caption.style.visibility = 'visible';
      caption.classList.add(animationType);

      // Store current animation
      this.state.currentAnimation = animationType;
    }, this.config.animationDelay);
  };

  // ==================== CAROUSEL EVENTS ====================
  BannerEffect.setupCarouselEvents = function() {
    // Lắng nghe sự kiện slide của Bootstrap carousel
    this.state.carousel.addEventListener('slide.bs.carousel', (event) => {
      const nextIndex = event.to;
      const nextCaption = this.state.captions[nextIndex];

      if (nextCaption) {
        // Reset caption hiện tại
        this.state.captions.forEach(cap => {
          cap.classList.remove(...this.config.animationTypes);
          cap.style.opacity = '0';
          cap.style.visibility = 'hidden';
        });

        // Animate caption mới
        this.animateCaption(nextCaption);
      }
    });

    // Lắng nghe sự kiện sau khi slide hoàn tất
    this.state.carousel.addEventListener('slid.bs.carousel', (event) => {
      console.log(`Banner slid to index: ${event.to}`);
    });
  };

  // ==================== INTERSECTION OBSERVER ====================
  BannerEffect.setupIntersectionObserver = function() {
    // Chỉ animate lần đầu khi banner xuất hiện trong viewport
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        threshold: this.config.observerThreshold,
        rootMargin: '0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.state.hasAnimated) {
            // Lấy caption của slide active
            const activeSlide = this.state.carousel.querySelector('.carousel-item.active');
            const activeCaption = activeSlide ?
                                 activeSlide.querySelector('.carousel-caption') :
                                 this.state.captions[0];

            if (activeCaption) {
              this.animateCaption(activeCaption);
              this.state.hasAnimated = true;

              // Unobserve sau khi animate lần đầu
              observer.unobserve(entry.target);
            }
          }
        });
      }, observerOptions);

      observer.observe(this.state.carousel);
    } else {
      // Fallback: animate ngay nếu không support IntersectionObserver
      this.animateCaption(this.state.captions[0]);
      this.state.hasAnimated = true;
    }
  };

  // ==================== DRAG/SWIPE EVENTS ====================
  BannerEffect.setupDragEvents = function() {
    const carousel = this.state.carousel;

    // Set cursor style
    carousel.style.cursor = 'grab';

    // Mouse Events
    carousel.addEventListener('mousedown', this.handleDragStart.bind(this));
    carousel.addEventListener('mousemove', this.handleDragMove.bind(this));
    carousel.addEventListener('mouseup', this.handleDragEnd.bind(this));
    carousel.addEventListener('mouseleave', this.handleDragEnd.bind(this));

    // Touch Events
    carousel.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: true });
    carousel.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: true });
    carousel.addEventListener('touchend', this.handleDragEnd.bind(this));

    // Prevent context menu on long press
    carousel.addEventListener('contextmenu', (e) => {
      if (this.state.isDragging) {
        e.preventDefault();
      }
    });

    // Prevent image drag
    const images = carousel.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    console.log('👆 Banner Effect: Drag/Swipe enabled');
  };

  // ==================== HANDLE DRAG START ====================
  BannerEffect.handleDragStart = function(e) {
    // Không drag nếu click vào button hoặc link
    if (e.target.closest('a, button')) {
      return;
    }

    this.state.isDragging = true;
    this.state.startX = this.getPositionX(e);
    this.state.currentX = this.state.startX;
    this.state.dragStartTime = Date.now();

    // Change cursor
    this.state.carousel.style.cursor = 'grabbing';

    // Pause carousel auto-slide
    if (this.state.bsCarousel) {
      this.state.bsCarousel.pause();
    }
  };

  // ==================== HANDLE DRAG MOVE ====================
  BannerEffect.handleDragMove = function(e) {
    if (!this.state.isDragging) return;

    this.state.currentX = this.getPositionX(e);
  };

  // ==================== HANDLE DRAG END ====================
  BannerEffect.handleDragEnd = function(e) {
    if (!this.state.isDragging) return;

    this.state.isDragging = false;
    this.state.carousel.style.cursor = 'grab';

    // Calculate drag distance and time
    const dragDistance = this.state.currentX - this.state.startX;
    const dragTime = Date.now() - this.state.dragStartTime;
    const dragVelocity = Math.abs(dragDistance) / dragTime;

    // Determine if should trigger slide change
    const shouldSlide = Math.abs(dragDistance) > this.config.dragThreshold ||
                       dragVelocity > 0.5;

    if (shouldSlide && this.state.bsCarousel) {
      if (dragDistance > 0) {
        // Swipe right -> Previous slide
        this.state.bsCarousel.prev();
      } else {
        // Swipe left -> Next slide
        this.state.bsCarousel.next();
      }
    }

    // Resume carousel auto-slide
    setTimeout(() => {
      if (this.state.bsCarousel) {
        this.state.bsCarousel.cycle();
      }
    }, 300);

    // Reset state
    this.state.startX = 0;
    this.state.currentX = 0;
    this.state.dragStartTime = 0;
  };

  // ==================== GET POSITION X (Mouse/Touch) ====================
  BannerEffect.getPositionX = function(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  };

  // ==================== UTILITY: SET ANIMATION TYPE ====================
  BannerEffect.setAnimationType = function(type) {
    if (this.config.animationTypes.includes(type)) {
      this.config.defaultAnimation = type;
      console.log(`Banner Effect: Animation type set to ${type}`);
    } else {
      console.warn(`Banner Effect: Invalid animation type "${type}"`);
    }
  };

  // ==================== UTILITY: TOGGLE DRAG ====================
  BannerEffect.toggleDrag = function(enable) {
    this.config.enableDrag = enable;
    if (enable && this.state.isInitialized) {
      this.setupDragEvents();
    }
    console.log(`Banner Effect: Drag ${enable ? 'enabled' : 'disabled'}`);
  };

  // ==================== UTILITY: REFRESH ====================
  BannerEffect.refresh = function() {
    if (!this.state.isInitialized) return;

    console.log('🔄 Banner Effect: Refreshing...');
    this.setupInitialAnimation();

    const activeCaption = this.state.carousel.querySelector('.carousel-item.active .carousel-caption');
    if (activeCaption) {
      this.animateCaption(activeCaption);
    }
  };

  // ==================== UTILITY: DESTROY ====================
  BannerEffect.destroy = function() {
    if (!this.state.isInitialized) return;

    console.log('🗑️ Banner Effect: Destroying...');

    // Remove all animation classes
    this.state.captions.forEach(caption => {
      caption.classList.remove(...this.config.animationTypes);
      caption.style.opacity = '';
      caption.style.visibility = '';
    });

    // Reset cursor
    if (this.state.carousel) {
      this.state.carousel.style.cursor = '';
    }

    // Reset state
    this.state = {
      carousel: null,
      captions: [],
      hasAnimated: false,
      isInitialized: false,
      currentAnimation: null,
      bsCarousel: null,
      isDragging: false,
      startX: 0,
      currentX: 0,
      dragStartTime: 0
    };
  };

  // ==================== AUTO INITIALIZATION ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      BannerEffect.init();
    });
  } else {
    BannerEffect.init();
  }

  // ==================== WINDOW LOAD FALLBACK ====================
  window.addEventListener('load', () => {
    if (!BannerEffect.state.isInitialized) {
      BannerEffect.init();
    }
  });

  // ==================== CLEANUP ON UNLOAD ====================
  window.addEventListener('beforeunload', () => {
    BannerEffect.destroy();
  });

  console.log('📦 Banner Effect: Module loaded (with drag/swipe support)');

})();

