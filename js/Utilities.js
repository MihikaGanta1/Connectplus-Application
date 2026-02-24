// ===== UTILITY FUNCTIONS =====
console.log('📦 Loading utilities...');

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'success', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.warn('Toast container not found');
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }
    
    if (typeof bootstrap === 'undefined') {
        console.warn('Bootstrap not available');
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    try {
        const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: duration });
        bsToast.show();
    } catch (error) {
        console.error('Toast error:', error);
        alert(`${type.toUpperCase()}: ${message}`);
    }
    
    setTimeout(() => toast.remove(), duration + 1000);
}

function showLoading(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading...</p>
        </div>
    `;
}

function hideLoading(container) {
    if (!container) return;
    // Content will be replaced by view rendering
}

function getStatusBadgeClass(status) {
    const map = {
        'Open': 'bg-primary',
        'InProgress': 'bg-warning text-dark',
        'OnHold': 'bg-secondary',
        'Resolved': 'bg-success',
        'Closed': 'bg-dark'
    };
    return map[status] || 'bg-secondary';
}

function getPriorityBadgeClass(priority) {
    const map = {
        'Low': 'bg-info text-dark',
        'Medium': 'bg-warning text-dark',
        'High': 'bg-danger',
        'Critical': 'bg-danger'
    };
    return map[priority] || 'bg-secondary';
}

// Export
window.utils = {
    formatDate,
    showToast,
    showLoading,
    hideLoading,
    getStatusBadgeClass,
    getPriorityBadgeClass
};

console.log('✅ Utilities loaded');