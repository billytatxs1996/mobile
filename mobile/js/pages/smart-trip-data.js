// 全局变量，存储跳闸事件数据
let globalTripEventData = {
    1: { status: '未确认', read: false },
    2: { status: '未确认', read: true },
    3: { status: '待处理', read: true },
    4: { status: '已处理', read: true },
    5: { status: '已处理', read: true },
    6: { status: '已处理', read: true },
    7: { status: '已处理', read: true }
};

// 更新故障事件数量角标
function updateFaultBadges() {
    let unconfirmedCount = 0;
    let pendingCount = 0;
    let unreadCount = 0;
    
    // 计算未确认、未处理和未读的故障事件数量
    Object.values(globalTripEventData).forEach(event => {
        if (event.status === '未确认') {
            unconfirmedCount++;
        } else if (event.status === '待处理') {
            pendingCount++;
        }
        if (event.read === false) {
            unreadCount++;
        }
    });
    
    // 更新跳闸快报应用的角标
    const tripReportBadge = document.getElementById('trip-report-badge');
    if (tripReportBadge) {
        if (unreadCount > 0) {
            tripReportBadge.textContent = unreadCount;
            tripReportBadge.style.display = 'flex';
        } else {
            tripReportBadge.style.display = 'none';
        }
    }
    
    // 更新故障确认应用的角标
    const faultConfirmationBadge = document.getElementById('fault-confirmation-badge');
    if (faultConfirmationBadge) {
        if (unconfirmedCount > 0) {
            faultConfirmationBadge.textContent = unconfirmedCount;
            faultConfirmationBadge.style.display = 'flex';
        } else {
            faultConfirmationBadge.style.display = 'none';
        }
    }
    
    // 更新故障处理应用的角标
    const faultHandlingBadge = document.getElementById('fault-handling-badge');
    if (faultHandlingBadge) {
        if (pendingCount > 0) {
            faultHandlingBadge.textContent = pendingCount;
            faultHandlingBadge.style.display = 'flex';
        } else {
            faultHandlingBadge.style.display = 'none';
        }
    }
}
function updateEventListReadStatus() {
    const eventItems = document.querySelectorAll('#trip-event-list .job-item');
    eventItems.forEach((item, index) => {
        const eventId = item.getAttribute('data-event-id');
        if (eventId && globalTripEventData[eventId]) {
            if (!globalTripEventData[eventId].read) {
                // 事件为未读
                item.classList.add('unread');
            } else {
                // 事件为已读
                item.classList.remove('unread');
            }
        } else if (index === 0) {
            // 第1条事件为未读（默认情况）
            item.classList.add('unread');
        } else {
            // 其他事件为已读（默认情况）
            item.classList.remove('unread');
        }
    });
}

// 初始化跳闸事件数据
function initTripEventData() {
    // 初始化全局跳闸事件数据
    globalTripEventData = {
        1: {
            eventName: '10kV线路跳闸事件',
            eventTime: '2026-02-12 10:30',
            equipment: '10kV #1线路开关',
            type: '过电流跳闸',
            current: '1200A',
            description: '10kV #1线路发生过电流跳闸，保护装置动作，重合闸未成功。经初步分析，可能是线路发生短路故障导致。',
            waveform: 'image/safety/跳闸波形图.png',
            status: '未确认',
            read: false
        },
        2: {
            eventName: '10kV线路跳闸事件',
            eventTime: '2026-02-12 09:37',
            equipment: '10kV #2线路开关',
            type: '过电流跳闸',
            current: '1500A',
            description: '10kV #2线路发生过电流跳闸，保护装置动作，重合闸未成功。经初步分析，可能是线路发生短路故障导致。',
            waveform: 'image/safety/跳闸波形图.png',
            status: '未确认',
            read: true
        },
        3: {
            eventName: '35kV母线跳闸事件',
            eventTime: '2026-02-11 16:45',
            equipment: '35kV母线保护',
            type: '差动保护动作',
            current: '5000A',
            description: '35kV母线发生差动保护动作跳闸，影响多条出线。经检查，发现母线PT故障导致保护误动。',
            waveform: 'image/safety/跳闸波形图.png',
            status: '待处理',
            read: true
        },
        4: {
            eventName: '110kV变压器跳闸事件',
            eventTime: '2026-02-10 09:20',
            equipment: '110kV #1主变压器',
            type: '瓦斯保护动作',
            current: '8000A',
            description: '110kV #1主变压器发生瓦斯保护动作跳闸，现场检查发现变压器油色谱异常，存在内部故障。',
            waveform: 'image/safety/跳闸波形图.png',
            status: '已处理',
            read: true
        },
        5: {
            eventName: '110kV线路跳闸事件',
            eventTime: '2026-02-09 14:30',
            equipment: '110kV #1线路开关',
            type: '过电流跳闸',
            current: '3200A',
            description: '110kV #1线路发生过电流跳闸，保护装置动作，重合闸未成功。经检查为线路故障，已隔离并处理。',
            waveform: 'image/safety/跳闸波形图.png',
            status: '已处理',
            read: true
        },
        6: {
            eventName: '110kV线路跳闸事件',
            eventTime: '2026-02-08 11:15',
            equipment: '110kV #2线路开关',
            type: '过电流跳闸',
            current: '2800A',
            description: '110kV #2线路发生过电流跳闸，保护装置动作。经排查为外力破坏导致，已修复。',
            waveform: 'image/safety/跳闸波形图.png',
            status: '已处理',
            read: true
        },
        7: {
            eventName: '110kV线路跳闸事件',
            eventTime: '2026-02-07 16:45',
            equipment: '110kV #3线路开关',
            type: '过电流跳闸',
            current: '3000A',
            description: '110kV #3线路发生过电流跳闸，保护动作正确。经检修已恢复送电。',
            waveform: 'image/safety/跳闸波形图.png',
            status: '已处理',
            read: true
        }
    };
    // 从数据渲染跳闸事件列表（index.html 仅保留空容器 #trip-event-list）
    renderTripEventList();
    updateEventListReadStatus();
    window.tripEventDataInitialized = true;
}

function renderTripEventList() {
    var el = document.getElementById('trip-event-list');
    if (!el || !globalTripEventData) return;
    var html = '';
    var ids = Object.keys(globalTripEventData).map(Number).sort(function (a, b) { return a - b; });
    ids.forEach(function (id) {
        var d = globalTripEventData[id];
        if (!d || !d.eventName) return;
        html += '<div class="job-item" data-event-id="' + id + '" data-event-name="' + (d.eventName || '') + '" data-event-time="' + (d.eventTime || '') + '">';
        html += '<div class="job-info"><h4>' + (d.eventName || '') + '</h4>';
        html += '<p>时间：' + (d.eventTime || '') + '</p>';
        html += '<p>设备：' + (d.equipment || '') + '</p>';
        html += '<p>状态：' + (d.status || '') + '</p></div></div>';
    });
    el.innerHTML = html;
}
