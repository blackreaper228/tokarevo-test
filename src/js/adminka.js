// скрипт админки

/**
 * Standalone History Script - История строительства из Google Sheets
 * Цельный скрипт без зависимостей для интеграции в Tilda
 */

(function () {
  'use strict';

  const SHEET_ID = '1sKdE2HBnZgJGX8_nZHJDvLtsSmpvo-iZEjhFES-MHsA';

  // URL для листа "History" - используем правильный gid=151892420
  const HISTORY_CSV_URLS = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=151892420`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=151892420`,
  ];
  function isUrl(value) {
    return /^https?:\/\/|^\/\//i.test(value || '');
  }

  function isImageUrl(value) {
    return isUrl(value) && /\.(webp|jpg|jpeg|png|gif|svg)(\?.*)?$/i.test(value);
  }

  function escapeHTML(text) {
    if (!text) return '';
    return String(text).replace(
      /[&<>"']/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[char]
    );
  }
  // Альтернативный метод для Tilda через JSONP
  function fetchHistoryDataViaJSONP() {
    return new Promise((resolve) => {
      console.log('???? Пробуем альтернативный метод загрузки через JSONP...');

      const script = document.createElement('script');
      const callbackName = 'historyCallback_' + Date.now();

      window[callbackName] = function (data) {
        console.log('???? Получены данные через JSONP:', data);
        document.head.removeChild(script);
        delete window[callbackName];

        if (data && data.table && data.table.rows) {
          const csvData = convertGoogleSheetsToCSV(data);
          resolve(parseCSV(csvData));
        } else {
          resolve([]);
        }
      };

      script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=151892420&tqx=out:json&tq&callback=${callbackName}`;
      script.onerror = () => {
        console.error('❌ JSONP метод не сработал');
        document.head.removeChild(script);
        delete window[callbackName];
        resolve([]);
      };

      document.head.appendChild(script);
    });
  }

  function convertGoogleSheetsToCSV(data) {
    if (!data.table || !data.table.rows) return '';

    const rows = data.table.rows;
    const csvLines = [];

    rows.forEach((row) => {
      const values = [];
      if (row.c) {
        row.c.forEach((cell) => {
          if (cell && cell.v !== null && cell.v !== undefined) {
            values.push('"' + String(cell.v).replace(/"/g, '""') + '"');
          } else {
            values.push('');
          }
        });
      }
      csvLines.push(values.join(','));
    });

    return csvLines.join('\n');
  }

  let historyData = [];

  async function fetchHistoryData() {
    console.log('???? Начинаем загрузку данных истории...');

    for (let i = 0; i < HISTORY_CSV_URLS.length; i++) {
      const url = HISTORY_CSV_URLS[i];
      console.log(`???? Пробуем URL ${i + 1}:`, url);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'text/csv,text/plain,*/*',
          },
          mode: 'cors',
          redirect: 'follow',
        });

        console.log(`???? Ответ от URL ${i + 1}:`, response.status, response.statusText);

        if (!response.ok) {
          console.log(`❌ URL ${i + 1} не отвечает`);
          continue;
        }

        const csvText = await response.text();
        console.log(`???? Данные от URL ${i + 1}:`, csvText.substring(0, 200) + '...');

        if (!csvText || csvText.trim().length === 0) {
          console.log(`❌ URL ${i + 1} вернул пустые данные`);
          continue;
        }

        if (csvText.trim().startsWith('<')) {
          console.log(`❌ URL ${i + 1} вернул HTML вместо CSV`);
          continue;
        }

        const data = parseCSV(csvText);
        console.log(`✅ Обработанные данные от URL ${i + 1}:`, data);

        if (data.length > 0) {
          return data;
        }
      } catch (error) {
        console.error(`❌ Ошибка при загрузке URL ${i + 1}:`, error);
        continue;
      }
    }

    console.log('❌ Все URL не сработали');
    return [];
  }

  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');

    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.some((value) => value.trim() !== '')) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  function formatHistoryData(data) {
    return data.map((row, index) => {
      const keys = Object.keys(row);

      const findKey = (regex, fallback) => {
        const found = keys.find((k) => regex.test((k || '').trim()));
        return found || fallback || null;
      };

      // Try to detect columns by name; fallback to prior order
      const yearKey = findKey(/^(год|year)$/i, keys[0]);
      const monthKey = findKey(/^(месяц|month)$/i, keys[1]);

      // Prefer explicit header; else use 3rd column if it doesn't look like an image URL
      let descKey = findKey(/^(описание|description)$/i, null);
      if (!descKey && keys[2]) {
        const candidateValue = (row[keys[2]] || '').trim();
        if (!isImageUrl(candidateValue)) descKey = keys[2];
      }

      // Collect images from all remaining columns that look like image URLs
      const images = [];
      keys.forEach((k) => {
        if (k === yearKey || k === monthKey || k === descKey) return;
        const val = (row[k] || '').trim();
        if (isImageUrl(val)) images.push(val);
      });

      const year = (row[yearKey] || '2025').toString();
      const month = (row[monthKey] || '').toString();
      const description = descKey ? (row[descKey] || '').toString().trim() : '';

      return {
        id: index,
        month: month,
        year: year,
        monthName: month,
        description: description,
        mainImage: images[0] || '',
        images: images,
      };
    });
  }

  function renderHistoryList(data, containerId = 'O_History') {
    console.log(`???? Рендерим список истории для ${containerId}:`, data);
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`❌ Контейнер с ID "${containerId}" не найден`);
      return;
    }

    console.log(`✅ Контейнер ${containerId} найден:`, container);

    const historyItems = data
      .map(
        (item) => `
      <div class="M_HistoryItem" id="${item.id}">
        <img class="A_HistoryItemImage" src="${item.mainImage}" alt="">
        <div class="W_HistoryItemRow">
          <p class="A_HistoryItemText">
            ${item.monthName}<br><span class="A_HistoryItemTextYear">${item.year}</span>
          </p>
          <div class="A_HistoryPlusWrapper">
            <img class="A_HistoryItemPlusIcon" src="https://optim.tildacdn.com/tild3832-3232-4461-a536-646564333339/-/resize/288x/-/format/webp/cross.png" alt="">
          </div>
        </div>
      </div>
    `
      )
      .join('');

    const historyHTML = `
      <div class="W_RowHistoryTitleButton U_Padding">
        <h2 class="A_SectionTitle">Ход строительства</h2>
        <div class="W_RowHistoryButton">
          <div class="A_Arrow U_LeftHistory">
            <img class="Q_ImageIcon" src="https://optim.tildacdn.com/tild6266-6439-4136-b839-316239636237/-/resize/700x/-/format/webp/arrow-Left.png" alt="">
          </div>
          <div class="A_Arrow U_RightHistory">
            <img class="Q_ImageIcon" src="https://optim.tildacdn.com/tild3638-3031-4436-b861-373431666664/-/resize/700x/-/format/webp/arrow-Right.png" alt="">
          </div>
        </div>
      </div>
      <div class="W_RowHistory" style="transform: translateX(0px);">
        ${historyItems}
      </div>
    `;

    container.innerHTML = historyHTML;
    console.log(`✅ HTML успешно установлен для ${containerId}`);
  }

  function renderHistoryDetails(data, containerId = 'O_HistoryInside') {
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`Контейнер с ID "${containerId}" не найден`);
      return;
    }

    const historyDetailsItems = data
      .map((item, index) => {
        const imagesHTML = item.images.map((img) => `<img src="${img}" alt="" style="flex-shrink: 0; width: 100%;">`).join('');
        const descriptionHTML = item.description ? `<p class="A_HistoryDescriptionText">${escapeHTML(item.description).replace(/\n/g, '<br>')}</p>` : '';

        return `
        <div class="M_HistoryInsideItem" id="${item.id}">
          <div class="M_HistoryInsideItemTitleAndButton">
            <p class="A_HistoryItemText">
              ${item.monthName}<br><span class="A_HistoryItemTextYear">${item.year}</span>
            </p>
            <div class="A_CloseButton">
              <img class="Q_Cross" src="https://optim.tildacdn.com/tild3832-3232-4461-a536-646564333339/-/resize/288x/-/format/webp/cross.png" alt="">
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
              <p style="line-height: 120%; font-size: 16px;">${descriptionHTML}</p>
          <div class="M_HistoryInsideItemSlider">
            <div class="M_HistoryInsideItemSliderImages" id="${item.id}" style="transform: translateX(0%);">
              ${imagesHTML}
            </div>
            <div class="M_NavButtonsHistory">
              <img class="A_AngleHistory" src="https://optim.tildacdn.com/tild3538-3565-4331-a466-623539363564/-/resize/718x/-/format/webp/Angle.png" alt="">
              <div class="A_Arrow U_LeftHistoryInsideItem" id="${item.id}">
                <img class="Q_ImageIcon" src="https://optim.tildacdn.com/tild6266-6439-4136-b839-316239636237/-/resize/700x/-/format/webp/arrow-Left.png" alt="">
              </div>
              <div class="A_Arrow U_RightHistoryInsideItem" id="${item.id}">
                <img class="Q_ImageIcon" src="https://optim.tildacdn.com/tild3638-3031-4436-b861-373431666664/-/resize/700x/-/format/webp/arrow-Right.png" alt="">
              </div>
            </div>
          </div>
        </div>
        </div>
      `;
      })
      .join('');

    container.innerHTML = historyDetailsItems;
  }

  //   function showHistoryLoading(containerId) {
  //     const container = document.getElementById(containerId);
  //     if (container) {
  //       container.innerHTML = `
  //         <div style="text-align: center; padding: 20px;">
  //           <p>Загрузка истории строительства...</p>
  //         </div>
  //       `;
  //     }
  //   }

  function showHistoryError(containerId, message = 'Ошибка загрузки истории') {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: red;">
          <p>${message}</p>
        </div>
      `;
    }
  }

  // Навигация по истории строительства
  function initHistoryNavigation() {
    // Desktop навигация по истории
    const historyRow = document.querySelector('.W_RowHistory');
    const leftArrow = document.querySelector('.U_LeftHistory');
    const rightArrow = document.querySelector('.U_RightHistory');

    if (historyRow && leftArrow && rightArrow) {
      let currentPosition = 0;
      historyRow.style.transform = `translateX(${currentPosition}px)`;

      // Функция для получения правильной ширины элемента с отступами
      function getItemWidth() {
        const firstItem = historyRow.children[0];
        if (!firstItem) return 300;

        const itemStyle = window.getComputedStyle(firstItem);
        const itemWidth = firstItem.offsetWidth;
        const marginLeft = parseInt(itemStyle.marginLeft, 10) || 0;
        const marginRight = parseInt(itemStyle.marginRight, 10) || 0;

        return itemWidth + marginLeft + marginRight;
      }

      // Функция для получения максимального сдвига
      function getMaxScroll() {
        const containerWidth = historyRow.parentElement.offsetWidth;
        const totalWidth = historyRow.scrollWidth;
        return -(totalWidth - containerWidth);
      }

      leftArrow.addEventListener('click', function () {
        const itemWidth = getItemWidth();
        const newPosition = currentPosition + itemWidth;

        // Проверяем, не превышаем ли начальную позицию
        if (newPosition <= 0) {
          currentPosition = newPosition;
          historyRow.style.transform = `translateX(${currentPosition}px)`;
          console.log(`⬅️ История: сдвиг влево на ${itemWidth}px, позиция: ${currentPosition}px`);
        } else {
          currentPosition = 0;
          historyRow.style.transform = `translateX(${currentPosition}px)`;
          console.log(`⬅️ История: возврат в начало, позиция: ${currentPosition}px`);
        }
      });

      rightArrow.addEventListener('click', function () {
        const itemWidth = getItemWidth();
        const maxScroll = getMaxScroll();
        const newPosition = currentPosition - itemWidth;

        // Проверяем, не превышаем ли максимальный сдвиг
        if (newPosition >= maxScroll) {
          currentPosition = newPosition;
          historyRow.style.transform = `translateX(${currentPosition}px)`;
          console.log(`➡️ История: сдвиг вправо на ${itemWidth}px, позиция: ${currentPosition}px`);
        } else {
          currentPosition = maxScroll;
          historyRow.style.transform = `translateX(${currentPosition}px)`;
          console.log(`➡️ История: максимальный сдвиг, позиция: ${currentPosition}px`);
        }
      });
    }

    // Клики по элементам истории для переключения детального вида
    const historyItems = document.querySelectorAll('.M_HistoryItem');
    const historyDetailsItems = document.querySelectorAll('.M_HistoryInsideItem');

    historyItems.forEach((item, index) => {
      item.addEventListener('click', function () {
        // Убираем активный класс со всех детальных элементов
        historyDetailsItems.forEach((detailItem) => {
          detailItem.classList.remove('active');
        });

        // Добавляем активный класс к соответствующему детальному элементу
        if (historyDetailsItems[index]) {
          historyDetailsItems[index].classList.add('active');
        }

        // Добавляем активный класс к контейнеру O_HistoryInside
        const historyInsideContainer = document.querySelector('.O_HistoryInside');
        if (historyInsideContainer) {
          historyInsideContainer.classList.add('active');
        }

        // Анимация плюсика
        const plusIcon = item.querySelector('.A_HistoryItemPlusIcon');
        if (plusIcon) {
          plusIcon.style.transform = 'rotate(45deg)';
          setTimeout(() => {
            plusIcon.style.transform = 'rotate(0deg)';
          }, 300);
        }
      });
    });

    // Hover эффекты для элементов истории
    historyItems.forEach((item) => {
      item.addEventListener('mouseenter', (e) => {
        const image = e.currentTarget.querySelector('.A_HistoryItemImage');
        const plusWrapper = e.currentTarget.querySelector('.A_HistoryPlusWrapper');

        if (image) {
          image.style.transform = 'scale(1.05)';
          image.style.transition = 'transform 0.3s ease';
        }

        if (plusWrapper) {
          plusWrapper.style.opacity = '1';
          plusWrapper.style.transition = 'opacity 0.3s ease';
        }
      });

      item.addEventListener('mouseleave', (e) => {
        const image = e.currentTarget.querySelector('.A_HistoryItemImage');
        const plusWrapper = e.currentTarget.querySelector('.A_HistoryPlusWrapper');

        if (image) {
          image.style.transform = 'scale(1)';
        }

        if (plusWrapper) {
          plusWrapper.style.opacity = '0.7';
        }
      });
    });

    // Инициализация слайдеров внутри детального вида
    initHistorySliders();
  }

  // Инициализация слайдеров для детального вида истории
  function initHistorySliders() {
    const historyDetailsItems = document.querySelectorAll('.M_HistoryInsideItem');

    historyDetailsItems.forEach((item, itemIndex) => {
      const slider = item.querySelector('.M_HistoryInsideItemSliderImages');
      const leftBtn = item.querySelector('.U_LeftHistoryInsideItem');
      const rightBtn = item.querySelector('.U_RightHistoryInsideItem');
      const closeBtn = item.querySelector('.A_CloseButton');

      if (slider && leftBtn && rightBtn) {
        let currentSlide = 0;
        const images = slider.querySelectorAll('img');
        const totalImages = images.length;

        // Обновление позиции слайдера
        function updateSliderPosition() {
          const imageWidth = images[0]?.offsetWidth || slider.offsetWidth;
          const translateX = currentSlide * imageWidth;
          slider.style.transform = `translateX(-${translateX}px)`;
        }

        // Навигация влево
        leftBtn.addEventListener('click', () => {
          if (currentSlide > 0) {
            currentSlide--;
            updateSliderPosition();
          }
        });

        // Навигация вправо
        rightBtn.addEventListener('click', () => {
          if (currentSlide < totalImages - 1) {
            currentSlide++;
            updateSliderPosition();
          }
        });

        // Кнопка закрытия
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            // Убираем активный класс с элемента
            item.classList.remove('active');

            // Убираем активный класс с контейнера O_HistoryInside
            const historyInsideContainer = document.querySelector('.O_HistoryInside');
            if (historyInsideContainer) {
              historyInsideContainer.classList.remove('active');
            }
          });
        }

        // Начальная инициализация
        updateSliderPosition();

        // Поддержка свайпов на мобильных устройствах
        let startX = 0;
        let startY = 0;

        slider.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        });

        slider.addEventListener('touchend', (e) => {
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const diffX = endX - startX;
          const diffY = endY - startY;
          const threshold = 50;

          // Проверяем, что это горизонтальный свайп
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX > 0 && currentSlide > 0) {
              // Свайп вправо - предыдущий слайд
              currentSlide--;
              updateSliderPosition();
            } else if (diffX < 0 && currentSlide < totalImages - 1) {
              // Свайп влево - следующий слайд
              currentSlide++;
              updateSliderPosition();
            }
          }
        });
      }
    });
  }

  // Основная функция инициализации истории
  async function initHistory() {
    console.log('???? Запуск инициализации истории...');
    // showHistoryLoading('O_History');
    // showHistoryLoading('O_HistoryInside');

    try {
      let rawData = await fetchHistoryData();

      // Если обычный fetch не сработал, пробуем JSONP
      if (rawData.length === 0) {
        console.log('???? Обычный метод не сработал, пробуем JSONP...');
        rawData = await fetchHistoryDataViaJSONP();
      }

      // Если и JSONP не сработал, используем тестовые данные
      if (rawData.length === 0) {
        console.log('???? Все методы не сработали, используем тестовые данные...');
        rawData = [
          {
            Год: '2025',
            Месяц: 'Май',
            'Первая картинка': 'https://optim.tildacdn.com/tild6166-3031-4332-a163-313535346139/-/format/webp/DJI_0532.jpg.webp',
            'Вторая картинка': 'https://optim.tildacdn.com/tild3937-3538-4461-a537-353434353533/-/format/webp/DJI_0556.jpg.webp',
            'Третья картинка': 'https://optim.tildacdn.com/tild3831-3139-4136-b764-386538316265/-/format/webp/DJI_0560.jpg.webp',
            'Четвертая картинка': 'https://optim.tildacdn.com/tild6430-3265-4065-b236-386332376238/-/format/webp/DJI_0567.jpg.webp',
            'Пятая картинка': 'https://optim.tildacdn.com/tild3666-6636-4434-b761-343737663139/-/format/webp/DJI_0578.jpg.webp',
          },
          {
            Год: '2025',
            Месяц: 'Апрель',
            'Первая картинка': 'https://optim.tildacdn.com/tild6166-3031-4332-a163-313535346139/-/format/webp/DJI_0532.jpg.webp',
            'Вторая картинка': 'https://optim.tildacdn.com/tild3937-3538-4461-a537-353434353533/-/format/webp/DJI_0556.jpg.webp',
            'Третья картинка': '',
            'Четвертая картинка': '',
            'Пятая картинка': '',
          },
        ];
      }

      if (rawData.length === 0) {
        throw new Error('Нет данных истории для отображения');
      }

      console.log('✅ Получены данные истории:', rawData);
      historyData = formatHistoryData(rawData);
      console.log('✅ Отформатированные данные истории:', historyData);

      renderHistoryList(historyData, 'O_History');
      renderHistoryDetails(historyData, 'O_HistoryInside');

      // Инициализируем навигацию после рендера
      setTimeout(() => {
        initHistoryNavigation();
      }, 100);
    } catch (error) {
      console.error('❌ Ошибка инициализации истории:', error);
      showHistoryError('O_History', `Ошибка загрузки истории: ${error.message}`);
      showHistoryError('O_HistoryInside', `Ошибка загрузки истории: ${error.message}`);
    }
  }

  // Делаем функции доступными глобально для использования в Tilda
  window.initHistory = initHistory;
  window.refreshHistory = initHistory;

  // Автоматическая инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, есть ли контейнеры для истории на странице
    if (document.getElementById('O_History') || document.getElementById('O_HistoryInside')) {
      initHistory();
    }
  });
})();
