function initSmartTripPage(targetTab = 'trip-report') {
    // 获取元素
    const smartTripPage = document.getElementById('smart-trip');
    const tripEventSelectionPage = document.getElementById('trip-event-selection-page');
    const backBtn = document.querySelector('#smart-trip .back-btn');
    const tabBtns = document.querySelectorAll('#smart-trip .tab-btn');
    const tabContents = document.querySelectorAll('#smart-trip .tab-content');
    const eventItems = document.querySelectorAll('#trip-event-list .job-item');

    // 智能跳闸页内照片点击全屏（本地实现，不依赖 smart-safety.js）
    function initPhotoFullscreen() {
        let modal = document.getElementById('photo-fullscreen-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'photo-fullscreen-modal';
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.9);display:none;justify-content:center;align-items:center;z-index:99999;';
            const wrap = document.createElement('div');
            wrap.style.cssText = 'width:100%;height:100%;display:flex;justify-content:center;align-items:center;';
            const img = document.createElement('img');
            img.id = 'fullscreen-image';
            img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';
            wrap.appendChild(img);
            modal.appendChild(wrap);
            document.body.appendChild(modal);
            wrap.addEventListener('click', function() { modal.style.display = 'none'; });
        }
        const fullscreenImage = document.getElementById('fullscreen-image');
        document.querySelectorAll('#smart-trip .photo-display img').forEach(function(photo) {
            photo.style.cursor = 'pointer';
            photo.onclick = function() {
                if (fullscreenImage) fullscreenImage.src = this.src;
                modal.style.display = 'flex';
            };
        });
    }

    // 故障确认：记录原始表单模板（用于未确认时恢复表单）
    const faultConfirmationContainer = document.querySelector('#smart-trip .fault-confirmation-content .work-order-container');
    const faultHandlingFormContainer = document.getElementById('fault-handling-form-container');
    const faultHandlingFormInner = faultHandlingFormContainer ? faultHandlingFormContainer.querySelector('.work-order-container') : null;
    if (!window.__faultConfirmationFormTemplate && faultConfirmationContainer && faultConfirmationContainer.querySelector('.feedback-form')) {
        window.__faultConfirmationFormTemplate = faultConfirmationContainer.innerHTML;
    }
    const faultConfirmationTemplate = window.__faultConfirmationFormTemplate || (faultConfirmationContainer ? faultConfirmationContainer.innerHTML : '');
    
    // 存储当前选择的作业项和标签
    let selectedEvent = null;
    let activeTab = targetTab;
    
    // 使用全局的跳闸事件数据
    // 确保全局数据与初始状态一致
    if (!window.tripEventDataInitialized) {
        // 如果还没有初始化，调用初始化函数
        initTripEventData();
    }
    
    // 为了方便使用，创建一个局部引用
    const tripEventData = globalTripEventData;
    
    // 切换标签
    function switchTab(tabId) {
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        const targetBtn = document.querySelector(`#smart-trip .tab-btn[data-tab="${tabId}"]`);
        const targetContent = document.querySelector(`#smart-trip .tab-content[data-tab="${tabId}"]`);
        if (!targetBtn || !targetContent) return;
        
        targetBtn.classList.add('active');
        targetContent.classList.add('active');
        
        activeTab = tabId;
        
        // 故障处理：恢复时间、处理时间默认当前时间，便于快速调整
        if (tabId === 'fault-handling') {
            var now = new Date();
            var pad = function (n) { return (n < 10 ? '0' : '') + n; };
            var dt = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(Math.floor(now.getMinutes() / 5) * 5);
            var rt = document.getElementById('restoration-time');
            var ht = document.getElementById('handling-time');
            if (rt && (rt.textContent === '请选择恢复时间' || !rt.dataset.value)) { rt.textContent = dt; rt.dataset.value = dt; }
            if (ht && (ht.textContent === '请选择处理时间' || !ht.dataset.value)) { ht.textContent = dt; ht.dataset.value = dt; }
        }
        
        // 如果已经选择了跳闸事件，更新内容
        if (selectedEvent) {
            updatePageContent();
        }
    }

    // 打开页面时先根据 targetTab 激活对应标签，避免默认总是停留在跳闸快报
    switchTab(activeTab);
    
    // 更新页面内容（以选中的列表项为准，避免列表与数据不一致时显示错事件）
    function updatePageContent() {
        if (!selectedEvent) return;
        
        const eventId = selectedEvent.getAttribute('data-event-id');
        const eventData = tripEventData[String(eventId)];
        // 事件名称：优先用当前选中列表项上的文案（data-event-name 或 h4），保证“选谁显示谁”
        const displayName = selectedEvent.getAttribute('data-event-name') ||
            (selectedEvent.querySelector('.job-info h4') && selectedEvent.querySelector('.job-info h4').textContent) ||
            (eventData && eventData.eventName) || '';
        // 状态：优先数据源，其次从列表项“状态：”文案解析
        let effectiveStatus = (eventData && eventData.status) ? eventData.status : '';
        if (!effectiveStatus && selectedEvent.querySelector('.job-info')) {
            const statusP = Array.from(selectedEvent.querySelectorAll('.job-info p')).find(function(p) { return /状态[：:]/.test(p.textContent); });
            if (statusP) {
                const m = statusP.textContent.match(/状态[：:]\s*(\S+)/);
                if (m && m[1]) effectiveStatus = m[1].trim();
            }
        }
        
        // 所有页面的“跳闸事件”名称统一用选中项名称
        document.querySelectorAll('.trip-event-name').forEach(function(el) { el.textContent = displayName; });
        
        if (eventData) {
            const tripReport = document.querySelector('#smart-trip .trip-report-content');
            if (tripReport) {
                const timeEl = tripReport.querySelector('.trip-event-time');
                if (timeEl) timeEl.textContent = eventData.eventTime;
                const equipEl = tripReport.querySelector('.trip-equipment');
                if (equipEl) equipEl.textContent = eventData.equipment;
                const typeEl = tripReport.querySelector('.trip-type');
                if (typeEl) typeEl.textContent = eventData.type;
                const currentEl = tripReport.querySelector('.trip-current');
                if (currentEl) currentEl.textContent = eventData.current;
                const statusEl = tripReport.querySelector('.trip-status');
                if (statusEl) statusEl.textContent = eventData.status;
                const descEl = tripReport.querySelector('.trip-description');
                if (descEl) descEl.textContent = eventData.description;
                const imgEl = tripReport.querySelector('.waveform-image');
                if (imgEl) imgEl.src = eventData.waveform || '';
            }
        }
        
        updateFaultConfirmationPage(effectiveStatus, displayName);
        updateFaultHandlingPage(effectiveStatus, displayName);
        
        document.querySelectorAll('.trip-event-name').forEach(function(el) { el.textContent = displayName; });
        initPhotoFullscreen();
        setTripEventFormEditable(effectiveStatus);
    }
    
    // 更新故障确认页面内容
    function updateFaultConfirmationPage(eventStatus, displayName) {
        const faultConfirmationContent = document.querySelector('#smart-trip .fault-confirmation-content .work-order-container');
        if (!faultConfirmationContent) return;
        
        // 逻辑调整：
        // - 未确认：保留原始表单结构，等待填写
        // - 待处理 / 已处理：展示已确认的只读信息
        if (eventStatus === '待处理' || eventStatus === '已处理') {
            // 已完成故障确认：纯数据展示，无交互按钮
            faultConfirmationContent.innerHTML = `
                <div class="work-order-section">
                    <div class="info-item">
                        <span class="info-label">跳闸事件：</span>
                        <span class="info-value trip-event-name"></span>
                    </div>
                </div>
                
                <div class="work-order-section">
                    <h3>故障确认信息</h3>
                    <div class="info-grid">
                        <div class="info-item full-width">
                            <span class="info-label">故障点照片：</span>
                            <span class="info-value">已上传</span>
                            <div class="photo-display">
                                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=电力设备故障点照片，显示设备故障位置和损坏情况&image_size=landscape_4_3" alt="故障点照片" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                            </div>
                        </div>
                        <div class="info-item full-width">
                            <span class="info-label">设备状态照片：</span>
                            <span class="info-value">已上传</span>
                            <div class="photo-display">
                                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=电力设备整体状态照片，显示设备全貌和周围环境&image_size=landscape_4_3" alt="设备状态照片" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                            </div>
                        </div>
                        <div class="info-item full-width">
                            <span class="info-label">现场环境照片：</span>
                            <span class="info-value">已上传</span>
                            <div class="photo-display">
                                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=电力设备现场环境照片，显示设备周围的环境和安全措施&image_size=landscape_4_3" alt="现场环境照片" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="work-order-section">
                    <h3>反馈记录</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">故障类型：</span>
                            <span class="info-value">设备内部故障</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">故障等级：</span>
                            <span class="info-value">重大故障</span>
                        </div>
                        <div class="info-item full-width">
                            <span class="info-label">故障描述：</span>
                            <span class="info-value">设备运行时发生异常声响，随后保护装置动作跳闸，现场检查发现设备内部存在明显损坏。</span>
                        </div>
                        <div class="info-item full-width">
                            <span class="info-label">处理建议：</span>
                            <span class="info-value">立即停止设备运行，进行全面检修，更换损坏部件，确保设备安全后再投入运行。</span>
                        </div>
                    </div>
                </div>
                
                <div class="work-order-section">
                    <h3>图片标记</h3>
                    <div class="info-grid">
                        <div class="info-item full-width">
                            <span class="info-label">标记说明：</span>
                            <span class="info-value">已在故障点照片上标记出具体故障位置和损坏程度。</span>
                        </div>
                    </div>
                </div>
            `;
            
            const nameText = (typeof displayName !== 'undefined' ? displayName : (document.querySelector('#smart-trip .trip-report-content .trip-event-name') || {}).textContent) || '';
            document.querySelectorAll('#smart-trip .fault-confirmation-content .trip-event-name').forEach(function(el) { el.textContent = nameText; });
            
            // 为照片添加点击全屏查看功能
            initPhotoFullscreen();
        } else {
            // 未确认：恢复原始「待填写」表单结构（使用首次保存的表单模板）
            const template = window.__faultConfirmationFormTemplate || faultConfirmationTemplate;
            if (template) {
                faultConfirmationContent.innerHTML = template;
            }
        }
    }
    
    // 更新故障处理页面内容：已处理显示只读区块，未确认/待处理显示表单（用 data 属性 + CSS 控制）
    function updateFaultHandlingPage(eventStatus, displayName) {
        const wrap = document.querySelector('#smart-trip .fault-handling-content');
        const readonlyEl = document.getElementById('fault-handling-readonly');
        if (!wrap) return;
        if (eventStatus === '已处理') {
            wrap.setAttribute('data-handling-view', 'readonly');
            if (readonlyEl) {
                const nameText = (typeof displayName !== 'undefined' ? displayName : (document.querySelector('#smart-trip .trip-report-content .trip-event-name') || {}).textContent) || '';
                readonlyEl.querySelectorAll('.trip-event-name').forEach(function(el) { el.textContent = nameText; });
                initPhotoFullscreen();
            }
        } else {
            wrap.setAttribute('data-handling-view', 'form');
        }
    }
    
    // 设置跳闸事件表单可编辑性
    function setTripEventFormEditable(eventStatus) {
        // 故障确认页面表单元素
        const faultConfirmationElements = document.querySelectorAll('.fault-confirmation-content input, .fault-confirmation-content textarea, .fault-confirmation-content button, .fault-confirmation-content select, .fault-confirmation-content .select-box, .fault-confirmation-content .photo-btn, .fault-confirmation-content .confirm-btn');
        
        // 故障处理页面表单元素
        const faultHandlingElements = document.querySelectorAll('.fault-handling-content input, .fault-handling-content textarea, .fault-handling-content button, .fault-handling-content select, .fault-handling-content .select-box, .fault-handling-content .photo-btn');
        
        if (eventStatus === '未确认') {
            // 未确认状态，故障确认和故障处理都可编辑
            // 故障确认表单可编辑
            faultConfirmationElements.forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.disabled = false;
                } else {
                    element.style.pointerEvents = 'auto';
                    element.style.opacity = '1';
                }
            });
            
            // 故障处理表单可编辑
            faultHandlingElements.forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.disabled = false;
                } else {
                    element.style.pointerEvents = 'auto';
                    element.style.opacity = '1';
                }
            });
        } else if (eventStatus === '待处理') {
            // 待处理状态，故障确认不可编辑，故障处理可编辑
            // 故障确认表单不可编辑
            faultConfirmationElements.forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.disabled = true;
                } else {
                    element.style.pointerEvents = 'none';
                    element.style.opacity = '0.6';
                }
            });
            
            // 故障处理表单可编辑
            faultHandlingElements.forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.disabled = false;
                } else {
                    element.style.pointerEvents = 'auto';
                    element.style.opacity = '1';
                }
            });
        } else if (eventStatus === '已处理') {
            // 已处理状态，故障确认和故障处理都不可编辑
            // 故障确认表单不可编辑
            faultConfirmationElements.forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.disabled = true;
                } else {
                    element.style.pointerEvents = 'none';
                    element.style.opacity = '0.6';
                }
            });
            
            // 故障处理表单不可编辑
            faultHandlingElements.forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.disabled = true;
                } else {
                    element.style.pointerEvents = 'none';
                    element.style.opacity = '0.6';
                }
            });
        }
    }
    
    // 绑定跳闸事件选择页面的事件项点击事件
    eventItems.forEach(item => {
        item.addEventListener('click', function() {
            selectedEvent = this;
            hideTripEventSelectionPage();
            switchTab(activeTab);
        });
    });
    
    // 跳闸事件选择页与智能跳闸页返回按钮由 initBackButtonDelegation 统一处理
    
    // 切换项目按钮
    const switchProjectBtn = document.querySelector('#smart-trip .switch-project-btn');
    if (switchProjectBtn) {
        switchProjectBtn.addEventListener('click', function() {
            console.log('Switch project button clicked');
            showTripEventSelectionPage();
        });
    }
    
    // 绑定跳闸事件选择页面的搜索框输入事件（实时搜索）
    const tripEventSearchInput = document.getElementById('trip-event-search');
    if (tripEventSearchInput) {
        tripEventSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const eventItems = document.querySelectorAll('#trip-event-list .job-item');
            eventItems.forEach(item => {
                const eventName = item.querySelector('h4').textContent.toLowerCase();
                const equipment = item.querySelector('p:nth-child(3)').textContent.toLowerCase();
                
                const matchesEventName = searchTerm === '' || eventName.includes(searchTerm);
                const matchesEquipment = searchTerm === '' || equipment.includes(searchTerm);
                
                if (matchesEventName || matchesEquipment) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // 绑定筛选按钮点击事件
    const tripEventFilterBtn = document.getElementById('trip-event-filter-btn');
    if (tripEventFilterBtn) {
        tripEventFilterBtn.addEventListener('click', function() {
            const filterModal = document.getElementById('trip-event-filter-modal');
            if (filterModal) {
                filterModal.style.display = 'flex';
            }
        });
    }
    
    // 绑定筛选弹窗关闭按钮点击事件
    const tripEventFilterModalClose = document.querySelector('#trip-event-filter-modal .bottom-modal-close');
    if (tripEventFilterModalClose) {
        tripEventFilterModalClose.addEventListener('click', function() {
            const filterModal = document.getElementById('trip-event-filter-modal');
            if (filterModal) {
                filterModal.style.display = 'none';
            }
        });
    }
    
    // 绑定筛选弹窗确认按钮点击事件
    const tripEventFilterConfirmBtn = document.getElementById('trip-filter-confirm');
    if (tripEventFilterConfirmBtn) {
        tripEventFilterConfirmBtn.addEventListener('click', function() {
            // 这里可以添加筛选逻辑
            const filterModal = document.getElementById('trip-event-filter-modal');
            if (filterModal) {
                filterModal.style.display = 'none';
            }
        });
    }
    
    // 绑定筛选弹窗重置按钮点击事件
    const tripEventFilterResetBtn = document.getElementById('trip-filter-reset');
    if (tripEventFilterResetBtn) {
        tripEventFilterResetBtn.addEventListener('click', function() {
            // 这里可以添加重置逻辑
            var tripDateEl = document.getElementById('trip-filter-date');
            if (tripDateEl) { tripDateEl.textContent = '请选择跳闸时间'; tripDateEl.dataset.value = ''; }
            const statusOptions = document.querySelectorAll('#trip-event-filter-modal .modal-option-item');
            statusOptions.forEach(option => option.classList.remove('selected'));
        });
    }
    
    // 标签切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // 自动选择跳闸事件逻辑
    function autoSelectTripEvent() {
        // 获取所有跳闸事件
        const allEventItems = Array.from(eventItems);
        
        // 按状态排序
        const unconfirmedEvents = allEventItems.filter(item => {
            const eventId = item.getAttribute('data-event-id');
            return tripEventData[eventId].status === '未确认';
        });
        
        const pendingEvents = allEventItems.filter(item => {
            const eventId = item.getAttribute('data-event-id');
            return tripEventData[eventId].status === '待处理';
        });
        
        const processedEvents = allEventItems.filter(item => {
            const eventId = item.getAttribute('data-event-id');
            return tripEventData[eventId].status === '已处理';
        });
        
        const unreadEvents = allEventItems.filter(item => {
            const eventId = item.getAttribute('data-event-id');
            return tripEventData[eventId].read === false;
        });
        
        // 按时间排序事件（最近的在前）
        function sortEventsByTime(events) {
            return events.sort((a, b) => {
                const eventIdA = a.getAttribute('data-event-id');
                const eventIdB = b.getAttribute('data-event-id');
                return new Date(tripEventData[eventIdB].eventTime) - new Date(tripEventData[eventIdA].eventTime);
            });
        }
        
        // 排序所有事件列表
        sortEventsByTime(unconfirmedEvents);
        sortEventsByTime(pendingEvents);
        sortEventsByTime(processedEvents);
        sortEventsByTime(unreadEvents);
        
        // 根据当前标签选择对应的事件
        if (activeTab === 'trip-report') {
            // 跳闸快报：选择时间最近的未读事件
            if (unreadEvents.length > 0) {
                selectedEvent = unreadEvents[0];
                // 标记为已读
                const eventId = selectedEvent.getAttribute('data-event-id');
                tripEventData[eventId].read = true;
                // 更新角标
                updateFaultBadges();
                // 更新事件列表的未读标识
                selectedEvent.classList.remove('unread');
                // 更新告警中心的跳闸告警
                if (window.updateTripAlert) {
                    window.updateTripAlert();
                }
            } else if (unconfirmedEvents.length > 0) {
                selectedEvent = unconfirmedEvents[0];
            } else if (pendingEvents.length > 0) {
                selectedEvent = pendingEvents[0];
            } else if (processedEvents.length > 0) {
                selectedEvent = processedEvents[0];
            }
        } else if (activeTab === 'fault-confirmation') {
            // 故障确认：选择时间最近的未确认事件
            if (unconfirmedEvents.length > 0) {
                selectedEvent = unconfirmedEvents[0];
            } else if (pendingEvents.length > 0) {
                selectedEvent = pendingEvents[0];
            } else if (processedEvents.length > 0) {
                selectedEvent = processedEvents[0];
            }
        } else if (activeTab === 'fault-handling') {
            // 故障处理：选择时间最近的待处理事件
            if (pendingEvents.length > 0) {
                selectedEvent = pendingEvents[0];
            } else if (processedEvents.length > 0) {
                selectedEvent = processedEvents[0];
            } else if (unconfirmedEvents.length > 0) {
                selectedEvent = unconfirmedEvents[0];
            }
        }
        
        // 如果选择了事件，更新页面内容
        if (selectedEvent) {
            updatePageContent();
            switchTab(activeTab);
        }
    }
    
    // 为保存标记按钮添加点击事件监听器
    function initSaveMarkingButtons() {
        // 监听故障确认页面的保存标记按钮
        document.addEventListener('click', function(e) {
            if (e.target.textContent === '保存标记' && e.target.classList.contains('btn-primary')) {
                // 获取当前选择的事件
                if (selectedEvent) {
                    const eventId = selectedEvent.getAttribute('data-event-id');
                    
                    // 根据当前标签更新事件状态
                    if (activeTab === 'fault-confirmation') {
                        // 故障确认：从未确认变为待处理
                        tripEventData[eventId].status = '待处理';
                    } else if (activeTab === 'fault-handling') {
                        // 故障处理：从待处理变为已处理
                        tripEventData[eventId].status = '已处理';
                    }
                    
                    // 更新角标
                    updateFaultBadges();
                    
                    // 显示提示信息
                    showCustomAlert('提示', '标记已保存，事件状态已更新');
                }
            }
        });
    }
    
    initSaveMarkingButtons();
    autoSelectTripEvent();
}
