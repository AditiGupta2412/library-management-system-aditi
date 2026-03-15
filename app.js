let currentPage  = null;
let pendingIssue = null;
let pendingReturn = null;

function navigate(page, data) {
  if (data !== undefined) {
    if (page === 'pay-fine')   pendingReturn = data;
    if (page === 'book-issue') pendingIssue  = data;
  }
  currentPage = page;
  renderPage(page);
}

function renderPage(page) {
  const root = document.getElementById('app');
  if (!root) return;

  const sess = DB.getSession();
  const publicPages = ['login','logout'];
  if (!sess && !publicPages.includes(page)) { navigate('login'); return; }

  switch (page) {
    case 'login':         root.innerHTML = buildLogin();         bindLogin();         break;
    case 'logout':        root.innerHTML = buildLogout();                             break;
    case 'admin-home':    root.innerHTML = buildShell(buildAdminHome(),  'home'); bindAdminHome();  break;
    case 'user-home':     root.innerHTML = buildShell(buildUserHome(),   'home'); break;
    case 'transactions':  root.innerHTML = buildShell(buildTransMenu(),  'transactions'); bindTransMenu(); break;
    case 'book-avail':    root.innerHTML = buildShell(buildBookAvail(),  'transactions'); bindBookAvail(); break;
    case 'avail-results': root.innerHTML = buildShell(buildAvailResults(data), 'transactions'); bindAvailResults(); break;
    case 'book-issue':    root.innerHTML = buildShell(buildBookIssue(),  'transactions'); bindBookIssue(); break;
    case 'return-book':   root.innerHTML = buildShell(buildReturnBook(), 'transactions'); bindReturnBook(); break;
    case 'pay-fine':      root.innerHTML = buildShell(buildPayFine(),   'transactions'); bindPayFine(); break;
    case 'reports':       root.innerHTML = buildShell(buildReportsList(),'reports');  bindReportsList(); break;
    case 'rpt-books':     root.innerHTML = buildShell(buildRptBooks(),   'reports');  break;
    case 'rpt-movies':    root.innerHTML = buildShell(buildRptMovies(),  'reports');  break;
    case 'rpt-members':   root.innerHTML = buildShell(buildRptMembers(), 'reports');  break;
    case 'rpt-active':    root.innerHTML = buildShell(buildRptActive(),  'reports');  break;
    case 'rpt-overdue':   root.innerHTML = buildShell(buildRptOverdue(), 'reports');  break;
    case 'rpt-requests':  root.innerHTML = buildShell(buildRptRequests(),'reports');  break;
    case 'maintenance':   root.innerHTML = buildShell(buildMaintMenu(),  'maintenance'); bindMaintMenu(); break;
    case 'add-membership':    root.innerHTML = buildShell(buildAddMembership(),   'maintenance'); bindAddMembership(); break;
    case 'update-membership': root.innerHTML = buildShell(buildUpdateMembership(),'maintenance'); bindUpdateMembership(); break;
    case 'add-book':      root.innerHTML = buildShell(buildAddBook(),    'maintenance'); bindAddBook(); break;
    case 'update-book':   root.innerHTML = buildShell(buildUpdateBook(), 'maintenance'); bindUpdateBook(); break;
    case 'user-mgmt':     root.innerHTML = buildShell(buildUserMgmt(),   'maintenance'); bindUserMgmt(); break;
    case 'tx-success':    root.innerHTML = buildShell(buildTxSuccess(),  ''); break;
    case 'tx-cancel':     root.innerHTML = buildShell(buildTxCancel(),   ''); break;
    case 'chart':         root.innerHTML = buildShell(buildChart(),      ''); break;
    default:              navigate('login');
  }
}


function buildShell(content, activeSection) {
  const sess    = DB.getSession();
  const isAdm   = sess && sess.isAdmin;
  const homeUrl = isAdm ? 'admin-home' : 'user-home';

  const maintLink = isAdm ? `
    <span class="sidebar-section-title">Admin</span>
    <a class="sidebar-item ${activeSection==='maintenance'?'active':''}" onclick="navigate('maintenance')">
      <span class="si-icon"></span> Maintenance
    </a>
    <div class="sidebar-divider"></div>` : '';

  return `
  <div class="topbar">
    <a class="topbar-brand" onclick="navigate('chart')">
      <div class="brand-icon"></div>
      LibraryMS
    </a>
    <div class="topbar-actions">
      <button class="topbar-nav-btn" onclick="navigate('chart')">Chart</button>
      <button class="topbar-nav-btn" onclick="navigate('${homeUrl}')">Home</button>
    </div>
  </div>
  <div class="page-wrapper">
    <aside class="sidebar">
      ${maintLink}
      <span class="sidebar-section-title">Navigation</span>
      <a class="sidebar-item ${activeSection==='home'?'active':''}"         onclick="navigate('${homeUrl}')">
        <span class="si-icon"></span> Home
      </a>
      <a class="sidebar-item ${activeSection==='transactions'?'active':''}" onclick="navigate('transactions')">
        <span class="si-icon"></span> Transactions
      </a>
      <a class="sidebar-item ${activeSection==='reports'?'active':''}"      onclick="navigate('reports')">
        <span class="si-icon"></span> Reports
      </a>
      <div class="sidebar-logout">
        <button class="sidebar-logout-btn" onclick="doLogout()">Log Out</button>
      </div>
    </aside>
    <main class="main-content page-enter">
      ${content}
    </main>
  </div>`;
}

function doLogout() { DB.clearSession(); navigate('logout'); }


function buildLogin() {
  return `
  <div class="login-root">
    <a class="login-chart-link" onclick="navigate('chart')">View Chart</a>
    <div class="login-panel">
      <div class="login-logo">
        <div class="login-logo-icon"></div>
        <div class="login-title">Library Management System</div>
        <div class="login-subtitle">Sign in to your account</div>
      </div>
      <div id="login-err" class="form-error-banner">⚠️ Invalid credentials. Please try again.</div>
      <div class="form-group">
        <label class="form-label">User ID <span class="req">*</span></label>
        <input id="l-uid" class="form-control" placeholder="Enter your user ID" autocomplete="username" />
      </div>
      <div class="form-group">
        <label class="form-label">Password <span class="req">*</span></label>
        <input id="l-pwd" class="form-control" type="password" placeholder="Enter your password" autocomplete="current-password"/>
      </div>
      <div class="form-actions" style="border:none;padding-top:8px">
        <button class="btn btn-secondary w-full" onclick="document.getElementById('l-uid').value='';document.getElementById('l-pwd').value=''">Cancel</button>
        <button class="btn btn-primary w-full" onclick="doLogin()">Login →</button>
      </div>
      <p style="text-align:center;margin-top:18px;font-size:0.78rem;color:#9aa0a6">
        Admin: <b>adm / adm</b> &nbsp;|&nbsp; User: <b>user / user</b>
      </p>
    </div>
  </div>`;
}
function bindLogin() {
  document.getElementById('l-pwd').addEventListener('keyup', e => { if (e.key === 'Enter') doLogin(); });
}
function doLogin() {
  const uid = document.getElementById('l-uid').value.trim();
  const pwd = document.getElementById('l-pwd').value;
  const err = document.getElementById('login-err');
  err.classList.remove('show');
  if (!uid || !pwd) { err.textContent = '⚠️ Please enter both User ID and Password.'; err.classList.add('show'); return; }
  const user = DB.login(uid, pwd);
  if (user) { navigate(user.isAdmin ? 'admin-home' : 'user-home'); }
  else       { err.textContent = '⚠️ Invalid credentials. Please try again.'; err.classList.add('show'); }
}


function buildLogout() {
  return `
  <div style="min-height:100vh;display:flex;flex-direction:column;background:var(--bg-main);">
    <div class="topbar">
      <div class="topbar-brand"><div class="brand-icon">📚</div>LibraryMS</div>
      <button class="topbar-nav-btn" onclick="navigate('login')">Login</button>
    </div>
    <div class="status-page page-enter">
      <div class="status-page-icon status-icon-logout"></div>
      <div class="status-title">You have successfully logged out.</div>
      <div class="status-subtitle">Thank you for using Library Management System.</div>
      <button class="btn btn-primary" onclick="navigate('login')">Sign In Again →</button>
    </div>
  </div>`;
}


function buildAdminHome() {
  const cats = DB.CATEGORIES;
  const books = DB.getBooks(); const issues = DB.getActiveIssues(); const mems = DB.getMemberships();
  const rows = cats.map(c => `<tr><td>${c.codeFrom}</td><td>${c.codeTo}</td><td>${c.label}</td></tr>`).join('');
  return `
  <div class="page-header">
    <div class="page-title">Welcome back, Admin</div>
    <div class="page-subtitle">Library Management System — Admin Dashboard</div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-card-icon"></div><div class="stat-card-label">Total Books</div><div class="stat-card-value">${books.filter(b=>b.type==='book').length}</div></div>
    <div class="stat-card"><div class="stat-card-icon"></div><div class="stat-card-label">Total Movies</div><div class="stat-card-value">${books.filter(b=>b.type==='movie').length}</div></div>
    <div class="stat-card"><div class="stat-card-icon"></div><div class="stat-card-label">Members</div><div class="stat-card-value">${mems.filter(m=>m.status==='Active').length}</div></div>
    <div class="stat-card"><div class="stat-card-icon"></div><div class="stat-card-label">Active Issues</div><div class="stat-card-value">${issues.length}</div></div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title"><div class="card-title-icon"></div>Book Categories</div></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Code No From</th><th>Code No To</th><th>Category</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}
function bindAdminHome() {}


function buildUserHome() {
  const cats = DB.CATEGORIES;
  const rows = cats.map(c => `<tr><td>${c.codeFrom}</td><td>${c.codeTo}</td><td>${c.label}</td></tr>`).join('');
  return `
  <div class="page-header">
    <div class="page-title">Welcome back</div>
    <div class="page-subtitle">Browse books, manage issues, and view your reports.</div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title"><div class="card-title-icon">📂</div>Book Categories</div></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Code No From</th><th>Code No To</th><th>Category</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}


function buildTxSuccess() {
  return `<div class="status-page page-enter">
    <div class="status-page-icon status-icon-success"></div>
    <div class="status-title">Transaction completed successfully.</div>
    <div class="status-subtitle">The operation has been saved. You can continue using the system.</div>
    <div style="display:flex;gap:12px">
      <button class="btn btn-secondary" onclick="navigate('chart')">📊 Chart</button>
      <button class="btn btn-primary"   onclick="navigate(DB.isAdmin()?'admin-home':'user-home')">🏠 Home</button>
    </div>
  </div>`;
}
function buildTxCancel() {
  return `<div class="status-page page-enter">
    <div class="status-page-icon status-icon-cancel"></div>
    <div class="status-title">Transaction cancelled.</div>
    <div class="status-subtitle">No changes were saved.</div>
    <div style="display:flex;gap:12px">
      <button class="btn btn-secondary" onclick="navigate('chart')">📊 Chart</button>
      <button class="btn btn-primary"   onclick="navigate(DB.isAdmin()?'admin-home':'user-home')">🏠 Home</button>
    </div>
  </div>`;
}


function buildChart() {
  return `
  <div class="page-header">
    <div class="page-title">Application Flow Chart</div>
    <div class="page-subtitle">Overview of screens and navigation in Library Management System</div>
  </div>
  <div class="card">
    <div class="card-body">
      <div style="overflow-x:auto;text-align:center;padding:16px">
        <div style="display:inline-block;text-align:left;font-size:0.9rem;line-height:2">
          <pre style="font-family:var(--font);color:var(--text-primary);background:var(--bg-row-alt);padding:28px;border-radius:12px;border:1px solid var(--border)">
                         ┌──────────────────┐
                         │    Login Screen   │
                         └────────┬─────────┘
                   ┌──────────────┴──────────────┐
           Admin Login                      User Login
                   │                              │
          ┌────────▼────────┐          ┌─────────▼──────────┐
          │  Admin Homepage  │          │   User Homepage     │
          │ (Maintenance +   │          │ (Reports +          │
          │  Reports + Tx)   │          │  Transactions)      │
          └────────┬─────────┘          └─────────┬──────────┘
         ┌─────────┼──────────┐                   │
    Maintenance  Reports  Transactions         Both have
         │          │          │              Reports + Tx
    ┌────▼──┐  ┌────▼───┐  ┌──▼────────────────────────┐
    │Add/Upd│  │6 Report│  │ Book Avail → Issue → Return│
    │Members│  │ Tables │  │ → Pay Fine                 │
    │Books  │  └────────┘  └────────────────────────────┘
    │Users  │
    └───────┘
          </pre>
        </div>
      </div>
    </div>
  </div>`;
}
