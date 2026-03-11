/**
 * 根据 js/data/page-data.js 中的数据渲染页面列表，index.html 仅保留空容器
 */
(function () {
    function escapeHtml(s) {
        if (s == null) return '';
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function renderRoleList() {
        var list = document.querySelector('#role-modal .role-list');
        var data = window.PAGE_DATA && window.PAGE_DATA.roles;
        if (!list || !data || !data.length) return;
        var html = '';
        data.forEach(function (r) {
            html += '<div class="role-item" data-role="' + escapeHtml(r.role) + '" data-name="' + escapeHtml(r.name) + '">';
            html += '<span>' + escapeHtml(r.role) + ' - ' + escapeHtml(r.name) + '</span></div>';
        });
        list.innerHTML = html;
    }

    function renderAlertCards() {
        var container = document.querySelector('.alert-cards');
        var data = window.PAGE_DATA && window.PAGE_DATA.alertCards;
        if (!container || !data || !data.length) return;
        var html = '';
        data.forEach(function (c) {
            html += '<div class="alert-card">';
            html += '<div class="alert-card-icon-container"><div class="alert-card-icon ' + escapeHtml(c.type) + '">';
            html += '<img src="' + escapeHtml(c.img) + '" alt="' + escapeHtml(c.title) + '" width="24" height="24">';
            html += '</div><span class="alert-badge">' + escapeHtml(c.badge) + '</span></div>';
            html += '<div class="alert-card-content-wrapper"><div class="alert-card-title">';
            html += '<h3>' + escapeHtml(c.title) + '</h3><span class="alert-card-time">' + escapeHtml(c.time) + '</span></div>';
            html += '<p class="alert-card-content">' + escapeHtml(c.content) + '</p></div></div>';
        });
        container.innerHTML = html;
    }

    function renderXiaozhiHistory() {
        var list = document.querySelector('#history-sidebar .history-list');
        var data = window.PAGE_DATA && window.PAGE_DATA.xiaozhiHistory;
        if (!list || !data || !data.length) return;
        var svgEdit = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        var svgDel = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        var html = '';
        data.forEach(function (h) {
            html += '<div class="history-item"><div class="history-info">';
            html += '<h4 class="history-title">' + escapeHtml(h.title) + '</h4>';
            html += '<p class="history-preview">' + escapeHtml(h.preview) + '</p>';
            html += '<span class="history-time">' + escapeHtml(h.time) + '</span></div>';
            html += '<div class="history-actions"><button class="history-action-btn">' + svgEdit + '</button><button class="history-action-btn">' + svgDel + '</button></div></div>';
        });
        list.innerHTML = html;
    }

    function renderModalJobList() {
        var list = document.querySelector('#job-selection-modal .job-list');
        var data = window.PAGE_DATA && window.PAGE_DATA.modalJobs;
        if (!list || !data || !data.length) return;
        var html = '';
        data.forEach(function (job) {
            html += '<div class="job-item" data-job-id="' + job.id + '" data-job-name="' + (job.name || '') + '">';
            html += '<div class="job-info"><h4>' + (job.name || '') + '</h4><p>工作票号：' + (job.ticketNo || '') + '</p></div>';
            html += '<div class="job-status"><span class="status-badge">' + (job.status || '') + '</span></div></div>';
        });
        list.innerHTML = html;
    }

    function renderPageJobList() {
        var list = document.getElementById('job-list');
        var data = window.PAGE_DATA && window.PAGE_DATA.pageJobs;
        if (!list || !data || !data.length) return;
        var html = '';
        data.forEach(function (job) {
            html += '<div class="job-item" data-job-id="' + job.id + '" data-job-name="' + (job.name || '') + '" data-status="' + (job.status || '') + '">';
            html += '<div class="job-info"><h4>' + (job.name || '') + '</h4>';
            html += '<p>工作票号：' + (job.ticketNo || '') + '</p>';
            html += '<p>作业时间：' + (job.timeRange || '') + '</p>';
            html += '<p>状态：' + (job.status || '') + '</p></div></div>';
        });
        list.innerHTML = html;
    }

    function init() {
        renderRoleList();
        renderAlertCards();
        renderXiaozhiHistory();
        renderModalJobList();
        renderPageJobList();
    }

    if (typeof window.PAGE_DATA === 'undefined') {
        console.warn('render-lists.js: PAGE_DATA 未加载，请确保 js/data/page-data.js 在之前引入');
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
