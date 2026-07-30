/* ==========================================================================
   IA TRADER - ADMINISTRATIVE DASHBOARD LOGIC (CLOUDFLARE SERVERLESS INTERACTION)
   ========================================================================== */

let adminPassword = '';
let refundRequests = [];
let currentFilter = 'all';

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

    try {
        // Verify password by attempting to fetch data
        const response = await fetch('/api/refunds', {
            method: 'GET',
            headers: {
                'Authorization': password
            }
        });

        if (response.status === 200) {
            adminPassword = password;
            sessionStorage.setItem('admin_password', password);
            showDashboard();
            passwordInput.value = '';
        } else {
            errorEl.style.display = 'block';
            passwordInput.select();
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
    showLogin();
}

/* ==========================================================================
   API DATA INTERACTION
   ========================================================================== */

async function fetchRefundRequests() {
    const listContainer = document.getElementById('requests-list');
    listContainer.innerHTML = '<div class="no-data">Cargando solicitudes desde el servidor Cloudflare...</div>';

    try {
        const response = await fetch('/api/refunds', {
            method: 'GET',
            headers: {
                'Authorization': adminPassword
            }
        });

        if (response.status === 200) {
            refundRequests = await response.json();
            updateMetrics();
            applyFilters();
        } else if (response.status === 401) {
            alert('Sesión expirada o no autorizada. Por favor inicia sesión de nuevo.');
            logoutAdmin();
        } else {
            alert('Error al obtener datos del servidor.');
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        listContainer.innerHTML = '<div class="no-data">Error al cargar datos. Asegúrate de configurar la base de datos KV en Cloudflare.</div>';
    }
}

async function changeRequestStatus(requestId, newStatus) {
    try {
        const response = await fetch('/api/refunds', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': adminPassword
            },
            body: JSON.stringify({
                id: requestId,
                status: newStatus
            })
        });

        if (response.status === 200) {
            closeRequestDetail();
            fetchRefundRequests();
        } else {
            alert('Error al cambiar el estado del reembolso.');
        }
    } catch (err) {
        console.error('Error changing status:', err);
        alert('Error de conexión.');
    }
}

async function deleteRequest(requestId) {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta solicitud?')) return;

    try {
        const response = await fetch(`/api/refunds?id=${encodeURIComponent(requestId)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': adminPassword
            }
        });

        if (response.status === 200) {
            closeRequestDetail();
            fetchRefundRequests();
        } else {
            alert('Error al eliminar el registro.');
        }
    } catch (err) {
        console.error('Error deleting:', err);
        alert('Error de conexión.');
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
            r.products.some(p => p.name.toLowerCase().includes(searchVal))
        );
    }
    
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-data">No se encontraron solicitudes.</div>';
        return;
    }
    
    filtered.forEach(request => {
        const row = document.createElement('div');
        row.className = 'request-item-row';
        row.onclick = (e) => {
            if (e.target.closest('.btn') || e.target.closest('.btn-sm')) return;
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
        const productsHTML = request.products.map(p => `<span class="admin-prod-tag">${p.name}</span>`).join(' ');
        
        row.innerHTML = `
            <div class="col-client">
                <span class="client-name-bold">${request.name}</span>
                <span class="client-contact-sub">${request.email}</span>
            </div>
            <div class="col-products">
                ${productsHTML}
            </div>
            <div class="col-reason">
                <span class="admin-prod-tag" style="background: rgba(255, 166, 0, 0.1); color: var(--accent); border-color: rgba(255, 166, 0, 0.2);">${request.reasonText}</span>
            </div>
            <div class="col-date">
                ${formattedDate}
            </div>
            <div class="col-status">
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="col-actions">
                <button class="btn btn-primary btn-sm" onclick="openRequestDetail('${request.id}')">Ver Detalle</button>
            </div>
        `;
        
        container.appendChild(row);
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
    const productsHTML = req.products.map(p => `<span class="admin-prod-tag" style="margin-right: 5px; margin-bottom: 5px; display: inline-block;">${p.name}</span>`).join('');
    
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
   CLIPBOARD UTILITIES & CSV EXPORT
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
Productos: ${req.products.map(p => p.name).join(', ')}
Razón: ${req.reasonText}
Comentarios: "${req.feedback}"
Fecha de Registro: ${new Date(req.date).toLocaleDateString('es-ES')}`;
    
    copyToClipboard(textToCopy, btnElement, '¡Datos Copiados!');
}

function exportData() {
    if (refundRequests.length === 0) {
        alert('No hay solicitudes para exportar.');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "ID,Cliente,Correo,Productos,Motivo,Comentarios,Fecha,Estado\n";
    
    refundRequests.forEach(req => {
        const id = req.id;
        const name = `"${req.name.replace(/"/g, '""')}"`;
        const email = `"${req.email.replace(/"/g, '""')}"`;
        const productsList = `"${req.products.map(p => p.name).join('; ').replace(/"/g, '""')}"`;
        const reason = `"${req.reasonText.replace(/"/g, '""')}"`;
        const feedback = `"${req.feedback.replace(/"/g, '""')}"`;
        const date = req.date;
        const status = req.status;
        
        const row = [id, name, email, productsList, reason, feedback, date, status].join(",");
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `solicitudes_reembolso_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); 
    
    link.click();
    document.body.removeChild(link);
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
