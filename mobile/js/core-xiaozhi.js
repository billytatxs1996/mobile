function initMessageInput() {
    const inputField = document.querySelector('.input-field');
    const chatMessages = document.querySelector('.chat-messages');
    
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && inputField.value.trim()) {
            const message = inputField.value.trim();
            
            // 添加用户消息
            addMessage('user', message);
            
            // 清空输入框
            inputField.value = '';
            
            // 模拟AI回复
            setTimeout(() => {
                addMessage('ai', getAIResponse(message));
            }, 1000);
        }
    });
}

// 添加消息到聊天区域（content 可为字符串或 { text, chart }）
function addMessage(type, content) {
    const chatMessages = document.querySelector('.chat-messages');
    const messageContainer = document.createElement('div');
    messageContainer.className = type === 'user' ? 'message-container user-message-container' : 'message-container ai-message-container';

    const isObj = content && typeof content === 'object' && content.text !== undefined;
    const text = isObj ? content.text : (content || '');
    const chartConfig = isObj ? content.chart : null;

    if (type === 'user') {
        messageContainer.innerHTML = `
            <div class="message-icon">
                <img src="image/common/头像.png" alt="用户" width="32" height="32">
            </div>
            <div class="system-message" style="background-color: #e3f2fd;">
                <p>${escapeHtml(text)}</p>
            </div>
        `;
    } else {
        const chartId = chartConfig ? 'xiaozhi-chart-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) : '';
        messageContainer.innerHTML = `
            <div class="message-icon">
                <img src="image/common/机器人.png" alt="机器人" width="32" height="32">
            </div>
            <div class="system-message">
                ${text ? '<p class="message-text">' + escapeHtml(text) + '</p>' : ''}
                ${chartConfig ? '<div class="message-chart-wrap"><canvas id="' + chartId + '" class="message-chart"></canvas></div>' : ''}
            </div>
        `;
        chatMessages.appendChild(messageContainer);
        if (chartConfig && typeof Chart !== 'undefined') {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                setTimeout(function () {
                    try {
                        new Chart(canvas, {
                            type: chartConfig.type,
                            data: chartConfig.data,
                            options: chartConfig.options || {}
                        });
                    } catch (e) { console.warn('Chart render error', e); }
                }, 50);
            }
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
    }

    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// 从数组中随机取一项，使回复更自然
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 模拟AI回复：支持纯文本、数据问答、图表展示，回复带随机变化
function getAIResponse(message) {
    const msg = (message || '').trim();
    const responses = {
        '你好': '你好！我是小智，有什么可以帮助你的吗？',
        '你是谁': '我是小智，你的智能助手，支持数据问答和图表展示，有问题随时问我。',
        '天气': '今天天气晴朗，温度适宜，是个好天气！',
        '工作': '工作顺利！记得劳逸结合哦。',
        '健康': '保持健康的生活方式很重要，记得多运动、多喝水。'
    };
    if (responses[msg]) return responses[msg];

    // 上周 / 上月 等时间维度优先
    if (/上周|上星期/.test(msg) && /巡视|巡检|数据|计划/.test(msg)) {
        return { text: pick([
            '上周巡视计划共 12 项，已完成 11 项，完成率 91.7%，待审核 1 项。整体执行良好。',
            '已查到上周数据：计划 12 项、完成 11 项，完成率约 92%。',
            '上周巡视：计划 12 项，完成 11 项，1 项待审核，完成率 91.7%。'
        ]), chart: null };
    }
    if (/上周|上星期/.test(msg)) {
        return { text: pick([
            '上周巡视计划 12 项，完成 11 项，完成率 91.7%。需要看趋势图或明细可以说一声。',
            '上周数据已查：计划 12 项、完成 11 项，整体正常。'
        ]), chart: null };
    }

    // 数据问答（关键词匹配，多条表述随机）
    if (/告警|报警/.test(msg) && (/数量|多少|几条|统计|查|询/.test(msg) || msg.length <= 6)) {
        return { text: pick([
            '本月共产生告警 23 条，其中紧急 5 条、提醒 12 条、通知 6 条。较上月下降约 12%。',
            '本月告警统计：合计 23 条（紧急 5、提醒 12、通知 6），环比有所下降。',
            '当前本月告警 23 条，紧急 5 条、提醒 12 条、通知 6 条。'
        ]), chart: null };
    }
    if (/完成率|完成情况|作业进度/.test(msg)) {
        return { text: pick([
            '当前作业完成率为 87.5%，环比上周提升 3.2%。进行中 8 项，待开始 2 项。',
            '完成率 87.5%，较上周 +3.2%。进行中 8 项、待开始 2 项。',
            '作业进度：完成率 87.5%，进行中 8 项，待开始 2 项。'
        ]), chart: null };
    }
    if (/巡视|巡检/.test(msg) && (/数据|计划|完成|问答|近期|查|询|帮|要/.test(msg) || msg.length <= 8)) {
        return { text: pick([
            '本周巡视计划 15 项，已完成 13 项，完成率 86.7%。待审核 2 项。近期巡视整体正常。',
            '本周计划 15 项、完成 13 项，完成率 86.7%，2 项待审核。',
            '查到啦：本周巡视 15 项，完成 13 项，2 项待审核，整体正常。'
        ]), chart: null };
    }
    if (/设备|运行|状态/.test(msg) && /多少|统计|数量/.test(msg)) {
        return { text: pick([
            '当前在册设备 128 台，正常 118 台、预警 7 台、故障 3 台，完好率 92.2%。',
            '设备统计：共 128 台，正常 118、预警 7、故障 3，完好率 92.2%。'
        ]), chart: null };
    }
    if (/告警|报警/.test(msg)) {
        return { text: pick([
            '本月共产生告警 23 条，其中紧急 5 条、提醒 12 条、通知 6 条。较上月下降约 12%。',
            '本月告警 23 条（紧急 5、提醒 12、通知 6），环比下降。'
        ]), chart: null };
    }
    if (/巡视|巡检/.test(msg)) {
        return { text: pick([
            '本周巡视计划 15 项，已完成 13 项，完成率 86.7%。待审核 2 项。',
            '本周巡视：计划 15 项、完成 13 项，2 项待审核。'
        ]), chart: null };
    }
    if (/趋势|走势|变化/.test(msg) && !/图|表|曲线/.test(msg)) {
        return { text: pick([
            '近 7 天告警数量依次为：12、15、8、22、9、11、23 条，整体呈波动趋势，周三为峰值。',
            '近一周告警：12、15、8、22、9、11、23 条，周三最高。',
            '7 天趋势：12→15→8→22→9→11→23 条，周三达峰。'
        ]), chart: null };
    }

    // 图表类：返回文案 + Chart.js 配置（文案也可随机）
    if (/趋势图|趋势曲线|告警趋势|走势图/.test(msg)) {
        return {
            text: pick(['近 7 天告警数量趋势如下：', '近一周告警趋势如图：', '7 天趋势图如下：']),
            chart: {
                type: 'line',
                data: {
                    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                    datasets: [{
                        label: '告警数',
                        data: [12, 15, 8, 22, 9, 11, 23],
                        borderColor: '#4a90e2',
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true, aspectRatio: 2, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            }
        };
    }
    if (/柱状图|条形图|分布图|各类型|分类统计/.test(msg)) {
        return {
            text: pick(['各类型告警数量分布：', '告警类型分布如图：', '分类统计如下：']),
            chart: {
                type: 'bar',
                data: {
                    labels: ['紧急', '提醒', '通知'],
                    datasets: [{ label: '数量', data: [5, 12, 6], backgroundColor: ['#d32f2f', '#e65100', '#1565c0'] }]
                },
                options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            }
        };
    }
    if (/饼图|占比|比例|构成/.test(msg)) {
        return {
            text: pick(['本周巡视完成情况占比：', '完成情况占比如图：', '占比构成如下：']),
            chart: {
                type: 'pie',
                data: {
                    labels: ['已完成', '进行中', '未开始'],
                    datasets: [{ data: [13, 2, 0], backgroundColor: ['#2e7d32', '#ed6c02', '#9e9e9e'] }]
                },
                options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.2 }
            }
        };
    }
    if (/图|表|曲线|图表/.test(msg)) {
        return {
            text: pick(['近 7 天告警趋势如下：', '趋势图如下：']),
            chart: {
                type: 'line',
                data: {
                    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                    datasets: [{ label: '告警数', data: [12, 15, 8, 22, 9, 11, 23], borderColor: '#4a90e2', backgroundColor: 'rgba(74, 144, 226, 0.1)', fill: true, tension: 0.3 }]
                },
                options: { responsive: true, maintainAspectRatio: true, aspectRatio: 2, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            }
        };
    }

    // 默认回复也随机化，并更口语化
    const defaults = [
        '可以说「本月告警数量」「上周巡视数据」「完成率」「趋势图」等，我帮你查数据或出图。',
        '试试问我：告警数量、巡视数据、完成率，或者说「趋势图」「柱状图」「饼图」看图表。',
        '我这边可以查告警、巡视、完成率等数据，也能画趋势图、柱状图、饼图，你直接说需求就行。',
        '需要数据或图表的话，比如：告警数量、巡视数据、完成率、趋势图、柱状图、饼图，都可以。'
    ];
    if (/数据|统计|多少|哪些|查询|查|帮|要/.test(msg)) {
        return pick(defaults);
    }
    return pick(defaults);
}

// 快捷功能按钮点击事件
function initQuickFunctions() {
    const quickBtns = document.querySelectorAll('.quick-btn');
    const inputField = document.querySelector('.input-field');
    
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent.trim();
            if (text) {
                inputField.value = text;
                inputField.focus();
            }
        });
    });
}

// 动态更新时间
function initDynamicTime() {
    const timeElement = document.getElementById('current-time');
    if (!timeElement) return;
    function updateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    updateTime();
    setInterval(updateTime, 1000);
}

// 角色切换功能
function initRoleSwitch() {
    const roleSwitchBtn = document.querySelector('.role-switch-btn');
    const roleModal = document.getElementById('role-modal');
    const roleItems = document.querySelectorAll('.role-item');
    const welcomeMessage = document.getElementById('welcome-message');
    if (!welcomeMessage) return;
    // 存储当前角色信息，并暴露到全局，供其它模块（如智能安全）判断视角
    let currentRole = { role: '负责人员', name: '张三' };
    window.currentRole = currentRole;
    
    // 更新欢迎语（与头部文案一致：Hello! + 人名 + 你好）
    function updateWelcomeMessage() {
        if (welcomeMessage) welcomeMessage.textContent = `Hello! ${currentRole.name}，你好！`;
    }
    
    // 初始化欢迎语
    updateWelcomeMessage();
    if (!roleSwitchBtn || !roleModal) return;
    // 打开角色切换弹窗
    roleSwitchBtn.addEventListener('click', () => {
        roleModal.classList.add('active');
    });
    // 关闭角色切换弹窗（点击弹窗外部）
    roleModal.addEventListener('click', (e) => {
        if (e.target === roleModal) roleModal.classList.remove('active');
    });
    // 选择角色
    roleItems.forEach(item => {
        item.addEventListener('click', () => {
            currentRole = {
                role: item.getAttribute('data-role'),
                name: item.getAttribute('data-name')
            };
            // 更新全局角色信息
            window.currentRole = currentRole;
            updateWelcomeMessage();
            roleModal.classList.remove('active');
        });
    });
}
