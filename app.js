const app = document.getElementById('app');
if (!app) {
  console.error('No #app element found. Aborting.');
  throw new Error('No #app element found.');
}

let data = {};
let state = loadState();

function loadState() {
  try {
    return JSON.parse(localStorage.getItem('nestApprovedState')) || {};
  } catch (err) {
    console.warn('Failed to parse saved state, resetting.', err);
    return {};
  }
}

function saveState() {
  try {
    localStorage.setItem('nestApprovedState', JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save state to localStorage', err);
  }
}

async function loadData() {
  const dataUrl = new URL('data.json', location.href).href;
  try {
    const res = await fetch(dataUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    data = await res.json();
    renderMenu();
  } catch (err) {
    renderError('Error loading data.json');
    console.error(err);
  }
}

function renderError(message) {
  app.innerHTML = '';
  const p = document.createElement('p');
  p.style.color = 'red';
  p.textContent = message;
  app.appendChild(p);
}

function renderMenu() {
  app.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.textContent = 'Choose a checklist';
  app.appendChild(h2);

  const menu = Array.isArray(data.menu) ? data.menu : [];
  if (menu.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No checklists available.';
    app.appendChild(p);
    return;
  }

  menu.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-item';
    btn.textContent = item.title || 'Untitled';
    btn.addEventListener('click', () => showChecklist(item.id, item.title || ''));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
    app.appendChild(btn);
  });
}

function showChecklist(id, title) {
  app.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.textContent = title || '';
  app.appendChild(h2);

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'back';
  back.textContent = '← Back';
  back.addEventListener('click', renderMenu);
  app.appendChild(back);

  const list = (data.checklists && Array.isArray(data.checklists[id])) ? data.checklists[id] : [];

  if (list.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No checklist items.';
    app.appendChild(p);
    return;
  }

  list.forEach(item => {
    const key = `${id}-${item.id}`;

    const box = document.createElement('div');
    box.className = 'checklist-item';

    const labelWrap = document.createElement('label');
    labelWrap.style.display = 'flex';
    labelWrap.style.alignItems = 'center';
    labelWrap.style.gap = '10px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `chk-${key}`;
    checkbox.checked = !!state[key];
    checkbox.setAttribute('aria-checked', checkbox.checked ? 'true' : 'false');

    const strong = document.createElement('strong');
    strong.textContent = item.text || 'Untitled item';

    labelWrap.appendChild(checkbox);
    labelWrap.appendChild(strong);
    box.appendChild(labelWrap);

    const details = document.createElement('div');
    details.className = 'details';
    details.style.display = checkbox.checked ? 'none' : 'block';
    details.setAttribute('aria-hidden', checkbox.checked ? 'true' : 'false');

    function addRow(labelText, value) {
      const row = document.createElement('div');
      const lbl = document.createElement('strong');
      lbl.textContent = labelText;
      row.appendChild(lbl);
      const span = document.createElement('span');
      span.textContent = ' ' + (value || '');
      row.appendChild(span);
      details.appendChild(row);
    }

    addRow('Why it matters:', item.why);
    addRow('What to look for:', item.look);
    addRow('Common homeowner mistake:', item.mistake);
    addRow('When to call a professional:', item.pro);
    addRow('Inspector note:', item.note);

    function addImageSection(labelText, imageData, borderClass) {
      if (!imageData) return;
      let url = '';
      let alt = '';
      if (typeof imageData === 'string') url = imageData;
      else if (imageData && typeof imageData.url === 'string') {
        url = imageData.url;
        alt = imageData.alt || '';
      } else {
        return;
      }
      const wrap = document.createElement('div');
      wrap.className = borderClass === 'bad' ? 'bad' : 'good';
      const t = document.createElement('div');
      t.textContent = labelText;
      wrap.appendChild(t);
      const img = document.createElement('img');
      img.src = url;
      img.alt = alt || (item.text ? `${item.text} example` : 'example image');
      img.loading = 'lazy';
      wrap.appendChild(img);
      details.appendChild(w