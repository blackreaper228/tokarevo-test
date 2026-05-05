// скрипт админки лотов

const SHEET_ID = '1sKdE2HBnZgJGX8_nZHJDvLtsSmpvo-iZEjhFES-MHsA';

const CSV_URLS = [
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`,
];

let allData = [];
let visibleRows = 10;
const rowsPerPage = 10;

async function fetchTableData() {
  for (let i = 0; i < CSV_URLS.length; i++) {
    const url = CSV_URLS[i];

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/csv,text/plain,*/*',
        },
        mode: 'cors',
        redirect: 'follow',
      });

      if (!response.ok) continue;

      const csvText = await response.text();

      if (!csvText || csvText.trim().length === 0) continue;

      if (csvText.trim().startsWith('<')) continue;

      const data = parseCSV(csvText);

      if (data.length > 0) {
        return data;
      }
    } catch (error) {
      continue;
    }
  }

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

function formatTableData(data) {
  return data.map((row) => {
    const keys = Object.keys(row);

    return {
      building: row[keys[0]] || row['Здание'] || '',
      area: row[keys[1]] || row['Площадь'] || '',
      docks: row[keys[2]] || row['Доки'] || '',
      parking: row[keys[3]] || row['Парковка'] || '',
      date: row[keys[4]] || row['Дата'] || '',
      price: row[keys[5]] || row['Стоимость'] || '',
    };
  });
}

function createTableRow(rowData) {
  return `
    <div class="A_TableRow">
      <div class="A_TableContent U_Uppercase U_First U_MobileHide">${rowData.building}</div>
      <div class="A_TableContent U_Uppercase U_Second">${rowData.area}</div>
      <div class="A_TableContent U_Uppercase U_Third U_MobileHide">${rowData.docks}</div>
      <div class="A_TableContent U_Uppercase U_Fourth U_MobileHide">${rowData.parking}</div>
      <div class="A_TableContent U_Uppercase U_Third U_MobileHide">${rowData.date}</div>
      <div class="A_TableContent U_Uppercase U_Fifth">${rowData.price}</div>
    </div>
  `;
}

function renderTable(data, containerId = 'propertyTable') {
  const container = document.getElementById(containerId);

  const visibleData = data.slice(0, visibleRows);

  const tableHTML = `
    <div class="W_TableForPhoneScroll">
      <div class="W_MainTable">
        <div class="A_TableRow U_TableRowHug">
          <div class="A_TableContent U_ProjectColor U_Uppercase U_First U_MobileHide">Здание</div>
          <div class="A_TableContent U_ProjectColor U_Uppercase U_Second">площадь<br>помещения</div>
          <div class="A_TableContent U_ProjectColor U_Uppercase U_Third U_MobileHide">Количество<br>доков | ворот</div>
          <div class="A_TableContent U_ProjectColor U_Uppercase U_Fourth U_MobileHide">Парковка для транспорта<br>легкового | грузового</div>
          <div class="A_TableContent U_ProjectColor U_Uppercase U_Third U_MobileHide">Дата готовности</div>
          <div class="A_TableContent U_ProjectColor U_Uppercase U_Fifth">стоимость</div>
        </div>
        ${visibleData.map(createTableRow).join('')}
      </div>
    </div>
    ${data.length > visibleRows ? '<div class="W_TableButton"><div class="A_Button U_Secondary" onclick="showMoreRows()">Показать еще</div></div>' : ''}
  `;

  container.innerHTML = tableHTML;
}

function showMoreRows() {
  visibleRows += rowsPerPage;
  renderTable(allData, 'propertyTable');
}

window.showMoreRows = showMoreRows;

async function initApp() {
  try {
    const rawData = await fetchTableData();
    allData = formatTableData(rawData);
    visibleRows = 10;
    renderTable(allData, 'propertyTable');
  } catch (error) {}
}

window.refreshTableData = async function () {
  await initApp();
};

document.addEventListener('DOMContentLoaded', initApp);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
