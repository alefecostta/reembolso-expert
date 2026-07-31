/* ==========================================================================
   IA TRADER - ADMINISTRATIVE DASHBOARD LOGIC (PREMIUM VERSION)
   ========================================================================== */

// CONFIGURATION: Paste your Google Web App URL here to save data to Google Sheets
// If left empty, it will default to relative local server paths (/api/refunds)
const DATABASE_URL = "https://script.google.com/macros/s/AKfycbwEYfoHSL0-_HIzNm8jHZIy3H3fWdmm0QjiTQc_irtzoWoo9-LmsBmRGWlqtQhv9c05/exec"; 

let adminPassword = '';
let refundRequests = [];
let selectedIds = [];
let currentFilter = 'all';
let auditLogs = [
    { text: 'Sistema de control iniciado.', time: new Date() }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if password exists in sessionStorage (keeps admin logged in on refresh)
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
        adminPassword = savedPassword;
        showDashboard();
    } else {
        showLogin();
    }
});

function showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('admin-password').focus();
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'block';
    addAuditLog('Sesión administrativa activa.');
    fetchRefundRequests();
}

/* ==========================================================================
   AUTHENTICATION LOGIC
   ========================================================================== */

async function loginAdmin() {
    const passwordInput = document.getElementById('admin-password');
    const password = passwordInput.value.trim();
    const errorEl = document.getElementById('login-error');
    errorEl.style.display = 'none';

    if (!password) {
        showInputError(passwordInput, 'La contraseña es requerida.');
        return;
    }

    // Local file protocol simulation (allows double-clicking file offline)
    if (window.location.protocol === 'file:') {
        if (password === 'reembolso' || password === 'admin') {
            adminPassword = password;
            sessionStorage.setItem('admin_password', password);
            showDashboard();
            passwordInput.value = '';
        } else {
            errorEl.style.display = 'block';
            passwordInput.select();
        }
        return;
    }

    // Check if database URL is missing when hosted on Netlify/web
    if (!DATABASE_URL && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        alert('Erro: Banco de dados não configurado! Você precisa configurar a URL da sua Planilha do Google na variável DATABASE_URL no topo do arquivo admin.js para conseguir fazer login.');
        return;
    }

    try {
        // Verify password by attempting to fetch data
        const url = DATABASE_URL 
            ? `${DATABASE_URL}?action=read&password=${encodeURIComponent(password)}`
            : '/api/refunds';
            
        const headers = DATABASE_URL ? {} : { 'Authorization': password };

        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (response.status === 200 || response.ok) {
            const data = await response.json();
            if (data && data.error === "Unauthorized") {
                errorEl.style.display = 'block';
                passwordInput.select();
                return;
            }
            
            adminPassword = password;
            sessionStorage.setItem('admin_password', password);
            showDashboard();
            passwordInput.value = '';
        } else {
            if (response.status === 404) {
                alert('Erro: Banco de dados não encontrado (404). Verifique se configurou a URL da planilha corretamente.');
            } else {
                errorEl.style.display = 'block';
                passwordInput.select();
            }
        }
    } catch (err) {
        console.error('Error logging in:', err);
        alert('Ocurrió un error al intentar conectar con el servidor.');
    }
}

function logoutAdmin() {
    adminPassword = '';
    sessionStorage.removeItem('admin_password');
    refundRequests = [];
    selectedIds = [];
    showLogin();
}

/* ==========================================================================
   API DATA INTERACTION
   ========================================================================== */

async function fetchRefundRequests() {
    const listContainer = document.getElementById('requests-list');
    listContainer.innerHTML = '<div class="no-data">Cargando solicitudes...</div>';
    
    // Clear selection
    selectedIds = [];
    updateBulkActionsBar();
    const masterSelect = document.getElementById('master-select');
    if (masterSelect) masterSelect.checked = false;

    // Local file protocol simulation (Offline testing mock data)
    if (window.location.protocol === 'file:') {
        refundRequests = [
            {
                id: "#REF-8321",
                name: "Carlos Mendoza",
                email: "carlos.mendoza@email.com",
                products: [{ id: "6587709", name: "AI PRO - Comece aqui" }],
                reason: "no-cumplio",
                reasonText: "Não tenho tempo para usar/aplicar",
                feedback: "Pensé que las alertas eran automáticas.",
                date: "2026-07-28T14:32:00.000Z",
                status: "pending"
            },
            {
                id: "#REF-4412",
                name: "Mariana Silva",
                email: "mari.silva@email.com",
                products: [{ id: "6587831", name: "Grupo VIP de Alumnos" }],
                reason: "problemas-economicos",
                reasonText: "Dificultad económica actual",
                feedback: "Tuve un imprevisto familiar y necesito recuperar el dinero.",
                date: "2026-07-29T09:15:00.000Z",
                status: "refunded"
            }
        ];
        updateMetrics();
        updateProductDistribution();
        updateAuditLogWidget();
        applyFilters();
        return;
    }

    try {
        const url = DATABASE_URL 
            ? `${DATABASE_URL}?action=read&password=${encodeURIComponent(adminPassword)}`
            : '/api/refunds';
            
        const headers = DATABASE_URL ? {} : { 'Authorization': adminPassword };

        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (response.status === 200 || response.ok) {
            const data = await response.json();
            if (data && data.error === "Unauthorized") {
                alert('Sesión expirada o no autorizada. Por favor inicia sesión de nuevo.');
                logoutAdmin();
                return;
            }
            
            refundRequests = data;
            updateMetrics();
            updateProductDistribution();
            updateAuditLogWidget();
            applyFilters();
        } else if (response.status === 401) {
            alert('Sesión expirada o no autorizada. Por favor inicia sesión de nuevo.');
            logoutAdmin();
        } else {
            alert('Error al obtener datos del servidor.');
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        listContainer.innerHTML = '<div class="no-data">Error de conexão. Não foi possível conectar ao banco de dados configurado.</div>';
    }
}

async function changeRequestStatus(requestId, newStatus) {
    // File protocol mock handling
    if (window.location.protocol === 'file:') {
        const idx = refundRequests.findIndex(r => r.id === requestId);
        if (idx !== -1) {
            refundRequests[idx].status = newStatus;
            addAuditLog(`Local: Ticket ${requestId} marcado como ${newStatus}.`);
            closeRequestDetail();
            updateMetrics();
            updateProductDistribution();
            applyFilters();
        }
        return;
    }

    try {
        const url = DATABASE_URL
            ? `${DATABASE_URL}?action=update&id=${encodeURIComponent(requestId)}&status=${encodeURIComponent(newStatus)}&password=${encodeURIComponent(adminPassword)}`
            : '/api/refunds';
            
        const response = await fetch(url, {
            method: DATABASE_URL ? 'GET' : 'PUT', // Apps Script does GET/POST redirects cleanly
            headers: DATABASE_URL ? {} : {
                'Content-Type': 'application/json',
                'Authorization': adminPassword
            },
            body: DATABASE_URL ? null : JSON.stringify({
                id: requestId,
                status: newStatus
            })
        });

        if (response.status === 200 || response.ok) {
            addAuditLog(`Ticket ${requestId} marcado como ${newStatus}.`);
            closeRequestDetail();
            fetchRefundRequests();
        } else {
            alert('Error al cambiar el estado del reembolso.');
        }
    } catch (err) {
        console.error('Error changing status:', err);
        alert('Error de conexão.');
    }
}

async function deleteRequest(requestId) {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta solicitud?')) return;

    // File protocol mock handling
    if (window.location.protocol === 'file:') {
        refundRequests = refundRequests.filter(r => r.id !== requestId);
        addAuditLog(`Local: Registro ${requestId} eliminado.`);
        closeRequestDetail();
        updateMetrics();
        updateProductDistribution();
        applyFilters();
        return;
    }

    try {
        const url = DATABASE_URL
            ? `${DATABASE_URL}?action=delete&id=${encodeURIComponent(requestId)}&password=${encodeURIComponent(adminPassword)}`
            : `/api/refunds?id=${encodeURIComponent(requestId)}`;
            
        const response = await fetch(url, {
            method: DATABASE_URL ? 'GET' : 'DELETE',
            headers: DATABASE_URL ? {} : {
                'Authorization': adminPassword
            }
        });

        if (response.status === 200 || response.ok) {
            addAuditLog(`Registro ${requestId} eliminado del sistema.`);
            closeRequestDetail();
            fetchRefundRequests();
        } else {
            alert('Error al eliminar el registro.');
        }
    } catch (err) {
        console.error('Error deleting:', err);
        alert('Error de conexão.');
    }
}

/* ==========================================================================
   METRICS & RENDERING
   ========================================================================== */

function updateMetrics() {
    const pendingCount = refundRequests.filter(r => r.status === 'pending').length;
    const refundedCount = refundRequests.filter(r => r.status === 'refunded').length;
    const rejectedCount = refundRequests.filter(r => r.status === 'rejected').length;
    const totalCount = refundRequests.length;
    
    document.getElementById('stat-pending').innerText = pendingCount;
    document.getElementById('stat-refunded').innerText = refundedCount;
    document.getElementById('stat-rejected').innerText = rejectedCount;
    document.getElementById('stat-total').innerText = totalCount;
}

function setFilter(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-filter') === filter) {
            tab.classList.add('active');
        }
    });
    
    applyFilters();
}

function applyFilters() {
    const searchVal = document.getElementById('admin-search').value.toLowerCase().trim();
    const container = document.getElementById('requests-list');
    
    let filtered = refundRequests;
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(r => r.status === currentFilter);
    }
    
    if (searchVal) {
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(searchVal) ||
            r.email.toLowerCase().includes(searchVal) ||
            r.id.toLowerCase().includes(searchVal) ||
            (r.products && r.products.some(p => p.name.toLowerCase().includes(searchVal)))
        );
    }
    
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-data">No se encontraron solicitudes.</div>';
        return;
    }
    
    filtered.forEach(request => {
        const isSelected = selectedIds.includes(request.id);
        const row = document.createElement('div');
        row.className = `request-item-row${isSelected ? ' row-selected' : ''}`;
        row.setAttribute('data-id', request.id);
        row.onclick = (e) => {
            if (e.target.closest('.col-select') || e.target.closest('.btn') || e.target.closest('input[type="checkbox"]')) return;
            openRequestDetail(request.id);
        };
        
        let statusClass = 'pending';
        let statusText = 'Pendiente';
        if (request.status === 'refunded') {
            statusClass = 'refunded';
            statusText = 'Reembolsado';
        } else if (request.status === 'rejected') {
            statusClass = 'rejected';
            statusText = 'Rechazado';
        }
        
        const dateObj = new Date(request.date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const productsHTML = request.products ? request.products.map(p => `<span class="admin-prod-tag">${p.name}</span>`).join(' ') : '';
        
        row.innerHTML = `
            <div class="col-select">
                <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="handleCheckboxClick(this, '${request.id}', event)">
            </div>
            <div class="col-client">
                <span class="client-name-bold">${request.name}</span>
                <span class="client-contact-sub">${request.email}</span>
            </div>
            <div class="col-products">
                ${productsHTML}
            </div>
            <div class="col-date">
                ${formattedDate}
            </div>
            <div class="col-status">
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="col-actions">
                <button class="btn btn-primary btn-sm" onclick="openRequestDetail('${request.id}')">Ver Detalles</button>
            </div>
        `;
        
        container.appendChild(row);
    });
}

/* ==========================================================================
   CHECKBOX SELECTION & BULK ACTIONS
   ========================================================================== */

function handleCheckboxClick(checkboxEl, id, event) {
    event.stopPropagation();
    const row = checkboxEl.closest('.request-item-row');
    
    if (checkboxEl.checked) {
        if (!selectedIds.includes(id)) selectedIds.push(id);
        if (row) row.classList.add('row-selected');
    } else {
        selectedIds = selectedIds.filter(selectedId => selectedId !== id);
        if (row) row.classList.remove('row-selected');
        
        // Uncheck master select
        document.getElementById('master-select').checked = false;
    }
    updateBulkActionsBar();
}

function toggleSelectAll(masterCheckbox) {
    const listRows = document.querySelectorAll('.request-item-row');
    selectedIds = [];
    
    listRows.forEach(row => {
        const id = row.getAttribute('data-id');
        const checkbox = row.querySelector('.col-select input[type="checkbox"]');
        
        if (masterCheckbox.checked) {
            selectedIds.push(id);
            if (checkbox) checkbox.checked = true;
            row.classList.add('row-selected');
        } else {
            if (checkbox) checkbox.checked = false;
            row.classList.remove('row-selected');
        }
    });
    
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const bar = document.getElementById('bulk-actions-bar');
    const countEl = document.getElementById('bulk-selected-count');
    
    if (selectedIds.length > 0) {
        countEl.innerText = selectedIds.length;
        bar.style.display = 'flex';
    } else {
        bar.style.display = 'none';
    }
}

async function handleBulkStatus(newStatus) {
    if (!confirm(`¿Estás seguro de que deseas marcar ${selectedIds.length} solicitudes como ${newStatus}?`)) return;

    // File protocol mock
    if (window.location.protocol === 'file:') {
        selectedIds.forEach(id => {
            const idx = refundRequests.findIndex(r => r.id === id);
            if (idx !== -1) refundRequests[idx].status = newStatus;
        });
        addAuditLog(`Local: ${selectedIds.length} tickets marcados como ${newStatus}.`);
        selectedIds = [];
        updateBulkActionsBar();
        document.getElementById('master-select').checked = false;
        updateMetrics();
        updateProductDistribution();
        applyFilters();
        return;
    }

    let successCount = 0;
    for (const id of selectedIds) {
        try {
            const url = DATABASE_URL
                ? `${DATABASE_URL}?action=update&id=${encodeURIComponent(id)}&status=${encodeURIComponent(newStatus)}&password=${encodeURIComponent(adminPassword)}`
                : '/api/refunds';
                
            const response = await fetch(url, {
                method: DATABASE_URL ? 'GET' : 'PUT',
                headers: DATABASE_URL ? {} : {
                    'Content-Type': 'application/json',
                    'Authorization': adminPassword
                },
                body: DATABASE_URL ? null : JSON.stringify({ id, status: newStatus })
            });
            if (response.status === 200 || response.ok) successCount++;
        } catch (err) {
            console.error(`Error updating bulk status for ${id}:`, err);
        }
    }
    
    addAuditLog(`Acción masiva: ${successCount} tickets marcados como ${newStatus}.`);
    fetchRefundRequests();
}

async function handleBulkDelete() {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente estas ${selectedIds.length} solicitudes?`)) return;

    // File protocol mock
    if (window.location.protocol === 'file:') {
        refundRequests = refundRequests.filter(r => !selectedIds.includes(r.id));
        addAuditLog(`Local: ${selectedIds.length} registros eliminados.`);
        selectedIds = [];
        updateBulkActionsBar();
        document.getElementById('master-select').checked = false;
        updateMetrics();
        updateProductDistribution();
        applyFilters();
        return;
    }

    let successCount = 0;
    for (const id of selectedIds) {
        try {
            const url = DATABASE_URL
                ? `${DATABASE_URL}?action=delete&id=${encodeURIComponent(id)}&password=${encodeURIComponent(adminPassword)}`
                : `/api/refunds?id=${encodeURIComponent(id)}`;
                
            const response = await fetch(url, {
                method: DATABASE_URL ? 'GET' : 'DELETE',
                headers: DATABASE_URL ? {} : {
                    'Authorization': adminPassword
                }
            });
            if (response.status === 200 || response.ok) successCount++;
        } catch (err) {
            console.error(`Error deleting bulk item ${id}:`, err);
        }
    }
    
    addAuditLog(`Eliminación masiva: ${successCount} registros eliminados del sistema.`);
    fetchRefundRequests();
}

/* ==========================================================================
   PRODUCT DISTRIBUTION WIDGET
   ========================================================================== */

function updateProductDistribution() {
    const widget = document.getElementById('product-distribution-widget');
    widget.innerHTML = '';

    if (refundRequests.length === 0) {
        widget.innerHTML = '<div class="no-data" style="padding: 10px 0;">No hay datos estadísticos.</div>';
        return;
    }

    const prodCounts = {};
    let totalProdSelections = 0;

    refundRequests.forEach(req => {
        if (req.products) {
            req.products.forEach(p => {
                prodCounts[p.name] = (prodCounts[p.name] || 0) + 1;
                totalProdSelections++;
            });
        }
    });

    Object.keys(prodCounts).forEach(name => {
        const count = prodCounts[name];
        const percentage = Math.round((count / totalProdSelections) * 100);

        const distItem = document.createElement('div');
        distItem.className = 'prod-dist-item';
        distItem.innerHTML = `
            <div class="prod-dist-info">
                <span>${name}</span>
                <strong>${count} (${percentage}%)</strong>
            </div>
            <div class="prod-dist-bar-bg">
                <div class="prod-dist-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        widget.appendChild(distItem);
    });
}

/* ==========================================================================
   AUDIT LOG WIDGET
   ========================================================================== */

function addAuditLog(text) {
    auditLogs.unshift({
        text,
        time: new Date()
    });
    // Limit to latest 10 logs
    if (auditLogs.length > 10) auditLogs.pop();
    
    updateAuditLogWidget();
}

function updateAuditLogWidget() {
    const widget = document.getElementById('audit-log-widget');
    if (!widget) return;
    
    widget.innerHTML = '';
    
    auditLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'audit-log-item';
        
        // Style indicator depending on type of action
        if (log.text.includes('eliminado') || log.text.includes('Eliminación') || log.text.includes('eliminados')) {
            item.style.borderLeftColor = 'var(--danger)';
        } else if (log.text.includes('reembolsada') || log.text.includes('reembolsado') || log.text.includes('masiva') || log.text.includes('reembolso')) {
            item.style.borderLeftColor = 'var(--success)';
        } else if (log.text.includes('iniciada') || log.text.includes('activa') || log.text.includes('control')) {
            item.style.borderLeftColor = 'var(--primary)';
        }
        
        const timeDiff = Math.round((new Date() - log.time) / 1000);
        let timeString = 'Hace un momento';
        if (timeDiff >= 60) {
            timeString = `Hace ${Math.round(timeDiff / 60)} min`;
        } else if (timeDiff > 10) {
            timeString = `Hace ${timeDiff} seg`;
        }
        
        item.innerHTML = `
            ${log.text}
            <span class="audit-time">${timeString}</span>
        `;
        widget.appendChild(item);
    });
}

/* ==========================================================================
   DETAIL MODAL
   ========================================================================== */

function openRequestDetail(requestId) {
    const req = refundRequests.find(r => r.id === requestId);
    if (!req) return;
    
    document.getElementById('detail-ticket-id').innerText = req.id;
    
    let statusClass = 'pending';
    let statusText = 'Pendiente';
    if (req.status === 'refunded') {
        statusClass = 'refunded';
        statusText = 'Reembolsado';
    } else if (req.status === 'rejected') {
        statusClass = 'rejected';
        statusText = 'Rechazado';
    }
    
    const reqDate = new Date(req.date).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
    const productsHTML = req.products ? req.products.map(p => `<span class="admin-prod-tag" style="margin-right: 5px; margin-bottom: 5px; display: inline-block;">${p.name}</span>`).join('') : '';
    
    const bodyEl = document.getElementById('detail-modal-body');
    bodyEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 15px;">
            <div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Registrado el: ${reqDate}</span>
        </div>
        
        <div class="detail-section">
            <h4>Datos del Cliente</h4>
            <div class="detail-info-block detail-grid-info">
                <div class="detail-label-val">
                    <label>Nombre del Cliente</label>
                    <span style="font-weight:600; color:white;">${req.name}</span>
                </div>
                <div class="detail-label-val">
                    <label>Correo Electrónico de Compra</label>
                    <span>${req.email}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Productos Seleccionados</h4>
            <div class="detail-info-block">
                ${productsHTML}
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Comentarios y Reclamo</h4>
            <div class="detail-info-block">
                <div class="detail-reason-tag">${req.reasonText}</div>
                <div class="feedback-text-quote">"${req.feedback}"</div>
            </div>
            
            <div class="copy-btn-group">
                <button class="btn btn-secondary btn-sm" onclick="copyRefundDetailsText('${req.id}', this)">
                    Copiar Datos del Reclamo
                </button>
            </div>
        </div>
    `;
    
    const footerActions = document.getElementById('detail-status-actions');
    footerActions.innerHTML = '';
    
    if (req.status === 'pending') {
        footerActions.innerHTML = `
            <button class="btn btn-primary" onclick="changeRequestStatus('${req.id}', 'refunded')">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" class="icon-left">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Marcar Reembolsado
            </button>
            <button class="btn btn-secondary" style="border-color: rgba(239, 68, 68, 0.4); color: #fca5a5;" onclick="changeRequestStatus('${req.id}', 'rejected')">
                Rechazar Solicitud
            </button>
        `;
    } else {
        footerActions.innerHTML = `
            <button class="btn btn-secondary" onclick="changeRequestStatus('${req.id}', 'pending')">
                Volver a Pendiente
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteRequest('${req.id}')">
                Eliminar Registro
            </button>
        `;
    }
    
    document.getElementById('request-detail-modal').style.display = 'flex';
}

function closeRequestDetail() {
    document.getElementById('request-detail-modal').style.display = 'none';
}

/* ==========================================================================
   EXPORTS & CLIPBOARD UTILITIES
   ========================================================================== */

function copyToClipboard(text, btnElement, successMsg = '¡Copiado!') {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" class="icon-left">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            ${successMsg}
        `;
        btnElement.style.borderColor = 'var(--success)';
        btnElement.style.color = 'var(--success)';
        
        setTimeout(() => {
            btnElement.innerHTML = originalHTML;
            btnElement.style.borderColor = '';
            btnElement.style.color = '';
        }, 1800);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function copyRefundDetailsText(requestId, btnElement) {
    const req = refundRequests.find(r => r.id === requestId);
    if (!req) return;
    
    let textToCopy = `REEMBOLSO MANUAL SOLICITADO
Ticket: ${req.id}
Cliente: ${req.name}
Correo: ${req.email}
Productos: ${req.products ? req.products.map(p => p.name).join(', ') : ''}
Razón: ${req.reasonText}
Comentarios: "${req.feedback}"
Fecha de Registro: ${new Date(req.date).toLocaleDateString('es-ES')}`;
    
    copyToClipboard(textToCopy, btnElement, '¡Datos Copiados!');
}

function exportData(format = 'csv') {
    if (refundRequests.length === 0) {
        alert('No hay solicitudes para exportar.');
        return;
    }
    
    let mimeType = 'text/csv';
    let fileExtension = 'csv';
    let dataContent = '';
    
    if (format === 'csv') {
        dataContent = "\uFEFFID,Cliente,Correo,Productos,Motivo,Comentarios,Fecha,Estado\n";
        refundRequests.forEach(req => {
            const id = req.id;
            const name = `"${req.name.replace(/"/g, '""')}"`;
            const email = `"${req.email.replace(/"/g, '""')}"`;
            const productsList = `"${req.products ? req.products.map(p => p.name).join('; ').replace(/"/g, '""') : ''}"`;
            const reason = `"${req.reasonText.replace(/"/g, '""')}"`;
            const feedback = `"${req.feedback.replace(/"/g, '""')}"`;
            const date = req.date;
            const status = req.status;
            
            const row = [id, name, email, productsList, reason, feedback, date, status].join(",");
            dataContent += row + "\n";
        });
    } else if (format === 'json') {
        mimeType = 'application/json';
        fileExtension = 'json';
        dataContent = JSON.stringify(refundRequests, null, 2);
    }
    
    const blob = new Blob([dataContent], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `solicitudes_reembolso_${new Date().toISOString().slice(0,10)}.${fileExtension}`);
    document.body.appendChild(link); 
    
    link.click();
    document.body.removeChild(link);
    addAuditLog(`Exportado registro completo como ${format.toUpperCase()}.`);
}

function showInputError(inputEl, message) {
    inputEl.style.borderColor = 'var(--danger)';
    const parent = inputEl.parentNode;
    
    // Remove previous validation errors if any
    const prevError = parent.querySelector('.validation-error-text');
    if (prevError) prevError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error-text';
    errorDiv.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        ${message}
    `;
    parent.appendChild(errorDiv);
    
    inputEl.addEventListener('input', () => {
        inputEl.style.borderColor = '';
        errorDiv.remove();
    }, { once: true });
}
