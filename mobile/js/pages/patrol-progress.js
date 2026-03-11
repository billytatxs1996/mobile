function initPatrolProgressPage() {
    const pendingTasks = [
        { id: 1, device: '10kV开关柜', location: '1号间隔', description: '开关柜柜门密封胶条老化，存在缝隙', time: '2026-02-10 10:30', status: 'pending' },
        { id: 2, device: '主变压器', location: '本体散热片', description: '散热片表面积灰严重，影响散热效果', time: '2026-02-10 09:15', status: 'pending' },
        { id: 3, device: 'GIS设备', location: '2号气室', description: '气室压力值接近告警阈值', time: '2026-02-10 08:45', status: 'pending' }
    ];
    const completedTasks = [
        { id: 4, device: '电压互感器', location: '二次端子箱', description: '端子箱门未关闭，存在安全隐患', time: '2026-02-09 16:30', verificationResult: '属实', verificationNotes: '已现场核实，端子箱门确实未关闭，已当场关闭并锁紧' },
        { id: 5, device: '电流互感器', location: '本体', description: '本体表面存在放电痕迹', time: '2026-02-09 14:20', verificationResult: '不属实', verificationNotes: '经现场核实，本体表面为正常氧化痕迹，非放电痕迹' },
        { id: 6, device: '10kV开关柜', location: '2号间隔', description: '开关柜内温度异常升高', time: '2026-02-09 11:45', verificationResult: '属实', verificationNotes: '已现场核实，开关柜内温度确实异常升高，已联系相关人员处理' },
        { id: 7, device: '主变压器', location: '中性点接地装置', description: '接地电阻值超标', time: '2026-02-09 10:30', verificationResult: '属实', verificationNotes: '已现场核实，接地电阻值确实超标，已安排接地网改造' },
        { id: 8, device: 'GIS设备', location: '1号气室', description: '气室压力值严重不足', time: '2026-02-09 09:15', verificationResult: '属实', verificationNotes: '已现场核实，气室压力值严重不足，已联系厂家进行补气处理' },
        { id: 9, device: '电压互感器', location: '本体', description: '本体漏油', time: '2026-02-08 16:30', verificationResult: '属实', verificationNotes: '已现场核实，本体确实存在漏油现象，已联系相关人员处理' },
        { id: 10, device: '电流互感器', location: '二次回路', description: '二次回路接地不良', time: '2026-02-08 14:20', verificationResult: '属实', verificationNotes: '已现场核实，二次回路接地确实不良，已重新接地' },
        { id: 11, device: '10kV开关柜', location: '3号间隔', description: '开关柜内湿度异常', time: '2026-02-08 11:45', verificationResult: '不属实', verificationNotes: '经现场核实，开关柜内湿度在正常范围内' }
    ];
    const allTasks = [...pendingTasks, ...completedTasks];
    const trueCount = completedTasks.filter(t => t.verificationResult === '属实').length;
    const falseCount = completedTasks.filter(t => t.verificationResult === '不属实').length;
    const total = allTasks.length;
    const completed = completedTasks.length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    const setBar = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = pct + '%'; };

    /* 数据分析 + 饼图：支持时间维度切换 */
    const pieColors = ['#1565c0', '#2e7d32', '#ff9800', '#7b1fa2', '#00838f'];
    const rangeLabels = { 'week': '本周', 'month': '本月' };
    const anchorDate = completedTasks.length
        ? new Date(Math.max.apply(null, completedTasks.map(t => new Date(t.time).getTime())))
        : null;
    const dayMs = 24 * 60 * 60 * 1000;

    function filterCompletedByRange(range) {
        if (!anchorDate) return completedTasks;
        const anchor = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
        let start;
        if (range === 'week') {
            const day = anchor.getDay() || 7; // 周一为一周开始
            start = new Date(anchor.getTime() - (day - 1) * dayMs);
        } else { // month
            start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        }
        return completedTasks.filter(t => {
            const d = new Date(t.time);
            return d >= start && d <= anchorDate;
        });
    }

    function renderOverview(range) {
        let pendingRange = pendingTasks;
        let completedRange = completedTasks;

        if (anchorDate) {
            const anchor = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
            let start;
            if (range === 'week') {
                const day = anchor.getDay() || 7;
                start = new Date(anchor.getTime() - (day - 1) * dayMs);
            } else { // month
                start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
            }
            const inRange = t => {
                const d = new Date(t.time);
                return d >= start && d <= anchorDate;
            };
            pendingRange = pendingTasks.filter(inRange);
            completedRange = completedTasks.filter(inRange);
        }

        const allRange = [...pendingRange, ...completedRange];
        const trueCountRange = completedRange.filter(t => t.verificationResult === '属实').length;
        const falseCountRange = completedRange.filter(t => t.verificationResult === '不属实').length;
        const totalRange = allRange.length;
        const completedCount = completedRange.length;
        const completionRateRange = totalRange ? Math.round((completedCount / totalRange) * 100) : 0;

        setBar('progress-bar', completionRateRange);
        setEl('progress-rate', completionRateRange);
        setEl('progress-desc', `${completedCount}/${totalRange} 任务`);
        setEl('metric-pending', pendingRange.length);
        setEl('metric-completed', completedCount);
        setEl('metric-true', trueCountRange);
        setEl('metric-false', falseCountRange);

        const tipEl = document.getElementById('progress-tip');
        if (tipEl) {
            tipEl.textContent = pendingRange.length > 0
                ? `待核实 ${pendingRange.length} 项，请尽快安排现场核实`
                : '';
        }
    }

    function renderAnalysis(range) {
        const analysisEl = document.getElementById('progress-analysis');
        const pieEl = document.getElementById('progress-pie');
        const legendEl = document.getElementById('progress-pie-legend');
        if (!analysisEl || !pieEl || !legendEl) return;

        const label = rangeLabels[range] || '';
        const rangePrefix = label ? label : '';

        const rangedCompleted = filterCompletedByRange(range);
        const rangedTrue = rangedCompleted.filter(t => t.verificationResult === '属实');
        const completedCount = rangedCompleted.length;
        const trueCountRange = rangedTrue.length;
        const truePct = completedCount ? Math.round((trueCountRange / completedCount) * 100) : 0;

        if (!completedCount) {
            analysisEl.innerHTML = `<li>${rangePrefix || '本周期'}暂无完成任务</li>`;
            pieEl.style.background = '#e0e0e0';
            legendEl.textContent = '本周期暂无属实缺陷';
            return;
        }

        const deviceGroups = {};
        rangedCompleted.forEach(t => { deviceGroups[t.device] = (deviceGroups[t.device] || 0) + 1; });
        const top = Object.entries(deviceGroups).sort((a, b) => b[1] - a[1])[0];

        analysisEl.innerHTML = `
            <li>${rangePrefix ? rangePrefix + '完成 ' : ''}${completedCount} 项，核实属实率 ${truePct}%</li>
            <li>${top ? '缺陷多集中在 ' + top[0] + '（' + top[1] + ' 项）' : '涉及多类设备'}</li>
        `;

        const byDevice = {};
        rangedTrue.forEach(t => { byDevice[t.device] = (byDevice[t.device] || 0) + 1; });
        const segments = Object.entries(byDevice).sort((a, b) => b[1] - a[1]);
        if (segments.length > 0) {
            const totalV = segments.reduce((s, [, n]) => s + n, 0);
            let acc = 0;
            const parts = segments.map(([, n], i) => {
                const pct = (n / totalV) * 360;
                const start = acc;
                acc += pct;
                return `${pieColors[i % pieColors.length]} ${start}deg ${acc}deg`;
            });
            pieEl.style.background = `conic-gradient(${parts.join(', ')})`;
            legendEl.innerHTML = segments.map(([name, n], i) => {
                const pct = Math.round((n / totalV) * 100);
                return `<span class="progress-pie-legend-item"><span class="dot" style="background:${pieColors[i % pieColors.length]}"></span>${name} ${n} 项（${pct}%）</span>`;
            }).join('');
        } else {
            pieEl.style.background = '#e0e0e0';
            legendEl.textContent = '本时段暂无属实缺陷';
        }
    }

    function renderTaskList(filter) {
        const listEl = document.getElementById('progress-task-list');
        if (!listEl) return;

        const PAGE_SIZE = 10;
        let currentFilter = filter || 'all';
        let currentList = [];
        let renderedCount = 0;
        let loading = false;
        let hasMore = true;

        // loader / end-tip
        let loaderEl = document.getElementById('progress-task-loader');
        if (!loaderEl) {
            loaderEl = document.createElement('div');
            loaderEl.id = 'progress-task-loader';
            loaderEl.className = 'progress-task-loader';
            loaderEl.style.display = 'none';
            listEl.parentNode && listEl.parentNode.appendChild(loaderEl);
        }

        const buildList = (f) => {
            let list = [...completedTasks].sort((a, b) => new Date(b.time) - new Date(a.time));
            if (f === 'true') list = list.filter(t => t.verificationResult === '属实');
            if (f === 'false') list = list.filter(t => t.verificationResult === '不属实');
            return list;
        };

        const taskHtml = (task) => `
            <div class="progress-task-item result-${task.verificationResult === '属实' ? 'true' : 'false'}">
                <div class="item-head">
                    <h4 class="item-title">${task.description}</h4>
                    <span class="item-badge ${task.verificationResult === '属实' ? 'true' : 'false'}">${task.verificationResult}</span>
                </div>
                <div class="item-meta">${task.device} · ${task.location} · ${task.time}</div>
                <div class="item-notes">${task.verificationNotes}</div>
            </div>
        `;

        const showLoader = () => {
            if (!loaderEl) return;
            loaderEl.innerHTML = `
                <div class="spinner"></div>
                <span class="text">加载中...</span>
            `;
            loaderEl.style.display = 'flex';
        };

        const showEnd = () => {
            if (!loaderEl) return;
            loaderEl.innerHTML = `<span class="text">已无更多记录</span>`;
            loaderEl.style.display = 'flex';
        };

        const hideLoader = () => {
            if (!loaderEl) return;
            loaderEl.style.display = 'none';
        };

        const appendNextPage = () => {
            if (loading || !hasMore) return;
            loading = true;
            showLoader();

            // 模拟加载动画延迟（前端演示）
            setTimeout(() => {
                const next = currentList.slice(renderedCount, renderedCount + PAGE_SIZE);
                if (next.length) {
                    listEl.insertAdjacentHTML('beforeend', next.map(taskHtml).join(''));
                }
                renderedCount += next.length;
                hasMore = renderedCount < currentList.length;
                loading = false;
                if (hasMore) {
                    hideLoader();
                } else if (currentList.length) {
                    showEnd();
                } else {
                    hideLoader();
                }
            }, 550);
        };

        const resetAndRender = (f) => {
            currentFilter = f || 'all';
            currentList = buildList(currentFilter);
            renderedCount = 0;
            hasMore = true;
            loading = false;
            listEl.innerHTML = '';
            hideLoader();

            if (!currentList.length) {
                listEl.innerHTML = '<p class="no-data">暂无符合条件的任务</p>';
                hasMore = false;
                return;
            }
            appendNextPage();
        };

        // 初次渲染
        resetAndRender(currentFilter);

        // 绑定滚动上拉加载（在页面主滚动容器上触发）
        const contentEl = document.querySelector('#patrol-progress .patrol-progress-content');
        if (contentEl) {
            // 防止重复绑定：每次 renderTaskList 都覆盖旧 handler
            if (contentEl._progressInfiniteHandlers) {
                const { scrollHandler, touchStartHandler, touchMoveHandler } = contentEl._progressInfiniteHandlers;
                contentEl.removeEventListener('scroll', scrollHandler);
                contentEl.removeEventListener('touchstart', touchStartHandler);
                contentEl.removeEventListener('touchmove', touchMoveHandler);
            }

            let bottomTouchStartY = 0;
            let touchedAtBottom = false;
            let scrollTriggerCooldown = false;

            const isAtBottom = () => (contentEl.scrollTop + contentEl.clientHeight) >= (contentEl.scrollHeight - 2);
            const isNearBottom = () => (contentEl.scrollTop + contentEl.clientHeight) >= (contentEl.scrollHeight - 24);

            const scrollHandler = () => {
                // 桌面端 / 非弹性滚动：接近底部直接触发
                if (scrollTriggerCooldown) return;
                if (isNearBottom() && hasMore && !loading) {
                    scrollTriggerCooldown = true;
                    appendNextPage();
                    setTimeout(() => { scrollTriggerCooldown = false; }, 400);
                }
            };

            const touchStartHandler = (e) => {
                if (!e.touches || !e.touches.length) return;
                bottomTouchStartY = e.touches[0].clientY;
                touchedAtBottom = isAtBottom();
            };

            const touchMoveHandler = (e) => {
                if (!touchedAtBottom || loading || !hasMore) return;
                if (!e.touches || !e.touches.length) return;
                const delta = e.touches[0].clientY - bottomTouchStartY;
                // 到底后继续上拉一定距离触发加载
                if (delta < -60) {
                    touchedAtBottom = false;
                    appendNextPage();
                }
            };

            contentEl.addEventListener('scroll', scrollHandler);
            contentEl.addEventListener('touchstart', touchStartHandler, { passive: true });
            contentEl.addEventListener('touchmove', touchMoveHandler, { passive: true });
            contentEl._progressInfiniteHandlers = { scrollHandler, touchStartHandler, touchMoveHandler };
        }

        // 暴露给按钮切换时复用（通过闭包）
        renderTaskList._resetAndRender = resetAndRender;
    }

    renderOverview('week');
    renderAnalysis('week');
    renderTaskList('all');

    const root = document.querySelector('#patrol-progress');
    if (root) {
        root.querySelectorAll('.progress-filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                root.querySelectorAll('.progress-filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const f = this.getAttribute('data-filter') || 'all';
                // 同一个列表组件：切换条件时重置分页并重新渲染
                if (typeof renderTaskList._resetAndRender === 'function') {
                    renderTaskList._resetAndRender(f);
                } else {
                    renderTaskList(f);
                }
            });
        });

        const timeButtons = root.querySelectorAll('.progress-time-filter-btn');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                timeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const range = this.getAttribute('data-range') || 'week';
                renderOverview(range);
                renderAnalysis(range);
            });
        });
    }
}

// 打开缺陷点位核实弹窗
