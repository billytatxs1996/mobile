function openDefectVerificationModal(task) {
    const modal = document.getElementById('defect-verification-modal');
    if (modal) {
        // 填充缺陷信息
        modal.querySelector('.defect-device').textContent = task.device;
        modal.querySelector('.defect-location').textContent = task.location;
        modal.querySelector('.defect-description').textContent = task.description;
        modal.querySelector('.defect-image').src = task.image;
        
        // 存储当前任务
        modal.currentTask = task;
        
        // 初始化步骤状态
        modal.currentStep = 1;
        modal.verificationData = {
            taskId: task.id,
            device: task.device,
            location: task.location,
            description: task.description,
            photos: [],
            defectValue: '',
            unit: '',
            verificationMethod: '',
            environment: {
                temperature: '',
                humidity: '',
                light: ''
            },
            verificationResult: '',
            defectLevel: '',
            notes: ''
        };
        
        // 重置所有步骤
        resetVerificationSteps(modal);
        
        // 显示弹窗
        modal.style.display = 'flex';
    }
}

// 重置核实步骤
function resetVerificationSteps(modal) {
    // 重置步骤状态
    const steps = modal.querySelectorAll('.verification-step');
    steps.forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // 重置进度指示器
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
    
    // 设置第一个步骤为激活状态
    if (progressSteps[0]) {
        progressSteps[0].classList.add('active');
    }
    
    // 只显示前三个节点
    progressSteps.forEach((s, index) => {
        if (index > 2) {
            s.classList.add('hidden');
        }
    });
    progressLines.forEach((l, index) => {
        if (index > 1) {
            l.classList.add('hidden');
        }
    });
    
    // 重置按钮状态
    const nextBtn = modal.querySelector('[data-action="next"]');
    const backBtn = modal.querySelector('[data-action="back"]');
    const submitBtn = modal.querySelector('[data-action="submit"]');
    
    nextBtn.style.display = 'block';
    backBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    
    // 重置表单数据
    modal.querySelector('.defect-value').value = '';
    modal.querySelector('.value-unit-select').value = '';
    modal.querySelector('.environment-temperature').value = '';
    modal.querySelector('.environment-humidity').value = '';
    modal.querySelector('.environment-light').value = '';
    modal.querySelector('.verification-notes').value = '';
    
    // 重置选项选择
    modal.querySelectorAll('.modal-option-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 重置照片
    modal.querySelector('.uploaded-photos').innerHTML = '';
    
    // 重置确认信息
    modal.querySelector('.device-name').textContent = '';
    modal.querySelector('.location').textContent = '';
    modal.querySelector('.description').textContent = '';
    modal.querySelector('.result').textContent = '';
    modal.querySelector('.level').textContent = '';
    modal.querySelector('.photo-count').textContent = '0张';
    modal.querySelector('.value').textContent = '';
    modal.querySelector('.method').textContent = '';
    modal.querySelector('.notes').textContent = '';
}

// 处理步骤切换
function handleStepChange(modal, direction) {
    const currentStep = modal.currentStep;
    let newStep = currentStep;
    
    if (direction === 'next') {
        // 验证当前步骤（仅提醒，不阻止）
        validateStep(modal, currentStep);
        
        // 保存当前步骤数据
        saveStepData(modal, currentStep);
        
        // 进入下一步
        newStep = currentStep + 1;
    } else if (direction === 'back') {
        // 进入上一步
        newStep = currentStep - 1;
    }
    
    // 更新步骤状态
    updateStepState(modal, newStep);
    modal.currentStep = newStep;
    
    // 更新按钮状态
    updateButtonState(modal, newStep);
    
    // 如果是最后一步，填充确认信息
    if (newStep === 5) {
        populateConfirmationInfo(modal);
    }
}

// 验证步骤数据（仅提醒，不阻止）
function validateStep(modal, step) {
    const missingFields = [];
    
    switch (step) {
        case 1:
            // 步骤1不需要验证
            return true;
        case 2:
            // 步骤2验证
            const photos = modal.querySelectorAll('.uploaded-photos img');
            if (photos.length === 0) {
                missingFields.push('现场照片');
            }
            break;
        case 3:
            // 步骤3验证
            const defectValue = modal.querySelector('.defect-value').value;
            if (!defectValue) {
                missingFields.push('缺陷数值');
            }
            const unit = modal.querySelector('.value-unit-select').value;
            if (!unit) {
                missingFields.push('单位');
            }
            const verificationMethod = modal.querySelector('.verification-method .modal-option-item.selected');
            if (!verificationMethod) {
                missingFields.push('验证方法');
            }
            break;
        case 4:
            // 步骤4验证
            const verificationResult = modal.querySelector('.verification-result .modal-option-item.selected');
            if (!verificationResult) {
                missingFields.push('核实结果');
            }
            const defectLevel = modal.querySelector('.defect-level .modal-option-item.selected');
            if (!defectLevel) {
                missingFields.push('缺陷等级');
            }
            break;
    }
    
    // 显示一次性提示
    if (missingFields.length > 0) {
        showCustomAlert('提醒', `请填写以下字段：${missingFields.join('、')}`);
    }
    
    return true;
}

// 提交时验证（阻止提交）
function validateSubmission(modal) {
    const missingFields = [];
    
    // 验证步骤2：现场照片
    const photos = modal.querySelectorAll('.uploaded-photos img');
    if (photos.length === 0) {
        missingFields.push('现场照片');
    }
    
    // 验证步骤3：缺陷数值、单位、验证方法
    const defectValue = modal.querySelector('.defect-value').value;
    if (!defectValue) {
        missingFields.push('缺陷数值');
    }
    const unit = modal.querySelector('.value-unit-select').value;
    if (!unit) {
        missingFields.push('单位');
    }
    const verificationMethod = modal.querySelector('.verification-method .modal-option-item.selected');
    if (!verificationMethod) {
        missingFields.push('验证方法');
    }
    
    // 验证步骤4：核实结果、缺陷等级
    const verificationResult = modal.querySelector('.verification-result .modal-option-item.selected');
    if (!verificationResult) {
        missingFields.push('核实结果');
    }
    const defectLevel = modal.querySelector('.defect-level .modal-option-item.selected');
    if (!defectLevel) {
        missingFields.push('缺陷等级');
    }
    
    // 显示一次性提示
    if (missingFields.length > 0) {
        showCustomAlert('提示', `请填写以下字段：${missingFields.join('、')}`);
        return false;
    }
    
    return true;
}

// 显示自定义弹窗
