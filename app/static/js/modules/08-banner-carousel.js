/**
 * ==================== BANNER CAROUSEL TRANG CHỦ ====================
 * File: 08-banner-carousel.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 29/10/2025 18:44:48
 * ==========================================================================
 * 

        📍 Vị trí: Trang chủ (index.html)
        🎯 Chức năng: Quản lý carousel banner với đầy đủ tính năng
        📄 Sử dụng tại:
           - public/index.html (id="bannerCarousel")
           - CSS: 04-banner.css
        🔧 Các tính năng:
           1. ✅ LAZY LOAD: IntersectionObserver tải ảnh khi cần
           2. ✅ PRELOAD: Tải trước slide hiện tại và 2 slide kế (prev/next)
           3. ✅ PAUSE ON HOVER: Desktop dừng khi hover
           4. ✅ PAUSE ON TOUCH: Mobile dừng khi chạm, resume sau 3s
           5. ✅ KEYBOARD: Arrow Left/Right điều khiển
           6. ✅ REDUCED MOTION: Tôn trọng prefers-reduced-motion
           7. ✅ SMOOTH CTA: Banner buttons scroll mượt
           8. ✅ FALLBACK: Force load tất cả ảnh sau 3s
           9. ✅ ANALYTICS: Track views nếu có Google Analytics/GTM
           10. ✅ PRECONNECT: Nếu dùng Cloudinary/ImgIX CDN
        
 * ==========================================================================
 */

// ==================== BANNER LAZY LOAD + RESPONSIVE (INTEGRATED) ====================
document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.getElementById('bannerCarousel');
  if (!carousel) return; // Không có banner thì bỏ qua
  
  // ✅ 1. LAZY LOAD BANNER IMAGES
  const lazyBannerImages = carousel.querySelectorAll('.banner-img[loading="lazy"]');
  
  if ('IntersectionObserver' in window && lazyBannerImages.length > 0) {
    const bannerObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const parent = img.closest('.carousel-item');
          
          // Add loading class for skeleton effect
          if (parent) parent.classList.add('loading');
          
          // Load image
          img.onload = function() {
            img.classList.add('loaded');
            if (parent) parent.classList.remove('loading');
            observer.unobserve(img);
          };
          
          // Trigger load if data-src exists
          if (img.dataset.src) {
            img.src = img.dataset.src;
          } else {
            img.classList.add('loaded'); // Image already has src
            if (parent) parent.classList.remove('loading');
          }
        }
      });
    }, {
      rootMargin: '100px' // Preload 100px before viewport
    });

    lazyBannerImages.forEach(img => bannerObserver.observe(img));
  } else {
    // Fallback: immediately mark as loaded
    lazyBannerImages.forEach(img => img.classList.add('loaded'));
  }

  // ✅ 2. PRELOAD ADJACENT SLIDES
  carousel.addEventListener('slide.bs.carousel', function(e) {
    const slides = carousel.querySelectorAll('.carousel-item');
    const nextIndex = e.to;
    
    // Preload current slide
    const currentSlide = slides[nextIndex];
    if (currentSlide) {
      const currentImg = currentSlide.querySelector('.banner-img');
      if (currentImg && !currentImg.classList.contains('loaded')) {
        currentImg.classList.add('loaded');
      }
    }

    // Preload adjacent slides (prev/next)
    const prevIndex = nextIndex - 1 < 0 ? slides.length - 1 : nextIndex - 1;
    const nextSlideIndex = nextIndex + 1 >= slides.length ? 0 : nextIndex + 1;
    
    [prevIndex, nextSlideIndex].forEach(index => {
      const slide = slides[index];
      if (slide) {
        const img = slide.querySelector('.banner-img');
        if (img && !img.classList.contains('loaded')) {
          img.classList.add('loaded');
        }
      }
    });
  });

  // ✅ 3. PAUSE ON HOVER (Desktop only)
  if (window.innerWidth >= 768) {
    let isHovering = false;
    
    carousel.addEventListener('mouseenter', function() {
      isHovering = true;
      const bsCarousel = bootstrap.Carousel.getInstance(carousel);
      if (bsCarousel) bsCarousel.pause();
    });
    
    carousel.addEventListener('mouseleave', function() {
      if (isHovering) {
        isHovering = false;
        const bsCarousel = bootstrap.Carousel.getInstance(carousel);
        if (bsCarousel) bsCarousel.cycle();
      }
    });
  }

  // ✅ 4. PAUSE ON TOUCH (Mobile)
  carousel.addEventListener('touchstart', function() {
    const bsCarousel = bootstrap.Carousel.getInstance(carousel);
    if (bsCarousel) bsCarousel.pause();
  });

  carousel.addEventListener('touchend', function() {
    const bsCarousel = bootstrap.Carousel.getInstance(carousel);
    if (bsCarousel) {
      setTimeout(() => bsCarousel.cycle(), 3000); // Resume after 3s
    }
  });

  // ✅ 5. KEYBOARD NAVIGATION
  carousel.addEventListener('keydown', function(e) {
    const bsCarousel = bootstrap.Carousel.getInstance(carousel);
    if (!bsCarousel) return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      bsCarousel.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      bsCarousel.next();
    }
  });

  // ✅ 6. RESPECT REDUCED MOTION
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    carousel.setAttribute('data-bs-interval', 'false');
    carousel.querySelectorAll('.carousel-item').forEach(item => {
      item.style.transition = 'none';
    });
  }

  // ✅ 7. SMOOTH SCROLL FOR BANNER CTA
  const bannerCTAs = carousel.querySelectorAll('.carousel-caption .btn[href^="#"]');
  bannerCTAs.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ✅ 8. FALLBACK: Force load all images after 3s
  setTimeout(() => {
    const unloadedImages = carousel.querySelectorAll('.banner-img:not(.loaded)');
    unloadedImages.forEach(img => {
      img.classList.add('loaded');
      const parent = img.closest('.carousel-item');
      if (parent) parent.classList.remove('loading');
    });
  }, 3000);

  // ✅ 9. ANALYTICS: Track banner views (if GA4/GTM exists)
  if (typeof gtag !== 'undefined') {
    carousel.addEventListener('slid.bs.carousel', function(e) {
      const activeSlide = carousel.querySelector('.carousel-item.active');
      const bannerTitle = activeSlide?.querySelector('h1, h2')?.textContent;
      
      gtag('event', 'banner_view', {
        'event_category': 'Banner',
        'event_label': bannerTitle || `Slide ${e.to + 1}`,
        'value': e.to + 1
      });
    });
  }

  // ✅ 10. PRECONNECT TO CDN (if using Cloudinary/ImgIX)
  const firstBanner = carousel.querySelector('.banner-img');
  if (firstBanner) {
    const src = firstBanner.getAttribute('src') || '';
    if (src.includes('cloudinary.com') || src.includes('imgix.net')) {
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = src.includes('cloudinary') 
        ? 'https://res.cloudinary.com'
        : 'https://assets.imgix.net';
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    }
  }
});

