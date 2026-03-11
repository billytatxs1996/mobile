function initKeyWorkPage() {
    const el = (sel) => document.querySelector(sel);
    const elAll = (sel) => document.querySelectorAll(sel);

    // 按时间维度模拟数据（今日/本周/本月）
    const keyWorkDataByRange = {
        today: {
            totalSites: 12,
            patrol: { sites: 5, total: 18, completed: 12, pending: 4, overdue: 2, completionRate: 66.7 },
            operation: { sites: 4, total: 10, completed: 7, pending: 2, overdue: 1, completionRate: 70 },
            safety: { sites: 3, total: 8, completed: 6, pending: 2, overdue: 0, completionRate: 75 }
        },
        week: {
            totalSites: 12,
            patrol: { sites: 8, total: 120, completed: 95, pending: 15, overdue: 10, completionRate: 79.2 },
            operation: { sites: 6, total: 80, completed: 65, pending: 12, overdue: 3, completionRate: 81.2 },
            safety: { sites: 5, total: 60, completed: 55, pending: 5, overdue: 0, completionRate: 91.7 }
        },
        month: {
            totalSites: 12,
            patrol: { sites: 8, total: 320, completed: 268, pending: 38, overdue: 14, completionRate: 83.8 },
            operation: { sites: 6, total: 185, completed: 152, pending: 25, overdue: 8, completionRate: 82.2 },
            safety: { sites: 5, total: 142, completed: 128, pending: 12, overdue: 2, completionRate: 90.1 }
        }
    };

    function updateKeyWorkData(keyWorkData) {
        if (el('.key-work-site-count')) el('.key-work-site-count').textContent = keyWorkData.totalSites;
        if (el('.patrol-sites')) el('.patrol-sites').textContent = keyWorkData.patrol.sites;
        if (el('.operation-sites')) el('.operation-sites').textContent = keyWorkData.operation.sites;
        if (el('.safety-sites')) el('.safety-sites').textContent = keyWorkData.safety.sites;
        el('.patrol-completion-rate').textContent = keyWorkData.patrol.completionRate + '%';
        el('.patrol-completed').textContent = keyWorkData.patrol.completed;
        el('.patrol-pending').textContent = keyWorkData.patrol.pending;
        el('.patrol-overdue').textContent = keyWorkData.patrol.overdue;
        el('.operation-completion-rate').textContent = keyWorkData.operation.completionRate + '%';
        el('.operation-completed').textContent = keyWorkData.operation.completed;
        el('.operation-pending').textContent = keyWorkData.operation.pending;
        el('.operation-overdue').textContent = keyWorkData.operation.overdue;
        el('.safety-completion-rate').textContent = keyWorkData.safety.completionRate + '%';
        el('.safety-completed').textContent = keyWorkData.safety.completed;
        el('.safety-pending').textContent = keyWorkData.safety.pending;
        el('.safety-overdue').textContent = keyWorkData.safety.overdue;
        elAll('.stat-progress-fill.patrol').forEach(e => { e.style.width = keyWorkData.patrol.completionRate + '%'; });
        elAll('.stat-progress-fill.operation').forEach(e => { e.style.width = keyWorkData.operation.completionRate + '%'; });
        elAll('.stat-progress-fill.safety').forEach(e => { e.style.width = keyWorkData.safety.completionRate + '%'; });
    }

    updateKeyWorkData(keyWorkDataByRange.today);

    // 时间维度切换（页面右上）
    elAll('#key-work .time-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const range = this.getAttribute('data-range');
            elAll('#key-work .time-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const data = keyWorkDataByRange[range === 'today' ? 'today' : range === 'month' ? 'month' : 'week'];
            if (data) updateKeyWorkData(data);
        });
    });
}

// 打开业务看板页面
function initBusinessDashboardPage() {
    const root = document.querySelector('#business-dashboard');
    if (!root) return;
    const el = (sel) => root.querySelector(sel);
    const elAll = (sel) => root.querySelectorAll(sel);

    // 按时间维度模拟数据（本月/本周）
    const bizDataByRange = {
        month: {
            remotePatrol: { sites: 150, totalSites: 200, ratio: 75 },
            remoteOperation: { sites: 80, totalSites: 120, ratio: 66.7 },
            patrol: { pending: 15, inProgress: 45, review: 12, completed: 60 },
            operation: { pending: 8, inProgress: 25, completed: 47 },
            safety: { pending: 3, inProgress: 18, completed: 39 }
        },
        week: {
            remotePatrol: { sites: 48, totalSites: 200, ratio: 24 },
            remoteOperation: { sites: 28, totalSites: 120, ratio: 23.3 },
            patrol: { pending: 5, inProgress: 12, review: 8, completed: 20 },
            operation: { pending: 3, inProgress: 7, completed: 15 },
            safety: { pending: 1, inProgress: 5, completed: 12 }
        }
    };

    function ratioClass(ratio) {
        if (ratio >= 70) return 'ratio-good';
        if (ratio >= 40) return 'ratio-mid';
        return 'ratio-low';
    }

    function updateBizDashboard(range) {
        const data = bizDataByRange[range] || bizDataByRange.month;

        // 变电月度关键指标：远程巡视/操作 站点数、占比
        const patrolCard = el('.coverage-card.remote-patrol');
        const opCard = el('.coverage-card.remote-operation');
        if (patrolCard) {
            patrolCard.classList.remove('ratio-good', 'ratio-mid', 'ratio-low');
            patrolCard.classList.add(ratioClass(data.remotePatrol.ratio));
            patrolCard.querySelector('.remote-patrol-sites').textContent = data.remotePatrol.sites;
            patrolCard.querySelector('.remote-patrol-total').textContent = data.remotePatrol.totalSites;
            patrolCard.querySelector('.remote-patrol-ratio').textContent = data.remotePatrol.ratio;
            const fill = patrolCard.querySelector('.remote-patrol-fill');
            if (fill) fill.style.width = Math.min(100, data.remotePatrol.ratio) + '%';
        }
        if (opCard) {
            opCard.classList.remove('ratio-good', 'ratio-mid', 'ratio-low');
            opCard.classList.add(ratioClass(data.remoteOperation.ratio));
            opCard.querySelector('.remote-operation-sites').textContent = data.remoteOperation.sites;
            opCard.querySelector('.remote-operation-total').textContent = data.remoteOperation.totalSites;
            opCard.querySelector('.remote-operation-ratio').textContent = data.remoteOperation.ratio;
            const fill = opCard.querySelector('.remote-operation-fill');
            if (fill) fill.style.width = Math.min(100, data.remoteOperation.ratio) + '%';
        }

        // 任务状态（巡视/操作/安全）
        elAll('.patrol-pending-count').forEach(e => { e.textContent = data.patrol.pending; });
        elAll('.patrol-in-progress-count').forEach(e => { e.textContent = data.patrol.inProgress; });
        elAll('.patrol-review-count').forEach(e => { e.textContent = data.patrol.review; });
        elAll('.patrol-completed-count').forEach(e => { e.textContent = data.patrol.completed; });
        elAll('.operation-pending-count').forEach(e => { e.textContent = data.operation.pending; });
        elAll('.operation-in-progress-count').forEach(e => { e.textContent = data.operation.inProgress; });
        elAll('.operation-completed-count').forEach(e => { e.textContent = data.operation.completed; });
        elAll('.safety-pending-count').forEach(e => { e.textContent = data.safety.pending; });
        elAll('.safety-in-progress-count').forEach(e => { e.textContent = data.safety.inProgress; });
        elAll('.safety-completed-count').forEach(e => { e.textContent = data.safety.completed; });

        // 待审核提示：有则显示
        const alertEl = el('#patrol-review-alert');
        if (alertEl) {
            alertEl.style.display = data.patrol.review > 0 ? 'inline-block' : 'none';
            const reviewSpan = alertEl.querySelector('.patrol-review-count');
            if (reviewSpan) reviewSpan.textContent = data.patrol.review;
        }
    }

    updateBizDashboard('week');

    // 时间维度切换（与重点工作一致：本月/本周）
    elAll('.time-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const range = this.getAttribute('data-range') || 'month';
            elAll('#business-dashboard .time-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateBizDashboard(range);
        });
    });
}

// 打开质量看板页面（终端统计看板+排名前10/后10，支持时间维度切换）
function initQualityDashboardPage() {
    const root = document.querySelector('#quality-dashboard');
    if (!root) return;
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

    // 25 个站点。缺陷：总缺陷数、识别数、识别率%；在线/使用：统计期内数/该站总数(率%)
    function buildMonthSiteData() {
        return [
            { siteName: '110kV 城东站', terminalCount: 18, onlineRate: 100, usageRate: 95, totalDefects: 0, identifiedDefects: 0 },
            { siteName: '220kV 枢纽站', terminalCount: 24, onlineRate: 98, usageRate: 93, totalDefects: 2, identifiedDefects: 2 },
            { siteName: '220kV 东区站', terminalCount: 20, onlineRate: 97, usageRate: 92, totalDefects: 1, identifiedDefects: 1 },
            { siteName: '110kV 城北站', terminalCount: 16, onlineRate: 96, usageRate: 90, totalDefects: 3, identifiedDefects: 3 },
            { siteName: '110kV 城西站', terminalCount: 14, onlineRate: 95, usageRate: 88, totalDefects: 2, identifiedDefects: 2 },
            { siteName: '35kV 工业园站', terminalCount: 10, onlineRate: 94, usageRate: 86, totalDefects: 4, identifiedDefects: 4 },
            { siteName: '110kV 城南站', terminalCount: 12, onlineRate: 93, usageRate: 85, totalDefects: 3, identifiedDefects: 3 },
            { siteName: '35kV 开发区站', terminalCount: 8, onlineRate: 91, usageRate: 82, totalDefects: 5, identifiedDefects: 4 },
            { siteName: '35kV 西区站', terminalCount: 9, onlineRate: 90, usageRate: 80, totalDefects: 4, identifiedDefects: 3 },
            { siteName: '35kV 高新区站', terminalCount: 6, onlineRate: 88, usageRate: 78, totalDefects: 6, identifiedDefects: 4 },
            { siteName: '110kV 河东站', terminalCount: 11, onlineRate: 86, usageRate: 74, totalDefects: 5, identifiedDefects: 3 },
            { siteName: '35kV 北郊站', terminalCount: 7, onlineRate: 85, usageRate: 72, totalDefects: 7, identifiedDefects: 4 },
            { siteName: '110kV 河西站', terminalCount: 13, onlineRate: 83, usageRate: 70, totalDefects: 6, identifiedDefects: 3 },
            { siteName: '35kV 南郊站', terminalCount: 5, onlineRate: 82, usageRate: 68, totalDefects: 8, identifiedDefects: 4 },
            { siteName: '220kV 西区站', terminalCount: 19, onlineRate: 80, usageRate: 65, totalDefects: 9, identifiedDefects: 4 },
            { siteName: '110kV 老城区站', terminalCount: 10, onlineRate: 78, usageRate: 62, totalDefects: 7, identifiedDefects: 3 },
            { siteName: '35kV 化工园站', terminalCount: 4, onlineRate: 76, usageRate: 58, totalDefects: 10, identifiedDefects: 4 },
            { siteName: '110kV 新城区站', terminalCount: 15, onlineRate: 74, usageRate: 55, totalDefects: 8, identifiedDefects: 3 },
            { siteName: '35kV 物流园站', terminalCount: 6, onlineRate: 72, usageRate: 52, totalDefects: 9, identifiedDefects: 2 },
            { siteName: '110kV 保税区站', terminalCount: 9, onlineRate: 70, usageRate: 50, totalDefects: 11, identifiedDefects: 3 },
            { siteName: '35kV 港口站', terminalCount: 5, onlineRate: 68, usageRate: 48, totalDefects: 10, identifiedDefects: 2 },
            { siteName: '110kV 机场站', terminalCount: 12, onlineRate: 65, usageRate: 45, totalDefects: 12, identifiedDefects: 3 },
            { siteName: '35kV 铁路站', terminalCount: 4, onlineRate: 62, usageRate: 42, totalDefects: 11, identifiedDefects: 2 },
            { siteName: '110kV 电厂站', terminalCount: 8, onlineRate: 58, usageRate: 38, totalDefects: 14, identifiedDefects: 2 },
            { siteName: '35kV 山区站', terminalCount: 3, onlineRate: 55, usageRate: 35, totalDefects: 13, identifiedDefects: 1 }
        ];
    }
    function buildWeekSiteData() {
        return [
            { siteName: '110kV 城东站', terminalCount: 18, onlineRate: 99, usageRate: 92, totalDefects: 0, identifiedDefects: 0 },
            { siteName: '220kV 枢纽站', terminalCount: 24, onlineRate: 97, usageRate: 90, totalDefects: 1, identifiedDefects: 1 },
            { siteName: '220kV 东区站', terminalCount: 20, onlineRate: 96, usageRate: 88, totalDefects: 1, identifiedDefects: 1 },
            { siteName: '110kV 城北站', terminalCount: 16, onlineRate: 95, usageRate: 86, totalDefects: 2, identifiedDefects: 2 },
            { siteName: '110kV 城西站', terminalCount: 14, onlineRate: 94, usageRate: 84, totalDefects: 2, identifiedDefects: 2 },
            { siteName: '35kV 工业园站', terminalCount: 10, onlineRate: 92, usageRate: 82, totalDefects: 3, identifiedDefects: 3 },
            { siteName: '110kV 城南站', terminalCount: 12, onlineRate: 91, usageRate: 80, totalDefects: 2, identifiedDefects: 2 },
            { siteName: '35kV 开发区站', terminalCount: 8, onlineRate: 89, usageRate: 76, totalDefects: 4, identifiedDefects: 3 },
            { siteName: '35kV 西区站', terminalCount: 9, onlineRate: 87, usageRate: 74, totalDefects: 3, identifiedDefects: 2 },
            { siteName: '35kV 高新区站', terminalCount: 6, onlineRate: 85, usageRate: 72, totalDefects: 5, identifiedDefects: 3 },
            { siteName: '110kV 河东站', terminalCount: 11, onlineRate: 83, usageRate: 70, totalDefects: 4, identifiedDefects: 2 },
            { siteName: '35kV 北郊站', terminalCount: 7, onlineRate: 81, usageRate: 68, totalDefects: 6, identifiedDefects: 3 },
            { siteName: '110kV 河西站', terminalCount: 13, onlineRate: 79, usageRate: 65, totalDefects: 5, identifiedDefects: 2 },
            { siteName: '35kV 南郊站', terminalCount: 5, onlineRate: 77, usageRate: 62, totalDefects: 7, identifiedDefects: 3 },
            { siteName: '220kV 西区站', terminalCount: 19, onlineRate: 75, usageRate: 58, totalDefects: 6, identifiedDefects: 2 },
            { siteName: '110kV 老城区站', terminalCount: 10, onlineRate: 73, usageRate: 55, totalDefects: 8, identifiedDefects: 2 },
            { siteName: '35kV 化工园站', terminalCount: 4, onlineRate: 70, usageRate: 52, totalDefects: 9, identifiedDefects: 2 },
            { siteName: '110kV 新城区站', terminalCount: 15, onlineRate: 68, usageRate: 48, totalDefects: 7, identifiedDefects: 1 },
            { siteName: '35kV 物流园站', terminalCount: 6, onlineRate: 65, usageRate: 45, totalDefects: 10, identifiedDefects: 2 },
            { siteName: '110kV 保税区站', terminalCount: 9, onlineRate: 62, usageRate: 42, totalDefects: 11, identifiedDefects: 2 },
            { siteName: '35kV 港口站', terminalCount: 5, onlineRate: 60, usageRate: 40, totalDefects: 9, identifiedDefects: 1 },
            { siteName: '110kV 机场站', terminalCount: 12, onlineRate: 57, usageRate: 36, totalDefects: 12, identifiedDefects: 1 },
            { siteName: '35kV 铁路站', terminalCount: 4, onlineRate: 54, usageRate: 33, totalDefects: 10, identifiedDefects: 1 },
            { siteName: '110kV 电厂站', terminalCount: 8, onlineRate: 51, usageRate: 30, totalDefects: 13, identifiedDefects: 1 },
            { siteName: '35kV 山区站', terminalCount: 3, onlineRate: 48, usageRate: 28, totalDefects: 11, identifiedDefects: 0 }
        ];
    }

    const qualityDataByRange = { month: buildMonthSiteData(), week: buildWeekSiteData() };
    let currentRange = 'week';
    const rankDir = { defect: 'top', online: 'top', usage: 'top' };

    function rateClass(rate) {
        if (rate >= 95) return 'rate-good';
        if (rate >= 85) return 'rate-mid';
        return 'rate-low';
    }
    function getDefectIdentifyRate(s) {
        if (!s.totalDefects) return 100;
        return Math.round((s.identifiedDefects / s.totalDefects) * 100);
    }
    function formatDefectStat(s) {
        const rate = getDefectIdentifyRate(s);
        const cls = rate >= 95 ? 'rate-good' : rate >= 85 ? 'rate-mid' : 'rate-low';
        return `${s.identifiedDefects}/${s.totalDefects}（${rate}%）`;
    }
    function formatOnlineStat(s) {
        const n = Math.round(s.terminalCount * s.onlineRate / 100);
        return `${n}/${s.terminalCount}（${s.onlineRate}%）`;
    }
    function formatUsageStat(s) {
        const n = Math.round(s.terminalCount * s.usageRate / 100);
        return `${n}/${s.terminalCount}（${s.usageRate}%）`;
    }

    function updateQualityDashboard() {
        const siteData = qualityDataByRange[currentRange] || qualityDataByRange.month;
        const totalTerminals = siteData.reduce((sum, s) => sum + s.terminalCount, 0);
        const avgOnlineRate = siteData.length ? (siteData.reduce((sum, s) => sum + s.onlineRate * s.terminalCount, 0) / totalTerminals) : 0;
        const avgOfflineRate = Math.round((100 - avgOnlineRate) * 10) / 10;

        setText('terminal-online-rate', avgOnlineRate.toFixed(1) + '%');
        setText('terminal-offline-rate', avgOfflineRate + '%');
        setText('terminal-total-count', totalTerminals + ' 台');

        function renderRanking(type, dir) {
            const listEl = document.getElementById('ranking-' + type + '-list');
            if (!listEl) return;
            let sorted = [];
            if (type === 'defect') {
                sorted = [...siteData].sort((a, b) => {
                    const ra = getDefectIdentifyRate(a);
                    const rb = getDefectIdentifyRate(b);
                    return dir === 'top' ? rb - ra : ra - rb;
                });
            } else if (type === 'online') sorted = [...siteData].sort((a, b) => dir === 'top' ? b.onlineRate - a.onlineRate : a.onlineRate - b.onlineRate);
            else if (type === 'usage') sorted = [...siteData].sort((a, b) => dir === 'top' ? b.usageRate - a.usageRate : a.usageRate - b.usageRate);
            const slice = sorted.slice(0, 10);
            listEl.innerHTML = slice.map((s, i) => {
                let stat = '';
                if (type === 'defect') stat = `<span class="rank-stat ${rateClass(getDefectIdentifyRate(s))}">${formatDefectStat(s)}</span>`;
                else if (type === 'online') stat = `<span class="rank-stat ${rateClass(s.onlineRate)}">${formatOnlineStat(s)}</span>`;
                else if (type === 'usage') stat = `<span class="rank-stat ${rateClass(s.usageRate)}">${formatUsageStat(s)}</span>`;
                return `<div class="site-ranking-row"><span class="rank">${i + 1}</span><span class="site-name">${s.siteName}</span>${stat}</div>`;
            }).join('');
        }

        ['defect', 'online', 'usage'].forEach(t => renderRanking(t, rankDir[t]));
    }

    updateQualityDashboard();

    // 时间维度切换
    root.querySelectorAll('.time-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            currentRange = this.getAttribute('data-range') || 'month';
            root.querySelectorAll('.time-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateQualityDashboard();
        });
    });

    // 排名切换：前10名 / 后10名（每个区块独立记忆方向）
    root.querySelectorAll('.ranking-block').forEach(block => {
        const type = block.getAttribute('data-rank-type');
        block.querySelectorAll('.rank-toggle-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const dir = this.getAttribute('data-dir');
                rankDir[type] = dir;
                block.querySelectorAll('.rank-toggle-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const siteData = qualityDataByRange[currentRange] || qualityDataByRange.month;
                let sorted = [];
                if (type === 'defect') {
                    sorted = [...siteData].sort((a, b) => {
                        const ra = getDefectIdentifyRate(a);
                        const rb = getDefectIdentifyRate(b);
                        return dir === 'top' ? rb - ra : ra - rb;
                    });
                } else if (type === 'online') sorted = [...siteData].sort((a, b) => dir === 'top' ? b.onlineRate - a.onlineRate : a.onlineRate - b.onlineRate);
                else if (type === 'usage') sorted = [...siteData].sort((a, b) => dir === 'top' ? b.usageRate - a.usageRate : a.usageRate - b.usageRate);
                const listEl = document.getElementById('ranking-' + type + '-list');
                if (!listEl) return;
                const slice = sorted.slice(0, 10);
                listEl.innerHTML = slice.map((s, i) => {
                    let stat = '';
                    if (type === 'defect') stat = `<span class="rank-stat ${rateClass(getDefectIdentifyRate(s))}">${formatDefectStat(s)}</span>`;
                    else if (type === 'online') stat = `<span class="rank-stat ${rateClass(s.onlineRate)}">${formatOnlineStat(s)}</span>`;
                    else if (type === 'usage') stat = `<span class="rank-stat ${rateClass(s.usageRate)}">${formatUsageStat(s)}</span>`;
                    return `<div class="site-ranking-row"><span class="rank">${i + 1}</span><span class="site-name">${s.siteName}</span>${stat}</div>`;
                }).join('');
            });
        });
    });
}

// 更新事件列表的未读标识
