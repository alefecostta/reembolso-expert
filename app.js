/* ==========================================================================
   IA TRADER - CUSTOMER REFUND FORM LOGIC (CLIENT SIDE)
   ========================================================================== */

// CONFIGURATION: Paste your Google Web App URL here to save data to Google Sheets
// If left empty, it will default to relative local server paths (/api/refunds)
const DATABASE_URL = "https://script.google.com/macros/s/AKfycbwEYfoHSL0-_HIzNm8jHZIy3H3fWdmm0QjiTQc_irtzoWoo9-LmsBmRGWlqtQhv9c05/exec"; 

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
    
    // Smooth scroll to top of wizard
    const container = document.querySelector('.card-glass');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function nextStep() {
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        } else {
            submitRefundForm();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

/* ==========================================================================
   STEP VALIDATION RULES
   ========================================================================== */

function validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
        // Step 1: Must select at least one product
        const errorEl = document.getElementById('product-selection-error');
        if (selectedProducts.length === 0) {
            errorEl.style.display = 'block';
            isValid = false;
        } else {
            errorEl.style.display = 'none';
        }
    } 
    else if (step === 2) {
        // Step 2: Customer Personal Details
        const nameInput = document.getElementById('client-name');
        const emailInput = document.getElementById('client-email');
        
        // Name Validation
        if (!nameInput.value.trim()) {
            showInputError(nameInput, 'El nombre completo es requerido.');
            isValid = false;
        } else {
            clearInputError(nameInput);
        }
        
        // Email Validation
        const emailVal = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal) {
            showInputError(emailInput, 'El correo electrónico es requerido.');
            isValid = false;
        } else if (!emailRegex.test(emailVal)) {
            showInputError(emailInput, 'Por favor, ingresa un correo electrónico válido.');
            isValid = false;
        } else {
            clearInputError(emailInput);
        }
    } 
    else if (step === 3) {
        // Step 3: Refund Reason
        const reasonSelect = document.getElementById('refund-reason');
        const feedbackInput = document.getElementById('client-feedback');
        const termsCheck = document.getElementById('terms-agree');
        
        if (!reasonSelect.value) {
            showInputError(reasonSelect, 'Por favor, selecciona el motivo de la devolución.');
            isValid = false;
        } else {
            clearInputError(reasonSelect);
        }
        
        if (!feedbackInput.value.trim()) {
            showInputError(feedbackInput, 'Por favor, escribe un breve detalle sobre tu motivo.');
            isValid = false;
        } else {
            clearInputError(feedbackInput);
        }
        
        if (!termsCheck.checked) {
            const termsLabel = termsCheck.closest('.checkbox-container');
            showInputError(termsCheck, 'Debes aceptar los términos de procesamiento para continuar.');
            isValid = false;
        } else {
            clearInputError(termsCheck);
        }
    }
    
    return isValid;
}

/* ==========================================================================
   PRODUCT SELECTION HANDLERS
   ========================================================================== */

function toggleProduct(productId, productName, imgPath) {
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    const index = selectedProducts.findIndex(p => p.id === productId);
    
    if (index === -1) {
        // Add to selections
        selectedProducts.push({ id: productId, name: productName, image: imgPath });
        card.classList.add('selected');
    } else {
        // Remove from selections
        selectedProducts.splice(index, 1);
        card.classList.remove('selected');
    }
    
    // Clear validation error if any
    const errorEl = document.getElementById('product-selection-error');
    if (selectedProducts.length > 0) {
        errorEl.style.display = 'none';
    }
    
    updateSummaryList();
}

function updateSummaryList() {
    const listContainer = document.getElementById('selected-summary-list');
    listContainer.innerHTML = '';
    
    if (selectedProducts.length === 0) {
        listContainer.innerHTML = '<li class="no-products-summary">Ningún producto seleccionado</li>';
        return;
    }
    
    selectedProducts.forEach(prod => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${prod.image}" alt="${prod.name}" style="width: 30px; height: 18px; border-radius: 3px; object-fit: cover;">
                <span>${prod.name}</span>
            </div>
            <button type="button" class="remove-summary-item-btn" onclick="toggleProduct('${prod.id}', '${prod.name}', '${prod.image}')">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        listContainer.appendChild(li);
    });
}

/* ==========================================================================
   API SUBMISSION AND REDIRECTS
   ========================================================================== */

async function submitRefundForm() {
    const nextBtn = document.getElementById('next-btn');
    const name = document.getElementById('client-name').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const reasonSelect = document.getElementById('refund-reason');
    const reasonText = reasonSelect.options[reasonSelect.selectedIndex].text;
    const feedback = document.getElementById('client-feedback').value.trim();
    
    const ticketId = '#REF-' + Math.floor(1000 + Math.random() * 9000);
    
    const newRequest = {
        id: ticketId,
        name: name,
        email: email,
        products: selectedProducts.map(p => ({ id: p.id, name: p.name })),
        reason: reasonSelect.value,
        reasonText: reasonText,
        feedback: feedback,
        date: new Date().toISOString(),
        status: 'pending'
    };

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
        // Send request to Google Sheets or relative local server API
        const url = DATABASE_URL || '/api/refunds';
        
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(newRequest)
        });

        // If using Google Sheets, it returns 200 on success. If local server, 200 is also correct.
        if (response.status === 200 || response.ok) {
            showSuccessScreen();
        } else {
            alert('Hubo un problema al enviar la solicitud al servidor. Inténtalo más tarde.');
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
    
    // Reset products list
    selectedProducts = [];
    document.querySelectorAll('.product-card').forEach(c => {
        c.classList.remove('selected');
    });
    updateSummaryList();
    
    // Reset step
    currentStep = 1;
    showStep(currentStep);
    
    // Toggle screens
    document.getElementById('client-section').style.display = 'block';
    document.getElementById('success-section').style.display = 'none';
}

/* ==========================================================================
   INPUT VALIDATION VISUAL FEEDBACK HELPERS
   ========================================================================== */

function showInputError(inputEl, message) {
    inputEl.style.borderColor = 'var(--danger)';
    const parent = inputEl.parentNode;
    
    // Check if error message is already present
    let errorDiv = parent.querySelector('.validation-error-text');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error-text';
        parent.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        ${message}
    `;
    errorDiv.style.display = 'flex';
}

function clearInputError(inputEl) {
    inputEl.style.borderColor = '';
    const parent = inputEl.parentNode;
    const errorDiv = parent.querySelector('.validation-error-text');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}
