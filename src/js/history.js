// скрипт хода стройки
// Главная карусель истории: Swiper (swiperMobileCarousels.js + adminka.js)

// === МОДАЛЬНОЕ ОКНО С ДЕТАЛЯМИ ИСТОРИИ ===
// Открытие/закрытие детальной информации при клике на карточку
let currentActiveImageIndex = 0;
document.addEventListener('DOMContentLoaded', function () {
  const closingItems = document.querySelectorAll('.A_CloseButton');
  const historyWrapper = document.querySelector('.O_HistoryInside');

  if (!historyWrapper) return;

  function historyModalScrollUnlock() {
    window.__kuvekinoHistoryModalScroll?.unlock();
  }

  historyWrapper.addEventListener('click', function (event) {
    if (event.target == historyWrapper) {
      currentActiveImageIndex = 0;
      historyWrapper.classList.remove('active');
      document.querySelectorAll('.M_HistoryInsideItem').forEach((item) => item.classList.remove('active'));
      historyModalScrollUnlock();
    }
  });

  closingItems.forEach((Button) => {
    Button.addEventListener('click', function () {
      document.querySelectorAll('.M_HistoryInsideItem').forEach((item) => {
        historyWrapper.classList.remove('active');
        item.classList.remove('active');
      });
      historyModalScrollUnlock();
    });
  });
});

// === СЛАЙДЕР ИЗОБРАЖЕНИЙ ВНУТРИ МОДАЛЬНОГО ОКНА ===
// Управление галереей фотографий в детальном просмотре
const getSlideWidthNew = (AllImagesInSlider) => {
  const slide = AllImagesInSlider;
  const slideWidth = slide.getBoundingClientRect().width;
  return slideWidth;
};

const leftArrows = document.querySelectorAll('.U_LeftHistoryInsideItem');
const rightArrows = document.querySelectorAll('.U_RightHistoryInsideItem');

function slideLeft(sliderContainer) {
  console.log(sliderContainer.children[0]);
  let slideWidth = getSlideWidthNew(sliderContainer.children[0]);
  if (currentActiveImageIndex > 0) {
    currentActiveImageIndex--;
    const translateX = -(currentActiveImageIndex * slideWidth);
    console.log('Sliding left on slider id:', sliderContainer.id);
    sliderContainer.style.transform = `translateX(${translateX}px)`;
  }
}

function slideRight(sliderContainer) {
  console.log(sliderContainer.children[0]);
  let slideWidth = getSlideWidthNew(sliderContainer.children[0]);
  console.log(sliderContainer.children.length);
  if (sliderContainer.children.length - 1 > currentActiveImageIndex) {
    currentActiveImageIndex++;
    const translateX = -(currentActiveImageIndex * slideWidth);
    console.log('Sliding right on slider id:', sliderContainer.id);
    sliderContainer.style.transform = `translateX(${translateX}px)`;
  }
}

// Привязка кнопок к слайдерам изображений
leftArrows.forEach((leftArrow) => {
  leftArrow.addEventListener('click', function (e) {
    const slideId = this.id;
    const sliderContainer = document.querySelector(`.M_HistoryInsideItemSliderImages[id="${slideId}"]`);
    if (sliderContainer) {
      slideLeft(sliderContainer);
    } else {
      console.warn('No slider container found for id:', slideId);
    }
  });
});

rightArrows.forEach((rightArrow) => {
  rightArrow.addEventListener('click', function (e) {
    const slideId = this.id;
    const sliderContainer = document.querySelector(`.M_HistoryInsideItemSliderImages[id="${slideId}"]`);
    if (sliderContainer) {
      slideRight(sliderContainer);
    } else {
      console.warn('No slider container found for id:', slideId);
    }
  });
});

// скрипт галереи
// === СЛАЙДЕР ГАЛЕРЕИ (главный) ===
// Управление горизонтальной прокруткой карточек галереи
let currentIndexHistoryG = 0;
const historyContainerG = document.querySelector('.W_RowHistoryG');
const historyG = document.querySelectorAll('.M_HistoryItemG');
const totalHistoryG = historyG.length;

const getSlideWidthHistoryG = () => {
  const slide = historyG[0];
  console.log(slide);
  const slideWidth = slide.getBoundingClientRect().width;
  console.log(slideWidth);
  const containerStyles = window.getComputedStyle(historyContainerG);
  const gapWidth = parseFloat(containerStyles.columnGap || containerStyles.gap || 0);
  return slideWidth;
};

const leftArrowHistoryG = document.querySelector('.U_LeftHistoryG');
const rightArrowHistoryG = document.querySelector('.U_RightHistoryG');

const updateSliderPositionHistoryG = () => {
  const slideWidth = getSlideWidthHistoryG();
  console.log(currentIndexHistoryG, slideWidth);
  const translateX = -(currentIndexHistoryG * slideWidth);
  console.log(`translateX(${translateX}px)`);
  historyContainerG.style.transform = `translateX(${translateX}px)`;
};

// Кнопки навигации для слайдера галереи
rightArrowHistoryG?.addEventListener('click', () => {
  console.log('right');
  console.log(currentIndexHistoryG);
  console.log(totalHistoryG);
  if (currentIndexHistoryG < totalHistoryG - 1) {
    currentIndexHistoryG++;
    updateSliderPositionHistoryG();
  }
});

leftArrowHistoryG?.addEventListener('click', () => {
  console.log('left');
  if (currentIndexHistoryG > 0) {
    currentIndexHistoryG--;
    updateSliderPositionHistoryG();
  }
});

// === МОДАЛЬНОЕ ОКНО С ДЕТАЛЯМИ ГАЛЕРЕИ ===
// Открытие/закрытие детальной информации при клике на карточку
let currentActiveImageIndexG = 0;
document.addEventListener('DOMContentLoaded', function () {
  const historyItemsG = document.querySelectorAll('.M_HistoryItemG');
  const closingItemsG = document.querySelectorAll('.A_CloseButtonG');
  const historyWrapperG = document.querySelector(`.O_HistoryInsideG`);

  // Закрытие при клике на фон
  historyWrapperG?.addEventListener('click', function (event) {
    console.log('TEST');
    if (event.target == historyWrapperG) {
      currentActiveImageIndexG = 0;
      document.querySelectorAll('.M_HistoryInsideItemG').forEach((item) => {
        historyWrapperG.classList.remove('active');
        item.classList.remove('active');
      });
    }
  });

  // Закрытие по кнопке
  closingItemsG.forEach((Button) => {
    Button.addEventListener('click', function (event) {
      document.querySelectorAll('.M_HistoryInsideItemG').forEach((item) => {
        historyWrapperG.classList.remove('active');
        item.classList.remove('active');
      });
    });
  });

  // Открытие модального окна при клике на карточку
  historyItemsG.forEach((item) => {
    item.addEventListener('click', function () {
      const itemId = this.id;
      const insideItems = document.querySelectorAll('.M_HistoryInsideItemG');
      insideItems.forEach((insideItem) => {
        insideItem.classList.remove('active');
      });

      const targetInsideItem = document.querySelector(`.M_HistoryInsideItemG[id="${itemId}"]`);
      const targetInsideItemWrapper = document.querySelector(`.O_HistoryInsideG`);
      if (targetInsideItem) {
        targetInsideItem.classList.add('active');
        targetInsideItemWrapper.classList.toggle('active');
      }
    });
  });
});

// === СЛАЙДЕР ИЗОБРАЖЕНИЙ ВНУТРИ МОДАЛЬНОГО ОКНА ===
// Управление галереей фотографий в детальном просмотре
const getSlideWidthNewG = (AllImagesInSlider) => {
  const slide = AllImagesInSlider;
  const slideWidth = slide.getBoundingClientRect().width;
  return slideWidth;
};

const leftArrowsG = document.querySelectorAll('.U_LeftHistoryInsideItemG');
const rightArrowsG = document.querySelectorAll('.U_RightHistoryInsideItemG');

function slideLeftG(sliderContainer) {
  console.log(sliderContainer.children[0]);
  let slideWidth = getSlideWidthNewG(sliderContainer.children[0]);
  if (currentActiveImageIndexG > 0) {
    currentActiveImageIndexG--;
    const translateX = -(currentActiveImageIndexG * slideWidth);
    console.log('Sliding left on slider id:', sliderContainer.id);
    sliderContainer.style.transform = `translateX(${translateX}px)`;
  }
}

function slideRightG(sliderContainer) {
  console.log(sliderContainer.children[0]);
  let slideWidth = getSlideWidthNewG(sliderContainer.children[0]);
  console.log(sliderContainer.children.length);
  if (sliderContainer.children.length - 1 > currentActiveImageIndexG) {
    currentActiveImageIndexG++;
    const translateX = -(currentActiveImageIndexG * slideWidth);
    console.log('Sliding right on slider id:', sliderContainer.id);
    sliderContainer.style.transform = `translateX(${translateX}px)`;
  }
}

// Привязка кнопок к слайдерам изображений
leftArrowsG.forEach((leftArrow) => {
  leftArrow.addEventListener('click', function (e) {
    const slideId = this.id;
    const sliderContainer = document.querySelector(`.M_HistoryInsideItemSliderImagesG[id="${slideId}"]`);
    if (sliderContainer) {
      slideLeftG(sliderContainer);
    } else {
      console.warn('No slider container found for id:', slideId);
    }
  });
});

rightArrowsG.forEach((rightArrow) => {
  rightArrow.addEventListener('click', function (e) {
    const slideId = this.id;
    const sliderContainer = document.querySelector(`.M_HistoryInsideItemSliderImagesG[id="${slideId}"]`);
    if (sliderContainer) {
      slideRightG(sliderContainer);
    } else {
      console.warn('No slider container found for id:', slideId);
    }
  });
});

const updateSliderPositionHistoryBuildingG = () => {
  const slideWidth = getSlideWidthHistoryG();
  console.log(currentIndexHistoryG, slideWidth);
  const translateX = -(currentIndexHistoryG * slideWidth);
  console.log(`translateX(${translateX}px)`);
  historyContainerG.style.transform = `translateX(${translateX}px)`;
};

// === АНИМАЦИЯ ИКОНКИ ПЛЮС ПРИ НАВЕДЕНИИ ===
// Показ/скрытие иконки при наведении на карточку
let allHistoryCardsG = document.querySelectorAll('.M_HistoryItemG');
allHistoryCardsG.forEach((card) => {
  const plusIcon = card.querySelector('.A_HistoryItemPlusIconG');
  if (plusIcon) {
    card.addEventListener('mouseenter', () => {
      plusIcon.classList.add('A_Active');
    });

    card.addEventListener('mouseleave', () => {
      plusIcon.classList.remove('A_Active');
    });
  } else {
    console.warn('Plus icon was not found in card:', card);
  }
});
