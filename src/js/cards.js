document.addEventListener('DOMContentLoaded', () => {
  function freezeClassNames(root) {
    const all = Array.from(root.querySelectorAll('*'));
    if (!all.length) return;

    const original = new Map();
    all.forEach((el) => {
      // Allow toggling classes on project cards (mobile tap-to-open).
      if (el.classList?.contains('project')) return;
      original.set(el, el.className);
    });

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
        const el = m.target;
        if (el.classList?.contains('project')) continue;
        const saved = original.get(el);
        if (typeof saved !== 'string') continue;
        if (el.className !== saved) el.className = saved;
      }
    });

    all.forEach((el) => {
      if (el.classList?.contains('project')) return;
      observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function getGapPx(track) {
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.gap || styles.columnGap || '0');
    return Number.isFinite(gap) ? gap : 0;
  }

  function bindHover(cardEl) {
    const hover = cardEl?.children?.[0];
    if (!hover) return;
    const text = hover.children?.[1];
    const plus = hover.children?.[0]?.children?.[1];

    cardEl.addEventListener('mouseenter', () => {
      hover.classList.add('U_HoverAnimationOpen');
      text?.classList.add('U_TextInCardOpacity');
      plus?.classList.add('A_PlusButtonHover');
    });
    cardEl.addEventListener('mouseleave', () => {
      hover.classList.remove('U_HoverAnimationOpen');
      text?.classList.remove('U_TextInCardOpacity');
      plus?.classList.remove('A_PlusButtonHover');
    });
  }

  function initDesktopCardsCarousel(root) {
    const track = root.querySelector('[data-cards-track]') || root.querySelector('#U_Cards');
    if (!track) return;

    const prev = root.querySelector('[data-cards-prev]') || root.querySelector('.U_Left');
    const next = root.querySelector('[data-cards-next]') || root.querySelector('.U_RightNew');
    if (!prev || !next) return;

    const hoverDisabled = root.getAttribute('data-disable-hover') === 'true';
    // Do not freeze class changes inside Swiper-based carousels.
    // Swiper adds/removes classes like `swiper-wrapper` dynamically.
    if (hoverDisabled && !root.hasAttribute('data-slider')) {
      freezeClassNames(root);
    }

    const initialCards = Array.from(track.children).filter((el) => el.nodeType === 1);
    if (initialCards.length === 0) return;

    const projectCards = initialCards.filter((el) => el.classList?.contains('project'));
    const hasProjects = projectCards.length > 0;

    // Mobile: tap toggles project expansion (2nd tap closes)
    const isTapDevice = () => window.matchMedia?.('(hover: none)')?.matches || window.innerWidth < 1024;
    if (projectCards.length) {
      projectCards.forEach((card) => {
        card.addEventListener('click', (e) => {
          if (!isTapDevice()) return;
          // Prevent accidental selection; allow links inside if added later.
          const wasOpen = card.classList.contains('is-open');
          projectCards.forEach((c) => c.classList.remove('is-open'));
          if (!wasOpen) card.classList.add('is-open');
        });
      });

      document.addEventListener('click', (e) => {
        if (!isTapDevice()) return;
        const target = e.target;
        if (target instanceof Element && target.closest('.project')) return;
        projectCards.forEach((c) => c.classList.remove('is-open'));
      });
    }

    // Our Projects carousel: Swiper handles the slider on all breakpoints.
    // Keep only tap-to-open here; do NOT run legacy translate/clone logic.
    if (hasProjects) return;

    // Hover for existing cards
    if (!hoverDisabled) {
      initialCards.forEach((card) => card.classList.contains('U_DesktopCard') && bindHover(card));
    }

    // Other carousels that are migrated to Swiper should skip legacy translate/clone logic.
    if (root.hasAttribute('data-slider')) return;

    let currentPosition = 0;
    let swipeIndex = 0;

    function applyPosition() {
      // Use transform for smoother, more reliable movement (matches other sliders in project)
      track.style.left = '0px';
      track.style.transform = `translate3d(${currentPosition}px, 0, 0)`;
      track.style.willChange = 'transform';
    }

    applyPosition();

    const stepPx = () => {
      const first = track.querySelector('.U_DesktopCard') || track.firstElementChild;
      if (!first) return 0;
      return first.offsetWidth + getGapPx(track);
    };

    prev.addEventListener('click', () => {
      if (window.innerWidth < 1024 && hasProjects) return;
      const step = stepPx();
      if (!step) return;
      if (currentPosition < 0) {
        currentPosition += step;
        applyPosition();
      }
    });

    next.addEventListener('click', () => {
      if (window.innerWidth < 1024 && hasProjects) return;
      const step = stepPx();
      if (!step) return;

      const elementToClone = initialCards[swipeIndex % initialCards.length];
      const clone = elementToClone.cloneNode(true);
      track.appendChild(clone);
      if (!hoverDisabled && clone.classList.contains('U_DesktopCard')) bindHover(clone);
      swipeIndex += 1;

      currentPosition -= step;
      applyPosition();
    });
  }

  // Init all carousels on page
  const carouselRoots = document.querySelectorAll('[data-cards-carousel]');
  if (carouselRoots.length) {
    carouselRoots.forEach((root) => initDesktopCardsCarousel(root));
  } else {
    // Backward-compatible single carousel
    const fallbackRoot = document;
    initDesktopCardsCarousel(fallbackRoot);
  }
  const rows = document.querySelectorAll('.W_MainTable .A_TableRow');
  const showMoreButton = document.querySelector('.W_TableButton .A_Button');
  let visibleRows = 10; // Number of rows to show initially
  // Function to update row visibility
  function updateVisibility() {
    rows.forEach((row, index) => {
      if (index < visibleRows) {
        row.style.display = 'flex'; // Show the row
      } else {
        row.style.display = 'none'; // Hide the row
      }
    });

    // Hide the button if all rows are visible
    if (visibleRows >= rows.length && showMoreButton) {
      showMoreButton.style.display = 'none';
    }
  }

  // Initial call to set the initial visibility
  // updateVisibility();

  // Mobile Cards swipe and arrows
  const cardContainer = document.getElementById('U_CardsMobile');
  const activeCounterElement = document.querySelector('.U_Active');
  if (cardContainer && activeCounterElement && cardContainer.children.length) {
    const cardWidth = cardContainer.children[0].offsetWidth;
    let activeIndex = 0;
    let startX = 0;

    // Function to update card position and counter display
    function updateCardDisplay() {
      const translateValue = -activeIndex * (cardWidth + 2); // Adjust for gap
      cardContainer.style.left = `${translateValue}px`;
      activeCounterElement.textContent = activeIndex + 1; // Displaying count starting from 1
    }

    // Left arrow click
    document.querySelector('.U_LeftMobile')?.addEventListener('click', () => {
      if (activeIndex > 0) {
        activeIndex--;
        updateCardDisplay();
      }
    });

    // Right arrow click
    document.querySelector('.U_RightMobile')?.addEventListener('click', () => {
      if (activeIndex < cardContainer.children.length - 1) {
        activeIndex++;
        updateCardDisplay();
      }
    });

    // Swipe start
    cardContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    // Swipe end
    cardContainer.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const difference = endX - startX;
      const threshold = 50; // Swipe threshold

      if (difference > threshold && activeIndex > 0) {
        // Swipe right
        activeIndex--;
      } else if (difference < -threshold && activeIndex < cardContainer.children.length - 1) {
        // Swipe left
        activeIndex++;
      }
      updateCardDisplay();
    });

    // Initial display update
    updateCardDisplay();
  }

  // Event listener for "Show more" button
  showMoreButton?.addEventListener('click', () => {
    visibleRows += 10; // Increase the number of visible rows by 10
    updateVisibility(); // Update visibility after increment
  });
});
