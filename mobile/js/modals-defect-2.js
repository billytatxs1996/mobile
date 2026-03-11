function showCustomAlert(title, message) {
    // 检查是否已存在弹窗
    let alertElement = document.getElementById('custom-alert');
    if (alertElement) {
        alertElement.remove();
    }
    
    // 创建弹窗
    alertElement = document.createElement('div');
    alertElement.id = 'custom-alert';
    alertElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 20px;
        max-width: 80%;
        z-index: 1000;
        text-align: center;
    `;
    
    // 创建标题
    const alertTitle = document.createElement('h3');
    alertTitle.textContent = title;
    alertTitle.style.cssText = `
        margin-top: 0;
        margin-bottom: 10px;
        color: #333;
    `;
    
    // 创建消息
    const alertMessage = document.createElement('p');
    alertMessage.textContent = message;
    alertMessage.style.cssText = `
        margin: 0 0 20px 0;
        color: #666;
    `;
    
    // 创建确认按钮
    const alertButton = document.createElement('button');
    alertButton.textContent = '确定';
    alertButton.style.cssText = `
        background: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    // 添加事件监听器
    alertButton.addEventListener('click', function() {
        alertElement.remove();
    });
    
    // 组装弹窗
    alertElement.appendChild(alertTitle);
    alertElement.appendChild(alertMessage);
    alertElement.appendChild(alertButton);
    
    // 添加到页面
    document.body.appendChild(alertElement);
}

// 保存步骤数据
function saveStepData(modal, step) {
    const data = modal.verificationData;
    
    switch (step) {
        case 2:
            // 保存现场核实数据
            const photos = modal.querySelectorAll('.uploaded-photos img');
            data.photos = Array.from(photos).map(img => img.src);
            
            data.environment.temperature = modal.querySelector('.environment-temperature').value;
            data.environment.humidity = modal.querySelector('.environment-humidity').value;
            data.environment.light = modal.querySelector('.environment-light').value;
            break;
        case 3:
            // 保存测量记录数据
            data.defectValue = modal.querySelector('.defect-value').value;
            data.unit = modal.querySelector('.value-unit-select').value;
            
            const verificationMethod = modal.querySelector('.verification-method .modal-option-item.selected');
            if (verificationMethod) {
                data.verificationMethod = verificationMethod.dataset.value;
            }
            break;
        case 4:
            // 保存结果判定数据
            const verificationResult = modal.querySelector('.verification-result .modal-option-item.selected');
            if (verificationResult) {
                data.verificationResult = verificationResult.dataset.value;
            }
            
            const defectLevel = modal.querySelector('.defect-level .modal-option-item.selected');
            if (defectLevel) {
                data.defectLevel = defectLevel.dataset.value;
            }
            
            data.notes = modal.querySelector('.verification-notes').value;
            break;
    }
}

// 更新步骤状态
function updateStepState(modal, step) {
    // 更新步骤显示
    const steps = modal.querySelectorAll('.verification-step');
    steps.forEach((s, index) => {
        if (index === step - 1) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
    
    // 更新进度指示器
    const progressSteps = modal.querySelectorAll('.progress-step');
    const progressLines = modal.querySelectorAll('.progress-line');
    
    // 重置所有步骤和线条
    progressSteps.forEach(s => {
        s.classList.remove('active');
        s.classList.remove('hidden');
    });
    progressLines.forEach(l => {
        l.classList.remove('hidden');
    });
    
    // 根据当前步骤更新激活状态
    progressSteps.forEach((s, index) => {
        if (index < step) {
            s.classList.add('active');
        }
    });
    
    // 根据当前步骤调整显示的节点
    const totalSteps = progressSteps.length;
    
    // 隐藏所有步骤和线条
    progressSteps.forEach(s => s.classList.add('hidden'));
    progressLines.forEach(l => l.classList.add('hidden'));
    
    if (step === 1) {
        // 第一步：显示第1、2、3个节点
        if (progressSteps[0]) progressSteps[0].classList.remove('hidden');
        if (progressLines[0]) progressLines[0].classList.remove('hidden');
        if (progressSteps[1]) progressSteps[1].classList.remove('hidden');
        if (progressLines[1]) progressLines[1].classList.remove('hidden');
        if (progressSteps[2]) progressSteps[2].classList.remove('hidden');
    } else if (step === totalSteps) {
        // 最后一步：显示倒数第3、2、1个节点
        if (progressSteps[totalSteps - 3]) progressSteps[totalSteps - 3].classList.remove('hidden');
        if (progressLines[totalSteps - 3]) progressLines[totalSteps - 3].classList.remove('hidden');
        if (progressSteps[totalSteps - 2]) progressSteps[totalSteps - 2].classList.remove('hidden');
        if (progressLines[totalSteps - 2]) progressLines[totalSteps - 2].classList.remove('hidden');
        if (progressSteps[totalSteps - 1]) progressSteps[totalSteps - 1].classList.remove('hidden');
    } else {
        // 中间步骤：显示当前步骤及其前后各一个节点
        if (progressSteps[step - 2]) progressSteps[step - 2].classList.remove('hidden');
        if (progressLines[step - 2]) progressLines[step - 2].classList.remove('hidden');
        if (progressSteps[step - 1]) progressSteps[step - 1].classList.remove('hidden');
        if (progressLines[step - 1]) progressLines[step - 1].classList.remove('hidden');
        if (progressSteps[step]) progressSteps[step].classList.remove('hidden');
    }
}

// 更新按钮状态
function updateButtonState(modal, step) {
    const nextBtn = modal.querySelector('[data-action="next"]');
    const backBtn = modal.querySelector('[data-action="back"]');
    const submitBtn = modal.querySelector('[data-action="submit"]');
    
    if (step === 1) {
        nextBtn.style.display = 'block';
        backBtn.style.display = 'none';
        submitBtn.style.display = 'none';
    } else if (step === 5) {
            nextBtn.style.display = 'none';
            backBtn.style.display = 'block';
            submitBtn.style.display = 'block';
            submitBtn.textContent = '提交结果';
        } else {
        nextBtn.style.display = 'block';
        backBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// 填充确认信息
function populateConfirmationInfo(modal) {
    const data = modal.verificationData;
    
    modal.querySelector('.device-name').textContent = data.device;
    modal.querySelector('.location').textContent = data.location;
    modal.querySelector('.description').textContent = data.description;
    modal.querySelector('.result').textContent = data.verificationResult;
    modal.querySelector('.level').textContent = data.defectLevel;
    modal.querySelector('.photo-count').textContent = `${data.photos.length}张`;
    modal.querySelector('.value').textContent = data.defectValue ? `${data.defectValue} ${data.unit}` : '无';
    modal.querySelector('.method').textContent = data.verificationMethod || '无';
    modal.querySelector('.notes').textContent = data.notes || '无';
}

// 提交核实结果
function submitVerificationResult(modal) {
    // 验证所有必填信息（阻止提交）
    if (!validateSubmission(modal)) {
        return;
    }
    
    const data = modal.verificationData;
    
    // 这里可以添加提交核实结果的逻辑
    console.log('提交核实结果:', data);
    
    // 关闭弹窗
    modal.style.display = 'none';
    
    // 显示成功提示
    showCustomAlert('提示', '核实结果已提交');
    
    // 重新初始化人机协同页面，更新任务列表
    initHumanMachinePage();
}

// 模拟拍照功能
function simulatePhotoCapture(modal) {
    const photoContainer = modal.querySelector('.uploaded-photos');
    
    // 模拟生成照片（使用随机图片）
    const photoUrl = `https://picsum.photos/200/200?random=${Math.random()}`;
    
    // 创建照片元素
    const photoElement = document.createElement('div');
    photoElement.className = 'uploaded-photo';
    photoElement.innerHTML = `
        <img src="${photoUrl}" alt="现场照片" width="80" height="80">
        <button class="remove-photo">×</button>
    `;
    
    // 添加删除照片功能
    const removeBtn = photoElement.querySelector('.remove-photo');
    removeBtn.addEventListener('click', function() {
        photoElement.remove();
        // 更新照片数据
        const photos = modal.querySelectorAll('.uploaded-photos img');
        modal.verificationData.photos = Array.from(photos).map(img => img.src);
    });
    
    // 添加到容器
    photoContainer.appendChild(photoElement);
    
    // 更新照片数据
    const photos = modal.querySelectorAll('.uploaded-photos img');
    modal.verificationData.photos = Array.from(photos).map(img => img.src);
}

// 初始化缺陷核实弹窗功能
function initDefectVerificationModal() {
    const modal = document.getElementById('defect-verification-modal');
    if (modal) {
        // 下一步按钮点击事件
        const nextBtn = modal.querySelector('[data-action="next"]');
        nextBtn.addEventListener('click', function() {
            handleStepChange(modal, 'next');
        });
        
        // 上一步按钮点击事件
        const backBtn = modal.querySelector('[data-action="back"]');
        backBtn.addEventListener('click', function() {
            handleStepChange(modal, 'back');
        });
        
        // 提交按钮点击事件
        const submitBtn = modal.querySelector('[data-action="submit"]');
        submitBtn.addEventListener('click', function() {
            submitVerificationResult(modal);
        });
        
        // 拍照按钮点击事件
        const photoBtn = modal.querySelector('.photo-upload .btn');
        photoBtn.addEventListener('click', function() {
            simulatePhotoCapture(modal);
        });
        
        // 选项选择事件
        modal.addEventListener('click', function(e) {
            if (e.target.closest('.modal-option-item')) {
                const optionItem = e.target.closest('.modal-option-item');
                const optionList = optionItem.closest('.modal-option-list');
                
                // 移除其他选项的选中状态
                optionList.querySelectorAll('.modal-option-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // 添加当前选项的选中状态
                optionItem.classList.add('selected');
            }
        });
    }
}





// 底部弹窗功能
