// 统一页面切换：只负责显示指定页面，不处理导航栏
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const el = document.getElementById(pageId);
    if (el) el.classList.add('active');
}

// 返回按钮统一委托（避免每次打开子页重复绑定）
function initBackButtonDelegation() {
    document.querySelector('.app-container').addEventListener('click', function(e) {
        const backBtn = e.target.closest('.back-btn');
        if (!backBtn) return;
        const page = backBtn.closest('.page');
        if (!page) return;
        const pageId = page.id;
        if (pageId === 'job-selection-page') {
            hideJobSelectionPage();
            return;
        }
        if (pageId === 'trip-event-selection-page') {
            hideTripEventSelectionPage();
            return;
        }
        if (pageId === 'smart-safety') {
            closeSmartSafetyPage();
            return;
        }
        if (pageId === 'smart-trip') {
            closeSmartTripPage();
            return;
        }
        if (pageId === 'human-machine-detail') {
            showPage('human-machine');
            return;
        }
        showPage('workbench');
    });
}

// 页面切换功能
function initPageSwitch() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.getAttribute('data-page');
            if (!targetPage) return;
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            showPage(targetPage);
        });
    });
}

// 标签页切换功能（按当前页面容器作用域，避免多页面 tab 互相干扰）
function initTabSwitch() {
    document.querySelector('.app-container').addEventListener('click', function(e) {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        const page = btn.closest('.page');
        if (!page) return;
        const tabId = btn.getAttribute('data-tab');
        if (!tabId) return;
        page.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const content = page.querySelector(`.tab-content[data-tab="${tabId}"]`);
        if (content) content.classList.add('active');
    });
}
