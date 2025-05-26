document.addEventListener('DOMContentLoaded', function() {
    const NUM_IMAGES = 20;
    const AUTO_SCROLL_INTERVAL = 2500;
    const SCROLL_COOLDOWN = 300;
    let activeIndex = Math.floor(NUM_IMAGES / 2);
    let autoScrollTimer = null;
    let isTransitioning = false;
    let lastScrollTime = 0;
  
    // Sample content for each image
    const imageContent = Array.from({length: NUM_IMAGES}, (_, i) => ({
      title: `Scenic View ${i + 1}`,
      description: `A stunning landscape captured in perfect detail. This image showcases the beauty of nature in its purest form.`,
      buttonText: 'View Details'
    }));
  
    const images = Array.from({length: NUM_IMAGES}, (_, i) =>
      `https://picsum.photos/640/640?random=${i + 1}`
    );
  
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) {
        console.error("Carousel track element not found!");
        return;
    }
  
    // --- Initial setup: Create all carousel items once ---
    function initializeCarouselItems() {
      images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = "carousel-item"; // Start with base class
        div.dataset.index = i;
        div.innerHTML = `<img src="${src}" alt="carousel ${i+1}">`;
        carouselTrack.appendChild(div);
      });
    }
    // --- Call this once when the script loads ---
    initializeCarouselItems();
  
  
    /**
     * Updates the classes of the existing carousel items based on the activeIndex.
     * This function NO LONGER removes and re-creates elements.
     */
    function updateCarouselClasses() {
      const items = carouselTrack.querySelectorAll('.carousel-item');
  
      items.forEach(item => {
        const i = parseInt(item.dataset.index, 10);
        let className = "carousel-item";
  
        if (i === activeIndex) {
            className += " center";
        } else if (i === activeIndex - 1) {
            className += " above";
        } else if (i === activeIndex + 1) {
            className += " below";
        } else if (i < activeIndex) {
            className += " hidden above-hidden";
        } else {
            className += " hidden below-hidden";
        }
  
        item.className = className;
      });
      
      isTransitioning = false;
    }
  
    /**
     * Animates the carousel to a new active index.
     */
    function animateTo(newIndex) {
      if (isTransitioning || newIndex < 0 || newIndex >= images.length || newIndex === activeIndex) {
        return;
      }
      isTransitioning = true;
      activeIndex = newIndex;
      updateCarouselClasses();
      updateContentOverlay();

      setTimeout(() => {
        isTransitioning = false;
      }, 500);
    }
  
    // --- Event Listeners for User Interaction (remain the same) ---
  
    // Click navigation
    document.addEventListener('click', function(e) {
      const now = Date.now();
      if (now - lastScrollTime < SCROLL_COOLDOWN) {
        return; // Exit if clicking too fast
      }

      const item = e.target.closest('.carousel-item');
      if (!item || item.classList.contains('center')) return;
      const idx = parseInt(item.dataset.index, 10);
      if (idx === activeIndex - 1 || idx === activeIndex + 1) {
        animateTo(idx);
        lastScrollTime = now;
        restartAutoScroll();
      }
    });
  
    // Mouse wheel navigation
    carouselTrack.addEventListener('wheel', function(e) {
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastScrollTime < SCROLL_COOLDOWN) {
        return;
      }
      
      if (isTransitioning) return;
      
      if (e.deltaY > 0) { // Scrolling down
        if (activeIndex < images.length - 1) {
          animateTo(activeIndex + 1);
          lastScrollTime = now;
        }
      } else if (e.deltaY < 0) { // Scrolling up
        if (activeIndex > 0) {
          animateTo(activeIndex - 1);
          lastScrollTime = now;
        }
      }
      restartAutoScroll();
    });
  
    // --- Auto-Scrolling Logic (remain the same) ---
  
    function autoScroll() {
      let nextIndex = activeIndex + 1;
      if (nextIndex < images.length) {
        animateTo(nextIndex);
      } else {
        // Stop auto-scrolling when reaching the end
        if (autoScrollTimer) {
          clearInterval(autoScrollTimer);
          autoScrollTimer = null;
        }
      }
    }
    function startAutoScroll() {
      if (autoScrollTimer) clearInterval(autoScrollTimer);
      autoScrollTimer = setInterval(autoScroll, AUTO_SCROLL_INTERVAL);
    }
    function restartAutoScroll() {
      // Only restart auto-scroll if we're not at the end
      if (activeIndex < images.length - 1) {
        startAutoScroll();
      } else if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
      }
    }
  
    // --- Initial Setup: Render the first state after items are created ---
    updateCarouselClasses(); // Apply initial classes
    // Only start auto-scrolling if we're not at the end
    if (activeIndex < images.length - 1) {
      startAutoScroll(); // Start auto-scrolling
    }

    function updateCounter() {
      document.getElementById('currentImage').textContent = (activeIndex + 1);
      document.getElementById('totalImages').textContent = NUM_IMAGES;
    }

    function updateIndicators() {
      const dots = document.querySelectorAll('.indicator-dot');
      dots.forEach((dot, index) => {
        dot.classList.remove('active');
        dot.style.background = 'rgba(255, 255, 255, 0.3)';
      });

      // Find which dot represents the current image
      const dotsStart = Math.max(0, Math.min(NUM_IMAGES - 4, activeIndex - 1));
      const activeDotIndex = activeIndex - dotsStart;
      
      if (activeDotIndex >= 0 && activeDotIndex < dots.length) {
        dots[activeDotIndex].classList.add('active');
        dots[activeDotIndex].style.background = 'white';
      }
    }

    function updateContentOverlay() {
      // Update content
      const content = imageContent[activeIndex];
      document.querySelector('.content-title').textContent = content.title;
      document.querySelector('.content-description').textContent = content.description;
      document.querySelector('.content-button').textContent = content.buttonText;
      
      updateCounter();
      updateIndicators();
    }

    function initializeIndicators() {
      const indicators = document.querySelector('.carousel-indicators');
      indicators.innerHTML = '';
      
      // Always show 4 dots
      for (let i = 0; i < 4; i++) {
        const dot = document.createElement('span');
        dot.className = 'indicator-dot';
        dot.addEventListener('click', () => {
          if (isTransitioning) return;
          const now = Date.now();
          if (now - lastScrollTime < SCROLL_COOLDOWN) return;
          
          const dotsStart = Math.max(0, Math.min(NUM_IMAGES - 4, activeIndex - 1));
          const targetIndex = dotsStart + i;
          
          if (Math.abs(targetIndex - activeIndex) === 1) {
            animateTo(targetIndex);
            lastScrollTime = now;
          }
        });
        indicators.appendChild(dot);
      }
      updateIndicators();
    }

    // Initialize
    initializeCarouselItems();
    initializeIndicators();
    updateCarouselClasses();
    updateContentOverlay();
    startAutoScroll();
  });