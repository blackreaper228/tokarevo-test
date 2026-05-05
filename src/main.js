import './style.css';

import './js/history.js';
import './js/adminka.js';
import './js/adminka_lotov.js';
import './js/accordeon.js';


// вывод текущего года в футере

const year = new Date().getFullYear();
document.getElementById('footerCopyrightYear').textContent = `© ${year} Parametr`;
