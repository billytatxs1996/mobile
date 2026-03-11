function searchJobs() {
    const searchTerm = document.getElementById('job-search').value.toLowerCase();
    
    const jobItems = document.querySelectorAll('#job-list .job-item');
    jobItems.forEach(item => {
        const jobName = item.querySelector('h4').textContent.toLowerCase();
        const workOrder = item.querySelector('p:nth-child(2)').textContent.toLowerCase();
        
        const matchesJobName = searchTerm === '' || jobName.includes(searchTerm);
        const matchesWorkOrder = searchTerm === '' || workOrder.includes(searchTerm);
        
        if (matchesJobName || matchesWorkOrder) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 显示跳闸事件选择页面
