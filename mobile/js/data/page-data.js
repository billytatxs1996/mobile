/**
 * 页面/弹窗列表的静态数据，仅在此处维护；index.html 只保留空容器，由 render-lists.js 渲染
 */
window.PAGE_DATA = {
    /** 角色切换弹窗（#role-modal）列表，需保持 data-role / data-name */
    roles: [
        { role: '负责人员', name: '张三' },
        { role: '许可人员', name: '李四' },
        { role: '管理人员', name: '王五' }
    ],
    /** 告警中心卡片（.alert-cards），type 对应 class：safety / patrol / trip，供 alerts.js 更新内容 */
    alertCards: [
        { type: 'safety', title: '安全告警', time: '暂无', content: '暂无安全告警', badge: '0', img: 'image/alerts/安全告警.png' },
        { type: 'patrol', title: '巡视告警', time: '18分钟前', content: '【巡视提醒】又到了每周巡视时间，请按时完成巡视任务，确保设备正常运行。', badge: '3', img: 'image/alerts/巡视告警.png' },
        { type: 'trip', title: '跳闸告警', time: '03-12 13:45', content: '3号线路发生跳闸，请及时检查故障原因并处理。', badge: '1', img: 'image/alerts/跳闸告警.png' }
    ],
    /** 小智历史对话（.history-list） */
    xiaozhiHistory: [
        { title: '技术咨询', preview: '如何解决前端跨域问题？', time: '10:30' },
        { title: '生活助手', preview: '今天天气怎么样？', time: '昨天' }
    ],
    /** 作业项选择弹窗（job-selection-modal）列表 */
    modalJobs: [
        { id: 1, name: '10kV开关柜检修项目', ticketNo: 'WD-2026-02-001', status: '进行中' },
        { id: 2, name: '主变压器预防性试验', ticketNo: 'WD-2026-02-002', status: '待开始' },
        { id: 3, name: 'GIS设备例行维护', ticketNo: 'WD-2026-02-003', status: '已完成' },
        { id: 4, name: '继电保护装置校验', ticketNo: 'WD-2026-02-004', status: '进行中' }
    ],
    /** 选择作业项页面（#job-list）列表 */
    pageJobs: [
        { id: 1, name: '10kV开关柜检修项目', ticketNo: 'WD-2026-02-001', timeRange: '2026-02-11 09:00 - 17:00', status: '进行中' },
        { id: 2, name: '主变压器预防性试验', ticketNo: 'WD-2026-02-002', timeRange: '2026-02-12 09:00 - 17:00', status: '待开始' },
        { id: 3, name: 'GIS设备例行维护', ticketNo: 'WD-2026-02-003', timeRange: '2026-02-10 09:00 - 17:00', status: '已完成' }
    ]
};
