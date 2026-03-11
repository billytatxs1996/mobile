// 告警页面功能
function initAlertPage() {
    const alertCards = document.querySelectorAll('.alert-card');
    const alertDetailModal = document.getElementById('alert-detail-modal');
    const closeBtn = document.querySelector('.close-btn');
    const markAllReadBtn = document.querySelector('.mark-all-read');

    // 安全告警卡片（第一个）
    const safetyAlertCard = document.querySelector('.alert-card-icon.safety')?.closest('.alert-card');
    const safetyAlertBadge = safetyAlertCard ? safetyAlertCard.querySelector('.alert-badge') : null;
    const safetyAlertTime = safetyAlertCard ? safetyAlertCard.querySelector('.alert-card-time') : null;
    const safetyAlertContent = safetyAlertCard ? safetyAlertCard.querySelector('.alert-card-content') : null;

    // 跳闸告警卡片（最后一个）
    const tripAlertCard = document.querySelector('.alert-card-icon.trip')?.closest('.alert-card');
    const tripAlertBadge = tripAlertCard ? tripAlertCard.querySelector('.alert-badge') : null;
    const tripAlertContent = tripAlertCard ? tripAlertCard.querySelector('.alert-card-content') : null;

    // 安全告警数据：与智能安全作业项联动（通过 jobId 和目标标签）
    const safetyAlerts = [
        {
            id: 'sa1',
            jobId: '1',
            level: 'danger',
            title: '安措布置待确认',
            summary: '10kV开关柜检修项目安措拍照未完成，许可前需补齐现场照片。',
            time: '2026-02-12 08:50',
            targetTab: 'safety-measure',
            read: false
        },
        {
            id: 'sa2',
            jobId: '1',
            level: 'warning',
            title: '授权申请待审核',
            summary: '10kV开关柜检修项目已提交临时增员/车辆授权申请，请许可人员及时审核。',
            time: '2026-02-12 09:15',
            targetTab: 'authorization',
            read: false
        },
        {
            id: 'sa3',
            jobId: '2',
            level: 'warning',
            title: '作业进度未更新',
            summary: '主变压器预防性试验作业进度超过计划时间，需更新当前进度与异常情况。',
            time: '2026-02-12 10:05',
            targetTab: 'operation-process',
            read: false
        },
        {
            id: 'sa4',
            jobId: '3',
            level: 'info',
            title: '完工信息待终结',
            summary: 'GIS设备例行维护已完成，终结信息和完工照片待补充提交。',
            time: '2026-02-11 18:20',
            targetTab: 'operation-end',
            read: false
        }
    ];

    function updateSafetyAlertCard() {
        if (!safetyAlertCard || !safetyAlertBadge || !safetyAlertContent || !safetyAlertTime) return;
        const unread = safetyAlerts.filter(a => !a.read);
        safetyAlertBadge.textContent = unread.length;
        if (unread.length === 0) {
            safetyAlertTime.textContent = '暂无';
            safetyAlertContent.textContent = '暂无安全告警';
        } else {
            // 最近一条放在数组前面即可
            const latest = unread[0];
            safetyAlertTime.textContent = latest.time;
            safetyAlertContent.textContent = latest.summary.length > 40
                ? latest.summary.slice(0, 40) + '...'
                : latest.summary;
        }
    }
    
    // 更新跳闸告警数量和内容
    window.updateTripAlert = function() {
        // 计算未读跳闸事件数量
        let unreadCount = 0;
        const unreadEvents = [];
        
        Object.values(globalTripEventData).forEach((event, index) => {
            if (!event.read) {
                unreadCount++;
                unreadEvents.push(event);
            }
        });
        
        // 更新跳闸告警数量
        if (tripAlertBadge) tripAlertBadge.textContent = unreadCount;
        
        // 更新跳闸告警内容
        if (tripAlertContent) {
            if (unreadCount > 0 && unreadEvents[0] && unreadEvents[0].eventName && unreadEvents[0].eventTime) {
                const latestEvent = unreadEvents[0];
                // 构建告警内容
                let alertContent = `${latestEvent.eventName}（${latestEvent.eventTime}）发生跳闸`;
                // 如果有设备信息，添加设备信息
                if (latestEvent.equipment) {
                    alertContent += `，设备：${latestEvent.equipment}`;
                }
                // 如果有类型信息，添加类型信息
                if (latestEvent.type) {
                    alertContent += `，类型：${latestEvent.type}`;
                }
                // 添加处理提示
                alertContent += '，请及时检查故障原因并处理。';
                // 如果内容太长，使用缩略号
                if (alertContent.length > 50) {
                    alertContent = alertContent.substring(0, 50) + '...';
                }
                tripAlertContent.textContent = alertContent;
            } else {
                tripAlertContent.textContent = '暂无未读跳闸告警';
            }
        }
    };
    
    // 初始化时更新告警概览
    updateSafetyAlertCard();
    window.updateTripAlert();
    
    // 告警卡片点击事件
    alertCards.forEach(card => {
        card.addEventListener('click', () => {
            const isSafetyAlert = card.querySelector('.alert-card-icon.safety');
            const isTripAlert = card.querySelector('.alert-card-icon.trip');
            const isPatrolAlert = card.querySelector('.alert-card-icon.patrol');

            if (isSafetyAlert) {
                // 点击安全告警，展示与智能安全作业项联动的消息列表
                const modalBody = alertDetailModal.querySelector('.modal-body');
                modalBody.innerHTML = '';

                const unreadSafety = safetyAlerts.filter(a => !a.read);
                const list = unreadSafety.length > 0 ? unreadSafety : safetyAlerts;

                if (list.length > 0) {
                    list.forEach(alert => {
                        const detailItem = document.createElement('div');
                        detailItem.className = 'detail-item safety-detail-item';

                        const levelClass = alert.level === 'danger'
                            ? 'danger'
                            : alert.level === 'warning'
                            ? 'warning'
                            : 'info';

                        // 通过 jobId 取作业名称
                        let jobName = '智能安全作业';
                        const jobEl = document.querySelector(`#job-list .job-item[data-job-id=\"${alert.jobId}\"] h4`);
                        if (jobEl) jobName = jobEl.textContent.trim();

                        detailItem.innerHTML = `
                            <div class="detail-header">
                                <span class="detail-tag ${levelClass}">${levelClass === 'danger' ? '紧急' : levelClass === 'warning' ? '提醒' : '通知'}</span>
                                <span class="detail-title">${alert.title}</span>
                            </div>
                            <div class="detail-info">
                                <span class="detail-equipment">关联作业：${jobName}</span>
                            </div>
                            <p class="detail-content">${alert.summary}</p>
                            <div class="detail-footer">
                                <span class="detail-time">${alert.time}</span>
                                <span class="detail-link">去处理</span>
                            </div>
                        `;

                        detailItem.addEventListener('click', () => {
                            alertDetailModal.classList.remove('active');
                            // 标记为已读并更新卡片
                            alert.read = true;
                            updateSafetyAlertCard();

                            // 跳转到智能安全页面对应标签
                            const targetTab = alert.targetTab || 'work-order';
                            openSmartSafetyPage(targetTab);

                            // 选择对应作业项，让内容联动刷新
                            setTimeout(() => {
                                const jobItems = document.querySelectorAll('#job-list .job-item');
                                jobItems.forEach(item => {
                                    if (item.getAttribute('data-job-id') === String(alert.jobId)) {
                                        item.click();
                                    }
                                });
                            }, 80);
                        });

                        modalBody.appendChild(detailItem);
                    });
                } else {
                    const emptyItem = document.createElement('div');
                    emptyItem.className = 'detail-item';
                    emptyItem.innerHTML = `
                        <div class="detail-header">
                            <span class="detail-title">暂无安全告警</span>
                        </div>
                        <p class="detail-content">当前没有未处理的智能安全作业风险。</p>
                    `;
                    modalBody.appendChild(emptyItem);
                }

                alertDetailModal.classList.add('active');
            } else if (isTripAlert) {
                // 点击跳闸告警，显示未读的跳闸事件
                const modalBody = alertDetailModal.querySelector('.modal-body');
                modalBody.innerHTML = '';
                
                // 筛选未读的跳闸事件
                const unreadEvents = [];
                Object.values(globalTripEventData).forEach((event, index) => {
                    if (!event.read) {
                        unreadEvents.push({...event, id: index + 1});
                    }
                });
                
                // 按时间排序（最近的在前）
                unreadEvents.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime));
                
                // 生成消息列表
                if (unreadEvents.length > 0) {
                    unreadEvents.forEach(event => {
                        const detailItem = document.createElement('div');
                        detailItem.className = 'detail-item';
                        // 确保event对象具有必要的属性
                        const eventName = event.eventName || '跳闸事件';
                        const description = event.description || '发生跳闸事件，请及时处理';
                        const eventTime = event.eventTime || '未知时间';
                        const equipment = event.equipment || '未知设备';
                        const type = event.type || '未知类型';
                        
                        detailItem.innerHTML = `
                            <div class="detail-header">
                                <span class="detail-tag danger">紧急</span>
                                <span class="detail-title">${eventName}</span>
                            </div>
                            <p class="detail-content">${description}</p>
                            <div class="detail-info">
                                <span class="detail-equipment">设备：${equipment}</span>
                                <span class="detail-type">类型：${type}</span>
                            </div>
                            <div class="detail-footer">
                                <span class="detail-time">${eventTime}</span>
                            </div>
                        `;
                        
                        // 添加点击事件，跳转到跳闸简报页面
                        detailItem.addEventListener('click', () => {
                            alertDetailModal.classList.remove('active');
                            // 标记该事件为已读
                            if (event.id && globalTripEventData[event.id]) {
                                globalTripEventData[event.id].read = true;
                                // 更新跳闸告警
                                window.updateTripAlert();
                                // 更新故障事件数量角标
                                updateFaultBadges();
                            }
                            // 跳转到跳闸简报页面
                            openSmartTripPage('trip-report');
                            // 模拟选择该事件
                            const eventItems = document.querySelectorAll('#trip-event-list .job-item');
                            if (event.id) {
                                eventItems.forEach(item => {
                                    if (item.getAttribute('data-event-id') === event.id.toString()) {
                                        item.click();
                                    }
                                });
                            }
                        });
                        
                        modalBody.appendChild(detailItem);
                    });
                } else {
                    const emptyItem = document.createElement('div');
                    emptyItem.className = 'detail-item';
                    emptyItem.innerHTML = `
                        <div class="detail-header">
                            <span class="detail-title">暂无未读跳闸告警</span>
                        </div>
                        <p class="detail-content">所有跳闸事件均已读</p>
                    `;
                    modalBody.appendChild(emptyItem);
                }
                
                alertDetailModal.classList.add('active');
            } else if (isPatrolAlert) {
                // 点击巡视告警，显示待核实任务
                const modalBody = alertDetailModal.querySelector('.modal-body');
                modalBody.innerHTML = '';
                
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
                
                // 按时间排序（最近的在前）
                defectTasks.sort((a, b) => new Date(b.time) - new Date(a.time));
                
                // 生成消息列表
                if (defectTasks.length > 0) {
                    defectTasks.forEach(task => {
                        const detailItem = document.createElement('div');
                        detailItem.className = 'detail-item';
                        
                        detailItem.innerHTML = `
                            <div class="detail-header">
                                <span class="detail-tag danger">紧急</span>
                                <span class="detail-title">${task.device}</span>
                            </div>
                            <p class="detail-content">${task.description}</p>
                            <div class="detail-info">
                                <span class="detail-equipment">点位位置：${task.location}</span>
                            </div>
                            <div class="detail-footer">
                                <span class="detail-time">${task.time}</span>
                            </div>
                        `;
                        
                        // 添加点击事件，跳转到人机协同详情页面
                        detailItem.addEventListener('click', () => {
                            alertDetailModal.classList.remove('active');
                            // 跳转到人机协同页面
                            openHumanMachinePage();
                            // 模拟选择该任务
                            setTimeout(() => {
                                const taskItems = document.querySelectorAll('#pending-task-list .job-item');
                                if (task.id) {
                                    taskItems.forEach(item => {
                                        if (item.getAttribute('data-task-id') === task.id.toString()) {
                                            item.click();
                                        }
                                    });
                                }
                            }, 100);
                        });
                        
                        modalBody.appendChild(detailItem);
                    });
                } else {
                    const emptyItem = document.createElement('div');
                    emptyItem.className = 'detail-item';
                    emptyItem.innerHTML = `
                        <div class="detail-header">
                            <span class="detail-title">暂无待核实任务</span>
                        </div>
                        <p class="detail-content">所有任务均已核实</p>
                    `;
                    modalBody.appendChild(emptyItem);
                }
                
                alertDetailModal.classList.add('active');
            } else {
                // 点击其他告警，显示默认内容
                alertDetailModal.classList.add('active');
            }
        });
    });
    
    // 全部已读按钮点击事件
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            // 标记所有告警为已读
            Object.values(globalTripEventData).forEach(event => {
                event.read = true;
            });

            // 安全告警也全部置为已读
            safetyAlerts.forEach(a => { a.read = true; });
            
            // 更新告警卡片
            updateSafetyAlertCard();
            updateTripAlert();
            
            // 更新故障事件数量角标
            updateFaultBadges();
            
            showCustomAlert('提示', '所有告警已标记为已读');
        });
    }
    
    // 关闭弹窗
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            alertDetailModal.classList.remove('active');
        });
    }
    
    // 点击弹窗外部关闭
    if (alertDetailModal) {
        alertDetailModal.addEventListener('click', (e) => {
            if (e.target === alertDetailModal) {
                alertDetailModal.classList.remove('active');
            }
        });
    }
}

// 小智页面侧边栏功能
