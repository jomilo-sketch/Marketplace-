/* Bouesti Admin — Control Room frontend logic */
(function () {
  'use strict';

  const API = '/api';
  let TOKEN = localStorage.getItem('bm_admin_token') || null;
  let CURRENT_USER = null;
  let SOCKET = null;
  const charts = {};

  // ─────────────────────────── helpers ───────────────────────────
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function fmtMoney(n) { return '₦' + Number(n || 0).toLocaleString('en-NG'); }
  function fmtDate(iso) { try { return new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return iso; } }

  let OFFLINE = false;
  const OFFLINE_KEY = 'bm_admin_offline_db_v1';

  function uid() { return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
  function nowISO() { return new Date().toISOString(); }

  const EKITI_LGAS = ['Ado-Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido-Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'];

  function seedOfflineDB() {
    const users = [
      { id: uid(), name: 'Success Admin', email: 'admin@bouesti.ng', password: 'Admin@12345', role: 'admin', status: 'active', createdAt: nowISO(), lastLogin: null, twoFactorEnabled: false, loginHistory: [] },
      { id: uid(), name: 'Bunmi Manager', email: 'manager@bouesti.ng', password: 'Manager@12345', role: 'manager', status: 'active', createdAt: nowISO(), lastLogin: null, twoFactorEnabled: false, loginHistory: [] },
      { id: uid(), name: 'Kunle Staff', email: 'staff@bouesti.ng', password: 'Staff@12345', role: 'staff', status: 'active', createdAt: nowISO(), lastLogin: null, twoFactorEnabled: false, loginHistory: [] },
    ];
    const cats = {
      produce: ['Fresh Pepper (Basket)', 'Yam Tubers (5pcs)', 'Pumpkin Leaves (Bunch)', 'Tomatoes (Crate)', 'Cassava (Bag)'],
      livestock: ['Broiler Chicken', 'Layer Chicken', 'Weaner Pig', 'Goat (Male)', 'Turkey'],
      insurance: ['Livestock Insurance — Basic', 'Crop Insurance — Seasonal', 'Farm Asset Cover'],
    };
    const products = [];
    Object.entries(cats).forEach(([cat, names]) => names.forEach((n, i) => products.push({
      id: uid(), category: cat, title: n, price: Math.round(Math.random() * 40000 + 5000), stock: Math.round(Math.random() * 80 + 5),
      status: i % 4 === 0 ? 'draft' : 'published', image: null, createdAt: nowISO(), updatedAt: nowISO(),
    })));
    const banners = [
      { id: uid(), title: 'Fresh from Ekiti Farms', subtitle: 'Farm produce delivered across all 16 LGAs', status: 'published', createdAt: nowISO() },
      { id: uid(), title: 'Livestock Season Sale', subtitle: 'Broilers and pigs at harvest prices', status: 'draft', createdAt: nowISO() },
    ];
    const orders = [];
    const statuses = ['pending', 'processing', 'delivered', 'cancelled'];
    for (let i = 0; i < 24; i++) {
      const created = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30);
      orders.push({ id: uid(), customer: ['Amaka Customer', 'Tunde Ayo', 'Folake Bello', 'Segun Ade', 'Ronke Ojo'][i % 5], lga: EKITI_LGAS[i % EKITI_LGAS.length], items: Math.round(Math.random() * 4 + 1), total: Math.round(Math.random() * 60000 + 3000), status: statuses[Math.floor(Math.random() * statuses.length)], createdAt: created.toISOString() });
    }
    const notifications = [{ id: uid(), type: 'system', title: 'Welcome to Bouesti Admin', message: 'You are running in local demo mode — no backend server was detected, so all data here is stored in your browser only.', createdAt: nowISO(), read: false }];
    const logs = [{ id: uid(), date: new Date().toLocaleDateString('en-NG'), time: new Date().toLocaleTimeString('en-NG'), ip: 'local', browser: 'Demo', user: 'system', action: 'Started local demo session' }];
    const settings = { marketplaceName: 'Bouesti Marketplace', logo: '', theme: 'dark', currency: 'NGN', deliveryFees: { base: 800 }, contact: {}, smtp: { host: '', configured: false }, paymentGateway: { provider: 'paystack', publicKey: '', configured: false }, lastBackupAt: null };
    const db = { users, products, banners, orders, notifications, logs, settings, meta: { ekitiLgas: EKITI_LGAS } };
    saveOfflineDB(db);
    return db;
  }
  function loadOfflineDB() {
    try { const raw = localStorage.getItem(OFFLINE_KEY); if (raw) return JSON.parse(raw); } catch {}
    return seedOfflineDB();
  }
  function saveOfflineDB(db) { try { localStorage.setItem(OFFLINE_KEY, JSON.stringify(db)); } catch {} }
  function publicUserOffline(u) { const { password, loginHistory, ...rest } = u; return rest; }
  function paginate(list, page, pageSize) {
    const p = Math.max(1, parseInt(page, 10) || 1), size = Math.max(1, parseInt(pageSize, 10) || 10);
    return { items: list.slice((p - 1) * size, (p - 1) * size + size), total: list.length, page: p, pageSize: size, totalPages: Math.max(1, Math.ceil(list.length / size)) };
  }
  function logOffline(db, user, action) {
    const entry = { id: uid(), date: new Date().toLocaleDateString('en-NG'), time: new Date().toLocaleTimeString('en-NG'), ip: 'local', browser: 'Demo', user: user || 'system', action };
    db.logs.unshift(entry); db.logs = db.logs.slice(0, 300);
  }

  // ── Measurement techniques (units.js): unit list for the product editor and the "ways to buy it" lines ──
  const U = window.BMUnits || { name: (u) => String(u || ''), unitsByGroup: () => [], unitFromWord: () => null, isUnit: () => false, info: (u) => ({ key: u }), normalizeMeasures: (p, l) => l || [] };
  function fillUnitSelect(current) {
    const sel = $('#productModalUnit');
    sel.innerHTML = U.unitsByGroup().map((g) => `<optgroup label="${esc(g.group)}">${g.units.map((u) => `<option value="${u.key}">${esc(u.name)}</option>`).join('')}</optgroup>`).join('');
    sel.value = U.isUnit(current) ? current : 'kg';
  }
  // text lines  ->  [{unit, qty, kg?}]      "paint rubber, 2.65, 4.5"  or  "bag = 50"
  function parseMeasureLines(text) {
    return String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const parts = line.split(/[,=;]/).map((s) => s.trim());
      const unit = U.unitFromWord(parts[0]) || (U.isUnit(parts[0]) ? parts[0] : null);
      const qty = Number(parts[1]);
      const kg = parts[2] ? Number(parts[2]) : null;
      return unit && qty > 0 ? { unit, qty, ...(kg > 0 ? { kg } : {}) } : null;
    }).filter(Boolean);
  }
  function measureLines(list) { return (list || []).map((m) => [m.unit, m.qty, m.kg != null ? m.kg : ''].filter((x, i) => i < 2 || x !== '').join(', ')).join('\n'); }
  function previewMeasures() {
    const list = U.normalizeMeasures($('#productModalUnit').value, parseMeasureLines($('#productModalMeasures').value));
    $('#productModalMeasurePreview').textContent = list.length ? 'Customers will see: ' + list.map((m) => m.label).join(' \u00b7 ') : '';
  }

  // ─────────────────────────── Customer Care in local demo mode ───────────────────────────
  const CARE_KEY = 'bm_care_offline_v1';
  const CARE_CATS = [['not_delivered', 'Order not delivered'], ['late_delivery', 'Late delivery'], ['wrong_item', 'Wrong item, weight or breed'], ['poor_quality', 'Poor quality / spoiled produce'], ['livestock_issue', 'Livestock problem'], ['wrong_charge', 'Wrong charge / refund'], ['payment', 'Payment problem'], ['account', 'Account or login'], ['website', 'Website problem'], ['other', 'Something else']];
  const careLabel = (k) => (CARE_CATS.find((c) => c[0] === k) || [k, 'Something else'])[1];
  function careLoad() { try { const d = JSON.parse(localStorage.getItem(CARE_KEY) || 'null'); if (d && d.complaints) return d; } catch {} return { seq: 0, complaints: [], messages: [], chats: {} }; }
  function careSave(d) { try { localStorage.setItem(CARE_KEY, JSON.stringify(d)); } catch {} }
  function careOut(c, staffReplies) { return Object.assign({}, c, { categoryLabel: careLabel(c.category), replies: staffReplies }); }
  function careThread(d, c) { return d.messages.filter((m) => m.complaintId === c.id).map((m) => ({ id: m.id, sender: m.sender, senderName: m.senderName || (m.sender === 'staff' ? 'Bouesti team' : c.name), body: m.body, createdAt: m.createdAt })); }
  function careDetail(d, c) {
    const chat = c.chatSession && d.chats[c.chatSession] ? d.chats[c.chatSession].messages.slice(0, 80).map((m) => ({ role: m.role, body: m.body, createdAt: m.createdAt })) : [];
    return { complaint: careOut(c), messages: careThread(d, c), chat };
  }
  function careOffline(pathname, method, qp, body, staffName) {
    const d = careLoad();
    const seg = pathname.split('/').filter(Boolean);
    if (seg[0] === 'chats') {
      if (seg.length === 1) {
        let list = Object.values(d.chats).sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
        if (qp.complaints === '1') list = list.filter((c) => c.complaintRef);
        const pg = paginate(list, qp.page, qp.pageSize);
        pg.items = pg.items.map((c) => ({ id: c.id, who: c.who || 'Visitor', messageCount: c.messages.length, complaintRef: c.complaintRef || '', lastMessage: ([...c.messages].reverse().find((m) => m.role === 'user') || {}).body || '', startedAt: c.createdAt, updatedAt: c.updatedAt || c.createdAt }));
        return pg;
      }
      const c = d.chats[decodeURIComponent(seg[1])];
      if (!c) throw new Error('Chat not found');
      return { id: c.id, who: c.who || 'Visitor', complaintRef: c.complaintRef || '', messages: c.messages };
    }
    // complaints
    if (seg.length === 1 && method === 'GET') {
      let list = d.complaints.slice();
      if (qp.status) list = list.filter((c) => c.status === qp.status);
      if (qp.category) list = list.filter((c) => c.category === qp.category);
      if (qp.q) { const q = qp.q.toLowerCase(); list = list.filter((c) => [c.ref, c.name, c.phone, c.email, c.orderRef, c.subject, c.message].some((v) => String(v || '').toLowerCase().includes(q))); }
      const rank = { open: 0, in_progress: 1, resolved: 2, closed: 2 }, pr = { urgent: 0, high: 1, normal: 2, low: 3 };
      list.sort((a, b) => (rank[a.status] - rank[b.status]) || (pr[a.priority] - pr[b.priority]) || (b.id - a.id));
      const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0, total: 0 };
      d.complaints.forEach((c) => { counts[c.status] += 1; counts.total += 1; });
      const pg = paginate(list, qp.page, qp.pageSize);
      pg.items = pg.items.map((c) => careOut(c, d.messages.filter((m) => m.complaintId === c.id && m.sender === 'staff').length));
      pg.counts = counts; pg.categories = CARE_CATS.map(([key, label]) => ({ key, label }));
      return pg;
    }
    const c = d.complaints.find((x) => String(x.id) === seg[1]);
    if (!c) throw new Error('Complaint not found');
    if (seg.length === 2 && method === 'GET') return careDetail(d, c);
    if (seg.length === 2 && method === 'PATCH') {
      if (body.status !== undefined) { if (!['open', 'in_progress', 'resolved', 'closed'].includes(body.status)) throw new Error('Invalid status'); c.status = body.status; }
      if (body.priority !== undefined) { if (!['low', 'normal', 'high', 'urgent'].includes(body.priority)) throw new Error('Invalid priority'); c.priority = body.priority; }
      c.updatedAt = nowISO(); careSave(d); return careDetail(d, c);
    }
    if (seg.length === 2 && method === 'DELETE') {
      d.complaints = d.complaints.filter((x) => x.id !== c.id); d.messages = d.messages.filter((m) => m.complaintId !== c.id); careSave(d); return { ok: true };
    }
    if (seg[2] === 'reply' && method === 'POST') {
      const msg = String(body.message || '').trim().slice(0, 2000);
      if (msg.length < 2) throw new Error('Please type a reply');
      d.seq += 1; d.messages.push({ id: d.seq, complaintId: c.id, sender: 'staff', senderName: staffName, body: msg, createdAt: nowISO() });
      c.status = body.status && ['open', 'in_progress', 'resolved', 'closed'].includes(body.status) ? body.status : (c.status === 'open' ? 'in_progress' : c.status);
      c.updatedAt = nowISO(); careSave(d); return careDetail(d, c);
    }
    throw new Error('This action is not available in local demo mode.');
  }

  function offlineRoute(path, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    const body = opts.body ? JSON.parse(opts.body) : {};
    const [pathname, qs] = path.split('?');
    const qp = Object.fromEntries(new URLSearchParams(qs || ''));
    const db = loadOfflineDB();
    const who = CURRENT_USER ? CURRENT_USER.email : 'guest';
    const seg = pathname.split('/').filter(Boolean); // e.g. ['users','id123','suspend']

    // ---- AUTH ----
    if (pathname === '/auth/login' && method === 'POST') {
      const u = db.users.find((x) => x.email.toLowerCase() === String(body.email || '').toLowerCase());
      if (!u || u.password !== body.password) throw new Error('Invalid email or password');
      if (u.status === 'suspended') throw new Error('This account has been suspended');
      u.lastLogin = nowISO(); logOffline(db, u.email, 'Signed in (local demo)'); saveOfflineDB(db);
      return { token: 'offline-' + u.id, user: publicUserOffline(u), expiresIn: 'local' };
    }
    if (pathname === '/auth/signup' && method === 'POST') {
      if (!body.name || !body.email || !body.password || body.password.length < 8) throw new Error('Please fill every field — password must be at least 8 characters');
      if (db.users.some((x) => x.email.toLowerCase() === String(body.email).toLowerCase())) throw new Error('An account with this email already exists — try signing in instead.');
      const u = { id: uid(), name: body.name.trim(), email: body.email.trim(), password: body.password, role: body.role || 'staff', status: 'active', createdAt: nowISO(), lastLogin: nowISO(), twoFactorEnabled: false, loginHistory: [] };
      db.users.push(u); logOffline(db, u.email, `New ${u.role} account created (local demo)`); saveOfflineDB(db);
      return { token: 'offline-' + u.id, user: publicUserOffline(u), expiresIn: 'local' };
    }
    if (pathname === '/auth/me' && method === 'GET') {
      const id = (TOKEN || '').replace('offline-', '');
      const u = db.users.find((x) => x.id === id);
      if (!u) throw new Error('Session expired, please log in again');
      return { user: publicUserOffline(u) };
    }
    if (pathname === '/auth/logout') return { ok: true };
    if (pathname === '/auth/forgot-password') { logOffline(db, body.email || 'unknown', 'Requested password reset (local demo)'); saveOfflineDB(db); return { ok: true, message: 'If that email exists, a reset link has been sent.' }; }
    if (pathname === '/auth/change-password' && method === 'POST') {
      const id = (TOKEN || '').replace('offline-', ''); const u = db.users.find((x) => x.id === id);
      if (!u || u.password !== body.currentPassword) throw new Error('Current password is incorrect');
      u.password = body.newPassword; saveOfflineDB(db); return { ok: true };
    }
    if (pathname === '/auth/2fa/toggle' && method === 'POST') {
      const id = (TOKEN || '').replace('offline-', ''); const u = db.users.find((x) => x.id === id);
      u.twoFactorEnabled = !u.twoFactorEnabled; saveOfflineDB(db); return { twoFactorEnabled: u.twoFactorEnabled };
    }

    // ---- USERS ----
    if (pathname === '/users' && method === 'GET') {
      let list = db.users.slice();
      if (qp.search) { const q = qp.search.toLowerCase(); list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)); }
      if (qp.role) list = list.filter((u) => u.role === qp.role);
      const p = paginate(list, qp.page, qp.pageSize);
      return { ...p, items: p.items.map(publicUserOffline) };
    }
    if (pathname === '/users' && method === 'POST') {
      if (db.users.some((x) => x.email.toLowerCase() === String(body.email).toLowerCase())) throw new Error('A user with this email already exists');
      const u = { id: uid(), name: body.name, email: body.email, role: body.role || 'customer', status: 'active', password: body.password, createdAt: nowISO(), lastLogin: null, twoFactorEnabled: false, loginHistory: [] };
      db.users.push(u); logOffline(db, who, `Added user ${u.email} (${u.role})`); saveOfflineDB(db);
      return { user: publicUserOffline(u) };
    }
    if (seg[0] === 'users' && seg[2] === 'suspend' && method === 'PATCH') {
      const u = db.users.find((x) => x.id === seg[1]); if (!u) throw new Error('User not found');
      u.status = u.status === 'suspended' ? 'active' : 'suspended'; logOffline(db, who, `${u.status === 'suspended' ? 'Suspended' : 'Reactivated'} user ${u.email}`); saveOfflineDB(db);
      return { user: publicUserOffline(u) };
    }
    if (seg[0] === 'users' && seg.length === 2 && method === 'PUT') {
      const u = db.users.find((x) => x.id === seg[1]); if (!u) throw new Error('User not found');
      Object.assign(u, body.name && { name: body.name }, body.email && { email: body.email }, body.role && { role: body.role }, body.status && { status: body.status }, body.password && { password: body.password });
      logOffline(db, who, `Updated user ${u.email}`); saveOfflineDB(db);
      return { user: publicUserOffline(u) };
    }
    if (seg[0] === 'users' && seg.length === 2 && method === 'DELETE') {
      const u = db.users.find((x) => x.id === seg[1]); if (!u) throw new Error('User not found');
      db.users = db.users.filter((x) => x.id !== seg[1]); logOffline(db, who, `Deleted user ${u.email}`); saveOfflineDB(db);
      return { ok: true };
    }

    // ---- CONTENT: products ----
    if (pathname === '/content/products' && method === 'GET') {
      let list = db.products.slice();
      if (qp.category) list = list.filter((p) => p.category === qp.category);
      if (qp.status) list = list.filter((p) => p.status === qp.status);
      if (qp.search) list = list.filter((p) => p.title.toLowerCase().includes(qp.search.toLowerCase()));
      return { items: list };
    }
    if (pathname === '/content/products' && method === 'POST') {
      const p = { id: uid(), category: body.category, title: body.title, price: Number(body.price), stock: Number(body.stock || 0), image: null, group: body.group || '', unit: body.unit || '', description: body.description || '', measures: body.measures || [], processedPrice: body.processedPrice || null, imageKey: body.imageKey || '', status: body.status || 'draft', createdAt: nowISO(), updatedAt: nowISO() };
      db.products.push(p); logOffline(db, who, `Added product "${p.title}"`); saveOfflineDB(db);
      return { product: p };
    }
    if (seg[0] === 'content' && seg[1] === 'products' && seg[3] === 'publish' && method === 'PATCH') {
      const p = db.products.find((x) => x.id === seg[2]); if (!p) throw new Error('Product not found');
      p.status = p.status === 'published' ? 'draft' : 'published'; logOffline(db, who, `${p.status === 'published' ? 'Published' : 'Unpublished'} "${p.title}"`); saveOfflineDB(db);
      return { product: p };
    }
    if (seg[0] === 'content' && seg[1] === 'products' && seg.length === 3 && method === 'PUT') {
      const p = db.products.find((x) => x.id === seg[2]); if (!p) throw new Error('Product not found');
      Object.assign(p, body, { updatedAt: nowISO() }); logOffline(db, who, `Updated product "${p.title}"`); saveOfflineDB(db);
      return { product: p };
    }
    if (seg[0] === 'content' && seg[1] === 'products' && seg.length === 3 && method === 'DELETE') {
      const p = db.products.find((x) => x.id === seg[2]); if (!p) throw new Error('Product not found');
      db.products = db.products.filter((x) => x.id !== seg[2]); logOffline(db, who, `Deleted product "${p.title}"`); saveOfflineDB(db);
      return { ok: true };
    }

    // ---- CONTENT: banners ----
    if (pathname === '/content/banners' && method === 'GET') return { items: db.banners };
    if (pathname === '/content/banners' && method === 'POST') {
      const b = { id: uid(), title: body.title, subtitle: body.subtitle || '', status: body.status || 'draft', createdAt: nowISO() };
      db.banners.push(b); logOffline(db, who, `Added banner "${b.title}"`); saveOfflineDB(db);
      return { banner: b };
    }
    if (seg[0] === 'content' && seg[1] === 'banners' && seg.length === 3 && method === 'PUT') {
      const b = db.banners.find((x) => x.id === seg[2]); if (!b) throw new Error('Banner not found');
      Object.assign(b, body); saveOfflineDB(db); return { banner: b };
    }
    if (seg[0] === 'content' && seg[1] === 'banners' && seg.length === 3 && method === 'DELETE') {
      db.banners = db.banners.filter((x) => x.id !== seg[2]); saveOfflineDB(db); return { ok: true };
    }

    // ---- CONTENT: delivery / contact ----
    if (pathname === '/content/delivery-info' && method === 'GET') return { deliveryFees: db.settings.deliveryFees || {} };
    if (pathname === '/content/delivery-info' && method === 'PUT') { db.settings.deliveryFees = body.deliveryFees; saveOfflineDB(db); return { deliveryFees: db.settings.deliveryFees }; }
    if (pathname === '/content/contact-info' && method === 'GET') return { contact: db.settings.contact || {} };
    if (pathname === '/content/contact-info' && method === 'PUT') { db.settings.contact = body.contact; saveOfflineDB(db); return { contact: db.settings.contact }; }

    // ---- ORDERS ----
    if (pathname === '/orders' && method === 'GET') {
      let list = db.orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (qp.status) list = list.filter((o) => o.status === qp.status);
      return paginate(list, qp.page, qp.pageSize);
    }
    if (seg[0] === 'orders' && seg.length === 2 && method === 'GET') {
      const o = db.orders.find((x) => x.id === seg[1]); if (!o) throw new Error('Order not found');
      return { order: { ...o, phone: '', address: '', state: 'Ekiti', payMethod: 'Pay on delivery', paymentStatus: 'unpaid', deliveryDate: '', subtotal: o.total, serviceFee: 0, deliveryFee: 0, items: [], lastLocation: null } };
    }
    if (seg[0] === 'orders' && seg[2] === 'location' && method === 'POST') return { ok: true };
    if (pathname === '/listing-requests' && method === 'GET') return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    if (pathname === '/reports/state-distribution') return { labels: ['Ekiti'], values: [db.orders.length] };
    if (pathname === '/reports/top-items') return { labels: [], values: [] };
    if (seg[0] === 'notifications' && seg.length === 2 && method === 'DELETE') { db.notifications = db.notifications.filter((x) => x.id !== seg[1]); saveOfflineDB(db); return { ok: true }; }
    if (seg[0] === 'orders' && seg[2] === 'status' && method === 'PATCH') {
      const o = db.orders.find((x) => x.id === seg[1]); if (!o) throw new Error('Order not found');
      o.status = body.status; logOffline(db, who, `Marked order ${o.id.slice(0, 8)} as ${o.status}`); saveOfflineDB(db);
      return { order: o };
    }

    // ---- REPORTS ----
    function lastNMonths(n) { const out = []; const d = new Date(); d.setDate(1); for (let i = n - 1; i >= 0; i--) { const dt = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push({ label: dt.toLocaleString('en-NG', { month: 'short' }), y: dt.getFullYear(), m: dt.getMonth() }); } return out; }
    if (pathname === '/reports/overview') {
      const revenue = db.orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
      return { totalUsers: db.users.length, totalOrders: db.orders.length, revenue, activeProducts: db.products.filter((p) => p.status === 'published').length, pendingDeliveries: db.orders.filter((o) => o.status === 'pending' || o.status === 'processing').length, notifications: db.notifications.filter((n) => !n.read).length, openComplaints: careLoad().complaints.filter((c) => c.status === 'open' || c.status === 'in_progress').length };
    }
    if (pathname === '/reports/revenue') {
      const months = lastNMonths(6);
      const values = months.map(({ y, m }) => db.orders.filter((o) => o.status !== 'cancelled').filter((o) => { const d = new Date(o.createdAt); return d.getFullYear() === y && d.getMonth() === m; }).reduce((s, o) => s + o.total, 0));
      return { labels: months.map((x) => x.label), values };
    }
    if (pathname === '/reports/sales') {
      const months = lastNMonths(6);
      const values = months.map(({ y, m }) => db.orders.filter((o) => { const d = new Date(o.createdAt); return d.getFullYear() === y && d.getMonth() === m; }).length);
      return { labels: months.map((x) => x.label), values };
    }
    if (pathname === '/reports/product-performance') {
      const byCat = {}; db.products.forEach((p) => { byCat[p.category] = (byCat[p.category] || 0) + (p.stock || 0); });
      return { labels: Object.keys(byCat), values: Object.values(byCat) };
    }
    if (pathname === '/reports/customer-growth') {
      const months = lastNMonths(6); let cum = 0;
      const values = months.map(({ y, m }) => { cum += db.users.filter((u) => { const d = new Date(u.createdAt); return d.getFullYear() === y && d.getMonth() === m; }).length; return cum; });
      return { labels: months.map((x) => x.label), values };
    }
    if (pathname === '/reports/lga-distribution') {
      const values = db.meta.ekitiLgas.map((lga) => db.orders.filter((o) => o.lga === lga).length);
      return { labels: db.meta.ekitiLgas, values };
    }
    if (pathname === '/reports/daily-visitors') {
      const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * 86400000); days.push({ label: d.toLocaleDateString('en-NG', { weekday: 'short' }), value: Math.round(80 + Math.random() * 220) }); }
      return { labels: days.map((d) => d.label), values: days.map((d) => d.value) };
    }

    // ---- NOTIFICATIONS ----
    if (pathname === '/notifications' && method === 'GET') return { items: db.notifications.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
    if (pathname === '/notifications' && method === 'POST') {
      const n = { id: uid(), type: body.type || 'broadcast', title: body.title, message: body.message, audience: body.audience || 'all', createdAt: nowISO(), read: false };
      db.notifications.push(n); logOffline(db, who, `Sent ${n.type} notification: "${n.title}"`); saveOfflineDB(db);
      return { notification: n };
    }

    // ---- SETTINGS ----
    if (pathname === '/settings' && method === 'GET') return { settings: db.settings };
    if (pathname === '/settings' && method === 'PUT') { Object.assign(db.settings, body); saveOfflineDB(db); return { settings: db.settings }; }
    if (pathname === '/settings/backup' && method === 'POST') { db.settings.lastBackupAt = nowISO(); logOffline(db, who, 'Generated local backup snapshot'); saveOfflineDB(db); return { ok: true, file: 'local-only', at: db.settings.lastBackupAt }; }

    // ---- LOGS ----
    if (pathname === '/logs' && method === 'GET') {
      let list = db.logs.slice();
      if (qp.search) list = list.filter((l) => l.action.toLowerCase().includes(qp.search.toLowerCase()));
      return paginate(list, qp.page, qp.pageSize);
    }

    // ---- CUSTOMER CARE (same browser store as the storefront chat widget) ----
    if (pathname === '/complaints' || pathname.startsWith('/complaints/') || pathname === '/chats' || pathname.startsWith('/chats/')) return careOffline(pathname, method, qp, body, CURRENT_USER ? CURRENT_USER.name : 'Admin');

    throw new Error('This action is not available in local demo mode.');
  }

  async function api(path, opts = {}) {
    if (OFFLINE) {
      await new Promise((r) => setTimeout(r, 120));
      return offlineRoute(path, opts);
    }
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
    let res;
    try {
      res = await fetch(API + path, { ...opts, headers });
    } catch (err) {
      // Network-level failure only (no server reachable, wrong host, CORS): fall back to local demo mode.
      OFFLINE = true;
      toast('No backend detected — switched to local demo mode.', 'error');
      return offlineRoute(path, opts);
    }
    let data = {};
    try { data = await res.json(); } catch {}
    // A 404/405 with no JSON error is a plain static file host with no API behind it.
    if ((res.status === 404 || res.status === 405) && !data.error) {
      OFFLINE = true;
      toast('No backend detected — switched to local demo mode.', 'error');
      return offlineRoute(path, opts);
    }
    if (!res.ok) {
      // A real answer from the server (wrong password, not allowed, validation...): show it, never switch to demo mode.
      if (res.status === 401) doLogout(true);
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  async function detectBackend() {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1800);
      const res = await fetch(API + '/health', { signal: ctrl.signal });
      clearTimeout(t);
      return res.ok;
    } catch { return false; }
  }

  function toast(message, type = 'ok') {
    const stack = $('#toastStack');
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' error' : '');
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3800);
  }

  // ripple click effect on any .ripple element
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.ripple');
    if (!btn) return;
    const circle = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.className = 'ripple-circle';
    circle.style.width = circle.style.height = size + 'px';
    circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
    circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  });

  function animateCount(el, target, prefix = '') {
    const start = 0;
    const dur = 900;
    const t0 = performance.now();
    function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(start + (target - start) * eased);
      el.textContent = prefix + val.toLocaleString('en-NG');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setRing(id, pct) {
    const circle = document.getElementById(id);
    if (!circle) return;
    const circumference = 119;
    const offset = circumference - Math.min(1, pct) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  // ─────────────────────────── loading screen ───────────────────────────
  function runLoadingScreen(cb) {
    const fill = $('#loadBarFill');
    const sub = $('#loadSub');
    const steps = ['Waking up the control room…', 'Connecting to the marketplace…', 'Loading Ekiti LGA data…', 'Almost there…'];
    let i = 0, pct = 0;
    const timer = setInterval(() => {
      pct += 14 + Math.random() * 10;
      if (pct > 100) pct = 100;
      fill.style.width = pct + '%';
      if (i < steps.length) sub.textContent = steps[i++];
      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          $('#loadScreen').style.transition = 'opacity .4s ease';
          $('#loadScreen').style.opacity = '0';
          setTimeout(() => { $('#loadScreen').hidden = true; cb(); }, 400);
        }, 250);
      }
    }, 220);
  }

  // ─────────────────────────── auth flow ───────────────────────────
  async function tryResumeSession() {
    const backendUp = await detectBackend();
    OFFLINE = !backendUp;
    if (OFFLINE) loadOfflineDB(); // make sure the local demo dataset exists

    // One login for both sites: a staff member already logged in on the storefront is let straight in.
    if (!TOKEN) TOKEN = sessionStorage.getItem('bm_admin_token_session') || localStorage.getItem('bm_token') || null;
    if (!TOKEN) return showLogin();
    try {
      const { user } = await api('/auth/me');
      if (!['admin', 'manager', 'staff'].includes(user.role)) { TOKEN = null; return showLogin(); }   // shoppers cannot use the dashboard
      CURRENT_USER = user;
      showDashboard();
    } catch {
      TOKEN = null;
      showLogin();
    }
  }

  function showLogin() {
    $('#loginScreen').hidden = false;
    $('#dashboard').hidden = true;
    switchAuthTab('signin');
    if (window.AOS) AOS.refreshHard();
    buildLoginPulseStrip();
    if (OFFLINE && !showLogin._hinted) {
      showLogin._hinted = true;
      toast('No backend detected — sign in or create an account below; data is saved in this browser only.');
    }
  }

  function buildLoginPulseStrip() {
    const wrap = $('#loginPulseStrip');
    if (!wrap || wrap.dataset.built) return;
    wrap.dataset.built = '1';
    const items = [
      ['16', 'LGAs served'], ['24/7', 'Live tracking'], ['3', 'Staff roles']
    ];
    wrap.innerHTML = items.map(([n, l]) => `
      <div style="background:var(--dark-3);border:1px solid var(--line);border-radius:10px;padding:12px 16px;">
        <div style="font-family:var(--mono);font-size:18px;color:var(--mint);font-weight:700">${n}</div>
        <div style="font-size:11px;color:var(--text-faint)">${l}</div>
      </div>`).join('');
  }

  // ─────────────────────────── auth tabs (sign in / sign up) ───────────────────────────
  function switchAuthTab(tab) {
    const isSignup = tab === 'signup';
    $all('.auth-tab[data-auth-tab]').forEach((t) => t.classList.toggle('active', t.dataset.authTab === tab));
    $('#authTabIndicator').classList.toggle('pos-1', isSignup);
    $('#loginForm').hidden = isSignup;
    $('#signupForm').hidden = !isSignup;
    $('#loginError').hidden = true;
    $('#signupError').hidden = true;
  }
  $all('[data-auth-tab]').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab(el.dataset.authTab); });
  });

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;
    const btn = $('#loginBtn');
    const errBox = $('#loginError');
    errBox.hidden = true;
    btn.disabled = true; btn.querySelector('span').textContent = 'Signing in…';
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, panel: 'admin' }) });
      TOKEN = data.token;
      CURRENT_USER = data.user;
      if ($('#rememberMe').checked) { localStorage.setItem('bm_admin_token', TOKEN); linkStorefront(data); }
      else sessionStorage.setItem('bm_admin_token_session', TOKEN);
      showDashboard();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.hidden = false;
    } finally {
      btn.disabled = false; btn.querySelector('span').textContent = 'Sign in →';
    }
  });

  // "Remember me" also signs the same person in on the storefront (the same account works on both).
  function linkStorefront(data) {
    if (OFFLINE) return;
    try {
      localStorage.setItem('bm_token', data.token);
      localStorage.setItem('bm_session', JSON.stringify({ name: data.user.name, email: data.user.email, phone: data.user.phone || '', role: data.user.role }));
    } catch {}
  }

  // resume from sessionStorage too
  if (!TOKEN) TOKEN = sessionStorage.getItem('bm_admin_token_session') || null;

  $('#pwToggle').addEventListener('click', () => {
    const input = $('#loginPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  // ─────────────────────────── sign up ───────────────────────────
  $all('.role-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      $all('.role-pill').forEach((p) => p.classList.remove('checked'));
      pill.classList.add('checked');
    });
  });

  $('#signupPwToggle').addEventListener('click', () => {
    const input = $('#signupPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4); // 0-4
  }
  const strengthMeta = [
    { pct: 0, color: 'var(--dark-4)', label: 'Password strength' },
    { pct: 25, color: 'var(--danger)', label: 'Weak' },
    { pct: 50, color: 'var(--gold)', label: 'Fair' },
    { pct: 75, color: '#38bdf8', label: 'Good' },
    { pct: 100, color: 'var(--mint)', label: 'Strong' },
  ];
  $('#signupPassword').addEventListener('input', () => {
    const s = passwordStrength($('#signupPassword').value);
    const meta = strengthMeta[s];
    $('#pwStrengthFill').style.width = meta.pct + '%';
    $('#pwStrengthFill').style.background = meta.color;
    $('#pwStrengthLabel').textContent = meta.label;
  });

  $('#signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#signupName').value.trim();
    const email = $('#signupEmail').value.trim();
    const password = $('#signupPassword').value;
    const confirm = $('#signupConfirm').value;
    const role = $('input[name="signupRole"]:checked')?.value || 'staff';
    const btn = $('#signupBtn');
    const errBox = $('#signupError');
    errBox.hidden = true;

    if (!name || !email || !password) { errBox.textContent = 'Please fill in every field.'; errBox.hidden = false; return; }
    if (password.length < 8) { errBox.textContent = 'Password must be at least 8 characters.'; errBox.hidden = false; return; }
    if (password !== confirm) { errBox.textContent = 'Passwords do not match.'; errBox.hidden = false; return; }

    btn.disabled = true; btn.querySelector('span').textContent = 'Creating account…';
    try {
      const data = await api('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password, role, phone: ($('#signupPhone').value || '').trim() }) });
      TOKEN = data.token;
      CURRENT_USER = data.user;
      sessionStorage.setItem('bm_admin_token_session', TOKEN);
      toast(`Welcome to Bouesti Admin, ${data.user.name.split(' ')[0]}!`);
      showDashboard();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.hidden = false;
    } finally {
      btn.disabled = false; btn.querySelector('span').textContent = 'Create account →';
    }
  });

  // Forgot password: a 4-digit code is sent to the email or phone number on the account (recovery.js).
  $('#forgotLink').addEventListener('click', (e) => {
    e.preventDefault();
    BMRecovery.open({
      identifier: $('#loginEmail').value.trim(),
      onDone: (email) => {
        $('#loginEmail').value = email || '';
        $('#loginPassword').value = '';
        $('#loginPassword').focus();
        toast('Password changed. Sign in with your new password.');
      },
    });
  });

  function doLogout(silent) {
    const oldToken = TOKEN;
    if (!silent) api('/auth/logout', { method: 'POST' }).catch(() => {});
    TOKEN = null; CURRENT_USER = null;
    try { if (localStorage.getItem('bm_token') === oldToken) { localStorage.removeItem('bm_token'); localStorage.removeItem('bm_session'); } } catch {}
    localStorage.removeItem('bm_admin_token');
    sessionStorage.removeItem('bm_admin_token_session');
    if (SOCKET) { SOCKET.disconnect(); SOCKET = null; }
    showLogin();
  }
  $('#logoutBtn').addEventListener('click', () => doLogout(false));

  // ─────────────────────────── dashboard shell ───────────────────────────
  function showDashboard() {
    $('#loginScreen').hidden = true;
    $('#dashboard').hidden = false;
    $('#profileName').textContent = CURRENT_USER.name;
    $('#profileRole').textContent = CURRENT_USER.role;
    $('#avatarInitials').textContent = CURRENT_USER.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    connectSocket();
    watchStorefrontActivity();
    initNav();
    loadOverview();
    startClock();
    loadWeather();
    if (window.AOS) AOS.init({ duration: 600, once: true });
  }

  function initNav() {
    $all('.nav-item[data-section]').forEach((btn) => {
      btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });
    $('#burgerBtn').addEventListener('click', () => $('#sidebar').classList.toggle('mobile-open'));
    $('#collapseBtn').addEventListener('click', () => $('#sidebar').classList.toggle('collapsed'));
  }

  const sectionTitles = {
    overview: 'Overview', users: 'User Management', content: 'Content Management', orders: 'Orders',
    sellers: 'Seller Requests', care: 'Customer Care', reports: 'Reports & Analytics', notifications: 'Notifications', security: 'Security', settings: 'Settings & Configuration', logs: 'Activity Logs',
  };
  const loadedSections = new Set(['overview']);

  function switchSection(name) {
    $all('.nav-item[data-section]').forEach((b) => b.classList.toggle('active', b.dataset.section === name));
    $('#sectionTitle').textContent = sectionTitles[name] || name;
    const panels = $all('.panel[data-panel]');
    const target = panels.find((p) => p.dataset.panel === name);
    const current = panels.find((p) => !p.hidden);

    const applyShow = () => {
      panels.forEach((p) => (p.hidden = p !== target));
      if (window.gsap) gsap.fromTo(target, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      if (!loadedSections.has(name)) { loadedSections.add(name); loadSection(name); }
      if (window.AOS) setTimeout(() => AOS.refreshHard(), 50);
    };

    if (window.gsap && current) {
      gsap.to(current, { opacity: 0, y: -8, duration: 0.18, onComplete: applyShow });
    } else applyShow();

    $('#sidebar').classList.remove('mobile-open');
  }

  function loadSection(name) {
    if (name === 'users') loadUsers();
    if (name === 'content') loadAllContent();
    if (name === 'orders') loadOrders();
    if (name === 'sellers') loadSellers();
    if (name === 'care') loadCare();
    if (name === 'reports') loadReports();
    if (name === 'notifications') loadNotifications();
    if (name === 'security') loadSecurity();
    if (name === 'settings') loadSettings();
    if (name === 'logs') loadLogs();
  }

  // ─────────────────────────── clock + weather ───────────────────────────
  function startClock() {
    function tick() {
      $('#liveClock').textContent = new Date().toLocaleTimeString('en-NG', { hour12: false });
    }
    tick(); setInterval(tick, 1000);
  }

  function loadWeather() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        $('#weatherWidget').textContent = `⛅ ${temp}°C`;
      } catch { /* silent — weather is a nice-to-have */ }
    }, () => {}, { timeout: 4000 });
  }

  $('#themeToggle').addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('bm_admin_theme', next);
  });

  // ─────────────────────────── socket.io real-time ───────────────────────────
  function connectSocket() {
    if (!window.io) return; // library failed to load (e.g. offline CDN) — dashboard still works via REST
    SOCKET = io({ auth: { token: TOKEN } });

    SOCKET.on('stats:tick', (payload) => {
      pushPulseTick(payload);
      $('#statRevenue') && animateCount($('#statRevenue'), payload.revenue, '₦');
    });
    SOCKET.on('stats:refresh', () => { if (!$('[data-panel="overview"]').hidden) loadOverview(); });
    SOCKET.on('order:new', (order) => {
      toast(`New order from ${order.customer} — ${fmtMoney(order.total)}`);
      if (!$('[data-panel="orders"]').hidden) loadOrders();
    });
    SOCKET.on('notification:new', (n) => {
      toast(n.title);
      bumpNotifBadge();
      if (!$('[data-panel="notifications"]').hidden) loadNotifications();
    });
    SOCKET.on('log:new', (entry) => prependMiniLog(entry));
    SOCKET.on('users:online', () => {});
    SOCKET.on('settings:theme', ({ theme }) => {
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  // ─────────────────────────── cross-tab live bridge (offline demo) ───────────────────────────
  // When this dashboard is running in local demo mode and the storefront
  // (index.html, typically open in another tab) writes a new order or
  // customer into the same shared localStorage store, the browser fires
  // a native "storage" event here. We use that instead of a real
  // Socket.IO server, so the offline demo still feels genuinely live.
  function watchStorefrontActivity() {
    window.addEventListener('storage', (e) => {
      if (!OFFLINE || e.key !== OFFLINE_KEY || !e.newValue) return;
      toast('New activity from the storefront — dashboard updated.');
      loadOverview();
      const visible = $all('.panel[data-panel]').find((p) => !p.hidden);
      if (visible && visible.dataset.panel !== 'overview') loadSection(visible.dataset.panel);
    });
  }

  function bumpNotifBadge() {
    const badge = $('#navNotifBadge');
    const dot = $('#bellDot');
    const n = (parseInt(badge.textContent, 10) || 0) + 1;
    badge.textContent = n; badge.hidden = false;
    dot.hidden = false;
  }

  function prependMiniLog(entry) {
    const list = $('#miniLog');
    if (!list) return;
    const li = document.createElement('li');
    li.innerHTML = `<b>${entry.user}</b> — ${entry.action}<span class="t">${entry.date} ${entry.time}</span>`;
    list.prepend(li);
    while (list.children.length > 8) list.removeChild(list.lastChild);
  }

  // ─────────────────────────── pulse strip (signature real-time viz) ───────────────────────────
  let lgaLabels = [];
  function ensurePulseBars(labels) {
    const strip = $('#pulseStrip');
    if (strip.dataset.built === labels.join('|')) return;
    strip.dataset.built = labels.join('|');
    strip.innerHTML = labels.map((l) => `<div class="pulse-bar" style="height:6px"><span>${l}</span></div>`).join('');
  }
  function pushPulseTick(payload) {
    if (!lgaLabels.length) return;
    const bars = $all('.pulse-bar', $('#pulseStrip'));
    bars.forEach((bar) => {
      const h = 6 + Math.random() * 90;
      bar.style.height = h + '%';
    });
  }

  // ─────────────────────────── OVERVIEW ───────────────────────────
  async function loadOverview() {
    try {
      const stats = await api('/reports/overview');
      animateCount($('#statUsers'), stats.totalUsers);
      animateCount($('#statOrders'), stats.totalOrders);
      animateCount($('#statRevenue'), stats.revenue, '₦');
      animateCount($('#statProducts'), stats.activeProducts);
      animateCount($('#statPending'), stats.pendingDeliveries);
      animateCount($('#statNotif'), stats.notifications);
      animateCount($('#statSellers'), stats.sellerRequests || 0);
      if (stats.sellerRequests > 0) { $('#navSellerBadge').hidden = false; $('#navSellerBadge').textContent = stats.sellerRequests; }
      setCareBadge(stats.openComplaints || 0);
      setRing('ringUsers', Math.min(1, stats.totalUsers / 50));
      setRing('ringOrders', Math.min(1, stats.totalOrders / 50));
      setRing('ringRevenue', Math.min(1, stats.revenue / 1000000));
      setRing('ringProducts', Math.min(1, stats.activeProducts / 20));
      setRing('ringPending', Math.min(1, stats.pendingDeliveries / 20));
      setRing('ringNotif', Math.min(1, stats.notifications / 10));
      if (stats.notifications > 0) { $('#navNotifBadge').hidden = false; $('#navNotifBadge').textContent = stats.notifications; $('#bellDot').hidden = false; }
    } catch (err) { toast(err.message, 'error'); }

    try {
      const lga = await api('/reports/lga-distribution');
      lgaLabels = lga.labels;
      ensurePulseBars(lga.labels);
      const max = Math.max(1, ...lga.values);
      $all('.pulse-bar', $('#pulseStrip')).forEach((bar, i) => {
        bar.style.height = Math.max(6, (lga.values[i] / max) * 100) + '%';
      });
    } catch {}

    try {
      const rev = await api('/reports/revenue');
      renderChart('chartRevenue', 'line', rev.labels, [{ label: 'Revenue', data: rev.values, color: '#02f5a1' }]);
    } catch {}

    try {
      const logs = await api('/logs?pageSize=8');
      $('#miniLog').innerHTML = logs.items.map((l) => `<li><b>${esc(l.user)}</b> — ${esc(l.action)}<span class="t">${l.date} ${l.time}</span></li>`).join('') || '<li>No activity yet.</li>';
    } catch {}
  }

  // Chart.js (about 200 KB, from a CDN) is fetched only when a chart is first needed, so it never delays login or navigation.
  const chartQueue = [];
  let chartLoading = false;
  function renderChart(canvasId, type, labels, series) {
    if (!window.Chart) {
      chartQueue.push([canvasId, type, labels, series]);
      if (!chartLoading) {
        chartLoading = true;
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.3/chart.umd.min.js';
        s.async = true;
        s.onload = () => chartQueue.splice(0).forEach((args) => renderChart(...args));
        s.onerror = () => { chartQueue.length = 0; };
        document.head.appendChild(s);
      }
      return;
    }
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (charts[canvasId]) charts[canvasId].destroy();
    const gridColor = 'rgba(255,255,255,0.06)';
    const textColor = getComputedStyle(document.body).color;
    charts[canvasId] = new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: series.map((s) => ({
          label: s.label,
          data: s.data,
          borderColor: s.color,
          backgroundColor: type === 'line' ? hexToRgba(s.color, 0.15) : (Array.isArray(s.color) ? s.color : hexToRgba(s.color, 0.7)),
          fill: type === 'line',
          tension: 0.4,
          borderWidth: 2,
          borderRadius: type === 'bar' ? 6 : 0,
          pointRadius: type === 'line' ? 2 : 0,
        })),
      },
      options: {
        responsive: true,
        plugins: { legend: { display: series.length > 1, labels: { color: textColor } } },
        scales: type === 'doughnut' || type === 'pie' ? {} : {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
      },
    });
  }
  function hexToRgba(hex, a) {
    if (Array.isArray(hex)) return hex;
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ─────────────────────────── USERS ───────────────────────────
  let usersPage = 1;
  async function loadUsers() {
    const skel = $('#usersSkeleton');
    skel.classList.add('show');
    skel.innerHTML = Array.from({ length: 5 }).map(() => '<div class="skel-line"></div>').join('');
    try {
      const q = new URLSearchParams({ search: $('#userSearch').value, role: $('#userRoleFilter').value, page: usersPage, pageSize: 8 });
      const data = await api('/users?' + q.toString());
      $('#usersTable tbody').innerHTML = data.items.map((u) => `
        <tr>
          <td>${esc(u.name)}</td><td>${esc(u.email)}</td>
          <td><span class="badge ${u.role}">${u.role}</span></td>
          <td><span class="badge ${u.status}">${u.status}</span></td>
          <td>${u.lastLogin ? fmtDate(u.lastLogin) : '—'}</td>
          <td><div class="row-actions">
            <button data-edit-user="${u.id}" title="Edit">✎</button>
            <button data-suspend-user="${u.id}" title="Suspend/Reactivate">⏸</button>
            <button class="danger" data-delete-user="${u.id}" title="Delete">🗑</button>
          </div></td>
        </tr>`).join('') || '<tr><td colspan="6" class="muted">No users found.</td></tr>';
      renderPagination('usersPagination', data.page, data.totalPages, (p) => { usersPage = p; loadUsers(); });
    } catch (err) { toast(err.message, 'error'); }
    finally { skel.classList.remove('show'); }
  }
  $('#userSearch').addEventListener('input', debounce(() => { usersPage = 1; loadUsers(); }, 350));
  $('#userRoleFilter').addEventListener('change', () => { usersPage = 1; loadUsers(); });

  $('#usersTable').addEventListener('click', async (e) => {
    const editId = e.target.dataset.editUser;
    const suspendId = e.target.dataset.suspendUser;
    const deleteId = e.target.dataset.deleteUser;
    if (editId) openUserModal(editId);
    if (suspendId) {
      try { await api(`/users/${suspendId}/suspend`, { method: 'PATCH' }); toast('User status updated'); loadUsers(); }
      catch (err) { toast(err.message, 'error'); }
    }
    if (deleteId) {
      if (!confirm('Delete this user? This cannot be undone.')) return;
      try { await api(`/users/${deleteId}`, { method: 'DELETE' }); toast('User deleted'); loadUsers(); }
      catch (err) { toast(err.message, 'error'); }
    }
  });

  function openUserModal(id) {
    const modal = $('#userModal');
    modal.hidden = false;
    $('#userModalId').value = id || '';
    $('#userModalTitle').textContent = id ? 'Edit user' : 'Add user';
    $('#userModalPassword').value = '';
    $('#userPwHint').style.display = id ? 'inline' : 'none';
    if (id) {
      api(`/users?search=&page=1&pageSize=999`).then((data) => {
        const u = data.items.find((x) => x.id === id);
        if (u) { $('#userModalName').value = u.name; $('#userModalEmail').value = u.email; $('#userModalRole').value = u.role; }
      });
    } else {
      $('#userModalName').value = ''; $('#userModalEmail').value = ''; $('#userModalRole').value = 'customer';
    }
  }
  $('#addUserBtn').addEventListener('click', () => openUserModal(null));
  $('#userModalCancel').addEventListener('click', () => $('#userModal').hidden = true);
  $('#userModalSave').addEventListener('click', async () => {
    const id = $('#userModalId').value;
    const body = { name: $('#userModalName').value.trim(), email: $('#userModalEmail').value.trim(), role: $('#userModalRole').value };
    const pw = $('#userModalPassword').value;
    if (pw) body.password = pw;
    if (!body.name || !body.email || (!id && !pw)) return toast('Please fill all required fields', 'error');
    try {
      if (id) await api(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await api('/users', { method: 'POST', body: JSON.stringify(body) });
      toast('User saved');
      $('#userModal').hidden = true;
      loadUsers();
    } catch (err) { toast(err.message, 'error'); }
  });

  // ─────────────────────────── CONTENT ───────────────────────────
  $('#contentTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    $all('.tab', $('#contentTabs')).forEach((t) => t.classList.toggle('active', t === btn));
    $all('.tab-panel').forEach((p) => (p.hidden = p.dataset.tabpanel !== btn.dataset.tab));
  });

  async function loadAllContent() {
    loadProductList('produce');
    loadProductList('livestock');
    loadProductList('insurance');
    loadBanners();
    loadDeliveryInfo();
    loadContactInfo();
  }

  async function loadProductList(cat, search = '') {
    try {
      const q = new URLSearchParams({ category: cat, search });
      const data = await api('/content/products?' + q.toString());
      const list = $(`[data-list="${cat}"]`);
      list.innerHTML = data.items.map((p) => `
        <div class="prod-card" data-aos="fade-up">
          <h4>${esc(p.title)}</h4>
          <div class="price">${fmtMoney(p.price)}${p.unit ? ' / ' + esc(U.name(p.unit)) : ''}${p.processedPrice ? ' · processed ' + fmtMoney(p.processedPrice) : ''}</div>
          <div class="meta">${p.group ? esc(p.group) + ' · ' : ''}Stock: ${p.stock} ${esc(U.name(p.unit, p.stock))}${p.measures && p.measures.length ? ' \u00b7 ' + esc(p.measures.map((m) => m.label).join(', ')) : ''} · <span class="badge ${p.status}">${p.status}</span></div>
          <div class="actions">
            <button class="btn-ghost" data-edit-prod="${p.id}" data-cat="${cat}">Edit</button>
            <button class="btn-ghost" data-publish-prod="${p.id}">${p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
            <button class="btn-ghost" data-delete-prod="${p.id}">Delete</button>
          </div>
        </div>`).join('') || '<p class="muted">Nothing here yet.</p>';
    } catch (err) { toast(err.message, 'error'); }
  }

  $all('.prod-search').forEach((input) => {
    input.addEventListener('input', debounce(() => loadProductList(input.dataset.cat, input.value), 350));
  });
  $all('[data-add]').forEach((btn) => btn.addEventListener('click', () => openProductModal(null, btn.dataset.add)));

  document.addEventListener('click', async (e) => {
    const editId = e.target.dataset.editProd;
    const pubId = e.target.dataset.publishProd;
    const delId = e.target.dataset.deleteProd;
    if (editId) openProductModal(editId, e.target.dataset.cat);
    if (pubId) { try { await api(`/content/products/${pubId}/publish`, { method: 'PATCH' }); toast('Status updated'); loadAllContent(); } catch (err) { toast(err.message, 'error'); } }
    if (delId) { if (confirm('Delete this item?')) { try { await api(`/content/products/${delId}`, { method: 'DELETE' }); toast('Deleted'); loadAllContent(); } catch (err) { toast(err.message, 'error'); } } }
  });

  // Where each kind of item appears on the website (the "Group" of the item).
  const PRODUCT_GROUPS = {
    produce: [['tubers', 'Tubers & Roots'], ['grains', 'Grains & Cereals'], ['legumes', 'Legumes, Beans & Oilseeds'], ['fruits', 'Fruits & Nuts'], ['vegetables', 'Vegetables'], ['spices', 'Spices, Herbs & Seasonings'], ['processed', 'Processed Produce']],
    livestock: [['livestock', 'Livestock & Animal Products'], ['poultry', 'Poultry Products'], ['fish', 'Fish & Aquaculture']],
    insurance: [],
  };

  function fillProductModal(p, cat) {
    const groups = PRODUCT_GROUPS[cat] || [];
    $('#productModalGroup').innerHTML = groups.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    $('#productExtra').hidden = cat === 'insurance';
    $('#productModalName').value = p ? p.title : '';
    $('#productModalPrice').value = p ? p.price : '';
    $('#productModalStock').value = p ? p.stock : '';
    $('#productModalGroup').value = p && p.group ? p.group : (groups[0] ? groups[0][0] : '');
    fillUnitSelect(p ? p.unit : 'kg');
    $('#productModalDesc').value = p ? (p.description || '') : '';
    $('#productModalMeasures').value = p ? measureLines(p.measures) : '';
    previewMeasures();
    $('#productModalProcessed').value = p && p.processedPrice ? p.processedPrice : '';
    $('#productModalImage').value = p ? (p.imageKey || '') : '';
  }

  function openProductModal(id, cat) {
    $('#productModal').hidden = false;
    $('#productModalId').value = id || '';
    $('#productModalCat').value = cat;
    $('#productModalTitle').textContent = id ? 'Edit item' : 'Add item';
    fillProductModal(null, cat);
    if (id) {
      api(`/content/products?category=${cat}`).then((data) => {
        const p = data.items.find((x) => String(x.id) === String(id));
        if (p) fillProductModal(p, cat);
      });
    }
  }
  $('#productModalCancel').addEventListener('click', () => $('#productModal').hidden = true);
  $('#productModalMeasures').addEventListener('input', previewMeasures);
  $('#productModalUnit').addEventListener('change', previewMeasures);
  $('#productModalSave').addEventListener('click', async () => {
    const id = $('#productModalId').value;
    const cat = $('#productModalCat').value;
    const body = {
      category: cat, title: $('#productModalName').value.trim(), price: Number($('#productModalPrice').value), stock: Number($('#productModalStock').value),
      group: $('#productModalGroup').value, unit: $('#productModalUnit').value, description: $('#productModalDesc').value.trim(),
      measures: parseMeasureLines($('#productModalMeasures').value),
      processedPrice: Number($('#productModalProcessed').value) || 0, imageKey: $('#productModalImage').value.trim(),
    };
    if (!id) body.status = 'published';
    if (!body.title || (!body.price && cat !== 'insurance')) return toast('Title and price are required', 'error');
    try {
      if (id) await api(`/content/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await api('/content/products', { method: 'POST', body: JSON.stringify(body) });
      toast('Saved'); $('#productModal').hidden = true; loadAllContent();
    } catch (err) { toast(err.message, 'error'); }
  });

  async function loadBanners() {
    try {
      const data = await api('/content/banners');
      $('[data-list="banners"]').innerHTML = data.items.map((b) => `
        <div class="prod-card">
          <h4>${esc(b.title)}</h4>
          <div class="meta">${esc(b.subtitle || '')}</div>
          <div class="meta"><span class="badge ${b.status}">${b.status}</span></div>
          <div class="actions">
            <button class="btn-ghost" data-banner-publish="${b.id}" data-status="${b.status}">${b.status === 'published' ? 'Unpublish' : 'Publish'}</button>
            <button class="btn-ghost" data-banner-delete="${b.id}">Delete</button>
          </div>
        </div>`).join('') || '<p class="muted">No banners yet.</p>';
    } catch (err) { toast(err.message, 'error'); }
  }
  function openBannerModal() {
    $('#bannerTitle').value = '';
    $('#bannerSubtitle').value = '';
    $('#bannerModal').hidden = false;
    $('#bannerTitle').focus();
  }
  function closeBannerModal() { $('#bannerModal').hidden = true; }
  $('#addBannerBtn').addEventListener('click', openBannerModal);
  $('#bannerModalCancel').addEventListener('click', closeBannerModal);
  $('#bannerModalSave').addEventListener('click', async () => {
    const title = $('#bannerTitle').value.trim();
    const subtitle = $('#bannerSubtitle').value.trim();
    if (!title) return toast('Title is required', 'error');
    try {
      await api('/content/banners', { method: 'POST', body: JSON.stringify({ title, subtitle }) });
      toast('Banner added');
      closeBannerModal();
      loadBanners();
    } catch (err) { toast(err.message, 'error'); }
  });
  // Allow Enter-to-submit while typing in the banner form
  ['bannerTitle', 'bannerSubtitle'].forEach((id) => {
    $('#' + id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); $('#bannerModalSave').click(); }
    });
  });
  document.addEventListener('click', async (e) => {
    const pubId = e.target.dataset.bannerPublish;
    const delId = e.target.dataset.bannerDelete;
    if (pubId) {
      const status = e.target.dataset.status === 'published' ? 'draft' : 'published';
      try { await api(`/content/banners/${pubId}`, { method: 'PUT', body: JSON.stringify({ status }) }); loadBanners(); } catch (err) { toast(err.message, 'error'); }
    }
    if (delId) { if (confirm('Delete this banner?')) { try { await api(`/content/banners/${delId}`, { method: 'DELETE' }); loadBanners(); } catch (err) { toast(err.message, 'error'); } } }
  });

  // Delivery states: fee per state, on/off, and new states can be added.
  function stateRow(st) {
    return `<div class="state-row" data-state="${esc(st.name)}">
      <span class="state-name">${esc(st.name)}</span>
      <input type="number" class="state-fee" min="0" value="${Number(st.fee) || 0}">
      <label><input type="checkbox" class="state-on" ${st.enabled !== false ? 'checked' : ''}> On</label>
      ${st.name === 'Ekiti' ? '' : '<button type="button" class="btn-ghost" data-remove-state title="Remove">×</button>'}
    </div>`;
  }
  function readStates() {
    return $all('#deliveryStates .state-row').map((row) => ({
      name: row.dataset.state, fee: Number($('.state-fee', row).value) || 0, enabled: $('.state-on', row).checked,
    }));
  }
  async function loadDeliveryInfo() {
    try {
      const { deliveryFees } = await api('/content/delivery-info');
      const base = deliveryFees?.base || 0;
      $('#deliveryBase').value = base;
      // Older data (or demo mode) only has a base fee: build the default list from it.
      const states = deliveryFees?.states || [['Ekiti', 1], ['Osun', 2], ['Ondo', 2], ['Kwara', 2], ['Kogi', 2], ['Edo', 2.5], ['Ogun', 2.5]]
        .map(([name, m]) => ({ name, fee: Math.round(base * m), enabled: true }));
      $('#deliveryStates').innerHTML = states.map(stateRow).join('');
    } catch {}
  }
  $('#deliveryBase').addEventListener('input', () => {
    const ekiti = $('#deliveryStates .state-row[data-state="Ekiti"] .state-fee');
    if (ekiti) ekiti.value = $('#deliveryBase').value;
  });
  $('#addStateBtn').addEventListener('click', () => {
    const name = $('#newStateName').value.trim();
    if (!name) return toast('Type the state name first', 'error');
    if (readStates().some((x) => x.name.toLowerCase() === name.toLowerCase())) return toast('That state is already in the list', 'error');
    $('#deliveryStates').insertAdjacentHTML('beforeend', stateRow({ name, fee: Number($('#newStateFee').value) || 0, enabled: true }));
    $('#newStateName').value = ''; $('#newStateFee').value = '';
  });
  $('#deliveryStates').addEventListener('click', (e) => {
    if (e.target.matches('[data-remove-state]')) e.target.closest('.state-row').remove();
  });
  $('#deliveryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const states = readStates();
    const ekiti = states.find((x) => x.name === 'Ekiti');
    if (ekiti) ekiti.fee = Number($('#deliveryBase').value) || ekiti.fee;
    try { await api('/content/delivery-info', { method: 'PUT', body: JSON.stringify({ deliveryFees: { base: Number($('#deliveryBase').value), states } }) }); toast('Delivery info saved'); loadDeliveryInfo(); }
    catch (err) { toast(err.message, 'error'); }
  });

  async function loadContactInfo() {
    try {
      const { contact } = await api('/content/contact-info');
      $('#contactEmail').value = contact?.email || ''; $('#contactPhone').value = contact?.phone || ''; $('#contactAddress').value = contact?.address || '';
    } catch {}
  }
  $('#contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const contact = { email: $('#contactEmail').value.trim(), phone: $('#contactPhone').value.trim(), address: $('#contactAddress').value.trim() };
    try { await api('/content/contact-info', { method: 'PUT', body: JSON.stringify({ contact }) }); toast('Contact info saved'); }
    catch (err) { toast(err.message, 'error'); }
  });

  // ─────────────────────────── ORDERS ───────────────────────────
  let ordersPage = 1;
  async function loadOrders() {
    try {
      const q = new URLSearchParams({ status: $('#orderStatusFilter').value, page: ordersPage, pageSize: 8 });
      const data = await api('/orders?' + q.toString());
      $('#ordersTable tbody').innerHTML = data.items.map((o) => `
        <tr>
          <td class="mono">${esc(o.ref || '—')}</td><td>${esc(o.customer)}</td><td>${esc(o.lga || '—')}</td><td>${o.items}</td><td>${fmtMoney(o.total)}</td>
          <td><span class="badge ${o.status}">${o.status}</span></td><td>${fmtDate(o.createdAt)}</td>
          <td><button class="btn-ghost" data-order-view="${esc(o.id)}" style="margin-right:6px">View</button><a class="btn-ghost" href="track.html?ref=${encodeURIComponent(o.ref || '')}" target="_blank" rel="noopener" style="margin-right:6px;text-decoration:none">📍 Track</a><select data-order-status="${o.id}">
            ${['pending', 'processing', 'delivered', 'cancelled'].map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select></td>
        </tr>`).join('') || '<tr><td colspan="8" class="muted">No orders found.</td></tr>';
      renderPagination('ordersPagination', data.page, data.totalPages, (p) => { ordersPage = p; loadOrders(); });
    } catch (err) { toast(err.message, 'error'); }
  }
  $('#ordersTable').addEventListener('click', (e) => {
    const id = e.target.dataset.orderView;
    if (id) openOrderModal(id);
  });

  // Order details + GPS tools
  let openOrderId = null;
  async function openOrderModal(id) {
    try {
      const { order: o } = await api(`/orders/${id}`);
      openOrderId = id;
      $('#orderModalTitle').textContent = `Order ${o.ref || ''}`;
      $('#orderModalTrack').href = `track.html?ref=${encodeURIComponent(o.ref || '')}`;
      $('#orderModalReceipt').href = `receipt.html?ref=${encodeURIComponent(o.ref || '')}`;
      const rows = (o.items || []).map((i) => `<tr><td>${esc(i.name)}${i.mode ? ' · ' + esc(i.mode) : ''}${i.measure ? ' · ' + esc(i.measure) : (i.weightKg ? ' · ' + i.weightKg + ' kg' : '')}</td><td>${i.qty}</td><td>${fmtMoney(i.lineTotal)}</td></tr>`).join('');
      const last = o.lastLocation ? `Last location: ${o.lastLocation.lat.toFixed(5)}, ${o.lastLocation.lng.toFixed(5)} (${fmtDate(o.lastLocation.at)})` : 'No GPS location shared yet.';
      $('#orderModalBody').innerHTML = `
        <p><b>${esc(o.customer)}</b> · ${esc(o.phone || '—')}</p>
        <p>${esc(o.address || '')}, ${esc(o.lga || '')}${o.state ? ', ' + esc(o.state) : ''}</p>
        <p>Payment: ${esc(o.payMethod || '—')} (${esc(o.paymentStatus || '—')}) · Delivery date: ${esc(o.deliveryDate || '—')} · Status: <span class="badge ${esc(o.status)}">${esc(o.status)}</span></p>
        <table class="data-table"><thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="3" class="muted">No item details.</td></tr>'}</tbody></table>
        <p>Subtotal ${fmtMoney(o.subtotal)} · Service fee ${fmtMoney(o.serviceFee)} · Delivery ${fmtMoney(o.deliveryFee)}<br><b>Total ${fmtMoney(o.total)}</b></p>
        <h4>GPS tracking</h4>
        <p class="muted" id="gpsLast">${last}</p>
        <div class="gps-tools">
          <button type="button" class="btn-ghost" id="gpsShare">📍 Use my current location</button>
          <input id="gpsLat" placeholder="Latitude"><input id="gpsLng" placeholder="Longitude">
          <button type="button" class="btn-ghost" id="gpsSend">Send</button>
        </div>
        <p class="muted">Phone GPS only works on https:// or localhost; otherwise type the coordinates.</p>`;
      $('#orderModal').hidden = false;
    } catch (err) { toast(err.message, 'error'); }
  }
  async function sendGps(lat, lng) {
    if (!(lat >= -90 && lat <= 90) || !(lng >= -180 && lng <= 180)) return toast('Enter valid coordinates', 'error');
    try {
      await api(`/orders/${openOrderId}/location`, { method: 'POST', body: JSON.stringify({ lat, lng }) });
      toast('Location sent'); $('#gpsLast').textContent = `Last location: ${lat.toFixed(5)}, ${lng.toFixed(5)} (just now)`; loadOrders();
    } catch (err) { toast(err.message, 'error'); }
  }
  $('#orderModal').addEventListener('click', (e) => {
    if (e.target.id === 'gpsSend') sendGps(parseFloat($('#gpsLat').value), parseFloat($('#gpsLng').value));
    if (e.target.id === 'gpsShare') {
      if (!navigator.geolocation) return toast('This browser has no GPS support', 'error');
      navigator.geolocation.getCurrentPosition((pos) => sendGps(pos.coords.latitude, pos.coords.longitude), (err) => toast('GPS error: ' + err.message, 'error'), { enableHighAccuracy: true });
    }
    if (e.target.id === 'orderModal') $('#orderModal').hidden = true;
  });
  $('#orderModalClose').addEventListener('click', () => { $('#orderModal').hidden = true; });

  // ─────────────────────────── SELLER REQUESTS ───────────────────────────
  let sellersPage = 1;
  async function loadSellers() {
    try {
      const q = new URLSearchParams({ status: $('#sellerStatusFilter').value, page: sellersPage, pageSize: 10 });
      const data = await api('/listing-requests?' + q.toString());
      $('#sellersTable tbody').innerHTML = data.items.map((r) => {
        const digits = String(r.phone).replace(/\D/g, '').replace(/^0/, '234');
        return `<tr>
          <td>${esc(r.name)}${r.email ? '<br><span class="muted">' + esc(r.email) + '</span>' : ''}</td>
          <td>${esc(r.phone)}</td>
          <td>${esc(r.whatSells)}${r.message ? '<br><span class="muted">' + esc(r.message) + '</span>' : ''}</td>
          <td>${esc(r.location || '—')}</td><td>${fmtDate(r.createdAt)}</td>
          <td><select data-seller-status="${r.id}">${['new', 'contacted', 'approved', 'rejected'].map((x) => `<option value="${x}" ${x === r.status ? 'selected' : ''}>${x}</option>`).join('')}</select></td>
          <td><a class="btn-ghost" href="https://wa.me/${digits}" target="_blank" rel="noopener" style="text-decoration:none">WhatsApp</a>
              <button class="btn-ghost" data-seller-delete="${r.id}">Delete</button></td>
        </tr>`;
      }).join('') || '<tr><td colspan="7" class="muted">No seller requests yet.</td></tr>';
      renderPagination('sellersPagination', data.page, data.totalPages, (p) => { sellersPage = p; loadSellers(); });
    } catch (err) { toast(err.message, 'error'); }
  }
  $('#sellerStatusFilter').addEventListener('change', () => { sellersPage = 1; loadSellers(); });
  $('#sellersTable').addEventListener('change', async (e) => {
    const id = e.target.dataset.sellerStatus;
    if (!id) return;
    try { await api(`/listing-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) }); toast('Request updated'); }
    catch (err) { toast(err.message, 'error'); }
  });
  $('#sellersTable').addEventListener('click', async (e) => {
    const id = e.target.dataset.sellerDelete;
    if (id && confirm('Delete this request?')) {
      try { await api(`/listing-requests/${id}`, { method: 'DELETE' }); loadSellers(); } catch (err) { toast(err.message, 'error'); }
    }
  });

  // ─────────────────────────── CUSTOMER CARE (complaints + AI chat transcripts) ───────────────────────────
  let carePage = 1;
  let careCategoriesLoaded = false;
  let careOpenId = null;
  const careStatusLabel = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed' };
  const careChip = (cls, text) => `<span class="care-chip ${esc(cls)}">${esc(text)}</span>`;

  function careWhatsApp(phone) {
    const d = String(phone || '').replace(/\D/g, '').replace(/^0/, '234');
    return d ? 'https://wa.me/' + d : '#';
  }

  async function loadCare() {
    const chats = $('#careView').value === 'chats';
    $('#careComplaintsWrap').hidden = chats;
    $('#careChatsWrap').hidden = !chats;
    $('#careStatusFilter').hidden = chats;
    $('#careCategoryFilter').hidden = chats;
    $('#careSearch').hidden = chats;
    try {
      if (chats) {
        const data = await api('/chats?' + new URLSearchParams({ page: carePage, pageSize: 10 }).toString());
        $('#careChatTable tbody').innerHTML = data.items.map((c) => `<tr>
          <td>${esc(c.who)}</td><td>${c.messageCount}</td><td>${esc(c.lastMessage || '—').slice(0, 90)}</td>
          <td>${c.complaintRef ? esc(c.complaintRef) : '<span class="muted">—</span>'}</td><td>${fmtDate(c.updatedAt)}</td>
          <td><button class="btn-ghost" data-care-chat="${esc(c.id)}">View chat</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">No chats yet.</td></tr>';
        renderPagination('carePagination', data.page, data.totalPages, (p) => { carePage = p; loadCare(); });
        return;
      }
      const q = new URLSearchParams({ status: $('#careStatusFilter').value, category: $('#careCategoryFilter').value, q: $('#careSearch').value.trim(), page: carePage, pageSize: 10 });
      const data = await api('/complaints?' + q.toString());
      if (!careCategoriesLoaded && data.categories) {
        careCategoriesLoaded = true;
        $('#careCategoryFilter').innerHTML = '<option value="">All categories</option>' + data.categories.map((c) => `<option value="${esc(c.key)}">${esc(c.label)}</option>`).join('');
      }
      const k = data.counts;
      $('#careCounts').innerHTML = [['Open', k.open], ['In progress', k.in_progress], ['Resolved', k.resolved], ['Closed', k.closed], ['Total', k.total]]
        .map(([l, n]) => `<div class="care-count"><b>${n}</b>${l}</div>`).join('');
      setCareBadge(k.open + k.in_progress);
      $('#careTable tbody').innerHTML = data.items.map((c) => `<tr>
        <td><b>${esc(c.ref)}</b>${c.source === 'chat' ? '<br><span class="muted">from AI chat</span>' : ''}</td>
        <td>${esc(c.name)}<br><span class="muted">${esc(c.phone || c.email)}</span></td>
        <td>${esc(c.categoryLabel)}${c.orderRef ? ' · ' + esc(c.orderRef) : ''}<br><span class="muted">${esc(c.message).slice(0, 80)}${c.message.length > 80 ? '…' : ''}</span></td>
        <td>${careChip(c.priority, c.priority)}</td><td>${careChip(c.status, careStatusLabel[c.status] || c.status)}</td>
        <td>${fmtDate(c.createdAt)}</td>
        <td><button class="btn-ghost" data-care-open="${c.id}">Open</button></td></tr>`).join('') || '<tr><td colspan="7" class="muted">No complaints found.</td></tr>';
      renderPagination('carePagination', data.page, data.totalPages, (p) => { carePage = p; loadCare(); });
    } catch (err) { toast(err.message, 'error'); }
  }

  function setCareBadge(n) {
    const b = $('#navCareBadge');
    if (!b) return;
    b.hidden = !(n > 0);
    b.textContent = n;
  }

  function renderCareModal(d) {
    const c = d.complaint;
    careOpenId = c.id;
    $('#careModalTitle').textContent = 'Complaint ' + c.ref;
    $('#careModalWa').href = careWhatsApp(c.phone);
    $('#careModalWa').hidden = !c.phone;
    const opts = (list, cur) => list.map((x) => `<option value="${x}" ${x === cur ? 'selected' : ''}>${careStatusLabel[x] || x}</option>`).join('');
    $('#careModalBody').innerHTML = `
      <div class="care-meta">
        <div><span>Customer</span>${esc(c.name)}</div><div><span>Phone</span>${esc(c.phone || '—')}</div><div><span>Email</span>${esc(c.email || '—')}</div>
        <div><span>Order reference</span>${esc(c.orderRef || '—')}</div><div><span>Category</span>${esc(c.categoryLabel)}</div>
        <div><span>Logged</span>${fmtDate(c.createdAt)} · ${c.source === 'chat' ? 'AI chat' : 'form'}</div>
      </div>
      <div class="care-meta">
        <div><span>Status</span><select id="careSetStatus">${opts(['open', 'in_progress', 'resolved', 'closed'], c.status)}</select></div>
        <div><span>Priority</span><select id="careSetPriority">${['low', 'normal', 'high', 'urgent'].map((x) => `<option value="${x}" ${x === c.priority ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      </div>
      <div class="care-thread">${d.messages.map((m) => `<div class="care-bub ${m.sender}">${esc(m.body)}<small>${esc(m.sender === 'staff' ? m.senderName : c.name)} · ${fmtDate(m.createdAt)}</small></div>`).join('')}</div>
      <label>Reply to customer <span class="muted">(they see it under “Track a complaint” on the website)</span></label>
      <textarea id="careReplyText" placeholder="Type your reply…"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button class="btn-primary ripple" id="careSendReply">Send reply</button>
        <button class="btn-ghost" id="careSendResolve">Send &amp; mark resolved</button>
        <button class="btn-ghost" id="careSaveMeta">Save status / priority</button>
      </div>
      ${d.chat && d.chat.length ? `<details style="margin-top:14px"><summary>Chat with the assistant before this complaint (${d.chat.length} messages)</summary>
        <div class="care-thread care-chat">${d.chat.map((m) => `<div class="care-bub ${m.role}">${esc(m.body)}</div>`).join('')}</div></details>` : ''}`;
    $('#careModal').hidden = false;
  }

  async function openCare(id) {
    try { renderCareModal(await api('/complaints/' + id)); } catch (err) { toast(err.message, 'error'); }
  }

  async function careReply(markResolved) {
    const msg = $('#careReplyText').value.trim();
    if (msg.length < 2) { toast('Type a reply first', 'error'); return; }
    try {
      const d = await api(`/complaints/${careOpenId}/reply`, { method: 'POST', body: JSON.stringify({ message: msg, status: markResolved ? 'resolved' : undefined }) });
      renderCareModal(d); toast('Reply sent'); loadCare();
    } catch (err) { toast(err.message, 'error'); }
  }

  $('#careView').addEventListener('change', () => { carePage = 1; loadCare(); });
  $('#careStatusFilter').addEventListener('change', () => { carePage = 1; loadCare(); });
  $('#careCategoryFilter').addEventListener('change', () => { carePage = 1; loadCare(); });
  let careTimer = null;
  $('#careSearch').addEventListener('input', () => { clearTimeout(careTimer); careTimer = setTimeout(() => { carePage = 1; loadCare(); }, 300); });
  $('#careTable').addEventListener('click', (e) => { const id = e.target.dataset.careOpen; if (id) openCare(id); });
  $('#careChatTable').addEventListener('click', async (e) => {
    const id = e.target.dataset.careChat;
    if (!id) return;
    try {
      const d = await api('/chats/' + encodeURIComponent(id));
      careOpenId = null;
      $('#careModalTitle').textContent = 'Chat with ' + d.who + (d.complaintRef ? ' · ' + d.complaintRef : '');
      $('#careModalWa').hidden = true;
      $('#careModalBody').innerHTML = `<div class="care-thread care-chat" style="max-height:420px">${d.messages.map((m) => `<div class="care-bub ${m.role}">${esc(m.body)}<small>${m.role === 'bot' ? 'Assistant' + (m.source === 'claude' ? ' (AI)' : '') : esc(d.who)} · ${fmtDate(m.createdAt)}</small></div>`).join('')}</div>`;
      $('#careModal').hidden = false;
    } catch (err) { toast(err.message, 'error'); }
  });
  $('#careModal').addEventListener('click', async (e) => {
    if (e.target.id === 'careSendReply') careReply(false);
    if (e.target.id === 'careSendResolve') careReply(true);
    if (e.target.id === 'careSaveMeta') {
      try {
        renderCareModal(await api('/complaints/' + careOpenId, { method: 'PATCH', body: JSON.stringify({ status: $('#careSetStatus').value, priority: $('#careSetPriority').value }) }));
        toast('Saved'); loadCare();
      } catch (err) { toast(err.message, 'error'); }
    }
  });
  $('#careModalClose').addEventListener('click', () => { $('#careModal').hidden = true; });
  $('#careModal').addEventListener('mousedown', (e) => { if (e.target.id === 'careModal') $('#careModal').hidden = true; });
  $('#careModalDelete').addEventListener('click', async () => {
    if (!careOpenId || !confirm('Delete this complaint and its replies for good?')) return;
    try { await api('/complaints/' + careOpenId, { method: 'DELETE' }); $('#careModal').hidden = true; toast('Complaint deleted'); loadCare(); } catch (err) { toast(err.message, 'error'); }
  });
  // keep the sidebar badge fresh while the dashboard is open
  setInterval(() => { api('/reports/overview').then((s) => setCareBadge(s.openComplaints || 0)).catch(() => {}); }, 45000);

  $('#orderStatusFilter').addEventListener('change', () => { ordersPage = 1; loadOrders(); });
  $('#ordersTable').addEventListener('change', async (e) => {
    const id = e.target.dataset.orderStatus;
    if (!id) return;
    try { await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) }); toast('Order updated'); }
    catch (err) { toast(err.message, 'error'); }
  });

  // ─────────────────────────── REPORTS ───────────────────────────
  async function loadReports() {
    try { const s = await api('/reports/sales'); renderChart('chartSales', 'bar', s.labels, [{ label: 'Orders', color: '#38bdf8', data: s.values }]); } catch {}
    try {
      const p = await api('/reports/product-performance');
      renderChart('chartProductPerf', 'doughnut', p.labels, [{ label: 'Stock', color: ['#02f5a1', '#7c5cff', '#ffc947'], data: p.values }]);
    } catch {}
    try { const g = await api('/reports/customer-growth'); renderChart('chartGrowth', 'line', g.labels, [{ label: 'Customers', color: '#7c5cff', data: g.values }]); } catch {}
    try { const v = await api('/reports/daily-visitors'); renderChart('chartVisitors', 'bar', v.labels, [{ label: 'Visitors', color: '#ffc947', data: v.values }]); } catch {}
    try { const st = await api('/reports/state-distribution'); renderChart('chartState', 'doughnut', st.labels, [{ label: 'Orders', color: ['#02f5a1', '#7c5cff', '#ffc947', '#38bdf8', '#ff6b6b', '#a3e635', '#f472b6'], data: st.values }]); } catch {}
    try { const t = await api('/reports/top-items'); renderChart('chartTopItems', 'bar', t.labels, [{ label: 'Sales (₦)', color: '#7c5cff', data: t.values }]); } catch {}
    try { const l = await api('/reports/lga-distribution'); renderChart('chartLga', 'bar', l.labels, [{ label: 'Orders', color: '#02f5a1', data: l.values }]); } catch {}
  }

  // ─────────────────────────── NOTIFICATIONS ───────────────────────────
  async function loadNotifications() {
    try {
      const data = await api('/notifications');
      $('#notifList').innerHTML = data.items.map((n) => `
        <li>
          <div class="n-title">${esc(n.title)} <span class="badge staff">${esc(n.type)}</span></div>
          <div class="n-msg">${esc(n.message)}</div>
          <div class="n-time">${fmtDate(n.createdAt)} ${n.type === 'system' ? '' : `<button class="btn-ghost" data-notif-delete="${n.id}" style="margin-left:10px">Delete</button>`}</div>
        </li>`).join('') || '<li class="muted">No notifications sent yet.</li>';
      $('#navNotifBadge').hidden = true; $('#bellDot').hidden = true;
    } catch (err) { toast(err.message, 'error'); }
  }
  $('#notifForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = $('#notifType').value, title = $('#notifTitle').value.trim(), message = $('#notifMessage').value.trim();
    if (!title || !message) return toast('Title and message are required', 'error');
    try {
      await api('/notifications', { method: 'POST', body: JSON.stringify({ type, title, message }) });
      toast('Notification sent'); $('#notifTitle').value = ''; $('#notifMessage').value = ''; loadNotifications();
    } catch (err) { toast(err.message, 'error'); }
  });
  $('#notifList').addEventListener('click', async (e) => {
    const id = e.target.dataset.notifDelete;
    if (id && confirm('Delete this notification? If it is an announcement it will disappear from the website.')) {
      try { await api(`/notifications/${id}`, { method: 'DELETE' }); loadNotifications(); } catch (err) { toast(err.message, 'error'); }
    }
  });
  $('#bellBtn').addEventListener('click', () => switchSection('notifications'));

  // ─────────────────────────── SECURITY ───────────────────────────
  async function loadSecurity() {
    try {
      const { user } = await api('/auth/me');
      $('#toggle2fa').textContent = user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA';
      const users = await api('/users?pageSize=999');
      const full = users.items.find((u) => u.id === user.id);
      $('#loginHistoryList').innerHTML = 'Login history is tracked from your next sign-ins onward.';
    } catch {}
  }
  $('#changePwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = $('#currentPw').value, newPassword = $('#newPw').value;
    try {
      await api('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
      toast('Password updated'); $('#currentPw').value = ''; $('#newPw').value = '';
    } catch (err) { toast(err.message, 'error'); }
  });
  $('#toggle2fa').addEventListener('click', async () => {
    try { const { twoFactorEnabled } = await api('/auth/2fa/toggle', { method: 'POST' }); $('#toggle2fa').textContent = twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'; toast(twoFactorEnabled ? '2FA enabled' : '2FA disabled'); }
    catch (err) { toast(err.message, 'error'); }
  });

  // ─────────────────────────── SETTINGS ───────────────────────────
  async function loadSettings() {
    try {
      const { settings } = await api('/settings');
      $('#setName').value = settings.marketplaceName || '';
      $('#setCurrency').value = settings.currency || 'NGN';
      $('#setTheme').value = settings.theme || 'dark';
      $('#setSmtp').value = settings.smtp?.host || '';
      $('#setPayment').value = settings.paymentGateway?.publicKey || '';
      $('#lastBackupText').textContent = settings.lastBackupAt ? `Last backup: ${fmtDate(settings.lastBackupAt)}` : 'No backup yet.';
    } catch (err) { toast(err.message, 'error'); }
  }
  $('#settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      marketplaceName: $('#setName').value.trim(), currency: $('#setCurrency').value, theme: $('#setTheme').value,
      smtp: { host: $('#setSmtp').value.trim(), configured: !!$('#setSmtp').value.trim() },
      paymentGateway: { provider: 'paystack', publicKey: $('#setPayment').value.trim(), configured: !!$('#setPayment').value.trim() },
    };
    try {
      await api('/settings', { method: 'PUT', body: JSON.stringify(body) });
      toast('Settings saved');
      document.documentElement.setAttribute('data-theme', body.theme);
      localStorage.setItem('bm_admin_theme', body.theme);
    } catch (err) { toast(err.message, 'error'); }
  });
  $('#backupBtn').addEventListener('click', async () => {
    try { const data = await api('/settings/backup', { method: 'POST' }); toast(`Backup created: ${data.file}`); loadSettings(); }
    catch (err) { toast(err.message, 'error'); }
  });

  // ─────────────────────────── LOGS ───────────────────────────
  let logsPage = 1;
  async function loadLogs() {
    try {
      const q = new URLSearchParams({ search: $('#logSearch').value, page: logsPage, pageSize: 10 });
      const data = await api('/logs?' + q.toString());
      $('#logsTable tbody').innerHTML = data.items.map((l) => `
        <tr><td>${esc(l.date)}</td><td>${esc(l.time)}</td><td>${esc(l.user)}</td><td>${esc(l.action)}</td><td>${esc(l.ip)}</td><td>${esc(l.browser)}</td></tr>
      `).join('') || '<tr><td colspan="6" class="muted">No activity recorded yet.</td></tr>';
      renderPagination('logsPagination', data.page, data.totalPages, (p) => { logsPage = p; loadLogs(); });
    } catch (err) { toast(err.message, 'error'); }
  }
  $('#logSearch').addEventListener('input', debounce(() => { logsPage = 1; loadLogs(); }, 350));

  // ─────────────────────────── shared UI helpers ───────────────────────────
  function renderPagination(elId, page, totalPages, onPage) {
    const el = $('#' + elId);
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html = '';
    for (let p = 1; p <= totalPages; p++) html += `<button class="${p === page ? 'active' : ''}" data-p="${p}">${p}</button>`;
    el.innerHTML = html;
    $all('button', el).forEach((b) => b.addEventListener('click', () => onPage(Number(b.dataset.p))));
  }

  function debounce(fn, ms) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  // close modals on backdrop click
  $all('.modal-backdrop').forEach((bd) => bd.addEventListener('click', (e) => { if (e.target === bd) bd.hidden = true; }));

  // ─────────────────────────── boot ───────────────────────────
  runLoadingScreen(tryResumeSession);
})();