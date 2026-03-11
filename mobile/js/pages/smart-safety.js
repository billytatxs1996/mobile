function initSmartSafetyPage(tab = 'work-order') {
    // 获取元素
    const smartSafetyPage = document.getElementById('smart-safety');
    const jobSelectionModal = document.getElementById('job-selection-modal');
    const backBtn = document.querySelector('#smart-safety .back-btn');
    const tabBtns = document.querySelectorAll('#smart-safety .tab-btn');
    const tabContents = document.querySelectorAll('#smart-safety .tab-content');
    const confirmBtn = document.querySelector('.job-selection-modal .confirm-btn');
    const cancelBtn = document.querySelector('.job-selection-modal .cancel-btn');
    const closeBtn = document.querySelector('.job-selection-modal .close-btn');
    
    // 存储当前选择的作业项和标签
    let selectedJob = null;
    let activeTab = tab;
    
    // 初始化/获取智能安全数据存储（按作业项 ID 区分）
    function getSmartSafetyStore() {
        if (!window.smartSafetyData) {
            window.smartSafetyData = {};
        }
        return window.smartSafetyData;
    }

    function getJobId(jobEl) {
        if (!jobEl) return 'unknown';
        return jobEl.dataset.jobId || jobEl.getAttribute('data-job-id') || jobEl.dataset.jobName || 'unknown';
    }

    function getJobRecord(jobId) {
        const store = getSmartSafetyStore();
        if (!store[jobId]) {
            store[jobId] = {
                safetyMeasure: { status: 'none', form: null, audit: null },
                authorization: { status: 'none', form: null, audit: null },
                operationProcess: { progress: null, exception: null, changePermission: { form: null, audit: null } },
                operationEnd: { status: 'none', form: null, audit: null }
            };
        }
        return store[jobId];
    }

    // 自动选择第一个作业项
    function autoSelectFirstJob() {
        const firstJobItem = document.querySelector('#job-list .job-item');
        if (firstJobItem) {
            selectedJob = firstJobItem;
            switchTab(activeTab);
        }
    }
    
    // 切换标签（限定在 #smart-safety 内，避免影响其他页面）
    function switchTab(tabId) {
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        const tabBtn = smartSafetyPage.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const tabContent = smartSafetyPage.querySelector(`.tab-content[data-tab="${tabId}"]`);
        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
        activeTab = tabId;
        if (selectedJob) {
            updateTabContent(tabId);
        } else {
            autoSelectFirstJob();
        }
    }
    
    // 获取当前角色（默认为负责人员）
    function getCurrentRole() {
        return (window.currentRole && window.currentRole.role) || '负责人员';
    }

    // 更新标签内容
    function updateTabContent(tabId) {
        const contentElement = smartSafetyPage.querySelector(`.tab-content[data-tab="${tabId}"] > div`);
        
        if (!contentElement) return;
        
        // 获取当前角色
        const currentRole = getCurrentRole();

        // 获取作业项 ID 及该作业在本模块下的存储记录
        const jobId = getJobId(selectedJob);
        const jobRecord = getJobRecord(jobId);

        // 获取作业项执行状态
        let jobStatus = '';
        const statusBadge = selectedJob.querySelector('.status-badge');
        if (statusBadge) {
            jobStatus = statusBadge.textContent;
        } else {
            const statusText = selectedJob.querySelector('p:nth-child(4)');
            if (statusText) {
                jobStatus = statusText.textContent.split('：')[1];
            }
        }
        
        // 根据标签和选择的作业项 + 当前角色 更新内容
        switch (tabId) {
            case 'work-order':
                contentElement.innerHTML = `
                    <div class="work-order-container">
                        <div class="work-order-section">
                            <h3>基本信息</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">工作票号：</span>
                                    <span class="info-value">${selectedJob.querySelector('.job-info p').textContent.split('：')[1]}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">工作项名称：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">制定时间：</span>
                                    <span class="info-value">${new Date().toLocaleString('zh-CN')}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">计划工作时间：</span>
                                    <span class="info-value">${new Date().toLocaleDateString('zh-CN')} 09:00 - ${new Date().toLocaleDateString('zh-CN')} 17:00</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">执行状态：</span>
                                    <span class="info-value">${jobStatus}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="work-order-section">
                            <h3>工作班组与人员</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">检修班组：</span>
                                    <span class="info-value">变电检修班</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">工作负责人：</span>
                                    <span class="info-value">周思聪</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">工作票签发人：</span>
                                    <span class="info-value">王建国</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">工作许可人：</span>
                                    <span class="info-value">李明</span>
                                </div>
                                <div class="info-item full-width">
                                    <span class="info-label">其他工作人员：</span>
                                    <span class="info-value">李华、张敏、赵鹏、钱磊</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="work-order-section">
                            <h3>工作内容与范围</h3>
                            <div class="work-content">
                                <p>${selectedJob.dataset.jobName}，包含设备检查、维护、测试等工作内容。</p>
                                <p>工作范围：${selectedJob.dataset.jobName.includes('10kV') ? '10kV配电装置区' : selectedJob.dataset.jobName.includes('主变压器') ? '主变压器区域' : selectedJob.dataset.jobName.includes('GIS') ? 'GIS设备区' : '继电保护室'}</p>
                            </div>
                        </div>
                        
                        <div class="work-order-section">
                            <h3>安全措施</h3>
                            <div class="safety-measures">
                                <ul>
                                    <li>断开相关设备电源</li>
                                    <li>验电并装设接地线</li>
                                    <li>悬挂"禁止合闸，有人工作"标识牌</li>
                                    <li>设置安全围栏</li>
                                    <li>佩戴个人安全防护装备</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'safety-measure':
                // 许可人员待开始：仅提示无需审核
                if (currentRole === '许可人员' && jobStatus === '待开始') {
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>安措执行</h3>
                                <p>当前作业项尚未提交安措执行信息。</p>
                            </div>
                        </div>
                    `;
                    break;
                }
                // 已完成：负责人员与许可人员看同一套页面（无变更许可、无审核，仅安措布置+执行描述）
                if (jobStatus === '已完成') {
                    const form = jobRecord.safetyMeasure.form || {};
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>安措布置信息</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">安全工器具检查：</span>
                                        <span class="info-value">已完成</span>
                                        <div class="photo-display">
                                            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=安全工器具检查现场照片，展示绝缘手套、安全帽等安全工具整齐摆放&image_size=landscape_4_3" alt="安全工器具检查" style="width: 100%; margin-top: 10px; border-radius: 4px;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">个人防护装备佩戴：</span>
                                        <span class="info-value">已完成</span>
                                        <div class="photo-display">
                                            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=工作人员正确佩戴安全帽、绝缘手套和绝缘鞋的照片&image_size=landscape_4_3" alt="个人防护装备佩戴" style="width: 100%; margin-top: 10px; border-radius: 4px;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">作业现场布置：</span>
                                        <span class="info-value">已完成</span>
                                        <div class="photo-display">
                                            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=作业现场安全围栏设置和警示标识悬挂照片&image_size=landscape_4_3" alt="作业现场布置" style="width: 100%; margin-top: 10px; border-radius: 4px;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">安全技术交底：</span>
                                        <span class="info-value">已完成</span>
                                        <div class="photo-display">
                                            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=工作负责人向工作人员进行安全技术交底的现场照片&image_size=landscape_4_3" alt="安全技术交底" style="width: 100%; margin-top: 10px; border-radius: 4px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>安措执行描述</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">执行情况说明：</span>
                                        <span class="info-value">${(form.executionDescription && form.executionDescription.trim()) ? form.executionDescription : '现场已按要求完成安全工器具检查、个人防护装备佩戴、作业现场布置及安全技术交底，各项安措执行情况正常。'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (currentRole === '许可人员') {
                    // 许可人员进行中：查看安措布置与执行，并对安措执行进行审核
                    const form = jobRecord.safetyMeasure.form || {};
                    let audit = jobRecord.safetyMeasure.audit || {};
                    const alreadyFinal =
                        audit.status === 'approved' ||
                        audit.status === 'rejected';
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>安措布置信息</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">安全工器具检查：</span>
                                        <span class="info-value">${form.toolsStatus || '已完成'}</span>
                                        <div class="photo-display">
                                            <img src="https://placeholdr.dev/800x600/electrical%20safety%20tools%20inspection%20insulation%20gloves%20helmet%20on%20workbench?style=photographic&seed=1"
                                                 alt="安全工器具检查示例" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">个人防护装备佩戴：</span>
                                        <span class="info-value">${form.ppeStatus || '已完成'}</span>
                                        <div class="photo-display">
                                            <img src="https://placeholdr.dev/800x600/workers%20wearing%20safety%20helmet%20insulation%20gloves%20electrical%20substation?style=photographic&seed=1"
                                                 alt="个人防护装备示例" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">作业现场布置：</span>
                                        <span class="info-value">${form.siteStatus || '已完成'}</span>
                                        <div class="photo-display">
                                            <img src="https://placeholdr.dev/800x600/electrical%20work%20site%20safety%20barrier%20warning%20signs%20around%20switchgear?style=photographic&seed=1"
                                                 alt="作业现场布置示例" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">安全技术交底：</span>
                                        <span class="info-value">${form.briefingStatus || '已完成'}</span>
                                        <div class="photo-display">
                                            <img src="https://placeholdr.dev/800x600/safety%20briefing%20meeting%20room%20whiteboard%20supervisor%20and%20electrical%20crew?style=photographic&seed=1"
                                                 alt="安全技术交底示例" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>安措执行描述</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">执行情况说明：</span>
                                        <span class="info-value">${(form.executionDescription && form.executionDescription.trim()) ? form.executionDescription : '现场已按要求完成安全工器具检查、个人防护装备佩戴、作业现场布置及安全技术交底，各项安措执行情况正常。'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${alreadyFinal ? `
                            <div class="work-order-section">
                                <h3>安措执行审核结果</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">审核状态：</span>
                                        <span class="info-value">${audit.status === 'approved' ? '已通过' : audit.status === 'rejected' ? '已驳回' : '已通过'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核人：</span>
                                        <span class="info-value">${audit.reviewer || '李明'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核时间：</span>
                                        <span class="info-value">${audit.time || new Date().toLocaleString('zh-CN')}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">审核意见：</span>
                                        <span class="info-value">${audit.notes || '经审核，安措执行情况符合要求。'}</span>
                                    </div>
                                </div>
                            </div>
                            ` : `
                            <div class="work-order-section">
                                <h3>安措执行审核</h3>
                                <div class="feedback-form">
                                    <div class="form-group">
                                        <label for="safety-review-notes">审核意见</label>
                                        <textarea id="safety-review-notes" class="form-control" rows="3" placeholder="请输入审核意见（必填）"></textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" id="safety-approve-btn">通过</button>
                                        <button class="btn btn-secondary" id="safety-reject-btn">驳回</button>
                                    </div>
                                </div>
                            </div>
                            `}
                        </div>
                    `;
                    if (!alreadyFinal) {
                        const approveBtn = contentElement.querySelector('#safety-approve-btn');
                        const rejectBtn = contentElement.querySelector('#safety-reject-btn');
                        const notesEl = contentElement.querySelector('#safety-review-notes');
                        if (approveBtn) {
                            approveBtn.addEventListener('click', () => {
                                const notes = notesEl ? notesEl.value.trim() : '';
                                jobRecord.safetyMeasure.audit = {
                                    status: 'approved',
                                    notes,
                                    reviewer: (window.currentRole && window.currentRole.name) || '李明',
                                    time: new Date().toLocaleString('zh-CN')
                                };
                                showCustomAlert('提示', '安措执行审核通过。');
                                updateTabContent('safety-measure');
                            });
                        }
                        if (rejectBtn) {
                            rejectBtn.addEventListener('click', () => {
                                const notes = notesEl ? notesEl.value.trim() : '';
                                jobRecord.safetyMeasure.audit = {
                                    status: 'rejected',
                                    notes,
                                    reviewer: (window.currentRole && window.currentRole.name) || '李明',
                                    time: new Date().toLocaleString('zh-CN')
                                };
                                showCustomAlert('提示', '安措执行已驳回，请负责人员按审核意见调整安措。');
                                updateTabContent('safety-measure');
                            });
                        }
                    }
                } else {
                    // 负责人员非已完成状态：保留按钮
                    contentElement.innerHTML = `
                        <div class="safety-measure-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <!-- 安措布置拍照部分 -->
                            <div class="safety-section">
                                <h3>安措布置拍照</h3>
                                <div class="measure-list">
                                    <div class="measure-item">
                                        <div class="measure-info">
                                            <h4>安全工器具检查</h4>
                                            <p>检查${selectedJob.dataset.jobName.includes('10kV') ? '10kV开关柜' : selectedJob.dataset.jobName.includes('主变压器') ? '主变压器' : selectedJob.dataset.jobName.includes('GIS') ? 'GIS设备' : '继电保护装置'}检修所需的安全工器具是否齐全、完好</p>
                                        </div>
                                        <div class="measure-actions">
                                            <button class="photo-btn">
                                                <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                拍照
                                            </button>
                                            <button class="confirm-btn">确认</button>
                                        </div>
                                    </div>
                                    <div class="measure-item">
                                        <div class="measure-info">
                                            <h4>个人防护装备佩戴</h4>
                                            <p>工作人员正确佩戴安全帽、绝缘手套、绝缘鞋等个人防护装备</p>
                                        </div>
                                        <div class="measure-actions">
                                            <button class="photo-btn">
                                                <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                拍照
                                            </button>
                                            <button class="confirm-btn">确认</button>
                                        </div>
                                    </div>
                                    <div class="measure-item">
                                        <div class="measure-info">
                                            <h4>作业现场布置</h4>
                                            <p>检查作业现场安全围栏设置、警示标识悬挂等情况</p>
                                        </div>
                                        <div class="measure-actions">
                                            <button class="photo-btn">
                                                <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                拍照
                                            </button>
                                            <button class="confirm-btn">确认</button>
                                        </div>
                                    </div>
                                    <div class="measure-item">
                                        <div class="measure-info">
                                            <h4>安全技术交底</h4>
                                            <p>工作负责人向工作人员进行安全技术交底，明确工作内容、安全措施和注意事项</p>
                                        </div>
                                        <div class="measure-actions">
                                            <button class="photo-btn">
                                                <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                拍照
                                            </button>
                                            <button class="confirm-btn">确认</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 安措执行描述 -->
                            <div class="safety-section">
                                <h3>安措执行描述</h3>
                                <div class="permission-form">
                                    <div class="form-group">
                                        <label for="safety-execution-desc">执行情况说明</label>
                                        <textarea id="safety-execution-desc" class="form-control" rows="4" placeholder="请描述安措执行情况，如现场检查结果、存在问题及处理情况等">${(jobRecord.safetyMeasure.form && jobRecord.safetyMeasure.form.executionDescription) || ''}</textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" id="safety-execution-submit">提交安措</button>
                                        <button class="btn btn-secondary" id="safety-execution-draft">保存草稿</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    const saveSafetyExecution = (isDraft) => {
                        const descEl = contentElement.querySelector('#safety-execution-desc');
                        if (!jobRecord.safetyMeasure.form) jobRecord.safetyMeasure.form = {};
                        jobRecord.safetyMeasure.form.executionDescription = descEl ? descEl.value.trim() : '';
                        if (!isDraft) jobRecord.safetyMeasure.executionSubmitted = true;
                        showCustomAlert('提示', isDraft ? '安措执行草稿已保存。' : '安措执行已提交。');
                        updateTabContent('safety-measure');
                    };
                    const execSubmitBtn = contentElement.querySelector('#safety-execution-submit');
                    const execDraftBtn = contentElement.querySelector('#safety-execution-draft');
                    if (execSubmitBtn) execSubmitBtn.addEventListener('click', () => saveSafetyExecution(false));
                    if (execDraftBtn) execDraftBtn.addEventListener('click', () => saveSafetyExecution(true));
                }
                break;
            case 'operation-process':
                if (jobStatus === '已完成') {
                    // 已完成状态：作业进度 + 异常情况 + 变更许可（含审核结果）
                    const progress = jobRecord.operationProcess.progress;
                    const exception = jobRecord.operationProcess.exception;
                    const cp = jobRecord.operationProcess.changePermission || {};
                    const cpForm = cp.form || {};
                    const cpAudit = cp.audit || {};
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>作业进度信息</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">最终状态：</span>
                                        <span class="info-value">${(progress && progress.status) || '已完成'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">完成百分比：</span>
                                        <span class="info-value">${(progress && progress.percent != null) ? progress.percent + '%' : '100%'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">进度描述：</span>
                                        <span class="info-value">${(progress && progress.description) || selectedJob.dataset.jobName + '已全部完成，包括设备检查、维护、测试等工作内容。'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>异常情况</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">异常类型：</span>
                                        <span class="info-value">${exception ? exception.type : '设备异常'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">上报时间：</span>
                                        <span class="info-value">${exception && exception.time ? exception.time : new Date().toLocaleString('zh-CN')}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">异常描述：</span>
                                        <span class="info-value">${exception && exception.description ? exception.description : '作业过程中发现开关柜指示灯显示异常，已现场排查并记录，后续由检修人员跟进处理。'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">处理情况：</span>
                                        <span class="info-value">${exception ? (exception.status === 'submitted' ? '已上报并跟进处理' : '已记录') : '已上报并跟进处理'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">异常现场照片：</span>
                                        <div class="photo-display" style="margin-top: 8px;">
                                            <img src="https://placeholdr.dev/800x600/electrical%20switch%20cabinet%20control%20panel%20with%20indicator%20lights%20alarm?style=photographic&seed=1" alt="异常现场" style="width: 100%; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>变更许可</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">变更原因：</span>
                                        <span class="info-value">${cpForm.changeReason || '不作变更'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">变更说明：</span>
                                        <span class="info-value">${cpForm.changeNotes || '无'}</span>
                                    </div>
                                    ${cpAudit.status ? `
                                    <div class="info-item">
                                        <span class="info-label">审核状态：</span>
                                        <span class="info-value">${cpAudit.status === 'approved' ? '已通过' : cpAudit.status === 'rejected' ? '已驳回' : '—'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核人：</span>
                                        <span class="info-value">${cpAudit.reviewer || '—'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核时间：</span>
                                        <span class="info-value">${cpAudit.time || '—'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">审核意见：</span>
                                        <span class="info-value">${cpAudit.notes || '—'}</span>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                } else if (currentRole === '许可人员') {
                    // 许可人员待开始：仅提示无需审核（参考授权申请样式）
                    if (jobStatus === '待开始') {
                        contentElement.innerHTML = `
                            <div class="work-order-container">
                                <div class="work-order-section">
                                    <div class="info-item">
                                        <span class="info-label">工作项：</span>
                                        <span class="info-value">${selectedJob.dataset.jobName}</span>
                                    </div>
                                </div>
                                <div class="work-order-section">
                                    <h3>变更许可审核</h3>
                                    <p>当前作业项尚未提交变更许可信息，无需审核。</p>
                                </div>
                            </div>
                        `;
                        break;
                    }
                    // 许可人员进行中：查看进度、异常 + 变更许可申请内容 + 变更许可审核
                    // 无记录时填充演示数据，便于许可人员看到申请内容并可进行审核操作
                    if (!jobRecord.operationProcess.progress || jobRecord.operationProcess.progress.status == null) {
                        jobRecord.operationProcess.progress = {
                            status: '进行中',
                            percent: 45,
                            description: '已完成现场勘查与安全交底，正在执行设备检查与维护作业，当前已完成约一半工序。'
                        };
                    }
                    const cp = jobRecord.operationProcess.changePermission || {};
                    if (!cp.submitted || !cp.form || (!(cp.form.changeReason || cp.form.changeNotes))) {
                        if (!jobRecord.operationProcess.changePermission) jobRecord.operationProcess.changePermission = {};
                        jobRecord.operationProcess.changePermission.submitted = true;
                        jobRecord.operationProcess.changePermission.form = {
                            changeReason: '作业范围调整',
                            changeNotes: '因现场设备检修需要，申请扩大作业范围至相邻间隔，已做好隔离措施并补充安全交底，请许可人员审核。'
                        };
                        jobRecord.operationProcess.changePermission.audit = jobRecord.operationProcess.changePermission.audit || {};
                    }
                    const cpForm = jobRecord.operationProcess.changePermission.form || {};
                    const cpAudit = jobRecord.operationProcess.changePermission.audit || {};
                    const hasChangePending = jobRecord.operationProcess.changePermission.submitted && (cpForm.changeReason || cpForm.changeNotes) && !cpAudit.status;
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>当前进度</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">当前状态：</span>
                                        <span class="info-value">${(jobRecord.operationProcess.progress && jobRecord.operationProcess.progress.status) || '—'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">完成百分比：</span>
                                        <span class="info-value">${(jobRecord.operationProcess.progress && jobRecord.operationProcess.progress.percent != null) ? jobRecord.operationProcess.progress.percent + '%' : '—'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">进度描述：</span>
                                        <span class="info-value">${(jobRecord.operationProcess.progress && jobRecord.operationProcess.progress.description) || '暂无进度记录'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>异常情况</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">异常记录：</span>
                                        <span class="info-value">${jobRecord.operationProcess.exception ? (jobRecord.operationProcess.exception.type + '：' + (jobRecord.operationProcess.exception.description || '无详细描述')) : '当前无新的异常上报'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>变更许可</h3>
                                <div class="info-grid" style="margin-bottom: 12px;">
                                    <h4 style="font-size: 14px; color: #666; margin: 0 0 8px 0;">变更许可申请内容</h4>
                                    ${(cp.submitted && (cpForm.changeReason || cpForm.changeNotes)) ? `
                                    <div class="info-item">
                                        <span class="info-label">变更原因：</span>
                                        <span class="info-value">${cpForm.changeReason || '—'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">变更说明：</span>
                                        <span class="info-value">${cpForm.changeNotes || '—'}</span>
                                    </div>
                                    ` : `<div class="info-item full-width"><p style="margin: 0; color: #999;">当前暂无变更许可申请内容。</p></div>`}
                                </div>
                                ${cpAudit.status ? `
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">审核状态：</span>
                                        <span class="info-value">${cpAudit.status === 'approved' ? '已通过' : '已驳回'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核人：</span>
                                        <span class="info-value">${cpAudit.reviewer || '—'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核时间：</span>
                                        <span class="info-value">${cpAudit.time || '—'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">审核意见：</span>
                                        <span class="info-value">${cpAudit.notes || '—'}</span>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                            ${hasChangePending ? `
                            <div class="work-order-section">
                                <h3>变更许可审核</h3>
                                <div class="feedback-form">
                                    <div class="form-group">
                                        <label for="op-change-review-notes">审核意见</label>
                                        <textarea id="op-change-review-notes" class="form-control" rows="3" placeholder="请输入审核意见（必填）"></textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" id="op-change-approve-btn">通过</button>
                                        <button class="btn btn-secondary" id="op-change-reject-btn">驳回</button>
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    `;
                    if (hasChangePending) {
                        const approveBtn = contentElement.querySelector('#op-change-approve-btn');
                        const rejectBtn = contentElement.querySelector('#op-change-reject-btn');
                        const notesEl = contentElement.querySelector('#op-change-review-notes');
                        if (approveBtn) {
                            approveBtn.addEventListener('click', () => {
                                const notes = notesEl ? notesEl.value.trim() : '';
                                if (!jobRecord.operationProcess.changePermission) jobRecord.operationProcess.changePermission = {};
                                jobRecord.operationProcess.changePermission.audit = {
                                    status: 'approved',
                                    notes,
                                    reviewer: (window.currentRole && window.currentRole.name) || '李明',
                                    time: new Date().toLocaleString('zh-CN')
                                };
                                showCustomAlert('提示', '变更许可审核通过。');
                                updateTabContent('operation-process');
                            });
                        }
                        if (rejectBtn) {
                            rejectBtn.addEventListener('click', () => {
                                const notes = notesEl ? notesEl.value.trim() : '';
                                if (!jobRecord.operationProcess.changePermission) jobRecord.operationProcess.changePermission = {};
                                jobRecord.operationProcess.changePermission.audit = {
                                    status: 'rejected',
                                    notes,
                                    reviewer: (window.currentRole && window.currentRole.name) || '李明',
                                    time: new Date().toLocaleString('zh-CN')
                                };
                                showCustomAlert('提示', '变更许可已驳回，请负责人员按审核意见重新提交。');
                                updateTabContent('operation-process');
                            });
                        }
                    }
                } else {
                    // 非已完成状态：保留按钮
                    contentElement.innerHTML = `
                        <div class="safety-measure-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <!-- 更新进度部分 -->
                            <div class="work-order-section">
                                <h3>更新进度</h3>
                                        <div class="progress-update">
                                    <div class="form-group">
                                        <label for="progress-status">当前状态</label>
                                        <div id="progress-status" class="form-control select-box" data-modal="progress-status-modal">准备中</div>
                                    </div>
                                    <div class="form-group">
                                        <label for="progress-percentage">完成百分比</label>
                                        <input type="range" id="progress-percentage" class="form-control" min="0" max="100" value="0">
                                        <div class="progress-value">0%</div>
                                    </div>
                                    <div class="form-group">
                                        <label for="progress-description">进度描述</label>
                                        <textarea id="progress-description" class="form-control" rows="3" placeholder="请描述当前进度情况"></textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" id="progress-submit-btn">更新进度</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 异常上报部分 -->
                            <div class="work-order-section">
                                <h3>异常上报</h3>
                                        <div class="exception-report">
                                    <div class="form-group">
                                        <label for="exception-type">异常类型</label>
                                        <div id="exception-type" class="form-control select-box" data-modal="exception-type-modal">设备异常</div>
                                    </div>
                                    <div class="form-group">
                                        <label for="exception-description">异常描述</label>
                                        <textarea id="exception-description" class="form-control" rows="3" placeholder="请详细描述异常情况"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label>异常现场拍照</label>
                                        <div class="measure-list">
                                            <div class="measure-item">
                                                <div class="measure-info">
                                                    <h4>异常现场</h4>
                                                    <p>拍摄异常现场照片，便于记录和后续处理</p>
                                                </div>
                                                <div class="measure-actions">
                                                    <button class="photo-btn">
                                                        <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                        拍照
                                                    </button>
                                                    <button class="confirm-btn">确认</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" id="exception-submit-btn">上报异常</button>
                                        <button class="btn btn-secondary" id="exception-draft-btn">保存草稿</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 变更许可部分 -->
                            <div class="work-order-section">
                                <h3>变更许可</h3>
                                <div class="permission-form">
                                    <div class="form-group">
                                        <label for="op-change-reason">变更原因</label>
                                        <div id="op-change-reason" class="form-control select-box" data-modal="change-reason-modal">${(jobRecord.operationProcess.changePermission && jobRecord.operationProcess.changePermission.form && jobRecord.operationProcess.changePermission.form.changeReason) || '不作变更'}</div>
                                    </div>
                                    <div class="form-group">
                                        <label for="op-change-notes">变更说明</label>
                                        <textarea id="op-change-notes" class="form-control" rows="3" placeholder="请简要说明本次变更的内容和原因，便于许可人员确认">${(jobRecord.operationProcess.changePermission && jobRecord.operationProcess.changePermission.form && jobRecord.operationProcess.changePermission.form.changeNotes) || ''}</textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" id="op-change-submit">提交变更</button>
                                        <button class="btn btn-secondary" id="op-change-draft">保存草稿</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    // 绑定负责人员的提交事件，写入本地记录
                    const progressBtn = contentElement.querySelector('#progress-submit-btn');
                    if (progressBtn) {
                        progressBtn.addEventListener('click', () => {
                            const statusText = contentElement.querySelector('#progress-status')?.textContent.trim() || '进行中';
                            const percentInput = contentElement.querySelector('#progress-percentage');
                            const percent = percentInput ? parseInt(percentInput.value, 10) : 0;
                            const desc = contentElement.querySelector('#progress-description')?.value.trim() || '';
                            jobRecord.operationProcess.progress = {
                                status: statusText,
                                percent: isNaN(percent) ? 0 : percent,
                                description: desc,
                                time: new Date().toLocaleString('zh-CN')
                            };
                            showCustomAlert('提示', '作业进度已更新。');
                            updateTabContent('operation-process');
                        });
                    }
                    const exceptionSubmitBtn = contentElement.querySelector('#exception-submit-btn');
                    const exceptionDraftBtn = contentElement.querySelector('#exception-draft-btn');
                    if (exceptionSubmitBtn) {
                        exceptionSubmitBtn.addEventListener('click', () => {
                            const typeText = contentElement.querySelector('#exception-type')?.textContent.trim() || '设备异常';
                            const desc = contentElement.querySelector('#exception-description')?.value.trim() || '';
                            jobRecord.operationProcess.exception = {
                                type: typeText,
                                description: desc,
                                status: 'submitted',
                                time: new Date().toLocaleString('zh-CN')
                            };
                            showCustomAlert('提示', '异常已上报。');
                            updateTabContent('operation-process');
                        });
                    }
                    if (exceptionDraftBtn) {
                        exceptionDraftBtn.addEventListener('click', () => {
                            const typeText = contentElement.querySelector('#exception-type')?.textContent.trim() || '设备异常';
                            const desc = contentElement.querySelector('#exception-description')?.value.trim() || '';
                            jobRecord.operationProcess.exception = {
                                type: typeText,
                                description: desc,
                                status: 'draft',
                                time: new Date().toLocaleString('zh-CN')
                            };
                            showCustomAlert('提示', '异常草稿已保存。');
                            updateTabContent('operation-process');
                        });
                    }
                    const opChangeSubmitBtn = contentElement.querySelector('#op-change-submit');
                    const opChangeDraftBtn = contentElement.querySelector('#op-change-draft');
                    const saveChangePermission = (isDraft) => {
                        const reasonEl = contentElement.querySelector('#op-change-reason');
                        const notesEl = contentElement.querySelector('#op-change-notes');
                        if (!jobRecord.operationProcess.changePermission) jobRecord.operationProcess.changePermission = {};
                        if (!jobRecord.operationProcess.changePermission.form) jobRecord.operationProcess.changePermission.form = {};
                        jobRecord.operationProcess.changePermission.form.changeReason = reasonEl ? reasonEl.textContent.trim() : '不作变更';
                        jobRecord.operationProcess.changePermission.form.changeNotes = notesEl ? notesEl.value.trim() : '';
                        if (!isDraft) {
                            jobRecord.operationProcess.changePermission.audit = null;
                            jobRecord.operationProcess.changePermission.submitted = true;
                        }
                        showCustomAlert('提示', isDraft ? '变更许可草稿已保存。' : '变更许可已提交，请等待许可人员审核。');
                        updateTabContent('operation-process');
                    };
                    if (opChangeSubmitBtn) opChangeSubmitBtn.addEventListener('click', () => saveChangePermission(false));
                    if (opChangeDraftBtn) opChangeDraftBtn.addEventListener('click', () => saveChangePermission(true));
                }
                break;
            case 'authorization':
                // 已完成：负责人员与许可人员看同一套页面
                if (jobStatus === '已完成') {
                    const auditAuth = jobRecord.authorization && jobRecord.authorization.audit;
                    if (!auditAuth || !auditAuth.status) {
                        if (!jobRecord.authorization) jobRecord.authorization = {};
                        jobRecord.authorization.audit = {
                            status: 'approved',
                            notes: '授权申请内容符合要求，已审批通过。',
                            reviewer: '李明',
                            time: new Date().toLocaleString('zh-CN')
                        };
                    }
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>临时授权总体情况</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">是否存在临时授权：</span>
                                        <span class="info-value">是</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">授权类型：</span>
                                        <span class="info-value">临时增员、车辆授权、门禁授权、锁具授权</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">授权说明：</span>
                                        <span class="info-value">本作业项在执行过程中曾发起临时授权申请，均已审批通过并按要求执行。</span>
                                    </div>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>授权明细</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">临时增员：</span>
                                        <span class="info-value">已完成，新增 1 人，授权时长 1 天。</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">车辆授权：</span>
                                        <span class="info-value">已完成，授权车牌号 粤A12345，授权时长 1 天。</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">门禁授权：</span>
                                        <span class="info-value">已完成，授权人员张三，区域主控室，授权时长 1 天。</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">锁具授权：</span>
                                        <span class="info-value">已完成，锁具编号 LK-001，授权人员李四，授权时长 1 天。</span>
                                    </div>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>审核结果</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">审核状态：</span>
                                        <span class="info-value">${jobRecord.authorization && jobRecord.authorization.audit ? (jobRecord.authorization.audit.status === 'approved' ? '已通过' : jobRecord.authorization.audit.status === 'rejected' ? '已驳回' : '已通过') : '已通过'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核人：</span>
                                        <span class="info-value">${(jobRecord.authorization && jobRecord.authorization.audit && jobRecord.authorization.audit.reviewer) || '李明'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核时间：</span>
                                        <span class="info-value">${(jobRecord.authorization && jobRecord.authorization.audit && jobRecord.authorization.audit.time) || new Date().toLocaleString('zh-CN')}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">审核意见：</span>
                                        <span class="info-value">${(jobRecord.authorization && jobRecord.authorization.audit && jobRecord.authorization.audit.notes) || '经审核，授权申请内容符合要求。'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (currentRole === '许可人员') {
                    // 许可人员待开始
                    if (jobStatus === '待开始') {
                        contentElement.innerHTML = `
                            <div class="work-order-container">
                                <div class="work-order-section">
                                    <div class="info-item">
                                        <span class="info-label">工作项：</span>
                                        <span class="info-value">${selectedJob.dataset.jobName}</span>
                                    </div>
                                </div>
                                <div class="work-order-section">
                                    <h3>授权申请审核</h3>
                                    <p>当前作业项尚未提交授权申请信息，无需审核。</p>
                                </div>
                            </div>
                        `;
                        break;
                    }
                    // 许可人员进行中：展示授权申请明细与审核操作
                    const form = jobRecord.authorization.form || {};
                    let audit = jobRecord.authorization.audit || {};
                    const alreadyFinal =
                        audit.status === 'approved' ||
                        audit.status === 'rejected';
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>授权申请明细</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">临时增员：</span>
                                        <span class="info-value">${form.person || '1 人，授权 1 天'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">车辆授权：</span>
                                        <span class="info-value">${form.vehicle || '车牌 粤A12345，授权 1 天'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">门禁授权：</span>
                                        <span class="info-value">${form.access || '张三，主控室，授权 1 天'}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">锁具授权：</span>
                                        <span class="info-value">${form.lock || 'LK-001，李四，授权 1 天'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${alreadyFinal ? `
                            <div class="work-order-section">
                                <h3>审核结果</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">审核状态：</span>
                                        <span class="info-value">${audit.status === 'approved' ? '已通过' : audit.status === 'rejected' ? '已驳回' : '已通过'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核人：</span>
                                        <span class="info-value">${audit.reviewer || '李明'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核时间：</span>
                                        <span class="info-value">${audit.time || new Date().toLocaleString('zh-CN')}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">审核意见：</span>
                                        <span class="info-value">${audit.notes || '经审核，授权申请内容符合要求。'}</span>
                                    </div>
                                </div>
                            </div>
                            ` : `
                            <div class="work-order-section">
                                <h3>本次审核</h3>
                                <div class="feedback-form">
                                    <div class="form-group">
                                        <label for="auth-review-notes">审核意见</label>
                                        <textarea id="auth-review-notes" class="form-control" rows="3" placeholder="请输入审核意见（必填）"></textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" id="auth-approve-btn">通过</button>
                                        <button class="btn btn-secondary" id="auth-reject-btn">驳回</button>
                                    </div>
                                </div>
                            </div>
                            `}
                        </div>
                    `;
                    if (!alreadyFinal) {
                        const approveBtn = contentElement.querySelector('#auth-approve-btn');
                        const rejectBtn = contentElement.querySelector('#auth-reject-btn');
                        const notesEl = contentElement.querySelector('#auth-review-notes');
                        if (approveBtn) {
                            approveBtn.addEventListener('click', () => {
                                const notes = notesEl ? notesEl.value.trim() : '';
                                jobRecord.authorization.audit = {
                                    status: 'approved',
                                    notes,
                                    reviewer: (window.currentRole && window.currentRole.name) || '李明',
                                    time: new Date().toLocaleString('zh-CN')
                                };
                                showCustomAlert('提示', '授权申请审核通过。');
                                updateTabContent('authorization');
                            });
                        }
                        if (rejectBtn) {
                            rejectBtn.addEventListener('click', () => {
                                const notes = notesEl ? notesEl.value.trim() : '';
                                jobRecord.authorization.audit = {
                                    status: 'rejected',
                                    notes,
                                    reviewer: (window.currentRole && window.currentRole.name) || '李明',
                                    time: new Date().toLocaleString('zh-CN')
                                };
                                showCustomAlert('提示', '授权申请已驳回，请负责人员按审核意见重新提交。');
                                updateTabContent('authorization');
                            });
                        }
                    }
                } else {
                    // 负责人员非已完成状态：可填写（待开始状态下按钮置灰，由 setFormEditable 控制）
                    contentElement.innerHTML = `
                        <div class="safety-measure-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>临时授权申请</h3>
                                <div class="authorization-tabs">
                                    <button class="auth-tab-btn active" data-auth-type="person">临时增员</button>
                                    <button class="auth-tab-btn" data-auth-type="vehicle">车辆授权</button>
                                    <button class="auth-tab-btn" data-auth-type="access">门禁授权</button>
                                    <button class="auth-tab-btn" data-auth-type="lock">锁具授权</button>
                                </div>
                                
                                <!-- 临时增员 -->
                                <div class="auth-content active" data-auth-type="person">
                                    <div class="form-group">
                                        <label for="person-name">人员姓名</label>
                                        <input type="text" id="person-name" class="form-control" placeholder="请输入人员姓名">
                                    </div>
                                    <div class="form-group">
                                        <label for="person-id">身份证号</label>
                                        <input type="text" id="person-id" class="form-control" placeholder="请输入身份证号">
                                    </div>
                                    <div class="form-group">
                                        <label for="person-role">工作角色</label>
                                        <input type="text" id="person-role" class="form-control" placeholder="请输入工作角色">
                                    </div>
                                    <div class="form-group">
                                        <label for="person-duration">授权时长</label>
                                        <div id="person-duration" class="form-control select-box" data-modal="duration-modal">1天</div>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary">申请增员</button>
                                        <button class="btn btn-secondary">保存草稿</button>
                                    </div>
                                </div>
                                
                                <!-- 车辆授权 -->
                                <div class="auth-content" data-auth-type="vehicle">
                                    <div class="form-group">
                                        <label for="vehicle-number">车牌号</label>
                                        <input type="text" id="vehicle-number" class="form-control" placeholder="请输入车牌号">
                                    </div>
                                    <div class="form-group">
                                        <label for="vehicle-type">车辆类型</label>
                                        <div id="vehicle-type" class="form-control select-box" data-modal="vehicle-type-modal">轿车</div>
                                    </div>
                                    <div class="form-group">
                                        <label for="vehicle-duration">授权时长</label>
                                        <div id="vehicle-duration" class="form-control select-box" data-modal="duration-modal">1天</div>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary">申请车辆授权</button>
                                    </div>
                                </div>
                                
                                <!-- 门禁授权 -->
                                <div class="auth-content" data-auth-type="access">
                                    <div class="form-group">
                                        <label for="access-person">授权人员</label>
                                        <input type="text" id="access-person" class="form-control" placeholder="请输入授权人员姓名">
                                    </div>
                                    <div class="form-group">
                                        <label for="access-area">授权区域</label>
                                        <div id="access-area" class="form-control select-box" data-modal="access-area-modal">主控室</div>
                                    </div>
                                    <div class="form-group">
                                        <label for="access-duration">授权时长</label>
                                        <div id="access-duration" class="form-control select-box" data-modal="duration-modal">1天</div>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary">申请门禁授权</button>
                                    </div>
                                </div>
                                
                                <!-- 锁具授权 -->
                                <div class="auth-content" data-auth-type="lock">
                                    <div class="form-group">
                                        <label for="lock-number">锁具编号</label>
                                        <input type="text" id="lock-number" class="form-control" placeholder="请输入锁具编号">
                                    </div>
                                    <div class="form-group">
                                        <label for="lock-person">授权人员</label>
                                        <input type="text" id="lock-person" class="form-control" placeholder="请输入授权人员姓名">
                                    </div>
                                    <div class="form-group">
                                        <label for="lock-duration">授权时长</label>
                                        <div id="lock-duration" class="form-control select-box" data-modal="duration-modal">1天</div>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary">申请锁具授权</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                break;
            case 'operation-end':
                // 许可人员待开始：仅提示无需审核
                if (currentRole === '许可人员' && jobStatus === '待开始') {
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>作业终结审核</h3>
                                <p>当前作业项尚未提交终结信息，无需审核。</p>
                            </div>
                        </div>
                    `;
                    break;
                }
                // 已完成：负责人员与许可人员看同一套页面
                if (jobStatus === '已完成') {
                    const auditEnd = jobRecord.operationEnd && jobRecord.operationEnd.audit;
                    if (!auditEnd || !auditEnd.status) {
                        if (!jobRecord.operationEnd) jobRecord.operationEnd = {};
                        jobRecord.operationEnd.audit = {
                            status: 'approved',
                            notes: '终结内容已审核通过。',
                            reviewer: '李明',
                            time: new Date().toLocaleString('zh-CN')
                        };
                    }
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>完工信息</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">设备状态：</span>
                                        <span class="info-value">正常运行</span>
                                        <div class="photo-display">
                                            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=电力设备正常运行状态照片，设备外观整洁，指示灯正常&image_size=landscape_4_3" alt="设备状态" style="width: 100%; margin-top: 10px; border-radius: 4px;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">工作现场：</span>
                                        <span class="info-value">整洁，无遗留物品</span>
                                        <div class="photo-display">
                                            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=整洁的工作现场照片，地面干净，无工具和材料遗留&image_size=landscape_4_3" alt="工作现场" style="width: 100%; margin-top: 10px; border-radius: 4px;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">安全措施恢复：</span>
                                        <span class="info-value">已全部恢复</span>
                                        <div class="photo-display">
                                            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=安全措施恢复照片，显示安全围栏已拆除，标识牌已收起&image_size=landscape_4_3" alt="安全措施恢复" style="width: 100%; margin-top: 10px; border-radius: 4px;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">工器具：</span>
                                        <span class="info-value">无遗漏</span>
                                        <div class="photo-display">
                                            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=工具摆放整齐的照片，所有工具已收回工具箱&image_size=landscape_4_3" alt="工器具" style="width: 100%; margin-top: 10px; border-radius: 4px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>作业总结</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">总结内容：</span>
                                        <span class="info-value">${selectedJob.dataset.jobName}已成功完成，所有工作内容均按照计划执行，设备运行正常，现场整洁有序。</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">终结时间：</span>
                                        <span class="info-value">${new Date().toLocaleString('zh-CN')}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">备注：</span>
                                        <span class="info-value">无特殊备注</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="work-order-section">
                                <h3>审核结果</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">审核状态：</span>
                                        <span class="info-value">${jobRecord.operationEnd && jobRecord.operationEnd.audit ? (jobRecord.operationEnd.audit.status === 'approved' ? '已通过' : jobRecord.operationEnd.audit.status === 'rejected' ? '已驳回' : '已通过') : '已通过'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核人：</span>
                                        <span class="info-value">${(jobRecord.operationEnd && jobRecord.operationEnd.audit && jobRecord.operationEnd.audit.reviewer) || '李明'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核时间：</span>
                                        <span class="info-value">${(jobRecord.operationEnd && jobRecord.operationEnd.audit && jobRecord.operationEnd.audit.time) || new Date().toLocaleString('zh-CN')}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">审核意见：</span>
                                        <span class="info-value">${(jobRecord.operationEnd && jobRecord.operationEnd.audit && jobRecord.operationEnd.audit.notes) || '经审核，作业终结内容符合要求。'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (currentRole === '许可人员') {
                    // 许可人员进行中：展示完工信息、作业总结与审核操作
                    let auditEnd = jobRecord.operationEnd && jobRecord.operationEnd.audit ? jobRecord.operationEnd.audit : {};
                    const alreadyFinalEnd = auditEnd.status === 'approved' || auditEnd.status === 'rejected';
                    contentElement.innerHTML = `
                        <div class="work-order-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>完工信息</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">设备状态：</span>
                                        <span class="info-value">正常运行</span>
                                        <div class="photo-display">
                                            <img src="https://placeholdr.dev/800x600/outdoor%20high%20voltage%20electrical%20equipment%20running%20normal%20condition%20clean%20indicators?style=photographic&seed=1"
                                                 alt="设备状态示例" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">工作现场：</span>
                                        <span class="info-value">整洁，无遗留物品</span>
                                        <div class="photo-display">
                                            <img src="https://placeholdr.dev/800x600/clean%20work%20site%20after%20electrical%20maintenance%20floor%20clean%20no%20tools%20left?style=photographic&seed=1"
                                                 alt="工作现场示例" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">安全措施恢复：</span>
                                        <span class="info-value">已全部恢复</span>
                                        <div class="photo-display">
                                            <img src="https://placeholdr.dev/800x600/safety%20barriers%20removed%20warning%20signs%20cleared%20electrical%20site?style=photographic&seed=1"
                                                 alt="安全措施恢复示例" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">工器具：</span>
                                        <span class="info-value">无遗漏</span>
                                        <div class="photo-display">
                                            <img src="https://placeholdr.dev/800x600/electrical%20tools%20stored%20in%20toolbox%20organized%20neat?style=photographic&seed=1"
                                                 alt="工器具示例" style="width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="work-order-section">
                                <h3>作业总结</h3>
                                <div class="info-grid">
                                    <div class="info-item full-width">
                                        <span class="info-label">总结内容：</span>
                                        <span class="info-value">${selectedJob.dataset.jobName}已成功完成，所有工作内容均按照计划执行，设备运行正常，现场整洁有序。</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">终结时间：</span>
                                        <span class="info-value">${new Date().toLocaleString('zh-CN')}</span>
                                    </div>
                                </div>
                            </div>
                            ${alreadyFinalEnd ? `
                            <div class="work-order-section">
                                <h3>审核结果</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">审核状态：</span>
                                        <span class="info-value">${auditEnd.status === 'approved' ? '已通过' : auditEnd.status === 'rejected' ? '已驳回' : '已通过'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核人：</span>
                                        <span class="info-value">${auditEnd.reviewer || '李明'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">审核时间：</span>
                                        <span class="info-value">${auditEnd.time || new Date().toLocaleString('zh-CN')}</span>
                                    </div>
                                    <div class="info-item full-width">
                                        <span class="info-label">审核意见：</span>
                                        <span class="info-value">${auditEnd.notes || '经审核，作业终结内容符合要求。'}</span>
                                    </div>
                                </div>
                            </div>
                            ` : `
                            <div class="work-order-section">
                                <h3>本次审核</h3>
                                <div class="feedback-form">
                                    <div class="form-group">
                                        <label for="end-review-notes">审核意见</label>
                                        <textarea id="end-review-notes" class="form-control" rows="3" placeholder="请输入审核意见（必填）"></textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" id="end-approve-btn">通过</button>
                                        <button class="btn btn-secondary" id="end-reject-btn">驳回</button>
                                    </div>
                                </div>
                            </div>
                            `}
                        </div>
                    `;
                    if (!alreadyFinalEnd) {
                        const approveBtn = contentElement.querySelector('#end-approve-btn');
                        const rejectBtn = contentElement.querySelector('#end-reject-btn');
                        const notesEl = contentElement.querySelector('#end-review-notes');
                        if (approveBtn) {
                            approveBtn.addEventListener('click', () => {
                                const notes = notesEl ? notesEl.value.trim() : '';
                                jobRecord.operationEnd = jobRecord.operationEnd || {};
                                jobRecord.operationEnd.audit = {
                                    status: 'approved',
                                    notes,
                                    reviewer: (window.currentRole && window.currentRole.name) || '李明',
                                    time: new Date().toLocaleString('zh-CN')
                                };
                                showCustomAlert('提示', '作业终结审核通过。');
                                updateTabContent('operation-end');
                            });
                        }
                        if (rejectBtn) {
                            rejectBtn.addEventListener('click', () => {
                                const notes = notesEl ? notesEl.value.trim() : '';
                                jobRecord.operationEnd = jobRecord.operationEnd || {};
                                jobRecord.operationEnd.audit = {
                                    status: 'rejected',
                                    notes,
                                    reviewer: (window.currentRole && window.currentRole.name) || '李明',
                                    time: new Date().toLocaleString('zh-CN')
                                };
                                showCustomAlert('提示', '作业终结已驳回，请负责人员按审核意见重新提交。');
                                updateTabContent('operation-end');
                            });
                        }
                    }
                } else {
                    // 负责人员非已完成状态：保留按钮
                    contentElement.innerHTML = `
                        <div class="safety-measure-container">
                            <div class="work-order-section">
                                <div class="info-item">
                                    <span class="info-label">工作项：</span>
                                    <span class="info-value">${selectedJob.dataset.jobName}</span>
                                </div>
                            </div>
                            
                            <!-- 完工拍照部分 -->
                            <div class="work-order-section">
                                <h3>完工拍照</h3>
                                <div class="completion-photos">
                                    <div class="measure-list">
                                        <div class="measure-item">
                                            <div class="measure-info">
                                                <h4>设备状态</h4>
                                                <p>拍摄设备运行状态，确保设备正常运行</p>
                                            </div>
                                            <div class="measure-actions">
                                                <button class="photo-btn">
                                                    <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                    拍照
                                                </button>
                                                <button class="confirm-btn">确认</button>
                                            </div>
                                        </div>
                                        <div class="measure-item">
                                            <div class="measure-info">
                                                <h4>工作现场</h4>
                                                <p>拍摄工作现场，确保现场整洁，无遗留物品</p>
                                            </div>
                                            <div class="measure-actions">
                                                <button class="photo-btn">
                                                    <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                    拍照
                                                </button>
                                                <button class="confirm-btn">确认</button>
                                            </div>
                                        </div>
                                        <div class="measure-item">
                                            <div class="measure-info">
                                                <h4>安全措施恢复</h4>
                                                <p>拍摄安全措施恢复情况，确保所有安全措施已恢复</p>
                                            </div>
                                            <div class="measure-actions">
                                                <button class="photo-btn">
                                                    <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                    拍照
                                                </button>
                                                <button class="confirm-btn">确认</button>
                                            </div>
                                        </div>
                                        <div class="measure-item">
                                            <div class="measure-info">
                                                <h4>工器具有无遗漏</h4>
                                                <p>拍摄工器具有无遗漏，确保所有工具已收回</p>
                                            </div>
                                            <div class="measure-actions">
                                                <button class="photo-btn">
                                                    <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                                    拍照
                                                </button>
                                                <button class="confirm-btn">确认</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 提交终结部分 -->
                            <div class="work-order-section">
                                <h3>提交终结</h3>
                                <div class="completion-form">
                                    <div class="form-group">
                                        <label for="completion-summary">作业总结</label>
                                        <textarea id="completion-summary" class="form-control" rows="4" placeholder="请输入作业总结，包括完成的工作内容、遇到的问题及解决方法等"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="completion-time">终结时间</label>
                                        <div id="completion-time" class="form-control select-box" data-modal="completion-time-modal">${new Date().toISOString().slice(0, 16).replace('T', ' ')}</div>
                                    </div>
                                    <div class="form-group">
                                        <label for="completion-notes">备注</label>
                                        <textarea id="completion-notes" class="form-control" rows="2" placeholder="请输入备注信息"></textarea>
                                    </div>
                                    <div class="form-actions">
                                    <button class="btn btn-primary">提交终结</button>
                                    <button class="btn btn-secondary">保存草稿</button>
                                </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                break;
        }
        
        // 只有在非工作票页面且非已完成状态时，才设置表单可编辑性
        // 工作票页面始终是纯数据展示，已完成状态的其他页面也是纯数据展示
        if (tabId !== 'work-order' && jobStatus !== '已完成') {
            setFormEditable(jobStatus);
        }
        
        // 为照片添加点击全屏查看功能
        initPhotoFullscreen();
    }
    
    // 初始化照片全屏查看功能
    function initPhotoFullscreen() {
        // 创建全屏查看模态框
        let fullscreenModal = document.getElementById('photo-fullscreen-modal');
        if (!fullscreenModal) {
            fullscreenModal = document.createElement('div');
            fullscreenModal.id = 'photo-fullscreen-modal';
            fullscreenModal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                padding: 0;
                margin: 0;
                border: none;
                box-shadow: none;
                overflow: hidden;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0;
                margin: 0;
            `;
            
            const fullscreenImage = document.createElement('img');
            fullscreenImage.id = 'fullscreen-image';
            fullscreenImage.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                transform-origin: center;
                transition: transform 0.2s ease;
                padding: 0;
                margin: 0;
                border: none;
            `;
            
            modalContent.appendChild(fullscreenImage);
            fullscreenModal.appendChild(modalContent);
            document.body.appendChild(fullscreenModal);
            
            // 点击空白处关闭
            modalContent.addEventListener('click', function(e) {
                if (e.target === modalContent) {
                    fullscreenModal.style.display = 'none';
                    // 重置缩放
                    fullscreenImage.style.transform = 'scale(1)';
                }
            });
            
            // 实现双指放大缩小
            let initialDistance = 0;
            let currentScale = 1;
            let initialScale = 1;
            
            fullscreenImage.addEventListener('touchstart', function(e) {
                if (e.touches.length === 2) {
                    initialDistance = getDistance(e.touches[0], e.touches[1]);
                    initialScale = currentScale;
                }
            });
            
            fullscreenImage.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const currentDistance = getDistance(e.touches[0], e.touches[1]);
                    const scale = initialScale * (currentDistance / initialDistance);
                    currentScale = Math.max(0.5, Math.min(3, scale)); // 限制缩放范围
                    fullscreenImage.style.transform = `scale(${currentScale})`;
                }
            });
            
            // 计算两点之间的距离
            function getDistance(touch1, touch2) {
                const dx = touch2.clientX - touch1.clientX;
                const dy = touch2.clientY - touch1.clientY;
                return Math.sqrt(dx * dx + dy * dy);
            }
        }
        
        // 为所有照片添加点击事件
        const photos = document.querySelectorAll('.photo-display img');
        photos.forEach(photo => {
            photo.style.cursor = 'pointer';
            photo.addEventListener('click', function() {
                const fullscreenImage = document.getElementById('fullscreen-image');
                fullscreenImage.src = this.src;
                fullscreenImage.style.transform = 'scale(1)';
                document.getElementById('photo-fullscreen-modal').style.display = 'flex';
            });
        });
    }
    
    // 设置表单可编辑性
    function setFormEditable(jobStatus) {
        const formElements = document.querySelectorAll('input, textarea, button, select, .select-box');
        const submitButtons = document.querySelectorAll('.confirm-btn, .btn-primary, .photo-btn');
        
        formElements.forEach(element => {
            if (jobStatus === '待开始') {
                // 待开始状态，表单可编辑，但提交按钮置灰
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT' || element.classList.contains('select-box')) {
                    element.disabled = false;
                    if (element.classList.contains('select-box')) {
                        element.style.pointerEvents = 'auto';
                        element.style.opacity = '1';
                    }
                } else if (element.tagName === 'BUTTON') {
                    // 检查是否为提交按钮
                    const isSubmitButton = element.classList.contains('confirm-btn') || 
                                         element.classList.contains('btn-primary') ||
                                         element.classList.contains('photo-btn');
                    if (isSubmitButton) {
                        // 提交按钮置灰不可点击
                        element.style.pointerEvents = 'none';
                        element.style.opacity = '0.6';
                        element.style.backgroundColor = '#e0e0e0';
                        element.style.color = '#9e9e9e';
                        element.style.borderColor = '#bdbdbd';
                    } else {
                        // 其他按钮可点击
                        element.style.pointerEvents = 'auto';
                        element.style.opacity = '1';
                        // 恢复默认颜色
                        element.style.backgroundColor = '';
                        element.style.color = '';
                        element.style.borderColor = '';
                    }
                }
            } else if (jobStatus === '已完成') {
                // 已完成状态，所有内容改为仅可查阅
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.disabled = true;
                } else if (element.classList.contains('select-box')) {
                    element.style.pointerEvents = 'none';
                    element.style.opacity = '0.6';
                } else if (element.tagName === 'BUTTON') {
                    // 所有按钮置灰不可点击，改为仅可查阅
                    element.style.pointerEvents = 'none';
                    element.style.opacity = '0.6';
                }
            } else {
                // 进行中状态，表单可编辑
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.disabled = false;
                } else if (element.tagName === 'BUTTON' || element.classList.contains('select-box')) {
                    element.style.pointerEvents = 'auto';
                    element.style.opacity = '1';
                }
            }
        });
    }
    
    // 选择作业项
    const modalJobItems = document.querySelectorAll('.job-item');
    modalJobItems.forEach(item => {
        item.addEventListener('click', () => {
            modalJobItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedJob = item;
        });
    });
    
    // 确认选择作业项
    confirmBtn.addEventListener('click', () => {
        if (selectedJob) {
            // 隐藏弹窗
            jobSelectionModal.style.display = 'none';
            
            // 切换到当前标签页
            switchTab(activeTab);
        } else {
            showCustomAlert('提示', '请选择一个作业项');
        }
    });
    
    // 取消选择
    cancelBtn.addEventListener('click', () => {
        jobSelectionModal.style.display = 'none';
        closeSmartSafetyPage();
    });
    
    // 关闭弹窗
    closeBtn.addEventListener('click', () => {
        jobSelectionModal.style.display = 'none';
        closeSmartSafetyPage();
    });
    
    // 返回按钮由 initBackButtonDelegation 统一处理
    
    // 切换项目按钮
    const switchProjectBtn = document.querySelector('#smart-safety .switch-project-btn');
    if (switchProjectBtn) {
        switchProjectBtn.addEventListener('click', () => {
            // 显示作业项选择页面
            showJobSelectionPage();
            
            // 重置作业项选择
            const jobItems = document.querySelectorAll('#job-list .job-item');
            jobItems.forEach(item => item.classList.remove('selected'));
            selectedJob = null;
        });
    }
    
    // 标签切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // 临时授权申请内「临时增员/车辆授权/门禁授权/锁具授权」标签切换（事件委托，避免授权申请内容动态插入后未绑定）
    smartSafetyPage.addEventListener('click', function(e) {
        const btn = e.target.closest('.auth-tab-btn');
        if (!btn) return;
        const authType = btn.dataset.authType;
        const container = btn.closest('.tab-content');
        if (!container) return;
        const authTabBtns = container.querySelectorAll('.auth-tab-btn');
        const authContents = container.querySelectorAll('.auth-content');
        authTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        authContents.forEach(content => {
            content.classList.remove('active');
            if (content.dataset.authType === authType) content.classList.add('active');
        });
    });
    
    // 作业过程页面的授权类型标签切换（保留以兼容作业过程内若有类似结构）
    function initAuthTabs() {
        const authTabBtns = document.querySelectorAll('.auth-tab-btn');
        const authContents = document.querySelectorAll('.auth-content');
        authTabBtns.forEach(b => b.classList.remove('active'));
        authContents.forEach(c => c.classList.remove('active'));
        if (authTabBtns.length) authTabBtns[0].classList.add('active');
        if (authContents.length) authContents[0].classList.add('active');
    }
    
    // 进度条值显示
    function initProgressBar() {
        const progressBar = document.getElementById('progress-percentage');
        const progressValue = document.querySelector('.progress-value');
        
        if (progressBar && progressValue) {
            progressBar.addEventListener('input', () => {
                progressValue.textContent = `${progressBar.value}%`;
            });
        }
    }
    
    // 初始化作业过程页面的功能
    function initOperationProcessPage() {
        initAuthTabs();
        initProgressBar();
    }
    
    // 当切换到作业过程标签时初始化
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === 'operation-process') {
            btn.addEventListener('click', initOperationProcessPage);
        }
    });
    
    // 绑定作业项选择页面的搜索框输入事件（实时搜索）
    const jobSearchInput = document.getElementById('job-search');
    if (jobSearchInput) {
        jobSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const jobItems = document.querySelectorAll('#job-list .job-item');
            jobItems.forEach(item => {
                const jobName = item.querySelector('h4').textContent.toLowerCase();
                const workOrder = item.querySelector('p:nth-child(2)').textContent.toLowerCase();
                
                const matchesJobName = searchTerm === '' || jobName.includes(searchTerm);
                const matchesWorkOrder = searchTerm === '' || workOrder.includes(searchTerm);
                
                if (matchesJobName || matchesWorkOrder) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // 绑定作业项选择页面的作业项点击事件
    function bindJobItemClickEvents() {
        const jobItems = document.querySelectorAll('#job-list .job-item');
        jobItems.forEach(item => {
            item.addEventListener('click', function() {
                selectedJob = this;
                hideJobSelectionPage();
                switchTab(activeTab);
            });
        });
    }
    
    // 绑定作业项选择页面的事件
    bindJobItemClickEvents();
    
    // 作业项选择页返回按钮由 initBackButtonDelegation 统一处理
    
    // 绑定筛选按钮点击事件
    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            const filterModal = document.getElementById('filter-modal');
            if (filterModal) {
                filterModal.style.display = 'flex';
            }
        });
    }
    
    // 绑定筛选弹窗关闭按钮点击事件
    const filterModalClose = document.querySelector('#filter-modal .bottom-modal-close');
    if (filterModalClose) {
        filterModalClose.addEventListener('click', function() {
            const filterModal = document.getElementById('filter-modal');
            if (filterModal) {
                filterModal.style.display = 'none';
            }
        });
    }
    
    // 绑定筛选弹窗确认按钮点击事件
    const filterConfirmBtn = document.getElementById('filter-confirm');
    if (filterConfirmBtn) {
        filterConfirmBtn.addEventListener('click', function() {
            // 这里可以添加筛选逻辑
            const filterModal = document.getElementById('filter-modal');
            if (filterModal) {
                filterModal.style.display = 'none';
            }
        });
    }
    
    // 绑定筛选弹窗重置按钮点击事件
    const filterResetBtn = document.getElementById('filter-reset');
    if (filterResetBtn) {
        filterResetBtn.addEventListener('click', function() {
            // 这里可以添加重置逻辑
            var filterDateEl = document.getElementById('filter-date');
            if (filterDateEl) { filterDateEl.textContent = '请选择作业时间'; filterDateEl.dataset.value = ''; }
            const statusOptions = document.querySelectorAll('#filter-modal .modal-option-item');
            statusOptions.forEach(option => option.classList.remove('selected'));
        });
    }
    
    // 初始化时自动选择第一个作业项
    autoSelectFirstJob();
}
