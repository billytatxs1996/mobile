// 显示作业项选择页面
function showJobSelectionPage() {
    // 显示作业项选择页面（从右侧滑入）
    const jobSelectionPage = document.getElementById('job-selection-page');
    // 先重置状态
    jobSelectionPage.classList.remove('active');
    // 确保元素显示
    jobSelectionPage.style.display = 'flex';
    // 强制重排
    void jobSelectionPage.offsetWidth;
    // 添加active类触发动画
    jobSelectionPage.classList.add('active');
}

// 隐藏作业项选择页面
function hideJobSelectionPage() {
    // 隐藏作业项选择页面（从左侧滑出）
    const jobSelectionPage = document.getElementById('job-selection-page');
    jobSelectionPage.classList.remove('active');
    // 延迟设置display: none，确保动画完成
    setTimeout(() => {
        jobSelectionPage.style.display = 'none';
    }, 300);
}

// 关闭智能安全页面，返回工作台
function closeSmartSafetyPage() {
    showPage('workbench');
}

// 打开智能安全页面
function openSmartSafetyPage(tab = 'work-order') {
    showPage('smart-safety');
    
    // 初始化智能安全页面
    initSmartSafetyPage(tab);
}

// 智能安全页面功能
function showTripEventSelectionPage() {
    // 显示跳闸事件选择页面（从右侧滑入）
    const tripEventSelectionPage = document.getElementById('trip-event-selection-page');
    // 先重置状态
    tripEventSelectionPage.classList.remove('active');
    // 确保元素显示
    tripEventSelectionPage.style.display = 'flex';
    // 强制重排
    void tripEventSelectionPage.offsetWidth;
    // 添加active类触发动画
    tripEventSelectionPage.classList.add('active');
    
    // 重置事件选择
    const eventItems = document.querySelectorAll('#trip-event-list .job-item');
    eventItems.forEach(item => item.classList.remove('selected'));
}

// 隐藏跳闸事件选择页面
function hideTripEventSelectionPage() {
    // 隐藏跳闸事件选择页面（从左侧滑出）
    const tripEventSelectionPage = document.getElementById('trip-event-selection-page');
    tripEventSelectionPage.classList.remove('active');
    // 延迟设置display: none，确保动画完成
    setTimeout(() => {
        tripEventSelectionPage.style.display = 'none';
    }, 300);
}

// 关闭智能跳闸页面，返回工作台
function closeSmartTripPage() {
    showPage('workbench');
    updateFaultBadges();
}

// 打开智能跳闸页面
function openSmartTripPage(targetTab = 'trip-report') {
    showPage('smart-trip');
    
    // 初始化智能跳闸页面
    initSmartTripPage(targetTab);
}


// 打开人机协同页面
function openHumanMachinePage() {
    showPage('human-machine');
    
    // 初始化人机协同页面
    initHumanMachinePage();
}

// 初始化人机协同页面

// 打开巡视进度指标页面
function openPatrolProgressPage() {
    // 显示巡视进度指标页面
    showPage('patrol-progress');
    
    // 初始化巡视进度指标页面
    initPatrolProgressPage();
}

// 初始化巡视进度指标页面
