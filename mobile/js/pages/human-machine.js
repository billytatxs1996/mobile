function initHumanMachinePage() {
    // 按任务生成不同的缺陷图、现场确认图（不同 prompt/seed 区分场景，与描述对应）
    // placeholdr.dev 的 seed 仅支持 1–3，超出会 400，此处归一化到 1–3
    const toSeed = (n) => ((Number(n) - 1) % 3) + 1;
    const defectImage = (promptEn, seed) =>
        `https://placeholdr.dev/800x600/${encodeURIComponent(promptEn)}?style=photographic&seed=${toSeed(seed)}`;
    const verifyImage = (promptEn, seed) =>
        `https://placeholdr.dev/800x600/${encodeURIComponent(promptEn)}?style=photographic&seed=${toSeed(seed)}`;

    // 模拟数据：待核实缺陷点位（每个任务缺陷图、现场确认图不同）
    const defectTasks = [
        {
            id: 1,
            device: '10kV开关柜',
            location: '1号间隔',
            description: '开关柜柜门密封胶条老化，存在缝隙',
            image: defectImage('electrical switchgear cabinet door seal aging gap', 1),
            time: '2026-02-10 10:30',
            status: 'pending',
            analysis: '通过图像识别发现柜门密封胶条存在明显老化现象，可能导致防尘防水性能下降',
            severity: '一般'
        },
        {
            id: 2,
            device: '主变压器',
            location: '本体散热片',
            description: '散热片表面积灰严重，影响散热效果',
            image: defectImage('power transformer radiator dust accumulation cooling', 2),
            time: '2026-02-10 09:15',
            status: 'pending',
            analysis: '散热片表面积灰厚度超过标准值，可能影响变压器散热效率，增加设备温度',
            severity: '较严重'
        },
        {
            id: 3,
            device: 'GIS设备',
            location: '2号气室',
            description: '气室压力值接近告警阈值',
            image: defectImage('GIS gas insulated switchgear compartment pressure gauge', 3),
            time: '2026-02-10 08:45',
            status: 'pending',
            analysis: '2号气室压力值为0.38MPa，接近告警阈值0.35MPa，需要及时检查是否存在泄漏',
            severity: '严重'
        }
    ];

    // 模拟数据：已完成任务（每个任务缺陷图与现场确认图均不同）
    const completedTasks = [
        {
            id: 4,
            device: '电压互感器',
            location: '二次端子箱',
            description: '端子箱门未关闭，存在安全隐患',
            image: defectImage('voltage transformer terminal box door open unsafe', 4),
            time: '2026-02-09 16:30',
            status: 'completed',
            verificationResult: '属实',
            verificationNotes: '已现场核实，端子箱门确实未关闭，已当场关闭并锁紧',
            verificationPhotos: [
                verifyImage('terminal box door closed after verification site', 41),
                verifyImage('voltage transformer secondary terminal box closed', 42)
            ],
            fieldAnalysis: '现场确认端子箱门未关，已关闭并锁紧，建议加强巡检提醒',
            analysis: '通过图像识别发现端子箱门处于开启状态，存在安全隐患',
            severity: '一般'
        },
        {
            id: 5,
            device: '电流互感器',
            location: '本体',
            description: '本体表面存在放电痕迹',
            image: defectImage('current transformer body surface oxidation trace', 5),
            time: '2026-02-09 14:20',
            status: 'completed',
            verificationResult: '不属实',
            verificationNotes: '经现场核实，本体表面为正常氧化痕迹，非放电痕迹',
            verificationPhotos: [
                verifyImage('current transformer body inspection field photo', 51)
            ],
            fieldAnalysis: '现场查看为正常氧化色，无放电灼伤，判定为误报',
            analysis: '通过图像识别发现本体表面存在异常痕迹，疑似放电痕迹',
            severity: '较严重'
        }
    ];
    
    // 计算最近七天的任务数量（模拟）
    const today = new Date('2026-02-13');
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // 过滤最近七天的任务
    const recentPendingTasks = defectTasks.filter(task => {
        const taskDate = new Date(task.time);
        return taskDate >= sevenDaysAgo && taskDate <= today;
    });
    
    const recentCompletedTasks = completedTasks.filter(task => {
        const taskDate = new Date(task.time);
        return taskDate >= sevenDaysAgo && taskDate <= today;
    });
    
    // 计算统计数据
    const pendingCount = recentPendingTasks.length;
    const completedCount = recentCompletedTasks.length;
    
    // 筛选条件状态（与选择作业项/跳闸筛选风格一致）
    let pendingFilter = { date: '', severity: '全部' };
    let completedFilter = { date: '', severity: '全部', verificationResult: '全部' };
    let currentFilterTab = 'pending';
    
    function getFilteredPending() {
        return defectTasks.filter(task => {
            if (pendingFilter.date) {
                const taskDate = task.time.slice(0, 10);
                if (taskDate !== pendingFilter.date) return false;
            }
            if (pendingFilter.severity !== '全部' && task.severity !== pendingFilter.severity) return false;
            return true;
        });
    }
    
    function getFilteredCompleted() {
        return completedTasks.filter(task => {
            if (completedFilter.date) {
                const taskDate = task.time.slice(0, 10);
                if (taskDate !== completedFilter.date) return false;
            }
            if (completedFilter.severity !== '全部' && task.severity !== completedFilter.severity) return false;
            if (completedFilter.verificationResult !== '全部' && task.verificationResult !== completedFilter.verificationResult) return false;
            return true;
        });
    }
    
    function applySearchToList(listId, searchInput) {
        if (!searchInput) return;
        const searchTerm = searchInput.value.toLowerCase();
        const items = document.querySelectorAll(`#${listId} .job-item`);
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = searchTerm === '' || text.includes(searchTerm) ? 'block' : 'none';
        });
    }
    
    function renderPendingList(tasks) {
        const pendingTaskList = document.getElementById('pending-task-list');
        if (!pendingTaskList) return;
        pendingTaskList.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'job-item';
            taskItem.dataset.taskId = task.id;
            taskItem.innerHTML = `
                <div class="job-info">
                    <h4>${task.device}</h4>
                    <p>时间：${task.time}</p>
                    <p>点位位置：${task.location}</p>
                    <p>可能缺陷：${task.description}</p>
                </div>
            `;
            taskItem.addEventListener('click', function() {
                openHumanMachineDetailPage(task);
            });
            pendingTaskList.appendChild(taskItem);
        });
        applySearchToList('pending-task-list', document.getElementById('pending-task-search'));
    }
    
    function renderCompletedList(tasks) {
        const completedTaskList = document.getElementById('completed-task-list');
        if (!completedTaskList) return;
        completedTaskList.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'job-item';
            taskItem.dataset.taskId = task.id;
            taskItem.innerHTML = `
                <div class="job-info">
                    <h4>${task.device}</h4>
                    <p>时间：${task.time}</p>
                    <p>点位位置：${task.location}</p>
                    <p>可能缺陷：${task.description}</p>
                    <p>核实结果：${task.verificationResult}</p>
                </div>
            `;
            taskItem.addEventListener('click', function() {
                openHumanMachineDetailPage(task);
            });
            completedTaskList.appendChild(taskItem);
        });
        applySearchToList('completed-task-list', document.getElementById('completed-task-search'));
    }
    
    // 加载待核实任务与已完成任务（按当前筛选条件）
    renderPendingList(getFilteredPending());
    renderCompletedList(getFilteredCompleted());
    
    // 返回按钮由 initBackButtonDelegation 统一处理
    
    // 绑定页签切换事件
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // 更新页签状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新内容显示
            tabContents.forEach(content => {
                if (content.dataset.tab === tabName) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // 绑定搜索框事件（在筛选后的列表上做模糊搜索）
    const pendingSearch = document.getElementById('pending-task-search');
    if (pendingSearch) {
        pendingSearch.addEventListener('input', function() {
            applySearchToList('pending-task-list', this);
        });
    }
    const completedSearch = document.getElementById('completed-task-search');
    if (completedSearch) {
        completedSearch.addEventListener('input', function() {
            applySearchToList('completed-task-list', this);
        });
    }
    
    // 筛选弹窗：同步弹窗内选项与当前筛选状态
    function syncFilterModalToState() {
        const dateEl = document.getElementById('hm-filter-date');
        const severityList = document.querySelectorAll('#human-machine-filter-modal .hm-filter-severity .modal-option-item');
        const verificationList = document.querySelectorAll('#human-machine-filter-modal .hm-filter-verification .modal-option-item');
        const state = currentFilterTab === 'pending' ? pendingFilter : completedFilter;
        if (dateEl) {
            dateEl.textContent = state.date ? state.date : '请选择任务时间';
            dateEl.dataset.value = state.date || '';
        }
        severityList.forEach(item => {
            item.classList.toggle('selected', item.dataset.value === state.severity);
        });
        if (currentFilterTab === 'completed') {
            verificationList.forEach(item => {
                item.classList.toggle('selected', item.dataset.value === state.verificationResult);
            });
        }
    }
    
    function openFilterModal(tab) {
        currentFilterTab = tab;
        const verificationGroup = document.getElementById('hm-filter-verification-group');
        if (verificationGroup) {
            verificationGroup.style.display = tab === 'completed' ? 'block' : 'none';
        }
        syncFilterModalToState();
        const modal = document.getElementById('human-machine-filter-modal');
        if (modal) modal.style.display = 'flex';
    }
    
    // 绑定筛选按钮：打开筛选弹窗
    const pendingFilterBtn = document.getElementById('pending-task-filter-btn');
    if (pendingFilterBtn) {
        pendingFilterBtn.addEventListener('click', function() {
            openFilterModal('pending');
        });
    }
    const completedFilterBtn = document.getElementById('completed-task-filter-btn');
    if (completedFilterBtn) {
        completedFilterBtn.addEventListener('click', function() {
            openFilterModal('completed');
        });
    }
    
    // 筛选弹窗关闭（叉号、遮罩由 core-workbench 统一处理）
    const hmFilterModalClose = document.querySelector('#human-machine-filter-modal .bottom-modal-close');
    if (hmFilterModalClose) {
        hmFilterModalClose.addEventListener('click', function() {
            const modal = document.getElementById('human-machine-filter-modal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // 筛选弹窗：重置
    const hmFilterReset = document.getElementById('hm-filter-reset');
    if (hmFilterReset) {
        hmFilterReset.addEventListener('click', function() {
            const dateEl = document.getElementById('hm-filter-date');
            if (dateEl) {
                dateEl.textContent = '请选择任务时间';
                dateEl.dataset.value = '';
            }
            document.querySelectorAll('#human-machine-filter-modal .modal-option-item').forEach(item => item.classList.remove('selected'));
            document.querySelector('#human-machine-filter-modal .hm-filter-severity .modal-option-item[data-value="全部"]').classList.add('selected');
            document.querySelector('#human-machine-filter-modal .hm-filter-verification .modal-option-item[data-value="全部"]').classList.add('selected');
            if (currentFilterTab === 'pending') {
                pendingFilter = { date: '', severity: '全部' };
                renderPendingList(getFilteredPending());
            } else {
                completedFilter = { date: '', severity: '全部', verificationResult: '全部' };
                renderCompletedList(getFilteredCompleted());
            }
            const modal = document.getElementById('human-machine-filter-modal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // 筛选弹窗：确认
    const hmFilterConfirm = document.getElementById('hm-filter-confirm');
    if (hmFilterConfirm) {
        hmFilterConfirm.addEventListener('click', function() {
            const dateEl = document.getElementById('hm-filter-date');
            const dateVal = (dateEl && dateEl.dataset.value) ? dateEl.dataset.value.slice(0, 10) : '';
            const severitySelected = document.querySelector('#human-machine-filter-modal .hm-filter-severity .modal-option-item.selected');
            const severityVal = severitySelected ? severitySelected.dataset.value : '全部';
            if (currentFilterTab === 'pending') {
                pendingFilter = { date: dateVal, severity: severityVal };
                renderPendingList(getFilteredPending());
            } else {
                const verificationSelected = document.querySelector('#human-machine-filter-modal .hm-filter-verification .modal-option-item.selected');
                const verificationVal = verificationSelected ? verificationSelected.dataset.value : '全部';
                completedFilter = { date: dateVal, severity: severityVal, verificationResult: verificationVal };
                renderCompletedList(getFilteredCompleted());
            }
            const modal = document.getElementById('human-machine-filter-modal');
            if (modal) modal.style.display = 'none';
        });
    }
}

// 打开人机协同详情页面
function openHumanMachineDetailPage(task) {
    // 显示详情页面
    showPage('human-machine-detail');
    
    // 填充详情数据
    document.getElementById('detail-device').textContent = task.device;
    document.getElementById('detail-time').textContent = task.time;
    document.getElementById('detail-location').textContent = task.location;
    document.getElementById('detail-description').textContent = task.description;
    document.getElementById('detail-analysis').textContent = task.analysis || '无分析结果';
    document.getElementById('detail-severity').textContent = task.severity || '未评估';
    
    // 填充缺陷图片（含加载失败占位）
    const imageContainer = document.getElementById('detail-image-container');
    if (imageContainer) {
        if (task.image) {
            imageContainer.innerHTML = `
                <img src="${task.image}" alt="缺陷图片" class="detail-image" onerror="this.onerror=null;this.style.display='none';var p=document.createElement('p');p.className='no-image';p.textContent='图片加载失败';this.parentNode.appendChild(p);">
            `;
        } else {
            imageContainer.innerHTML = '<p class="no-image">无缺陷图片</p>';
        }
    }
    
    // 填充现场核实部分
    const verificationSection = document.getElementById('detail-verification-section');
    const verificationForm = document.getElementById('verification-form');
    const uploadedPhotos = document.getElementById('uploaded-photos');
    
    // 填充核实结果
    const resultSection = document.getElementById('detail-result-section');
    const resultInfo = document.getElementById('detail-result-info');
    const actionsSection = document.getElementById('detail-actions');
    
    if (task.status === 'completed') {
        // 已完成任务显示核实结果
        resultSection.style.display = 'block';
        if (resultInfo) {
            resultInfo.innerHTML = `
                <div class="result-item">
                    <span class="result-label">核实结果：</span>
                    <span class="result-value ${task.verificationResult === '属实' ? 'true' : 'false'}">${task.verificationResult}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">核实备注：</span>
                    <span class="result-value">${task.verificationNotes || '无备注'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">现场分析：</span>
                    <span class="result-value">${task.fieldAnalysis || '无分析结果'}</span>
                </div>
            `;
        }
        
        // 已完成任务显示现场核实结果
        verificationSection.style.display = 'block';
        if (verificationForm) {
            verificationForm.innerHTML = `
                <!-- 现场确认照片 -->
                <div class="form-group">
                    <label class="form-label">现场确认照片</label>
                    <div class="uploaded-photos" id="completed-photos">
                        ${task.verificationPhotos ? task.verificationPhotos.map(photo => `
                            <div class="uploaded-photo-item">
                                <img src="${photo}" alt="现场确认照片" class="uploaded-photo">
                            </div>
                        `).join('') : '<p class="no-image">无现场确认照片</p>'}
                    </div>
                </div>
            `;
        }
        
        // 已完成任务不显示操作按钮
        actionsSection.style.display = 'none';
    } else {
        // 待核实任务显示现场核实表单
        verificationSection.style.display = 'block';
        if (verificationForm) {
            verificationForm.innerHTML = `
                <!-- 现场确认照片（与安措执行拍照样式一致） -->
                <div class="form-group">
                    <label class="form-label">现场确认照片</label>
                    <div class="measure-list">
                        <div class="measure-item">
                            <div class="measure-info">
                                <h4>现场确认照片</h4>
                                <p>拍摄现场确认照片，便于记录核实情况</p>
                            </div>
                            <div class="measure-actions">
                                <button type="button" class="photo-btn" id="verification-photo-btn">
                                    <img src="image/safety/安措拍照.png" alt="拍照" width="24" height="24">
                                    拍照
                                </button>
                                <button type="button" class="confirm-btn">确认</button>
                            </div>
                        </div>
                    </div>
                    <input type="file" id="verification-photo" class="file-upload-input" accept="image/*" multiple style="display:none;">
                    <div class="uploaded-photos" id="uploaded-photos" style="margin-top:10px;">
                        <!-- 上传的照片将在这里动态生成 -->
                    </div>
                </div>
                
                <!-- 现场分析 -->
                <div class="form-group">
                    <label class="form-label">现场分析</label>
                    <textarea id="field-analysis" class="form-textarea" placeholder="请详细描述现场缺陷情况、分析结果及处理建议..."></textarea>
                </div>
                
                <!-- 核实备注 -->
                <div class="form-group">
                    <label class="form-label">核实备注</label>
                    <textarea id="verification-notes" class="form-textarea" placeholder="请填写核实备注..."></textarea>
                </div>
            `;
            
            // 拍照按钮点击触发文件选择
            const photoBtn = document.getElementById('verification-photo-btn');
            const fileInput = document.getElementById('verification-photo');
            const photosContainer = document.getElementById('uploaded-photos');
            if (photoBtn && fileInput) {
                photoBtn.addEventListener('click', function() {
                    fileInput.click();
                });
            }
            if (fileInput && photosContainer) {
                fileInput.addEventListener('change', function(e) {
                    const files = e.target.files;
                    if (files.length > 0) {
                        Array.from(files).forEach(file => {
                            const reader = new FileReader();
                            reader.onload = function(event) {
                                const photoItem = document.createElement('div');
                                photoItem.className = 'uploaded-photo-item';
                                photoItem.innerHTML = `
                                    <img src="${event.target.result}" alt="现场确认照片" class="uploaded-photo">
                                    <button type="button" class="remove-photo-btn">×</button>
                                `;
                                photosContainer.appendChild(photoItem);
                                const removeBtn = photoItem.querySelector('.remove-photo-btn');
                                removeBtn.addEventListener('click', function() {
                                    photoItem.remove();
                                });
                            };
                            reader.readAsDataURL(file);
                        });
                    }
                    e.target.value = '';
                });
            }
        }
        
        // 待核实任务不显示核实结果
        resultSection.style.display = 'none';
        
        // 待核实任务显示操作按钮
        actionsSection.style.display = 'block';
        if (actionsSection) {
            actionsSection.innerHTML = `
                <button class="task-btn primary verify-btn" data-result="属实">确认属实</button>
                <button class="task-btn secondary verify-btn" data-result="不属实">确认不属实</button>
            `;
            
            // 绑定核实按钮点击事件
            const verifyBtns = actionsSection.querySelectorAll('.verify-btn');
            verifyBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const result = this.dataset.result;
                    const fieldAnalysis = document.getElementById('field-analysis').value;
                    const verificationNotes = document.getElementById('verification-notes').value;
                    
                    if (!fieldAnalysis) {
                        showCustomAlert('提示', '请填写现场分析');
                        return;
                    }
                    
                    showCustomAlert('提示', `已确认${result}，任务将标记为已完成`);
                    
                    // 延迟返回
                    setTimeout(() => {
                        // 返回人机协同页面
                        showPage('human-machine');
                        // 重新初始化页面
                        initHumanMachinePage();
                    }, 1500);
                });
            });
        }
    }
    
    // 详情页返回按钮由 initBackButtonDelegation 统一处理
}
