// ==================== FLOATING BUTTONS ====================
window.addEventListener("scroll", function () {
  const floatingButtons = document.querySelector(".floating-buttons");
  if (floatingButtons) {
    floatingButtons.style.display = "flex"; // luôn hiển thị
  }
});

// ==================== ANIMATE ON SCROLL ====================
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate-on-scroll");
    }
  });
}, observerOptions);

// Observe all product cards and blog cards
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".product-card, .blog-card");
  cards.forEach((card) => {
    observer.observe(card);
  });
});

// ==================== AUTO DISMISS ALERTS ====================
document.addEventListener("DOMContentLoaded", function () {
  const alerts = document.querySelectorAll(".alert.alert-dismissible");
  alerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 3000);
  });
});

// ==================== SEARCH FORM VALIDATION ====================
document.addEventListener("DOMContentLoaded", function () {
  const searchForms = document.querySelectorAll('form[action*="search"]');
  searchForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const input = form.querySelector('input[name="q"], input[name="search"]');
      if (input && input.value.trim() === "") {
        e.preventDefault();
        alert("Vui lòng nhập từ khóa tìm kiếm");
      }
    });
  });
});

// ==================== IMAGE LAZY LOADING ====================
if ("loading" in HTMLImageElement.prototype) {
  const images = document.querySelectorAll("img[data-src]");
  images.forEach((img) => {
    img.src = img.dataset.src;
  });
} else {
  // Fallback for browsers that don't support lazy loading
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js";
  document.body.appendChild(script);
}

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

// ==================== SCROLL TO TOP WITH PROGRESS ====================
(function () {
  const scrollToTopBtn = document.getElementById("scrollToTop");
  if (!scrollToTopBtn) return;

  const progressCircle = scrollToTopBtn.querySelector("circle.progress");
  const radius = progressCircle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  // Set initial progress circle
  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = circumference;

  // Update progress on scroll
  function updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;

    // Update progress circle
    const offset = circumference - (scrollPercentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    // Show/hide button
    if (scrollTop > 300) {
      scrollToTopBtn.classList.add("show");
    } else {
      scrollToTopBtn.classList.remove("show");
    }
  }

  // Smooth scroll to top
  scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Listen to scroll event
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial check
  updateProgress();
})();

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

// ==================== RESPONSIVE IMAGE SOURCE HANDLER ====================
// Force browser to re-evaluate <picture> on resize (debounced)
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    const carousel = document.getElementById('bannerCarousel');
    if (!carousel) return;
    
    const pictures = carousel.querySelectorAll('picture');
    pictures.forEach(picture => {
      const img = picture.querySelector('img');
      if (img) {
        // Force browser to re-check <source> media queries
        img.src = img.src; // Trigger re-evaluation
      }
    });
  }, 250);
});
// ==================== Page-loader ====================
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 500);
  }
});

// ==================== FEATURED PROJECTS CAROUSEL WITH MOUSE DRAG ====================
(function () {
  "use strict";

  const carousel = document.getElementById("projectsCarousel");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsContainer = document.getElementById("carouselDots");

  // Exit if carousel doesn't exist
  if (!carousel || !dotsContainer) {
    console.warn("Featured Projects Carousel: Required elements not found");
    return;
  }

  const slides = carousel.querySelectorAll(".project-slide");
  const totalSlides = slides.length;

  if (totalSlides === 0) {
    console.warn("Featured Projects Carousel: No slides found");
    return;
  }

  let currentIndex = 0;
  let autoSlideInterval = null;

  // Mouse drag variables
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  // Configuration
  const config = {
    autoSlideDelay: 3000,
    transitionDuration: 600,
    dragThreshold: 50,
  };

  // ==================== INITIALIZATION ====================
  function init() {
    createDots();
    setupEventListeners();
    updateCarousel(false);
    startAutoSlide();

    // Pause when tab is hidden
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle window resize
    window.addEventListener("resize", debounce(handleResize, 250));

    console.log(
      `Featured Projects Carousel: Initialized with ${totalSlides} slides`
    );
  }

  // ==================== DOTS CREATION ====================
  function createDots() {
    dotsContainer.innerHTML = ""; // Clear existing dots

    slides.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "dot";
      if (index === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.setAttribute("data-index", index);
      dot.addEventListener("click", () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    console.log(`Created ${slides.length} dots`);
  }

  // ==================== CAROUSEL UPDATES ====================
  function updateCarousel(smooth = true) {
    // Set transition
    if (smooth) {
      carousel.style.transition = `transform ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    } else {
      carousel.style.transition = "none";
    }

    // Calculate and apply transform
    const offset = -currentIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;

    // Update dots
    const currentDots = dotsContainer.querySelectorAll(".dot");
    currentDots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });

    // Update ARIA attributes
    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", index !== currentIndex);
    });
  }

  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentIndex = index;
    updateCarousel();
    resetAutoSlide();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  // ==================== AUTO SLIDE ====================
  function startAutoSlide() {
    stopAutoSlide(); // Clear any existing interval
    autoSlideInterval = setInterval(nextSlide, config.autoSlideDelay);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  // ==================== DRAG FUNCTIONALITY ====================
  function getPositionX(event) {
    return event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
  }

  function dragStart(event) {
    // Ignore if clicking on buttons or links
    if (event.target.closest("a, button")) {
      return;
    }

    isDragging = true;
    startPos = getPositionX(event);
    animationID = requestAnimationFrame(animation);
    stopAutoSlide();

    carousel.style.cursor = "grabbing";
    carousel.classList.add("dragging");
  }

  function dragMove(event) {
    if (!isDragging) return;

    const currentPosition = getPositionX(event);
    const diff = currentPosition - startPos;
    currentTranslate = prevTranslate + diff;
  }

  function dragEnd() {
    if (!isDragging) return;

    isDragging = false;
    cancelAnimationFrame(animationID);

    carousel.style.cursor = "grab";
    carousel.classList.remove("dragging");

    const movedBy = currentTranslate - prevTranslate;

    // Determine if we should change slide
    if (Math.abs(movedBy) > config.dragThreshold) {
      if (movedBy < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    } else {
      updateCarousel();
    }

    prevTranslate = -currentIndex * carousel.offsetWidth;
    currentTranslate = prevTranslate;
    startAutoSlide();
  }

  function animation() {
    if (!isDragging) return;

    const slideWidth = carousel.offsetWidth;
    const maxTranslate = 0;
    const minTranslate = -(totalSlides - 1) * slideWidth;

    // Limit dragging beyond boundaries
    if (currentTranslate > maxTranslate) {
      currentTranslate = maxTranslate + (currentTranslate - maxTranslate) * 0.3; // Rubber band effect
    }
    if (currentTranslate < minTranslate) {
      currentTranslate = minTranslate + (currentTranslate - minTranslate) * 0.3;
    }

    const percentageTranslate = (currentTranslate / slideWidth) * 100;

    carousel.style.transition = "none";
    carousel.style.transform = `translateX(${percentageTranslate}%)`;

    animationID = requestAnimationFrame(animation);
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    // Mouse events
    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("mousemove", dragMove);
    carousel.addEventListener("mouseup", dragEnd);
    carousel.addEventListener("mouseleave", () => {
      if (isDragging) dragEnd();
    });

    // Touch events
    carousel.addEventListener("touchstart", dragStart, { passive: true });
    carousel.addEventListener("touchmove", dragMove, { passive: true });
    carousel.addEventListener("touchend", dragEnd);

    // Prevent context menu and text selection
    carousel.addEventListener("contextmenu", (e) => e.preventDefault());
    carousel.addEventListener("dragstart", (e) => e.preventDefault());

    // Set cursor style
    carousel.style.cursor = "grab";

    // Hover to pause auto-slide
    carousel.addEventListener("mouseenter", stopAutoSlide);
    carousel.addEventListener("mouseleave", () => {
      if (!isDragging) startAutoSlide();
    });

    // Keyboard navigation
    document.addEventListener("keydown", handleKeyboard);

    // Button events (if visible)
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        nextSlide();
        resetAutoSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        prevSlide();
        resetAutoSlide();
      });
    }
  }

  // ==================== UTILITY FUNCTIONS ====================
  function handleKeyboard(e) {
    // Only handle if carousel is in viewport
    const rect = carousel.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom >= 0;

    if (!isInView) return;

    if (e.key === "ArrowLeft") {
      prevSlide();
      resetAutoSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
      resetAutoSlide();
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopAutoSlide();
    } else {
      startAutoSlide();
    }
  }

  function handleResize() {
    prevTranslate = -currentIndex * carousel.offsetWidth;
    currentTranslate = prevTranslate;
    updateCarousel(false);
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ==================== CLEANUP ====================
  function destroy() {
    stopAutoSlide();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("keydown", handleKeyboard);
    console.log("Featured Projects Carousel: Destroyed");
  }

  // Expose destroy method globally if needed
  window.destroyProjectsCarousel = destroy;

  // Initialize carousel
  init();
})();

// ==================== Chatbot Widget ====================
class ChatbotWidget {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.remainingRequests = 20;

        // DOM elements
        this.chatButton = document.getElementById('chatbotButton');
        this.chatWidget = document.getElementById('chatbotWidget');
        this.closeBtn = document.getElementById('chatbotCloseBtn');
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.userInput = document.getElementById('chatbotInput');
        this.sendBtn = document.getElementById('chatbotSendBtn');
        this.resetBtn = document.getElementById('chatbotResetBtn');
        this.requestCountEl = document.getElementById('requestCount');

        if (!this.chatButton || !this.chatWidget) {
            console.error('Chatbot elements not found');
            return;
        }

        this.init();
    }

    init() {
        this.chatButton.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.resetBtn.addEventListener('click', () => this.resetChat());

        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // ❌ XÓA AUTO-FOCUS - KHÔNG CÒN TỰ ĐỘNG MỞ BÀN PHÍM
        // Không dùng transitionend để focus nữa

        console.log('Chatbot initialized successfully');
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatWidget.classList.toggle('active');

        // ✅ THÊM/XÓA CLASS VÀO BODY
        if (this.isOpen) {
            document.body.classList.add('chatbot-open');
            this.scrollToBottom();

            // Fix cho iOS: Ngăn body scroll
            if (this.isMobile()) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                document.body.style.top = '0';
            }
        } else {
            document.body.classList.remove('chatbot-open');

            // Khôi phục scroll
            if (this.isMobile()) {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
            }
        }
    }

    isMobile() {
        return window.innerWidth <= 768;
    }

    async sendMessage() {
        const message = this.userInput.value.trim();

        if (!message || this.isTyping) {
            return;
        }

        if (message.length > 500) {
            alert('Tin nhắn quá dài! Vui lòng nhập tối đa 500 ký tự.');
            return;
        }

        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.setInputState(false);
        this.showTyping();

        try {
            const response = await fetch('/chatbot/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            this.hideTyping();

            if (response.ok) {
                this.addMessage(data.response, 'bot');

                if (data.remaining_requests !== undefined) {
                    this.remainingRequests = data.remaining_requests;
                    this.updateRequestCount();
                }
            } else {
                this.addMessage(
                    data.error || data.response || 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại! 😊',
                    'bot'
                );
            }

        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTyping();
            this.addMessage(
                'Xin lỗi, không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng! 🔌',
                'bot'
            );
        } finally {
            this.setInputState(true);
            // ❌ KHÔNG FOCUS SAU KHI GỬI - TRÁNH MỞ BÀN PHÍM
            // this.userInput.focus(); // Đã xóa dòng này
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chatbot-message-content';
        contentDiv.innerHTML = this.escapeHtml(text).replace(/\n/g, '<br>');

        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTyping() {
        this.isTyping = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot';
        typingDiv.id = 'chatbotTypingIndicator';

        const typingContent = document.createElement('div');
        typingContent.className = 'chatbot-typing';
        typingContent.innerHTML = '<span></span><span></span><span></span>';

        typingDiv.appendChild(typingContent);
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('chatbotTypingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    setInputState(enabled) {
        this.userInput.disabled = !enabled;
        this.sendBtn.disabled = !enabled;
        this.sendBtn.style.opacity = enabled ? '1' : '0.5';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    async resetChat() {
        if (!confirm('Bạn có chắc muốn làm mới hội thoại? Tất cả tin nhắn sẽ bị xóa.')) {
            return;
        }

        try {
            const response = await fetch('/chatbot/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const messages = this.messagesContainer.querySelectorAll('.chatbot-message');
                messages.forEach((msg, index) => {
                    if (index > 0) {
                        msg.remove();
                    }
                });

                this.remainingRequests = 20;
                this.updateRequestCount();
                this.addMessage('Đã làm mới hội thoại! Tôi có thể giúp gì cho bạn? 😊', 'bot');
            }
        } catch (error) {
            console.error('Reset error:', error);
            alert('Không thể làm mới hội thoại. Vui lòng thử lại!');
        }
    }

    updateRequestCount() {
        if (this.requestCountEl) {
            this.requestCountEl.textContent = `Còn ${this.remainingRequests} tin nhắn`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chatbotButton')) {
        new ChatbotWidget();
    }
});
// ==================== ENHANCED EFFECTS FOR INDEX PAGE ==================== /
// ==================== NAMESPACE RIÊNG ĐỂ TRÁNH XUNG ĐỘT ====================
window.EnhancedEffects = window.EnhancedEffects || {};

(function(EE) {
  'use strict';

// ==================== ANIMATED COUNTER ====================
// Đếm tăng dần cho phần thống kê, có thể chỉnh bước đếm
EE.AnimatedCounter = {
  counters: [],
  isAnimated: new Set(),

  init: function() {
    this.counters = document.querySelectorAll('.about-stats h3, .stat-number h3');
    if (this.counters.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isAnimated.has(entry.target)) {
            this.animateCounter(entry.target);
            this.isAnimated.add(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.counters.forEach(counter => observer.observe(counter));
  },

  animateCounter: function(element) {
    let text = element.textContent.trim();
    const match = text.match(/[\d.,]+/);
    if (!match) return;

    // Làm sạch số: bỏ . và ,
    const targetNumber = parseInt(match[0].replace(/[.,]/g, ''), 10);
    const suffix = text.replace(match[0], '').trim(); // ví dụ '+'

    // ⚙️ Cấu hình
    const duration = 2000;   // Tổng thời gian chạy (ms)
    const step = 300;        // Mỗi lần tăng bao nhiêu
    const totalSteps = Math.ceil(targetNumber / step);
    const intervalTime = duration / totalSteps;

    let current = 0;

    const originalColor = window.getComputedStyle(element).color;
    element.style.color = 'var(--brand-primary)';
    element.style.transition = 'color 0.3s ease';

    const timer = setInterval(() => {
      current += step;
      if (current >= targetNumber) {
        current = targetNumber;
        clearInterval(timer);
        element.style.color = originalColor;
      }

      element.textContent = `${current.toLocaleString('vi-VN')}${suffix}`;
    }, intervalTime);
  }
};


  // ==================== PARALLAX SCROLLING ====================
  // Hiệu ứng parallax cho images
  EE.ParallaxEffect = {
    elements: [],

    init: function() {
      const parallaxConfig = [
        { selector: '.video-container img', speed: 0.3 },
      ];

      parallaxConfig.forEach(config => {
        const els = document.querySelectorAll(config.selector);
        els.forEach(el => {
          this.elements.push({ el: el, speed: config.speed });
        });
      });

      if (this.elements.length > 0) {
        this.handleScroll();
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 10));
      }
    },

    handleScroll: function() {
      const scrolled = window.pageYOffset;

      this.elements.forEach(item => {
        const rect = item.el.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
          const yPos = -((scrolled - elementTop) * item.speed);
          item.el.style.transform = `translateY(${yPos}px)`;
          item.el.style.willChange = 'transform';
        }
      });
    },

    throttle: function(func, delay) {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return func(...args);
        }
      };
    }
  };

  // ==================== SMOOTH REVEAL ANIMATION ====================
  // Hiệu ứng xuất hiện mượt mà cho elements
  EE.SmoothReveal = {
    elements: [],

    init: function() {
      this.elements = document.querySelectorAll(`
        .product-card:not(.animate-on-scroll),
        .blog-card:not(.animate-on-scroll),
        .process-step,
        .feature-item,
        section h2,
        .title-underline
      `);

      if (this.elements.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('revealed');
              }, index * 100); // Stagger effect
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      // Thêm class initial state
      this.elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });

      // CSS cho revealed state
      const style = document.createElement('style');
      style.textContent = `
        .revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // ====================  MAGNETIC BUTTONS ====================
  // Nút CTA "hút" chuột khi di chuyển gần
  EE.MagneticButtons = {
    buttons: [],

    init: function() {
      // Chỉ áp dụng trên desktop
      if (window.innerWidth < 768) return;

      this.buttons = document.querySelectorAll(`
        .btn-warning:not(.mobile-blog-carousel-btn),
        .btn-dark,
        .btn-outline-warning
      `);

      this.buttons.forEach(btn => {
        btn.style.transition = 'transform 0.2s ease-out';

        btn.addEventListener('mousemove', this.handleMouseMove.bind(this));
        btn.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
      });
    },

    handleMouseMove: function(e) {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const moveX = x * 0.15;
      const moveY = y * 0.15;

      btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
    },

    handleMouseLeave: function(e) {
      const btn = e.currentTarget;
      btn.style.transform = 'translate(0, 0)';
    }
  };

  // ====================  TEXT TYPING ANIMATION ====================
  // Hiệu ứng đánh máy cho heading
  EE.TypingAnimation = {
    elements: [],

    init: function() {
      // Tìm heading "BRICON VIỆT NAM" trong about section
      const heading = document.querySelector('.about-content h2, #featured-projects h2:first-of-type');

      if (!heading) return;

      const originalText = heading.textContent;
      heading.setAttribute('data-original-text', originalText);
      heading.textContent = '';
      heading.style.borderRight = '2px solid var(--brand-primary)';
      heading.style.animation = 'blink 0.7s step-end infinite';

      // CSS cho cursor nhấp nháy
      const style = document.createElement('style');
      style.textContent = `
        @keyframes blink {
          from, to { border-color: transparent; }
          50% { border-color: var(--brand-primary); }
        }
      `;
      document.head.appendChild(style);

      // Observer để bắt đầu typing khi vào viewport
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.typeText(heading, originalText);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(heading);
    },

    typeText: function(element, text) {
      let index = 0;
      const speed = 80; // milliseconds

      const type = () => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
          setTimeout(type, speed);
        } else {
          // Xóa cursor sau khi hoàn thành
          setTimeout(() => {
            element.style.borderRight = 'none';
            element.style.animation = 'none';
          }, 500);
        }
      };

      type();
    }
  };

  // ==================== KHỞI TẠO TẤT CẢ HIỆU ỨNG ====================
  EE.init = function() {
    // Đợi DOM load xong
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initAll();
      });
    } else {
      this.initAll();
    }
  };

  EE.initAll = function() {
    console.log('🎨 Initializing Enhanced Effects...');

    try {
      // Các hiệu ứng không phụ thuộc scroll
      this.AnimatedCounter.init();
      this.MagneticButtons.init();
      this.TypingAnimation.init();

      // Hiệu ứng scroll-based (delay nhỏ để tránh lag)
      setTimeout(() => {
        this.ParallaxEffect.init();
        this.SmoothReveal.init();
      }, 100);

      console.log('✅ Enhanced Effects loaded successfully!');
    } catch (error) {
      console.error('❌ Enhanced Effects error:', error);
    }
  };

  // ==================== AUTO INIT ====================
  EE.init();

})(window.EnhancedEffects);

// ==================== CLEANUP ON PAGE UNLOAD ====================
window.addEventListener('beforeunload', function() {
  // Cleanup để tránh memory leaks
  if (window.EnhancedEffects) {
    window.EnhancedEffects = null;
  }
});

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

/* ==================== Testimonials / Customer Reviews ==================== */
(function() {
  'use strict';

  window.TestimonialsCarousel = window.TestimonialsCarousel || {};
  const testimonials = window.TestimonialsCarousel;

  testimonials.config = {
    autoSlideDelay: 4000,
    transitionDuration: 500,
    dragThreshold: 50
  };

  testimonials.state = {
    currentSlide: 0,
    totalSlides: 0,
    isDragging: false,
    startX: 0,
    currentX: 0,
    autoSlideInterval: null,
    isInitialized: false
  };

  testimonials.elements = {
    track: null,
    cards: [],
    dots: []
  };

  testimonials.init = function() {
    const section = document.getElementById('testimonials-section');
    if (!section) return;

    this.elements.track = section.querySelector('.testimonials-track');
    this.elements.cards = Array.from(section.querySelectorAll('.testimonial-card'));
    this.state.totalSlides = this.elements.cards.length;

    if (this.state.totalSlides === 0) return;

    this.createDots();
    this.setupEventListeners();
    this.startAutoSlide();
    this.state.isInitialized = true;

    console.log(`✅ Testimonials Carousel: Initialized with ${this.state.totalSlides} slides`);
  };

  testimonials.createDots = function() {
    const dotsContainer = document.querySelector('.testimonials-dots');
    if (!dotsContainer) return;

    for (let i = 0; i < this.state.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');

      dot.addEventListener('click', () => {
        this.goToSlide(i);
        this.resetAutoSlide();
      });

      dotsContainer.appendChild(dot);
      this.elements.dots.push(dot);
    }
  };

  testimonials.setupEventListeners = function() {
    const track = this.elements.track;

    // Mouse events
    track.addEventListener('mousedown', this.handleDragStart.bind(this));
    track.addEventListener('mousemove', this.handleDragMove.bind(this));
    track.addEventListener('mouseup', this.handleDragEnd.bind(this));
    track.addEventListener('mouseleave', this.handleDragEnd.bind(this));

    // Touch events
    track.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: true });
    track.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: true });
    track.addEventListener('touchend', this.handleDragEnd.bind(this));

    // Pause on hover
    track.addEventListener('mouseenter', () => this.stopAutoSlide());
    track.addEventListener('mouseleave', () => this.startAutoSlide());

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      document.hidden ? this.stopAutoSlide() : this.startAutoSlide();
    });
  };

  testimonials.goToSlide = function(index) {
    if (index < 0 || index >= this.state.totalSlides) return;

    this.state.currentSlide = index;
    const translateX = -index * 100;

    this.elements.track.style.transition = `transform ${this.config.transitionDuration}ms ease`;
    this.elements.track.style.transform = `translateX(${translateX}%)`;

    this.updateDots();
  };

  testimonials.nextSlide = function() {
    const next = (this.state.currentSlide + 1) % this.state.totalSlides;
    this.goToSlide(next);
  };

  testimonials.updateDots = function() {
    this.elements.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.state.currentSlide);
    });
  };

  testimonials.handleDragStart = function(e) {
    if (e.target.closest('a, button')) return;

    this.state.isDragging = true;
    this.state.startX = this.getPositionX(e);
    this.elements.track.classList.add('dragging');
    this.stopAutoSlide();
  };

  testimonials.handleDragMove = function(e) {
    if (!this.state.isDragging) return;
    this.state.currentX = this.getPositionX(e);
  };

  testimonials.handleDragEnd = function() {
    if (!this.state.isDragging) return;

    this.state.isDragging = false;
    this.elements.track.classList.remove('dragging');

    const diff = this.state.currentX - this.state.startX;

    if (Math.abs(diff) > this.config.dragThreshold) {
      if (diff > 0 && this.state.currentSlide > 0) {
        this.goToSlide(this.state.currentSlide - 1);
      } else if (diff < 0 && this.state.currentSlide < this.state.totalSlides - 1) {
        this.goToSlide(this.state.currentSlide + 1);
      }
    }

    this.startAutoSlide();
  };

  testimonials.getPositionX = function(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  };

  testimonials.startAutoSlide = function() {
    this.stopAutoSlide();
    this.state.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.config.autoSlideDelay);
  };

  testimonials.stopAutoSlide = function() {
    if (this.state.autoSlideInterval) {
      clearInterval(this.state.autoSlideInterval);
      this.state.autoSlideInterval = null;
    }
  };

  testimonials.resetAutoSlide = function() {
    this.stopAutoSlide();
    this.startAutoSlide();
  };

  testimonials.destroy = function() {
    if (!this.state.isInitialized) return;
    this.stopAutoSlide();
    console.log('Testimonials Carousel: Destroyed');
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => testimonials.init());
  } else {
    testimonials.init();
  }

  window.addEventListener('beforeunload', () => testimonials.destroy());

})();

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