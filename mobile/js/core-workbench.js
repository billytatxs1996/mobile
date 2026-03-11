function initBottomModals() {
    // 点击选择框打开对应弹窗
    document.addEventListener('click', function(e) {
        if (e.target.closest('.select-box')) {
            const selectBox = e.target.closest('.select-box');
            const modalId = selectBox.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                // 存储当前点击的选择框
                modal.currentSelectBox = selectBox;
                // 显示弹窗
                modal.style.display = 'flex';
                
                // 处理不同类型的弹窗
                if (modal.querySelector('.modal-option-list')) {
                    // 简单选项弹窗
                    const optionItems = modal.querySelectorAll('.modal-option-item');
                    optionItems.forEach(item => {
                        if (item.dataset.value === selectBox.textContent.trim()) {
                            item.classList.add('selected');
                        } else {
                            item.classList.remove('selected');
                        }
                    });
                } else if (modal.querySelector('.calendar-container')) {
                    // 日历/时间选择器弹窗：支持 data-modal-title 动态标题
                    var titleEl = modal.querySelector('.bottom-modal-title');
                    if (titleEl && selectBox.dataset.modalTitle) titleEl.textContent = selectBox.dataset.modalTitle;
                    // 恢复时间/处理时间：默认当前时间，弹窗内也预填当前时间便于快速调整
                    var boxId = selectBox.id || '';
                    var boxText = (selectBox.textContent || '').trim();
                    var isRestoration = boxId === 'restoration-time';
                    var isHandling = boxId === 'handling-time';
                    var needDefault = (isRestoration || isHandling) && (boxText === '请选择恢复时间' || boxText === '请选择处理时间' || !boxText);
                    var now = new Date();
                    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
                    var dateTimeStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(Math.floor(now.getMinutes() / 5) * 5);
                    if (needDefault) {
                        selectBox.textContent = dateTimeStr;
                        selectBox.dataset.value = dateTimeStr;
                    }
                    var syncDate = needDefault ? now : (selectBox.dataset.value ? new Date(selectBox.dataset.value.replace(' ', 'T')) : now);
                    if (isRestoration || isHandling) {
                        if (typeof window.syncCalendarModalToDatetime === 'function') {
                            window.syncCalendarModalToDatetime(modal, isNaN(syncDate.getTime()) ? now : syncDate);
                        }
                    }
                }
            }
        }
    });
    
    // 点击弹窗选项
    document.addEventListener('click', function(e) {
        if (e.target.closest('.modal-option-item')) {
            const optionItem = e.target.closest('.modal-option-item');
            const modal = optionItem.closest('.bottom-modal');
            // 移除其他选项的选中状态
            const optionItems = modal.querySelectorAll('.modal-option-item');
            optionItems.forEach(item => item.classList.remove('selected'));
            // 添加当前选项的选中状态
            optionItem.classList.add('selected');
        }
    });
    
    // 点击日历日期
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('calendar-day')) {
            const calendarDay = e.target;
            const calendarDays = calendarDay.parentElement.querySelectorAll('.calendar-day');
            calendarDays.forEach(day => day.classList.remove('active'));
            calendarDay.classList.add('active');
        }
    });
    
    // 点击弹窗确定按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.bottom-modal-btn.primary')) {
            const btn = e.target.closest('.bottom-modal-btn.primary');
            const modal = btn.closest('.bottom-modal');
            
            if (modal.id === 'defect-verification-modal') {
                // 缺陷点位核实弹窗
                if (modal.currentTask) {
                    const selectedResult = modal.querySelector('.modal-option-item.selected');
                    const verificationNotes = modal.querySelector('.verification-notes').value;
                    
                    if (selectedResult) {
                        const verificationResult = selectedResult.dataset.value;
                        
                        // 这里可以添加提交核实结果的逻辑
                        console.log('提交核实结果:', {
                            taskId: modal.currentTask.id,
                            verificationResult: verificationResult,
                            verificationNotes: verificationNotes
                        });
                        
                        // 关闭弹窗
                        modal.style.display = 'none';
                        
                        // 显示成功提示
                        showCustomAlert('提示', '核实结果已提交');
                        
                        // 重新初始化人机协同页面，更新任务列表
                        initHumanMachinePage();
                    } else {
                        showCustomAlert('提示', '请选择核实结果');
                    }
                }
            } else if (modal.currentSelectBox) {
                if (modal.querySelector('.modal-option-list')) {
                    // 简单选项弹窗
                    const selectedOption = modal.querySelector('.modal-option-item.selected');
                    if (selectedOption) {
                        // 更新选择框的值
                        modal.currentSelectBox.textContent = selectedOption.textContent;
                        // 存储选中的值
                        modal.currentSelectBox.dataset.value = selectedOption.dataset.value;
                    }
                } else if (modal.querySelector('.calendar-container')) {
                    // 日历选择器弹窗
                    const selectedDay = modal.querySelector('.calendar-day.active');
                    const startHourSelect = modal.querySelector('.start-hour') || modal.querySelector('.hour-select');
                    const startMinuteSelect = modal.querySelector('.start-minute') || modal.querySelector('.minute-select');
                    const endHourSelect = modal.querySelector('.end-hour');
                    const endMinuteSelect = modal.querySelector('.end-minute');
                    
                    if (selectedDay && startHourSelect && startMinuteSelect) {
                            const day = selectedDay.textContent;
                            const monthYear = modal.querySelector('.calendar-title').textContent;
                            const [year, month] = monthYear.split('年');
                            // 移除月份中的"月"字符，确保正确解析
                            const monthNum = parseInt(month.replace('月', ''));
                            const startHour = startHourSelect.value;
                            const startMinute = startMinuteSelect.value;
                            
                            if (endHourSelect && endMinuteSelect) {
                                // 时间段选择
                                const endHour = endHourSelect.value;
                                const endMinute = endMinuteSelect.value;
                                
                                // 构建日期时间字符串
                                const startDateTimeStr = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${startHour}:${startMinute}`;
                                const endDateTimeStr = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${endHour}:${endMinute}`;
                                const dateTimeRangeStr = `${startDateTimeStr} - ${endDateTimeStr}`;
                                
                                // 更新选择框的值
                                modal.currentSelectBox.textContent = dateTimeRangeStr;
                                // 存储选中的值
                                modal.currentSelectBox.dataset.value = dateTimeRangeStr;
                            } else {
                                // 单个时间选择
                                // 构建日期时间字符串
                                const dateTimeStr = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${startHour}:${startMinute}`;
                                
                                // 更新选择框的值
                                modal.currentSelectBox.textContent = dateTimeStr;
                                // 存储选中的值
                                modal.currentSelectBox.dataset.value = dateTimeStr;
                            }
                        }
                }
                
                // 关闭弹窗
                modal.style.display = 'none';
            }
        }
    });
    
    // 点击弹窗取消按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.bottom-modal-btn.secondary') || e.target.closest('.bottom-modal-close')) {
            const btn = e.target.closest('.bottom-modal-btn.secondary') || e.target.closest('.bottom-modal-close');
            const modal = btn.closest('.bottom-modal');
            // 关闭弹窗
            modal.style.display = 'none';
        }
    });
    
    // 点击弹窗外部关闭弹窗
    document.addEventListener('click', function(e) {
        if (e.target.closest('.bottom-modal') && !e.target.closest('.bottom-modal-content')) {
            const modal = e.target.closest('.bottom-modal');
            // 关闭弹窗
            modal.style.display = 'none';
        }
    });
}

// 初始化工作台页面的应用图标点击事件
function initWorkbenchAppIcons() {
    // 绑定工作台页面的管理决策应用图标点击事件
    const managementApps = document.querySelectorAll('.app-section:nth-child(1) .app-item');
    managementApps.forEach((app, index) => {
        if (index === 0) {
            // 重点工作应用
            app.addEventListener('click', openKeyWorkPage);
        } else if (index === 1) {
            // 业务看板应用
            app.addEventListener('click', openBusinessDashboardPage);
        } else if (index === 2) {
            // 质量看板应用
            app.addEventListener('click', openQualityDashboardPage);
        }
    });
    
    // 绑定工作台页面的智能安全应用图标点击事件
    const smartSafetyApps = document.querySelectorAll('.app-section:nth-child(2) .app-item');
    smartSafetyApps.forEach((app, index) => {
        const tabs = ['work-order', 'authorization', 'safety-measure', 'operation-process', 'operation-end'];
        app.addEventListener('click', () => {
            openSmartSafetyPage(tabs[index]);
        });
    });
    
    // 绑定工作台页面的智能巡视应用图标点击事件
    const smartPatrolApps = document.querySelectorAll('.app-section:nth-child(3) .app-item');
    smartPatrolApps.forEach((app, index) => {
        if (index === 0) {
            // 人机协同应用
            app.addEventListener('click', openHumanMachinePage);
        } else if (index === 1) {
            // 巡视进度指标应用
            app.addEventListener('click', openPatrolProgressPage);
        }
    });
    
    // 绑定工作台页面的智能跳闸应用图标点击事件（根据 data-app 精确映射）
    const smartTripApps = document.querySelectorAll('#workbench .app-item[data-app]');
    smartTripApps.forEach(app => {
        app.addEventListener('click', () => {
            const appType = app.dataset.app;
            if (appType === 'fault-confirmation') {
                openSmartTripPage('fault-confirmation');
            } else if (appType === 'fault-handling') {
                openSmartTripPage('fault-handling');
            } else {
                openSmartTripPage('trip-report');
            }
        });
    });
    
    // 更新人机协同角标
    updateHumanMachineBadge();
    // 更新工作票/安措执行/作业过程/作业终结的进行中数量角标
    updateSmartSafetyBadges();
}

// 更新人机协同角标
function updateHumanMachineBadge() {
    // 模拟数据：待核实缺陷点位
    const defectTasks = [
        {
            id: 1,
            device: '10kV开关柜',
            location: '1号间隔',
            description: '开关柜柜门密封胶条老化，存在缝隙',
            time: '2026-02-10 10:30',
            status: 'pending'
        },
        {
            id: 2,
            device: '主变压器',
            location: '本体散热片',
            description: '散热片表面积灰严重，影响散热效果',
            time: '2026-02-10 09:15',
            status: 'pending'
        },
        {
            id: 3,
            device: 'GIS设备',
            location: '2号气室',
            description: '气室压力值接近告警阈值',
            time: '2026-02-10 08:45',
            status: 'pending'
        }
    ];
    
    // 计算待核实任务数量
    const pendingCount = defectTasks.length;
    
    // 更新角标
    const badge = document.getElementById('human-machine-badge');
    if (badge) {
        badge.textContent = pendingCount;
        // 如果数量为0，隐藏角标
        if (pendingCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    }
}

// 更新工作票、授权申请、安措执行、作业过程、作业终结的进行中作业项数量角标（与「选择作业项」列表一致，0 不显示）
function updateSmartSafetyBadges() {
    const badgeIds = ['work-order-badge', 'authorization-badge', 'safety-measure-badge', 'operation-process-badge', 'operation-end-badge'];
    const inProgressCount = 1;
    const counts = [inProgressCount, inProgressCount, inProgressCount, inProgressCount, inProgressCount];
    badgeIds.forEach((id, i) => {
        const badge = document.getElementById(id);
        if (!badge) return;
        const n = counts[i];
        if (n === 0) {
            badge.style.display = 'none';
            badge.textContent = '';
        } else {
            badge.textContent = n > 99 ? '99+' : String(n);
            badge.style.display = 'flex';
        }
    });
}

// 初始化所有功能
function initApp() {
    initPageSwitch();
    initTabSwitch();
    initMessageInput();
    initQuickFunctions();
    initDynamicTime();
    initRoleSwitch();
    initAlertPage();
    initXiaozhiSidebar();
    initScenarioSelector();
    initWorkbenchAppIcons();
    initBottomModals();
    initDefectVerificationModal();
    initBackButtonDelegation();
    updateFaultBadges();
}
// 打开重点工作页面
function openKeyWorkPage() {
    showPage('key-work');
    
    // 初始化重点工作页面
    initKeyWorkPage();
}

function openBusinessDashboardPage() {
    showPage('business-dashboard');
    
    // 初始化业务看板页面
    initBusinessDashboardPage();
}

// 初始化业务看板页面
function openQualityDashboardPage() {
    showPage('quality-dashboard');
    
    // 初始化质量看板页面
    initQualityDashboardPage();
}

// 初始化质量看板页面
