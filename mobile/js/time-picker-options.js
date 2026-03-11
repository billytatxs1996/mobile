/**
 * 时间选择器选项 + 日历结构：统一填充，避免在 HTML 中维护大量重复 option / 星期 / 日期
 */
(function () {
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var hourOptions = '';
    var minuteOptions = '';
    var i;

    for (i = 0; i < 24; i++) {
        hourOptions += '<option value="' + pad(i) + '">' + pad(i) + '</option>';
    }
    for (i = 0; i < 60; i += 5) {
        minuteOptions += '<option value="' + pad(i) + '">' + pad(i) + '</option>';
    }

    var weekdaysHtml = ['日', '一', '二', '三', '四', '五', '六'].map(function (w) {
        return '<span>' + w + '</span>';
    }).join('');

    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    function fillCalendar(el, daysInMonth, activeDay) {
        if (activeDay == null) activeDay = 11;
        if (daysInMonth == null) daysInMonth = 28;
        var html = '';
        for (i = 1; i <= daysInMonth; i++) {
            html += '<div class="calendar-day' + (i === activeDay ? ' active' : '') + '">' + i + '</div>';
        }
        el.innerHTML = html;
    }

    /** 将日历时间弹窗同步到指定日期时间（用于恢复时间/处理时间等默认当前时间） */
    window.syncCalendarModalToDatetime = function (modal, date) {
        if (!modal || !date) return;
        var d = date instanceof Date ? date : new Date(date);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        minute = Math.floor(minute / 5) * 5;
        if (minute >= 60) minute = 55;
        var titleEl = modal.querySelector('.calendar-title');
        if (titleEl) titleEl.textContent = year + '年' + month + '月';
        var daysEl = modal.querySelector('.calendar-days');
        if (daysEl) fillCalendar(daysEl, getDaysInMonth(year, month), day);
        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        var hourSelect = modal.querySelector('.start-hour') || modal.querySelector('.hour-select');
        var minuteSelect = modal.querySelector('.start-minute') || modal.querySelector('.minute-select');
        if (hourSelect) hourSelect.value = pad(hour);
        if (minuteSelect) minuteSelect.value = pad(minute);
    };

    function fillTimePickers() {
        document.querySelectorAll('.hour-select').forEach(function (el) {
            if (!el.options.length) el.innerHTML = hourOptions;
        });
        document.querySelectorAll('.minute-select').forEach(function (el) {
            if (!el.options.length) el.innerHTML = minuteOptions;
        });
    }

    function fillCalendars() {
        document.querySelectorAll('.calendar-weekdays').forEach(function (el) {
            if (!el.children.length) el.innerHTML = weekdaysHtml;
        });
        document.querySelectorAll('.calendar-days').forEach(function (el) {
            if (!el.children.length) fillCalendar(el, 28, 11);
        });
    }

    function init() {
        fillTimePickers();
        fillCalendars();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
