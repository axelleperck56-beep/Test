const STORAGE_KEY = 'subtracker_subs';

const CATEGORY_ICONS = {
  streaming: '🎬',
  musique: '🎵',
  logiciel: '💻',
  sport: '🏋️',
  autre: '📦',
};

let subs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentFilter = 'all';
let editingId = null;
let selectedColor = '#6C63FF';

// DOM refs
const subsList = document.getElementById('subsList');
const emptyState = document.getElementById('emptyState');
const totalMonthly = document.getElementById('totalMonthly');
const totalYearly = document.getElementById('totalYearly');
const modalOverlay = document.getElementById('modalOverlay');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCancel = document.getElementById('btnCancel');
const btnSave = document.getElementById('btnSave');
const filters = document.getElementById('filters');
const colorPicker = document.getElementById('colorPicker');
const modalTitle = document.getElementById('modalTitle');

// ---- Helpers ----

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function toMonthly(price, cycle) {
  return cycle === 'yearly' ? price / 12 : price;
}

function formatPrice(amount) {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function renewalLabel(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return '';
  if (days < 0) return 'Expiré';
  if (days === 0) return 'Renouvellement aujourd\'hui';
  if (days <= 7) return `Renouvellement dans ${days}j`;
  const d = new Date(dateStr);
  return `Renouvellement le ${d.toLocaleDateString('fr-FR')}`;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
}

// ---- Rendu ----

function render() {
  const filtered = currentFilter === 'all'
    ? subs
    : subs.filter(s => s.category === currentFilter);

  // Totaux sur TOUS les abonnements
  const monthly = subs.reduce((acc, s) => acc + toMonthly(s.price, s.cycle), 0);
  totalMonthly.textContent = formatPrice(monthly);
  totalYearly.textContent = formatPrice(monthly * 12);

  // Vider liste
  subsList.innerHTML = '';

  if (filtered.length === 0) {
    subsList.appendChild(emptyState);
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  filtered.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'sub-card';
    card.style.borderLeftColor = sub.color || '#6C63FF';

    const days = daysUntil(sub.renewal);
    const isSoon = days !== null && days >= 0 && days <= 7;

    const monthlyPrice = toMonthly(sub.price, sub.cycle);

    card.innerHTML = `
      <div class="sub-icon" style="background:${sub.color}22">
        ${CATEGORY_ICONS[sub.category] || '📦'}
      </div>
      <div class="sub-info">
        <div class="sub-name">${sub.name}</div>
        <div class="sub-meta">${sub.cycle === 'monthly' ? 'Mensuel' : 'Annuel'} · ${sub.category}</div>
        ${sub.renewal ? `<div class="sub-renewal ${isSoon ? 'soon' : ''}">${renewalLabel(sub.renewal)}</div>` : ''}
      </div>
      <div class="sub-price">
        ${formatPrice(sub.price)}
        <span class="per">${sub.cycle === 'monthly' ? '/mois' : '/an'}${sub.cycle === 'yearly' ? ` · ${formatPrice(monthlyPrice)}/mois` : ''}</span>
      </div>
      <div class="sub-actions">
        <button class="btn-icon edit" data-id="${sub.id}" title="Modifier">✏️</button>
        <button class="btn-icon delete" data-id="${sub.id}" title="Supprimer">🗑️</button>
      </div>
    `;

    subsList.appendChild(card);
  });

  // Events sur les boutons de la liste
  subsList.querySelectorAll('.btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', () => {
      subs = subs.filter(s => s.id !== btn.dataset.id);
      save();
      render();
    });
  });

  subsList.querySelectorAll('.btn-icon.edit').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
}

// ---- Modal ----

function openAddModal() {
  editingId = null;
  modalTitle.textContent = 'Nouvel abonnement';
  document.getElementById('inputName').value = '';
  document.getElementById('inputPrice').value = '';
  document.getElementById('inputCycle').value = 'monthly';
  document.getElementById('inputCategory').value = 'streaming';
  document.getElementById('inputRenewal').value = '';
  setColor('#6C63FF');
  modalOverlay.classList.add('open');
}

function openEditModal(id) {
  const sub = subs.find(s => s.id === id);
  if (!sub) return;
  editingId = id;
  modalTitle.textContent = 'Modifier';
  document.getElementById('inputName').value = sub.name;
  document.getElementById('inputPrice').value = sub.price;
  document.getElementById('inputCycle').value = sub.cycle;
  document.getElementById('inputCategory').value = sub.category;
  document.getElementById('inputRenewal').value = sub.renewal || '';
  setColor(sub.color || '#6C63FF');
  modalOverlay.classList.add('open');
}

function closeModal() {
  modalOverlay.classList.remove('open');
  editingId = null;
}

function setColor(color) {
  selectedColor = color;
  colorPicker.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('selected', dot.dataset.color === color);
  });
}

colorPicker.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => setColor(dot.dataset.color));
});

btnOpenModal.addEventListener('click', openAddModal);
btnCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

btnSave.addEventListener('click', () => {
  const name = document.getElementById('inputName').value.trim();
  const price = parseFloat(document.getElementById('inputPrice').value);
  const cycle = document.getElementById('inputCycle').value;
  const category = document.getElementById('inputCategory').value;
  const renewal = document.getElementById('inputRenewal').value;

  if (!name || isNaN(price) || price <= 0) {
    document.getElementById('inputName').focus();
    return;
  }

  if (editingId) {
    subs = subs.map(s => s.id === editingId
      ? { ...s, name, price, cycle, category, renewal, color: selectedColor }
      : s
    );
  } else {
    subs.push({ id: genId(), name, price, cycle, category, renewal, color: selectedColor });
  }

  save();
  closeModal();
  render();
});

// ---- Filtres ----

filters.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    filters.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.cat;
    render();
  });
});

// ---- Init ----
render();
