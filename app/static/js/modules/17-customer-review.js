/**
 * ==================== Khách hàng đánh giá ====================
 * File: 17-customer-review.js
 * Tạo tự động từ: main.js
 * Ngày tạo: 27/10/2025 22:02:30
 * ==========================================================================
 * 

            Khách hàng đánh giá
    
 * ==========================================================================
 */

/* ==================== Testimonials / Customer Reviews ==================== */
(function() {
  'use strict';

  window.TestimonialsCarousel = window.TestimonialsCarousel || {};
  const testimonials = window.TestimonialsCarousel;

  testimonials.config = {
    autoSlideDelay: 6000,
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

