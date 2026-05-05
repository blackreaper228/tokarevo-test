// скрипт хода стройки
// === СЛАЙДЕР ИСТОРИИ (главный) ===
// Управление горизонтальной прокруткой карточек истории
let currentIndexHistory = 0;
const historyContainer = document.querySelector('.W_RowHistory');
const history = document.querySelectorAll('.M_HistoryItem');
const totalHistory = history.length;

const getSlideWidthHistory = () => {
  const slide = history[0];
  console.log(slide);
  const slideWidth = slide.getBoundingClientRect().width;
  console.log(slideWidth);
  const containerStyles = window.getComputedStyle(historyContainer);
  const gapWidth = parseFloat(containerStyles.columnGap || containerStyles.gap || 0);
  return slideWidth;
};

const leftArrowHistory = document.querySelector('.U_LeftHistory');
const rightArrowHistory = document.querySelector('.U_RightHistory');

const updateSliderPositionHistory = () => {
  const slideWidth = getSlideWidthHistory();
  console.log(currentIndexHistory, slideWidth);
  const translateX = -(currentIndexHistory * slideWidth);
  console.log(`translateX(${translateX}px)`);
  historyContainer.style.transform = `translateX(${translateX}px)`;
};

// Кнопки навигации для слайдера истории
rightArrowHistory.addEventListener('click', () => {
  console.log('right');
  console.log(currentIndexHistory);
  console.log(totalHistory);
  if (currentIndexHistory < totalHistory - 1) {
    currentIndexHistory++;
    updateSliderPositionHistory();
  }
});

leftArrowHistory.addEventListener('click', () => {
  console.log('left');
  if (currentIndexHistory > 0) {
    currentIndexHistory--;
    updateSliderPositionHistory();
  }
});

// === МОДАЛЬНОЕ ОКНО С ДЕТАЛЯМИ ИСТОРИИ ===
// Открытие/закрытие детальной информации при клике на карточку
let currentActiveImageIndex = 0;
document.addEventListener('DOMContentLoaded', function () {
  const historyItems = document.querySelectorAll('.M_HistoryItem');
  const closingItems = document.querySelectorAll('.A_CloseButton');
  const historyWrapper = document.querySelector(`.O_HistoryInside`);

  // Закрытие при клике на фон
  historyWrapper.addEventListener('click', function (event) {
    console.log('TEST');
    if (event.target == historyWrapper) {
      currentActiveImageIndex = 0;
      document.querySelectorAll('.M_HistoryInsideItem').forEach((item) => {
        historyWrapper.classList.remove('active');
        item.classList.remove('active');
      });
    }
  });

  // Закрытие по кнопке
  closingItems.forEach((Button) => {
    Button.addEventListener('click', function (event) {
      document.querySelectorAll('.M_HistoryInsideItem').forEach((item) => {
        historyWrapper.classList.remove('active');
        item.classList.remove('active');
      });
    });
  });

  // Открытие модального окна при клике на карточку
  historyItems.forEach((item) => {
    item.addEventListener('click', function () {
      const itemId = this.id;
      const insideItems = document.querySelectorAll('.M_HistoryInsideItem');
      insideItems.forEach((insideItem) => {
        insideItem.classList.remove('active');
      });

      const targetInsideItem = document.querySelector(`.M_HistoryInsideItem[id="${itemId}"]`);
      const targetInsideItemWrapper = document.querySelector(`.O_HistoryInside`);
      if (targetInsideItem) {
        targetInsideItem.classList.add('active');
        targetInsideItemWrapper.classList.toggle('active');
      }
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

const updateSliderPositionHistoryBuilding = () => {
  const slideWidth = getSlideWidthHistory();
  console.log(currentIndexHistory, slideWidth);
  const translateX = -(currentIndexHistory * slideWidth);
  console.log(`translateX(${translateX}px)`);
  historyContainer.style.transform = `translateX(${translateX}px)`;
};

// === АНИМАЦИЯ ИКОНКИ ПЛЮС ПРИ НАВЕДЕНИИ ===
// Показ/скрытие иконки при наведении на карточку
let allHistoryCards = document.querySelectorAll('.M_HistoryItem');
allHistoryCards.forEach((card) => {
  const plusIcon = card.querySelector('.A_HistoryItemPlusIcon');
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

// === СЛАЙДЕР ПРЕДЛОЖЕНИЙ (OFFERS) ===
// Управление каруселью предложений с счетчиком для мобильных
document.addEventListener('DOMContentLoaded', () => {
  const offersContainer = document.querySelector('.W_Offers');
  const offers = document.querySelectorAll('.W_Offer');
  const totalOffers = offers.length;
  let currentIndex = 0;

  const leftArrow = document.querySelector('.U_LeftOffer');
  const rightArrow = document.querySelector('.U_RightOffer');

  // Обновление счетчика на мобильных устройствах
  const currentCountElement = document.querySelector('.A_Mobilecount.U_Dynamic');
  const totalCountElement = document.querySelector('.A_Mobilecount:last-child');
  totalCountElement.textContent = totalOffers;

  const getSlideWidth = () => {
    const slide = offers[0];
    const slideWidth = slide.getBoundingClientRect().width;
    const containerStyles = window.getComputedStyle(offersContainer);
    const gapWidth = parseFloat(containerStyles.columnGap || containerStyles.gap || 0);
    return slideWidth + gapWidth;
  };

  const updateSliderPosition = () => {
    const slideWidth = getSlideWidth();
    const translateX = -(currentIndex * slideWidth);
    offersContainer.style.transform = `translateX(${translateX}px)`;
    currentCountElement.textContent = currentIndex + 1;
  };

  rightArrow.addEventListener('click', () => {
    if (currentIndex < totalOffers - 1) {
      currentIndex++;
      updateSliderPosition();
    }
  });

  leftArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSliderPosition();
    }
  });

  window.addEventListener('resize', updateSliderPosition);
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
