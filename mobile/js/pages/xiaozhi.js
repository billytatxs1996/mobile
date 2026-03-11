function initXiaozhiSidebar() {
    const menuBtn = document.getElementById('menu-btn');
    const historySidebar = document.getElementById('history-sidebar');
    const closeSidebarBtn = document.querySelector('.close-sidebar');
    const newChatBtns = document.querySelectorAll('.new-chat-btn');
    const historyItems = document.querySelectorAll('.history-item');
    const historyActionBtns = document.querySelectorAll('.history-action-btn');
    
    // 打开侧边栏
    menuBtn.addEventListener('click', () => {
        historySidebar.classList.add('active');
    });
    
    // 关闭侧边栏
    closeSidebarBtn.addEventListener('click', () => {
        historySidebar.classList.remove('active');
    });
    
    // 新建对话按钮点击事件
    newChatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 这里可以添加新建对话的逻辑
            console.log('新建对话');
            // 关闭侧边栏
            historySidebar.classList.remove('active');
        });
    });
    
    // 历史对话项点击事件（切换对话）
    historyItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // 避免点击操作按钮时触发
            if (!e.target.closest('.history-actions')) {
                console.log('切换到对话:', item.querySelector('.history-title').textContent);
                // 关闭侧边栏
                historySidebar.classList.remove('active');
            }
        });
    });
    
    // 历史对话操作按钮点击事件
    historyActionBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止冒泡
            const historyItem = btn.closest('.history-item');
            const historyTitle = historyItem.querySelector('.history-title');
            
            // 第一个按钮是编辑名称，第二个按钮是删除
            if (index % 2 === 0) {
                // 编辑名称
                const newTitle = prompt('请输入新的对话名称:', historyTitle.textContent);
                if (newTitle && newTitle.trim()) {
                    historyTitle.textContent = newTitle.trim();
                }
            } else {
                // 删除对话
                if (confirm('确定要删除这个对话吗？')) {
                    historyItem.remove();
                }
            }
        });
    });
}

// 更新场景快捷功能
function updateScenarioQuickFunctions(scenarioName) {
    const patrolApp = document.querySelector('.patrol-app');
    const analysisApp = document.querySelector('.analysis-app');
    
    if (scenarioName === '巡视应用') {
        patrolApp.style.display = 'flex';
        analysisApp.style.display = 'none';
    } else if (scenarioName === '分析应用') {
        patrolApp.style.display = 'none';
        analysisApp.style.display = 'flex';
    }
}

// 场景切换功能
function initScenarioSelector() {
    const scenarioHeader = document.getElementById('scenario-header');
    const scenarioDropdown = document.getElementById('scenario-dropdown');
    const scenarioItems = document.querySelectorAll('.scenario-item');
    const currentScenario = document.querySelector('.current-scenario');
    
    // 切换下拉菜单显示/隐藏
    scenarioHeader.addEventListener('click', () => {
        scenarioHeader.classList.toggle('active');
        scenarioDropdown.classList.toggle('active');
    });
    
    // 选择场景
    scenarioItems.forEach(item => {
        item.addEventListener('click', () => {
            // 移除所有场景的active状态
            scenarioItems.forEach(i => i.classList.remove('active'));
            // 添加当前场景的active状态
            item.classList.add('active');
            // 更新当前场景显示
            const scenarioName = item.querySelector('.scenario-name').textContent;
            currentScenario.textContent = scenarioName;
            // 关闭下拉菜单
            scenarioHeader.classList.remove('active');
            scenarioDropdown.classList.remove('active');
            // 更新场景快捷功能
            updateScenarioQuickFunctions(scenarioName);
            // 这里可以添加场景切换的逻辑
            console.log('切换到场景:', scenarioName);
        });
    });
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.scenario-selector')) {
            scenarioHeader.classList.remove('active');
            scenarioDropdown.classList.remove('active');
        }
    });
}
