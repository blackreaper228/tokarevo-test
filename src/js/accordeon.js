// аккордеон инвестиций


function initDataAccordion(root) {
  const items = Array.from(root.querySelectorAll('[data-accordion-item]'));
  if (items.length === 0) return;

  function getParts(item) {
    return {
      trigger: item.querySelector('[data-accordion-trigger]') || item,
      content: item.querySelector('[data-accordion-content]'),
      icon: item.querySelector('[data-accordion-icon]'),
    };
  }

  function setClosed(item, { content, icon }) {
    item.dataset.open = 'false';
    if (icon) icon.style.transform = '';
    if (!content) return;
    content.style.overflow = 'hidden';
    content.style.maxHeight = '0px';
  }

  function setOpen(item, { content, icon }) {
    item.dataset.open = 'true';
    if (icon) icon.style.transform = 'translate(-50%, -50%) rotate(180deg)';
    if (!content) return;
    content.style.overflow = 'hidden';
    content.style.maxHeight = content.scrollHeight + 'px';
  }

  // Setup animation styles and initial closed state
  items.forEach((item) => {
    const parts = getParts(item);
    if (parts.content) {
      parts.content.style.transition = 'max-height 400ms cubic-bezier(0.16, 1, 0.3, 1)';
      parts.content.style.willChange = 'max-height';
      // keep spacing consistent: collapse only by height, not by margins
      parts.content.style.marginTop = parts.content.style.marginTop || '';
    }
    if (parts.icon) {
      parts.icon.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)';
    }
    setClosed(item, parts);
  });

  function closeAll(exceptItem = null) {
    items.forEach((item) => {
      if (exceptItem && item === exceptItem) return;
      setClosed(item, getParts(item));
    });
  }

  // Open the first item by default
  closeAll();
  const firstItem = items[0];
  if (firstItem) {
    setOpen(firstItem, getParts(firstItem));
  }

  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-accordion-trigger]');
    if (!trigger || !root.contains(trigger)) return;

    const item = trigger.closest('[data-accordion-item]');
    if (!item || !root.contains(item)) return;

    const parts = getParts(item);
    const isOpen = item.dataset.open === 'true';

    closeAll(item);
    if (isOpen) {
      setClosed(item, parts);
    } else {
      setOpen(item, parts);
    }
  });

  window.addEventListener('resize', () => {
    items.forEach((item) => {
      if (item.dataset.open !== 'true') return;
      const { content } = getParts(item);
      if (!content) return;
      // if it was opened, keep its max-height in sync
      content.style.maxHeight = content.scrollHeight + 'px';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-accordion="invest"]').forEach((root) => initDataAccordion(root));
});