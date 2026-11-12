
let products = [
  { id: 1, name: "Thiéboudienne Rouge", category: "Plats chauds", price: 1500, available: true, image: "🍲" },
  { id: 2, name: "Yassa Poulet", category: "Plats chauds", price: 1500, available: true, image: "🍗" },
  { id: 3, name: "Burger Kiki Special", category: "Snacks", price: 1200, available: true, image: "🍔" },
  { id: 4, name: "Chawarma Poulet", category: "Snacks", price: 1000, available: true, image: "🌯" },
  { id: 5, name: "Jus de Bissap (50cl)", category: "Boissons", price: 500, available: true, image: "🥤" },
  { id: 6, name: "Jus de Bouye (50cl)", category: "Boissons", price: 500, available: false, image: "🥤" },
  { id: 7, name: "Tiramisu", category: "Desserts", price: 800, available: true, image: "🍰" }
];

let cart = [];
let selectedPayment = 'Mobile Money';
let currentCategory = 'All';

let orders = [
  {
    id: "CMD-8812",
    time: "12:15",
    items: [{ name: "Thiéboudienne Rouge", qty: 1, price: 1500 }],
    total: 1500,
    status: "retirée",
    createdAt: Date.now() - 3600000
  }
];

let activeOrderId = null;

// --- INITIALISATION ---
window.onload = function() {
  renderMenu();
  renderCart();
  renderVendeurOrders();
  renderVendeurMenu();
  renderAdminDashboard();
};

// --- LOGIQUE RÔLES ---
function switchRole(role) {
  document.getElementById('view-client').classList.add('hidden');
  document.getElementById('view-vendeur').classList.add('hidden');
  document.getElementById('view-admin').classList.add('hidden');

  document.getElementById('btn-role-client').className = "px-3 py-1 rounded-md text-white transition";
  document.getElementById('btn-role-vendeur').className = "px-3 py-1 rounded-md text-white transition";
  document.getElementById('btn-role-admin').className = "px-3 py-1 rounded-md text-white transition";

  if(role === 'client') {
    document.getElementById('view-client').classList.remove('hidden');
    document.getElementById('btn-role-client').className = "px-3 py-1 rounded-md bg-white text-orange-600 transition font-bold";
  } else if(role === 'vendeur') {
    document.getElementById('view-vendeur').classList.remove('hidden');
    document.getElementById('btn-role-vendeur').className = "px-3 py-1 rounded-md bg-white text-orange-600 transition font-bold";
  } else {
    document.getElementById('view-admin').classList.remove('hidden');
    document.getElementById('btn-role-admin').className = "px-3 py-1 rounded-md bg-white text-orange-600 transition font-bold";
  }
}

// --- CLIENT TABS ---
function switchClientTab(tab) {
  ['menu', 'panier', 'commande', 'historique'].forEach(t => {
    document.getElementById(`client-tab-${t}`).classList.add('hidden');
    document.getElementById(`tab-client-${t}`).className = "py-2 px-4 border-b-2 border-transparent font-medium text-gray-500 text-sm";
  });
  document.getElementById(`client-tab-${tab}`).classList.remove('hidden');
  document.getElementById(`tab-client-${tab}`).className = "py-2 px-4 border-b-2 border-orange-500 font-bold text-orange-600 text-sm";

  if(tab === 'commande') renderActiveOrder();
  if(tab === 'historique') renderHistory();
}

// --- MENU & RECHERCHE ---
function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.className = "cat-btn px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 whitespace-nowrap";
  });
  event.target.className = "cat-btn px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-500 text-white whitespace-nowrap";
  renderMenu();
}

function renderMenu() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const grid = document.getElementById('products-grid');
  grid.innerHTML = "";

  const filtered = products.filter(p => {
    const matchesCat = currentCategory === 'All' || p.category === currentCategory;
    const matchesSearch = p.name.toLowerCase().includes(search);
    return matchesCat && matchesSearch;
  });

  filtered.forEach(p => {
    const isAvailable = p.available;
    grid.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center ${!isAvailable ? 'opacity-60' : ''}">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">${p.image}</span>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">${p.name}</h3>
            <p class="text-xs text-gray-500">${p.category}</p>
            <p class="text-orange-600 font-bold text-sm mt-1">${p.price} FCFA</p>
          </div>
        </div>
        <div>
          ${isAvailable ? 
            `<button onclick="addToCart(${p.id})" class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow">+ Ajouter</button>` : 
            `<span class="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">Épuisé</span>`
          }
        </div>
      </div>
    `;
  });
}

// --- PANIER & COMMANDE ---
function addToCart(productId) {
  const prod = products.find(p => p.id === productId);
  const existing = cart.find(c => c.id === productId);
  if(existing) {
    existing.qty++;
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if(item) {
    item.qty += delta;
    if(item.qty <= 0) {
      cart = cart.filter(c => c.id !== id);
    }
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const badge = document.getElementById('cart-badge');
  const totalEl = document.getElementById('cart-total');

  const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);
  if(totalItems > 0) {
    badge.innerText = totalItems;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  if(cart.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-sm py-4 text-center">Votre panier est vide.</p>`;
    totalEl.innerText = "0 FCFA";
    return;
  }

  container.innerHTML = "";
  let grandTotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    grandTotal += itemTotal;
    container.innerHTML += `
      <div class="py-3 flex justify-between items-center">
        <div>
          <p class="font-bold text-sm text-gray-800">${item.name}</p>
          <p class="text-xs text-gray-500">${item.price} FCFA x ${item.qty}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="changeQty(${item.id}, -1)" class="w-6 h-6 bg-gray-200 rounded text-sm font-bold">-</button>
          <span class="text-xs font-bold">${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)" class="w-6 h-6 bg-orange-500 text-white rounded text-sm font-bold">+</button>
        </div>
      </div>
    `;
  });

  totalEl.innerText = `${grandTotal} FCFA`;
}

function selectPayment(mode) {
  selectedPayment = mode;
  document.getElementById('pay-mm').className = mode === 'Mobile Money' ? 
    'p-3 border-2 border-orange-500 rounded-lg text-center text-xs font-bold text-orange-600 bg-orange-50' : 
    'p-3 border-2 border-gray-200 rounded-lg text-center text-xs font-bold text-gray-600';
  document.getElementById('pay-cb').className = mode === 'Carte Baucine/CB' ? 
    'p-3 border-2 border-orange-500 rounded-lg text-center text-xs font-bold text-orange-600 bg-orange-50' : 
    'p-3 border-2 border-gray-200 rounded-lg text-center text-xs font-bold text-gray-600';
}

function processCheckout() {
  if(cart.length === 0) return alert("Votre panier est vide !");

  const newId = "CMD-" + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

  const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);

  const newOrder = {
    id: newId,
    time: timeStr,
    items: [...cart],
    total: total,
    status: "en_attente",
    createdAt: Date.now()
  };

  orders.unshift(newOrder);
  activeOrderId = newId;

  cart = [];
  renderCart();
  renderVendeurOrders();
  renderAdminDashboard();

  switchClientTab('commande');
}

function renderActiveOrder() {
  const container = document.getElementById('active-order-container');
  const active = orders.find(o => o.id === activeOrderId);

  if(!active) {
    container.innerHTML = `<p class="text-gray-500">Aucune commande active en cours.</p>`;
    return;
  }

  const isReady = active.status === 'prete';
  const isDone = active.status === 'retirée';

  container.innerHTML = `
    <div class="space-y-4">
      <div class="inline-block p-2 bg-orange-100 rounded-full text-orange-600 font-bold text-xs uppercase tracking-wider">
        Commande ${active.id}
      </div>
      
      <!-- TIMELINE DE STATUT -->
      <div class="flex justify-around items-center my-4 text-xs font-bold">
        <div class="${active.status === 'en_attente' ? 'text-orange-600 underline' : 'text-gray-400'}">1. En préparation</div>
        <div class="text-gray-300">➔</div>
        <div class="${isReady ? 'text-green-600 font-extrabold text-base animate-pulse' : 'text-gray-400'}">2. Commande Prête</div>
        <div class="text-gray-300">➔</div>
        <div class="${isDone ? 'text-gray-800' : 'text-gray-400'}">3. Retirée</div>
      </div>

      ${isReady ? `<div class="p-3 bg-green-500 text-white font-bold rounded-lg text-center animate-bounce">
        ✅ VOTRE COMMANDE EST PRÊTE AU COMPTOIR !
      </div>` : ''}

      <!-- QR CODE GENERATEUR -->
      <div class="flex justify-center my-4">
        <div id="qrcode-box" class="p-4 bg-white border-2 border-orange-400 rounded-xl shadow-inner"></div>
      </div>

      <p class="text-xs text-gray-500">Présentez ce QR Code unique au vendeur Kiki Traiteur pour récupérer votre repas.</p>
    </div>
  `;

  setTimeout(() => {
    document.getElementById('qrcode-box').innerHTML = "";
    new QRCode(document.getElementById("qrcode-box"), {
      text: active.id,
      width: 140,
      height: 140
    });
  }, 50);
}

function renderHistory() {
  const container = document.getElementById('history-list');
  container.innerHTML = "";

  orders.forEach(o => {
    container.innerHTML += `
      <div class="p-4 border rounded-lg flex justify-between items-center text-sm">
        <div>
          <p class="font-bold text-gray-800">${o.id} - ${o.total} FCFA</p>
          <p class="text-xs text-gray-500">${o.items.map(i => i.name).join(', ')}</p>
        </div>
        <span class="px-2 py-1 text-xs font-bold rounded ${
          o.status === 'retirée' ? 'bg-gray-100 text-gray-700' :
          o.status === 'prete' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }">${o.status}</span>
      </div>
    `;
  });
}

// --- VENDEUR ---
function switchVendeurTab(tab) {
  ['orders', 'scanner', 'menu-mg'].forEach(t => {
    document.getElementById(`vendeur-tab-${t}`).classList.add('hidden');
    document.getElementById(`tab-vendeur-${t}`).className = "py-2 px-4 border-b-2 border-transparent font-medium text-gray-500 text-sm";
  });
  document.getElementById(`vendeur-tab-${tab}`).classList.remove('hidden');
  document.getElementById(`tab-vendeur-${tab}`).className = "py-2 px-4 border-b-2 border-orange-500 font-bold text-orange-600 text-sm";
}

function renderVendeurOrders() {
  const container = document.getElementById('vendeur-orders-list');
  container.innerHTML = "";

  if(orders.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-sm">Aucune commande en attente.</p>`;
    return;
  }

  orders.forEach(o => {
    container.innerHTML += `
      <div class="p-4 border rounded-xl shadow-sm bg-gray-50 space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-bold text-orange-600">${o.id}</span>
          <span class="text-xs text-gray-400">${o.time}</span>
        </div>
        <div class="text-sm">
          ${o.items.map(i => `<p>• ${i.qty}x ${i.name}</p>`).join('')}
        </div>
        <div class="flex gap-2 pt-2 border-t">
          <button onclick="updateOrderStatus('${o.id}', 'en_attente')" class="px-3 py-1 text-xs rounded font-bold ${o.status === 'en_attente' ? 'bg-orange-500 text-white' : 'bg-gray-200'}">En préparation</button>
          <button onclick="updateOrderStatus('${o.id}', 'prete')" class="px-3 py-1 text-xs rounded font-bold ${o.status === 'prete' ? 'bg-green-500 text-white' : 'bg-gray-200'}">Prête</button>
          <button onclick="updateOrderStatus('${o.id}', 'retirée')" class="px-3 py-1 text-xs rounded font-bold ${o.status === 'retirée' ? 'bg-gray-800 text-white' : 'bg-gray-200'}">Retirée</button>
        </div>
      </div>
    `;
  });
}

function updateOrderStatus(id, newStatus) {
  const order = orders.find(o => o.id === id);
  if(order) {
    order.status = newStatus;
    renderVendeurOrders();
    renderAdminDashboard();
    if(activeOrderId === id) renderActiveOrder();
  }
}

function validateManualQR() {
  const input = document.getElementById('manual-qr-input').value.trim().toUpperCase();
  const res = document.getElementById('scan-result');
  const order = orders.find(o => o.id === input);

  res.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');

  if(!order) {
    res.classList.add('bg-red-100', 'text-red-800');
    res.innerText = "❌ Erreur : Commande introuvable !";
  } else if(order.status === 'retirée') {
    res.classList.add('bg-red-100', 'text-red-800');
    res.innerText = "⚠️ Commande DÉJÀ retirée !";
  } else {
    order.status = 'retirée';
    res.classList.add('bg-green-100', 'text-green-800');
    res.innerText = `✅ Validation réussie ! Commande ${order.id} servie.`;
    renderVendeurOrders();
    renderAdminDashboard();
    if(activeOrderId === order.id) renderActiveOrder();
  }
}

function renderVendeurMenu() {
  const container = document.getElementById('vendeur-menu-list');
  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="py-3 flex justify-between items-center">
        <span class="font-bold text-sm text-gray-800">${p.name}</span>
        <button onclick="toggleAvailability(${p.id})" class="px-3 py-1 text-xs font-bold rounded-full ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
          ${p.available ? 'En Stock (Disponible)' : 'Épuisé'}
        </button>
      </div>
    `;
  });
}

function toggleAvailability(id) {
  const prod = products.find(p => p.id === id);
  if(prod) {
    prod.available = !prod.available;
    renderVendeurMenu();
    renderMenu();
  }
}

// --- ADMIN ---
function renderAdminDashboard() {
  const totalCA = orders.reduce((acc, o) => acc + o.total, 0);
  const totalDone = orders.filter(o => o.status === 'retirée').length;

  document.getElementById('admin-ca').innerText = `${totalCA} FCFA`;
  document.getElementById('admin-count').innerText = orders.length;
  document.getElementById('admin-done').innerText = totalDone;

  const table = document.getElementById('admin-orders-table');
  table.innerHTML = "";

  orders.forEach(o => {
    table.innerHTML += `
      <tr>
        <td class="p-3 font-bold">${o.id}</td>
        <td class="p-3">${o.time}</td>
        <td class="p-3">${o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
        <td class="p-3 font-bold">${o.total} FCFA</td>
        <td class="p-3">
          <span class="px-2 py-1 text-xs font-bold rounded ${
            o.status === 'retirée' ? 'bg-gray-100 text-gray-700' :
            o.status === 'prete' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }">${o.status}</span>
        </td>
      </tr>
    `;
  });
}