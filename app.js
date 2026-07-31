/* ==========================================================================
   IA TRADER - CUSTOMER REFUND FORM LOGIC (CLIENT SIDE)
   ========================================================================== */

// Configure API base URL depending on platform hosting
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '' // Use local relative paths for localhost server testing
    : (window.location.hostname.includes('workers.dev') || window.location.hostname.includes('pages.dev')
        ? '' // Use relative paths for native Cloudflare hosting
        : 'https://reembolso-expert.grupogritt.workers.dev'); // Connect to Cloudflare Worker backend for Netlify hosting

// Global State
let currentStep = 1;
const totalSteps = 3;
let selectedProducts = [];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Set up initial view
    showStep(currentStep);
});

/* ==========================================================================
   FORM STEP WIZARD NAVIGATION
   ========================================================================== */

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step-${step}`).classList.add('active');
    
    // Update indicator nodes
    document.querySelectorAll('.step-node').forEach(node => {
        const nodeStep = parseInt(node.getAttribute('data-step'));
        node.classList.remove('active', 'completed');
        if (nodeStep === step) {
            node.classList.add('active');
        } else if (nodeStep < step) {
            node.classList.add('completed');
        }
    });
    
    // Update progress bar width
    const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;
    document.getElementById('step-progress-bar').style.width = `${progressPercent}%`;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (step === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-flex';
    }
    
    if (step === totalSteps) {
        nextBtn.innerHTML = `Enviar Solicitud 
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" class="icon-right">
                <path d="M22 2L11 13"></path>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>`;
    } else {
        nextBtn.innerHTML = `Siguiente 
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" class="icon-right">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>`;
    }
}

function navigateSteps(direction) {
    if (direction === 1) {
        // Validate before moving to next step
        if (!validateStep(currentStep)) {
            return;
        }
        
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            window.scrollTo({ top: 100, behavior: 'smooth' });
        } else {
            // Submit form
            submitRefundForm();
        }
    } else {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    }
}

/* ==========================================================================
   FORM VALIDATION
   ========================================================================== */

function validateStep(step) {
    removeValidationErrors();
    let isValid = true;
    
    if (step === 1) {
        const name = document.getElementById('client-name');
        const email = document.getElementById('client-email');
        
        if (!name.value.trim()) {
            showInputError(name, 'El nombre completo es requerido.');
            isValid = false;
        }
        
        if (!email.value.trim()) {
            showInputError(email, 'El correo electrónico es requerido.');
            isValid = false;
        } else if (!validateEmail(email.value.trim())) {
            showInputError(email, 'Ingresa un correo electrónico válido.');
            isValid = false;
        }
    }
    
    else if (step === 2) {
        if (selectedProducts.length === 0) {
            document.getElementById('product-error').style.display = 'block';
            isValid = false;
        }
    }
    
    else if (step === 3) {
        const reason = document.getElementById('refund-reason');
        const feedback = document.getElementById('client-feedback');
        const terms = document.getElementById('terms-agree');
        
        if (!reason.value) {
            showInputError(reason, 'Selecciona la razón de devolución.');
            isValid = false;
        }
        
        if (!feedback.value.trim()) {
            showInputError(feedback, 'Tus comentarios o reclamo son requeridos.');
            isValid = false;
        } else if (feedback.value.trim().length < 20) {
            showInputError(feedback, 'Por favor, describe tu reclamación con más detalles (mínimo 20 caracteres).');
            isValid = false;
        }
        
        if (!terms.checked) {
            showCheckboxError(terms, 'Debes aceptar los términos para continuar.');
            isValid = false;
        }
    }
    
    return isValid;
}

function showInputError(inputEl, message) {
    inputEl.style.borderColor = 'var(--danger)';
    
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
    inputEl.parentNode.appendChild(errorDiv);
}

function showCheckboxError(checkboxEl, message) {
    const parent = checkboxEl.parentNode;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error-text';
    errorDiv.style.marginLeft = '30px';
    errorDiv.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        ${message}
    `;
    parent.parentNode.insertBefore(errorDiv, parent.nextSibling);
}

function removeValidationErrors() {
    document.querySelectorAll('.validation-error-text').forEach(el => {
        if (el.id !== 'product-error') el.remove();
    });
    document.getElementById('product-error').style.display = 'none';
    
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.style.borderColor = '';
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/* ==========================================================================
   PRODUCT SELECTION LOGIC
   ========================================================================== */

function toggleProduct(cardEl) {
    const productId = cardEl.getAttribute('data-product-id');
    const productName = cardEl.querySelector('.product-name').innerText;
    
    cardEl.classList.toggle('selected');
    
    if (cardEl.classList.contains('selected')) {
        selectedProducts.push({ id: productId, name: productName });
    } else {
        selectedProducts = selectedProducts.filter(prod => prod.id !== productId);
    }
}

/* ==========================================================================
   FORM SUBMISSION (POST TO CLOUDFLARE BACKEND API)
   ========================================================================== */

async function submitRefundForm() {
    const name = document.getElementById('client-name').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const reasonSelect = document.getElementById('refund-reason');
    const reason = reasonSelect.value;
    const reasonText = reasonSelect.options[reasonSelect.selectedIndex].text;
    const feedback = document.getElementById('client-feedback').value.trim();
    
    // Create random ticket ID
    const ticketId = `#REF-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Formulate request object
    const newRequest = {
        id: ticketId,
        name,
        email,
        products: selectedProducts,
        reason,
        reasonText,
        feedback,
        date: new Date().toISOString(),
        status: 'pending'
    };

    // Change button state to loading
    const nextBtn = document.getElementById('next-btn');
    const originalText = nextBtn.innerHTML;
    nextBtn.disabled = true;
    nextBtn.innerHTML = 'Enviando...';

    // Helper to render the success screen
    const showSuccessScreen = () => {
        document.getElementById('receipt-id').innerText = ticketId;
        document.getElementById('receipt-name').innerText = name;
        document.getElementById('receipt-email').innerText = email;
        document.getElementById('receipt-products').innerText = selectedProducts.map(p => p.name).join(', ');
        
        const telegramMsg = `SOLICITUD DE REEMBOLSO MANUAL
----------------------------------------
Ticket ID: ${ticketId}
Cliente: ${name}
Correo: ${email}
Productos: ${selectedProducts.map(p => p.name).join(', ')}
Motivo: ${reasonText}
Comentarios: "${feedback}"`;
        
        document.getElementById('telegram-message-box').value = telegramMsg;
        document.getElementById('client-section').style.display = 'none';
        document.getElementById('success-section').style.display = 'block';
        window.scrollTo({ top: 50, behavior: 'smooth' });
    };

    // If running offline/locally via file:// protocol, simulate success for testing
    if (window.location.protocol === 'file:') {
        console.log('Local environment detected (file://). Simulating API response...');
        setTimeout(() => {
            showSuccessScreen();
            nextBtn.disabled = false;
            nextBtn.innerHTML = originalText;
        }, 800);
        return;
    }
    
    try {
        // Send request POST to server API (Cloudflare Pages/Worker backend)
        const response = await fetch(`${API_BASE}/api/refunds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newRequest)
        });

        if (response.status === 200 || response.ok) {
            showSuccessScreen();
        } else {
            let errorMsg = 'Hubo un problema al enviar la solicitud al servidor. Inténtalo más tarde.';
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMsg += `\n\nDetalles: ${errorData.error}`;
                }
            } catch (e) {}
            alert(errorMsg);
        }
    } catch (err) {
        console.error('Error submitting form:', err);
        alert('Error de conexão. Inténtalo más tarde.');
    } finally {
        nextBtn.disabled = false;
        nextBtn.innerHTML = originalText;
    }
}

function redirectToTelegram() {
    const messageText = document.getElementById('telegram-message-box').value;
    
    // Copy to clipboard as a backup
    try {
        navigator.clipboard.writeText(messageText);
    } catch (e) {
        console.error('Backup copy failed:', e);
    }

    // Generate Telegram share link with pre-filled message text
    const shareUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(messageText)}`;
    
    // Open Telegram share dialog
    window.open(shareUrl, '_blank');
}

function resetForm() {
    // Clear inputs
    document.getElementById('client-name').value = '';
    document.getElementById('client-email').value = '';
    document.getElementById('refund-reason').value = '';
    document.getElementById('client-feedback').value = '';
    document.getElementById('terms-agree').checked = false;
    
    // Reset products
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    selectedProducts = [];
    
    // Reset steps
    currentStep = 1;
    showStep(currentStep);
    
    // Toggle screens
    document.getElementById('success-section').style.display = 'none';
    document.getElementById('client-section').style.display = 'block';
}
