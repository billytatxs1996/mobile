window.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof initTripEventData === 'function') initTripEventData();
    } catch (e) {
        console.warn('initTripEventData:', e);
    }
    if (typeof initApp === 'function') initApp();
});
