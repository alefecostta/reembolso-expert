/* ==========================================================================
   UNIFIED CLOUDFLARE WORKER - MANUAL REFUNDS (FRONTEND + BACKEND API)
   ========================================================================== */

const HTML_CLIENT = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IA TRADER | Solicitud de Reembolso</title>
    <!-- Google Fonts: Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="style.css">
<style>
/* ==========================================================================
   IA TRADER - SYSTEM STYLES (PREMIUM DARK & GLASSMORPHISM)
   ========================================================================== */

/* Variables & Base resets */
:root {
    --bg-main: #07090e;
    --bg-surface: #0e121a;
    --bg-glass: rgba(13, 18, 28, 0.65);
    --border-glass: rgba(255, 255, 255, 0.07);
    --border-glass-focus: rgba(255, 166, 0, 0.4);
    
    --primary: #ffa600;
    --primary-grad: linear-gradient(135deg, #ffa600 0%, #d47a00 100%);
    --accent: #ff7b00;
    --accent-grad: linear-gradient(135deg, #ff7b00 0%, #e06000 100%);
    --success: #10b981;
    --success-grad: linear-gradient(135deg, #10b981 0%, #059669 100%);
    --warning: #f59e0b;
    --danger: #ef4444;
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
    --text-dark: #1f2937;
    
    --font-family: 'Outfit', sans-serif;
    --shadow-premium: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-family);
    background-color: var(--bg-main);
    color: var(--text-main);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-x: hidden;
    position: relative;
    padding: 20px;
}

/* Background Glow Effects */
.bg-glow {
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    filter: blur(140px);
    opacity: 0.12;
    pointer-events: none;
    z-index: -1;
}

.bg-glow-1 {
    background: var(--primary);
    top: -200px;
    right: -100px;
}

.bg-glow-2 {
    background: var(--accent);
    bottom: -200px;
    left: -100px;
}

/* Scrollbar styles */
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: var(--bg-main);
}
::-webkit-scrollbar-thumb {
    background: #1f293d;
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #374151;
}

/* Layout Container */
.container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 40px);
}

/* Header styling */
.app-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 0 30px;
    text-align: center;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-text {
    display: flex;
    flex-direction: column;
}

.logo-title {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #fff 20%, var(--primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 20px rgba(255, 166, 0, 0.25);
}

/* Glassmorphism Card base */
.card-glass {
    background: var(--bg-glass);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-glass);
    border-radius: 24px;
    box-shadow: var(--shadow-premium);
    overflow: hidden;
    position: relative;
    margin-bottom: 30px;
    transition: var(--transition-smooth);
}

.card-header-accent {
    height: 5px;
    background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%);
    background-size: 200% 100%;
    animation: gradientShift 6s linear infinite;
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.success-accent {
    background: var(--success-grad) !important;
}

.admin-accent {
    background: var(--primary-grad) !important;
}

.card-body {
    padding: 40px;
}

/* Intro header inside form */
.form-intro {
    text-align: center;
    margin-bottom: 35px;
}

.form-intro h1 {
    font-size: 2.1rem;
    font-weight: 700;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #ffffff 40%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.form-intro p {
    color: var(--text-muted);
    font-size: 0.95rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.5;
}

/* Step Progress Indicator */
.step-indicator-container {
    position: relative;
    margin-bottom: 45px;
    padding: 0 10px;
}

.step-progress-line {
    position: absolute;
    top: 18px;
    left: 45px;
    right: 45px;
    height: 3px;
    background: rgba(255, 255, 255, 0.08);
    z-index: 1;
}

.step-progress-bar {
    height: 100%;
    background: var(--primary-grad);
    box-shadow: 0 0 10px var(--primary);
    width: 0%;
    transition: var(--transition-smooth);
}

.step-nodes {
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 2;
}

.step-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.step-number {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--bg-surface);
    border: 2px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-muted);
    transition: var(--transition-smooth);
    box-shadow: 0 0 0 4px var(--bg-main);
}

.step-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-smooth);
}

.step-node.active .step-number {
    border-color: var(--primary);
    color: var(--primary);
    box-shadow: 0 0 15px rgba(255, 166, 0, 0.3), 0 0 0 4px var(--bg-main);
    background: rgba(255, 166, 0, 0.05);
}

.step-node.active .step-label {
    color: var(--primary);
}

.step-node.completed .step-number {
    background: var(--primary-grad);
    border-color: transparent;
    color: var(--bg-main);
    box-shadow: 0 0 0 4px var(--bg-main);
}

.step-node.completed .step-label {
    color: var(--text-main);
}

/* Step Content display toggle */
.step-content {
    display: none;
    animation: fadeSlideIn 0.4s ease forwards;
}

.step-content.active {
    display: block;
}

@keyframes fadeSlideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.step-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: #ffffff;
}

.step-desc {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 25px;
}

/* Form Styling */
.form-group {
    margin-bottom: 22px;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.required {
    color: var(--danger);
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"],
select,
textarea {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    color: var(--text-main);
    font-family: var(--font-family);
    font-size: 0.95rem;
    outline: none;
    transition: var(--transition-smooth);
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="password"]:focus,
select:focus,
textarea:focus {
    border-color: var(--border-glass-focus);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 15px rgba(255, 166, 0, 0.15);
}

select option {
    background-color: var(--bg-surface);
    color: var(--text-main);
}

/* Form Helper Text */
.form-help {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 6px;
}

.validation-error-text {
    color: var(--danger);
    font-size: 0.8rem;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 5px;
}

/* Grid & Rows */
.form-row {
    display: flex;
    gap: 15px;
}

.col-6 {
    flex: 1;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 13px 25px;
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: 12px;
    cursor: pointer;
    border: none;
    outline: none;
    transition: var(--transition-smooth);
    gap: 8px;
}

.btn-primary {
    background: var(--primary-grad);
    color: var(--bg-main);
    box-shadow: 0 4px 20px rgba(255, 166, 0, 0.25);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(255, 166, 0, 0.35);
    filter: brightness(1.1);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-main);
    border: 1px solid var(--border-glass);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.15);
}

.btn-danger {
    background: var(--danger);
    color: white;
}

.btn-danger:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.btn-sm {
    padding: 8px 15px;
    font-size: 0.8rem;
    border-radius: 8px;
}

.btn-wide {
    width: 100%;
}

.icon-left {
    margin-right: 4px;
}

.icon-right {
    margin-left: 4px;
}

/* Form Controls bar */
.form-controls {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 35px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 25px;
}

/* Product Selection Cards */
.product-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
}

.product-card {
    display: flex;
    align-items: center;
    padding: 18px 22px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    cursor: pointer;
    position: relative;
    transition: var(--transition-smooth);
    user-select: none;
}

.product-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
}

.product-card.selected {
    background: rgba(255, 166, 0, 0.04);
    border-color: var(--primary);
    box-shadow: 0 0 15px rgba(255, 166, 0, 0.1);
}

.product-selection-indicator {
    position: absolute;
    right: 22px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: var(--transition-smooth);
}

.product-card.selected .product-selection-indicator {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--bg-main);
}

.product-image {
    width: 80px;
    height: 50px;
    border-radius: 6px;
    margin-right: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    object-fit: cover;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.product-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #ffffff;
}

.main-badge {
    background: rgba(255, 123, 0, 0.2);
    color: #ffaa5a;
    border: 1px solid rgba(255, 123, 0, 0.3);
}

.upsell-badge {
    background: rgba(255, 123, 0, 0.15);
    color: #a3d3ff;
    border: 1px solid rgba(255, 123, 0, 0.2);
}

/* Method Fields containers */
.method-fields {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    animation: fadeSlideIn 0.3s ease;
}

/* Checkbox alignment */
.form-checkbox-group {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 25px;
    cursor: pointer;
}

.form-checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
    accent-color: var(--primary);
}

.form-checkbox-group label {
    font-size: 0.88rem;
    color: var(--text-muted);
    line-height: 1.4;
    cursor: pointer;
    user-select: none;
}

/* SUCCESS PAGE COMPONENT */
.success-body {
    padding: 50px 40px;
}

.success-icon-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 25px;
}

.success-icon-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(16, 185, 129, 0.12);
    border-radius: 50%;
    filter: blur(8px);
    animation: pulseGlow 2s infinite ease-in-out;
}

@keyframes pulseGlow {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.15); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 0.5; }
}

.success-checkmark {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: block;
    stroke-width: 2.5;
    stroke: var(--success);
    stroke-miterlimit: 10;
    box-shadow: inset 0px 0px 0px var(--success);
    animation: fillCheckmark .4s ease-in-out .4s forwards, scaleCheckmark .3s ease-in-out .9s forwards;
}

.success-checkmark-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2.5;
    stroke-miterlimit: 10;
    stroke: var(--success);
    fill: none;
    animation: strokeCheckmark .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.success-checkmark-check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: strokeCheckmark .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
}

@keyframes strokeCheckmark {
    100% { stroke-dashoffset: 0; }
}

@keyframes fillCheckmark {
    100% { box-shadow: inset 0px 0px 0px 40px rgba(16, 185, 129, 0.05); }
}

@keyframes scaleCheckmark {
    0%, 100% { transform: none; }
    50% { transform: scale3d(1.1, 1.1, 1); }
}

.success-body h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: #ffffff;
}

.success-text {
    color: var(--text-muted);
    font-size: 0.95rem;
    max-width: 500px;
    margin: 0 auto 35px;
    line-height: 1.5;
}

.receipt-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    padding: 20px 25px;
    max-width: 420px;
    margin: 0 auto 35px;
    text-align: left;
}

.receipt-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.receipt-row:last-child {
    border-bottom: none;
}

.receipt-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted);
}

.receipt-value {
    font-size: 0.88rem;
    font-weight: 600;
    color: #ffffff;
}

.success-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.notice-info {
    font-size: 0.8rem;
    color: #ffaa5a;
    background: rgba(255, 123, 0, 0.08);
    border: 1px solid rgba(255, 123, 0, 0.15);
    padding: 10px 18px;
    border-radius: 8px;
    max-width: 450px;
}

.text-center {
    text-align: center;
}

/* ADMIN PANEL STYLING */
.admin-card {
    animation: fadeSlideIn 0.5s ease forwards;
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 20px;
    margin-bottom: 25px;
}

.admin-header h1 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 5px;
    color: #ffffff;
}

.admin-header p {
    color: var(--text-muted);
    font-size: 0.85rem;
}

.admin-top-actions {
    display: flex;
    gap: 10px;
}

.btn-label {
    margin: 0;
}

/* Admin Dashboard Stats Grid */
.admin-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 30px;
}

.stat-box {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.stat-title {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 1.6rem;
    font-weight: 800;
}

.text-success { color: var(--success); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }

/* Filters & Search */
.admin-filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
}

.search-wrap {
    position: relative;
    flex: 1;
    max-width: 350px;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
}

.search-wrap input {
    padding-left: 42px;
}

.filter-tabs {
    display: flex;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-glass);
    padding: 4px;
    border-radius: 10px;
    gap: 4px;
}

.filter-tab {
    background: transparent;
    border: none;
    padding: 8px 16px;
    color: var(--text-muted);
    font-family: var(--font-family);
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 7px;
    cursor: pointer;
    transition: var(--transition-smooth);
}

.filter-tab:hover {
    color: white;
}

.filter-tab.active {
    background: rgba(255, 255, 255, 0.06);
    color: var(--primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Requests container & rows */
.admin-requests-container {
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

.requests-header-row {
    display: flex;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--border-glass);
    padding: 14px 20px;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.requests-list {
    min-height: 200px;
}

.no-data {
    padding: 60px 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
}

.request-item-row {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 0.88rem;
    cursor: pointer;
    transition: var(--transition-smooth);
}

.request-item-row:last-child {
    border-bottom: none;
}

.request-item-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

/* Col layouts */
.col-client { flex: 2.2; display: flex; flex-direction: column; gap: 2px; }
.col-products { flex: 2; display: flex; flex-direction: column; gap: 3px; }
.col-method { flex: 2.2; display: flex; flex-direction: column; gap: 2px; }
.col-date { flex: 1.1; color: var(--text-muted); font-size: 0.8rem; }
.col-status { flex: 1.1; }
.col-actions { flex: 1.6; display: flex; justify-content: flex-end; gap: 8px; }

.client-name-bold {
    font-weight: 600;
    color: #ffffff;
}

.client-contact-sub {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.admin-prod-tag {
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    color: var(--text-main);
}

.method-type-badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--primary);
}

.key-truncated {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: monospace;
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Status Badges */
.status-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 30px;
    text-align: center;
    text-transform: uppercase;
}

.status-badge.pending {
    background: rgba(245, 158, 11, 0.15);
    color: var(--warning);
    border: 1px solid rgba(245, 158, 11, 0.25);
}

.status-badge.refunded {
    background: rgba(16, 185, 129, 0.15);
    color: var(--success);
    border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-badge.rejected {
    background: rgba(239, 68, 68, 0.15);
    color: var(--danger);
    border: 1px solid rgba(239, 68, 68, 0.25);
}

/* MODAL OVERLAYS */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(3, 5, 8, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-glass);
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    overflow: hidden;
    animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.modal-large {
    max-width: 680px;
}

@keyframes scaleUp {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
}

.modal-close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: var(--transition-smooth);
}

.modal-close:hover {
    color: white;
}

.modal-body {
    padding: 24px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    background: rgba(0, 0, 0, 0.15);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Detail Modal content styles */
.detail-section {
    margin-bottom: 20px;
}

.detail-section:last-child {
    margin-bottom: 0;
}

.detail-section h4 {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.detail-info-block {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    padding: 14px 18px;
}

.detail-grid-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.detail-label-val {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.detail-label-val label {
    font-size: 0.72rem;
    color: var(--text-muted);
}

.detail-label-val span {
    font-size: 0.9rem;
    font-weight: 500;
}

.detail-reason-tag {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255, 123, 0, 0.1);
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 8px;
}

.feedback-text-quote {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #e5e7eb;
    font-style: italic;
    border-left: 3px solid var(--primary);
    padding-left: 12px;
}

.detail-modal-status-actions {
    display: flex;
    gap: 10px;
    margin-right: auto; /* Push cancel buttons to the right */
}

/* Footer alignment */
.app-footer {
    margin-top: auto;
    padding: 30px 0 10px;
    text-align: center;
}

.app-footer p {
    font-size: 0.78rem;
    color: var(--text-muted);
}

/* Phone input layout helper */
.phone-input-wrapper {
    display: flex;
}

/* Copy quick buttons */
.copy-btn-group {
    display: flex;
    gap: 8px;
    margin-top: 10px;
}

/* RESPONSIVE MEDIA QUERIES */
@media (max-width: 768px) {
    body {
        padding: 10px;
    }
    
    .card-body {
        padding: 24px;
    }
    
    .form-row {
        flex-direction: column;
        gap: 0;
    }
    
    .admin-stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .admin-filter-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
    
    .search-wrap {
        max-width: none;
    }
    
    .requests-header-row {
        display: none; /* Hide header on mobile, stack rows */
    }
    
    .request-item-row {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        position: relative;
        padding-bottom: 20px;
    }
    
    .col-client, .col-products, .col-method, .col-date, .col-status, .col-actions {
        flex: auto;
        text-align: left;
    }
    
    .col-actions {
        justify-content: flex-start;
        margin-top: 5px;
    }
    
    .detail-grid-info {
        grid-template-columns: 1fr;
    }
    
    .modal-footer {
        flex-direction: column-reverse;
    }
    
    .detail-modal-status-actions {
        margin-right: 0;
        flex-direction: column;
        width: 100%;
        gap: 8px;
        margin-bottom: 10px;
    }
    
    .detail-modal-status-actions .btn {
        width: 100%;
    }
    
    .step-label {
        display: none; /* Hide step labels on small screens to fit nodes */
    }
}

</style>
</head>
<body>
    <!-- Background Glow Effects -->
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <div class="container">
        <!-- Header -->
        <header class="app-header">
            <div class="logo-container">
                <div class="logo-text">
                    <span class="logo-title">Soporte al Cliente</span>
                </div>
            </div>
            <!-- Acceso Soporte oculto para el cliente. Se ingresa mediante doble clic en el footer o #admin en URL -->
            <button id="admin-access-btn" class="btn btn-secondary btn-sm" style="display: none;" onclick="openAdminLogin()"></button>
        </header>

        <!-- Main Workspace (Forms / Admin) -->
        <main class="main-content">
            
            <!-- CLIENT FORM SECTION -->
            <section id="client-section" class="card-glass">
                <div class="card-header-accent"></div>
                
                <div class="card-body">
                    <div class="form-intro">
                        <h1>Solicitud de Reembolso Manual</h1>
                        <p>Lamentamos que decidas no continuar. Por favor, completa este formulario para procesar tu reembolso de forma manual y segura.</p>
                    </div>

                    <!-- Step Progress Indicator -->
                    <div class="step-indicator-container">
                        <div class="step-progress-line">
                            <div class="step-progress-bar" id="step-progress-bar" style="width: 0%;"></div>
                        </div>
                        <div class="step-nodes">
                            <div class="step-node active" data-step="1">
                                <span class="step-number">1</span>
                                <span class="step-label">Tus Datos</span>
                            </div>
                            <div class="step-node" data-step="2">
                                <span class="step-number">2</span>
                                <span class="step-label">Productos</span>
                            </div>
                            <div class="step-node" data-step="3">
                                <span class="step-number">3</span>
                                <span class="step-label">Motivo</span>
                            </div>
                        </div>
                    </div>

                    <!-- Step 1: Personal Info -->
                    <div class="step-content active" id="step-1">
                        <h2 class="step-title">1. Información de tu Cuenta</h2>
                        <p class="step-desc">Ingresa los datos con los cuales realizaste la compra.</p>
                        
                        <div class="form-group">
                            <label for="client-name">Nombre Completo <span class="required">*</span></label>
                            <input type="text" id="client-name" placeholder="Ej. Juan Pérez" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="client-email">Correo Electrónico de Compra <span class="required">*</span></label>
                            <input type="email" id="client-email" placeholder="juan@ejemplo.com" required>
                            <small class="form-help">Debe ser el mismo correo que utilizaste en la pasarela de pago.</small>
                        </div>
                    </div>

                    <!-- Step 2: Product Selection -->
                    <div class="step-content" id="step-2">
                        <h2 class="step-title">2. ¿Qué producto deseas reembolsar?</h2>
                        <p class="step-desc">Puedes seleccionar uno o más productos de los que compraste.</p>
                        
                        <div class="product-grid">
                            <!-- Product 1 -->
                            <div class="product-card" data-product-id="6587709" onclick="toggleProduct(this)">
                                <div class="product-selection-indicator">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <img src="https://raw.githubusercontent.com/alefecostta/reembolso-expert/main/assets/aipro.png" alt="AI PRO" class="product-image">
                                <div class="product-info">
                                    <h3 class="product-name">AI PRO - Empieza aquí</h3>
                                </div>
                            </div>

                            <!-- Product 2 -->
                            <div class="product-card" data-product-id="6587810" onclick="toggleProduct(this)">
                                <div class="product-selection-indicator">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <img src="https://raw.githubusercontent.com/alefecostta/reembolso-expert/main/assets/titan.png" alt="IA Titan" class="product-image">
                                <div class="product-info">
                                    <h3 class="product-name">IA TITAN</h3>
                                </div>
                            </div>

                            <!-- Product 3 -->
                            <div class="product-card" data-product-id="6587831" onclick="toggleProduct(this)">
                                <div class="product-selection-indicator">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <img src="https://raw.githubusercontent.com/alefecostta/reembolso-expert/main/assets/vip.png" alt="Grupo VIP de Alumnos" class="product-image">
                                <div class="product-info">
                                    <h3 class="product-name">Grupo VIP de Alumnos</h3>
                                </div>
                            </div>
                        </div>
                        <div id="product-error" class="validation-error-text" style="display: none;">Deberías elegir al menos un producto para solicitar reembolso.</div>
                    </div>

                    <!-- Step 3: Reason & Complaint -->
                    <div class="step-content" id="step-3">
                        <h2 class="step-title">3. ¿Por qué solicitas el reembolso?</h2>
                        <p class="step-desc">Tus comentarios nos ayudan a mejorar el producto.</p>
                        
                        <div class="form-group">
                            <label for="refund-reason">Razón Principal de Devolución <span class="required">*</span></label>
                            <select id="refund-reason">
                                <option value="" disabled selected>Selecciona una opción...</option>
                                <option value="no-cumplio">El producto no cumplió mis expectativas</option>
                                <option value="dificil-usar">Es muy difícil de usar o no entendí la IA</option>
                                <option value="falta-tiempo">No tengo tiempo para usarlo/aplicarlo</option>
                                <option value="problemas-economicos">Dificultad económica actual</option>
                                <option value="otro">Otra razón (Detallar abajo)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="client-feedback">Tu Reclamo o Comentarios <span class="required">*</span></label>
                            <textarea id="client-feedback" rows="4" placeholder="Cuéntanos más detalladamente qué sucedió y cómo podemos mejorar..." required></textarea>
                        </div>

                        <div class="form-checkbox-group">
                            <input type="checkbox" id="terms-agree" required>
                            <label for="terms-agree">
                                Confirmo que la información ingresada es correcta y entiendo que perderé acceso inmediato a los productos seleccionados una vez que se envíe esta solicitud.
                            </label>
                        </div>
                    </div>

                    <!-- Form Controls -->
                    <div class="form-controls">
                        <button type="button" id="prev-btn" class="btn btn-secondary" style="display: none;" onclick="navigateSteps(-1)">
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon-left">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Anterior
                        </button>
                        <button type="button" id="next-btn" class="btn btn-primary" onclick="navigateSteps(1)">
                            Siguiente
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon-right">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>

                </div>
            </section>

            <!-- SUCCESS VIEW -->
            <section id="success-section" class="card-glass" style="display: none;">
                <div class="card-header-accent success-accent"></div>
                <div class="card-body success-body text-center">
                    <div class="success-icon-wrap">
                        <div class="success-icon-bg"></div>
                        <svg class="success-checkmark" viewBox="0 0 52 52">
                            <circle class="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                            <path class="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                    </div>
                    <h1>¡Solicitud Recibida con Éxito!</h1>
                    <p class="success-text">Hemos registrado tu reclamo y los datos de devolución. Nuestro equipo revisará los detalles del producto de forma manual.</p>
                    
                    <div class="receipt-card">
                        <div class="receipt-row">
                            <span class="receipt-label">Ticket ID:</span>
                            <span class="receipt-value" id="receipt-id">#0000</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">Cliente:</span>
                            <span class="receipt-value" id="receipt-name">Juan Pérez</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">Correo Electrónico:</span>
                            <span class="receipt-value" id="receipt-email">juan@ejemplo.com</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">Productos Seleccionados:</span>
                            <span class="receipt-value" id="receipt-products">AI PRO</span>
                        </div>
                    </div>
                    
                    <div class="telegram-box" style="margin: 25px 0 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; text-align: left;">
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
                            👉 Para procesar tu reembolso más rápido, haz clic en el botón de abajo. Se **copiará automáticamente** tu mensaje de soporte y se abrirá el Telegram de <strong>@MartinRezende</strong> para que puedas pegarlo y enviarlo directamente.
                        </p>
                        <textarea id="telegram-message-box" readonly style="width: 100%; height: 110px; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; color: #fff; padding: 10px; font-family: monospace; font-size: 0.8rem; resize: none;"></textarea>
                    </div>
                    
                    <div class="success-actions">
                        <button type="button" class="btn btn-primary btn-wide" id="telegram-redirect-btn" onclick="redirectToTelegram()">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="icon-left" style="margin-right: 8px;">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.2-5.33 3.52-.5.35-.96.52-1.37.51-.45-.01-1.32-.26-1.97-.47-.8-.26-1.43-.4-1.38-.85.03-.24.35-.48.97-.73 3.8-1.65 6.33-2.73 7.6-3.26 3.62-1.5 4.37-1.76 4.86-1.77.11 0 .35.03.5.15.13.1.17.24.18.34 0 .07.01.22 0 .33z"/>
                            </svg>
                            Copiar Mensaje e Ir a Telegram
                        </button>
                        <button type="button" class="btn btn-secondary btn-wide" onclick="resetForm()" style="margin-top: 10px;">
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </section>
        </main>
        
        <!-- Footer -->
        <footer class="app-footer">
            <p>Todos los reembolsos se analizan en un plazo de hasta 48 horas hábiles. | @MartinRezende</p>
        </footer>
    </div>

    <!-- App JavaScript -->
    <script>
/* ==========================================================================
   IA TRADER - CUSTOMER REFUND FORM LOGIC (CLIENT SIDE)
   ========================================================================== */

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
    document.getElementById(\`step-\${step}\`).classList.add('active');
    
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
    document.getElementById('step-progress-bar').style.width = \`\${progressPercent}%\`;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (step === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-flex';
    }
    
    if (step === totalSteps) {
        nextBtn.innerHTML = \`Enviar Solicitud 
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" class="icon-right">
                <path d="M22 2L11 13"></path>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>\`;
    } else {
        nextBtn.innerHTML = \`Siguiente 
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" class="icon-right">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>\`;
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
    errorDiv.innerHTML = \`
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        \${message}
    \`;
    inputEl.parentNode.appendChild(errorDiv);
}

function showCheckboxError(checkboxEl, message) {
    const parent = checkboxEl.parentNode;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error-text';
    errorDiv.style.marginLeft = '30px';
    errorDiv.innerHTML = \`
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        \${message}
    \`;
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
    const ticketId = \`#REF-\${Math.floor(1000 + Math.random() * 9000)}\`;
    
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
    
    try {
        // Send request POST to server API
        const response = await fetch('/api/refunds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newRequest)
        });

        if (response.status === 200) {
            // Populate success screen details
            document.getElementById('receipt-id').innerText = ticketId;
            document.getElementById('receipt-name').innerText = name;
            document.getElementById('receipt-email').innerText = email;
            document.getElementById('receipt-products').innerText = selectedProducts.map(p => p.name).join(', ');
            
            // Populate Telegram message details
            const telegramMsg = \`Hola, solicito el reembolso de mi compra.
Ticket: \${ticketId}
Cliente: \${name}
Correo: \${email}
Productos: \${selectedProducts.map(p => p.name).join(', ')}
Motivo: \${reasonText}
Comentarios: "\${feedback}"\`;
            
            document.getElementById('telegram-message-box').value = telegramMsg;

            // Display Success screen
            document.getElementById('client-section').style.display = 'none';
            document.getElementById('success-section').style.display = 'block';
            window.scrollTo({ top: 50, behavior: 'smooth' });
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
    
    // Copy message to clipboard
    navigator.clipboard.writeText(messageText).then(() => {
        // Show success indicator on button
        const btn = document.getElementById('telegram-redirect-btn');
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = \`
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="icon-left" style="margin-right: 8px;">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            ¡Mensaje Copiado! Redirigiendo...
        \`;
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);

        // Open Telegram chat
        window.open('https://t.me/MartinRezende', '_blank');
    }).catch(err => {
        console.error('Error copying text:', err);
        // Fallback: open anyway if copy fails
        window.open('https://t.me/MartinRezende', '_blank');
    });
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

</script>
</body>
</html>
`;
const HTML_ADMIN = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soporte | Panel Administrativo</title>
    <!-- Google Fonts: Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Shared Stylesheet -->
    <link rel="stylesheet" href="style.css">
<style>
/* ==========================================================================
   IA TRADER - SYSTEM STYLES (PREMIUM DARK & GLASSMORPHISM)
   ========================================================================== */

/* Variables & Base resets */
:root {
    --bg-main: #07090e;
    --bg-surface: #0e121a;
    --bg-glass: rgba(13, 18, 28, 0.65);
    --border-glass: rgba(255, 255, 255, 0.07);
    --border-glass-focus: rgba(255, 166, 0, 0.4);
    
    --primary: #ffa600;
    --primary-grad: linear-gradient(135deg, #ffa600 0%, #d47a00 100%);
    --accent: #ff7b00;
    --accent-grad: linear-gradient(135deg, #ff7b00 0%, #e06000 100%);
    --success: #10b981;
    --success-grad: linear-gradient(135deg, #10b981 0%, #059669 100%);
    --warning: #f59e0b;
    --danger: #ef4444;
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
    --text-dark: #1f2937;
    
    --font-family: 'Outfit', sans-serif;
    --shadow-premium: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-family);
    background-color: var(--bg-main);
    color: var(--text-main);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-x: hidden;
    position: relative;
    padding: 20px;
}

/* Background Glow Effects */
.bg-glow {
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    filter: blur(140px);
    opacity: 0.12;
    pointer-events: none;
    z-index: -1;
}

.bg-glow-1 {
    background: var(--primary);
    top: -200px;
    right: -100px;
}

.bg-glow-2 {
    background: var(--accent);
    bottom: -200px;
    left: -100px;
}

/* Scrollbar styles */
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: var(--bg-main);
}
::-webkit-scrollbar-thumb {
    background: #1f293d;
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #374151;
}

/* Layout Container */
.container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 40px);
}

/* Header styling */
.app-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 0 30px;
    text-align: center;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-text {
    display: flex;
    flex-direction: column;
}

.logo-title {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #fff 20%, var(--primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 20px rgba(255, 166, 0, 0.25);
}

/* Glassmorphism Card base */
.card-glass {
    background: var(--bg-glass);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-glass);
    border-radius: 24px;
    box-shadow: var(--shadow-premium);
    overflow: hidden;
    position: relative;
    margin-bottom: 30px;
    transition: var(--transition-smooth);
}

.card-header-accent {
    height: 5px;
    background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%);
    background-size: 200% 100%;
    animation: gradientShift 6s linear infinite;
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.success-accent {
    background: var(--success-grad) !important;
}

.admin-accent {
    background: var(--primary-grad) !important;
}

.card-body {
    padding: 40px;
}

/* Intro header inside form */
.form-intro {
    text-align: center;
    margin-bottom: 35px;
}

.form-intro h1 {
    font-size: 2.1rem;
    font-weight: 700;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #ffffff 40%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.form-intro p {
    color: var(--text-muted);
    font-size: 0.95rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.5;
}

/* Step Progress Indicator */
.step-indicator-container {
    position: relative;
    margin-bottom: 45px;
    padding: 0 10px;
}

.step-progress-line {
    position: absolute;
    top: 18px;
    left: 45px;
    right: 45px;
    height: 3px;
    background: rgba(255, 255, 255, 0.08);
    z-index: 1;
}

.step-progress-bar {
    height: 100%;
    background: var(--primary-grad);
    box-shadow: 0 0 10px var(--primary);
    width: 0%;
    transition: var(--transition-smooth);
}

.step-nodes {
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 2;
}

.step-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.step-number {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--bg-surface);
    border: 2px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-muted);
    transition: var(--transition-smooth);
    box-shadow: 0 0 0 4px var(--bg-main);
}

.step-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-smooth);
}

.step-node.active .step-number {
    border-color: var(--primary);
    color: var(--primary);
    box-shadow: 0 0 15px rgba(255, 166, 0, 0.3), 0 0 0 4px var(--bg-main);
    background: rgba(255, 166, 0, 0.05);
}

.step-node.active .step-label {
    color: var(--primary);
}

.step-node.completed .step-number {
    background: var(--primary-grad);
    border-color: transparent;
    color: var(--bg-main);
    box-shadow: 0 0 0 4px var(--bg-main);
}

.step-node.completed .step-label {
    color: var(--text-main);
}

/* Step Content display toggle */
.step-content {
    display: none;
    animation: fadeSlideIn 0.4s ease forwards;
}

.step-content.active {
    display: block;
}

@keyframes fadeSlideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.step-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: #ffffff;
}

.step-desc {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 25px;
}

/* Form Styling */
.form-group {
    margin-bottom: 22px;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.required {
    color: var(--danger);
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"],
select,
textarea {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    color: var(--text-main);
    font-family: var(--font-family);
    font-size: 0.95rem;
    outline: none;
    transition: var(--transition-smooth);
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="password"]:focus,
select:focus,
textarea:focus {
    border-color: var(--border-glass-focus);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 15px rgba(255, 166, 0, 0.15);
}

select option {
    background-color: var(--bg-surface);
    color: var(--text-main);
}

/* Form Helper Text */
.form-help {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 6px;
}

.validation-error-text {
    color: var(--danger);
    font-size: 0.8rem;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 5px;
}

/* Grid & Rows */
.form-row {
    display: flex;
    gap: 15px;
}

.col-6 {
    flex: 1;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 13px 25px;
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: 12px;
    cursor: pointer;
    border: none;
    outline: none;
    transition: var(--transition-smooth);
    gap: 8px;
}

.btn-primary {
    background: var(--primary-grad);
    color: var(--bg-main);
    box-shadow: 0 4px 20px rgba(255, 166, 0, 0.25);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(255, 166, 0, 0.35);
    filter: brightness(1.1);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-main);
    border: 1px solid var(--border-glass);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.15);
}

.btn-danger {
    background: var(--danger);
    color: white;
}

.btn-danger:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.btn-sm {
    padding: 8px 15px;
    font-size: 0.8rem;
    border-radius: 8px;
}

.btn-wide {
    width: 100%;
}

.icon-left {
    margin-right: 4px;
}

.icon-right {
    margin-left: 4px;
}

/* Form Controls bar */
.form-controls {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 35px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 25px;
}

/* Product Selection Cards */
.product-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
}

.product-card {
    display: flex;
    align-items: center;
    padding: 18px 22px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    cursor: pointer;
    position: relative;
    transition: var(--transition-smooth);
    user-select: none;
}

.product-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
}

.product-card.selected {
    background: rgba(255, 166, 0, 0.04);
    border-color: var(--primary);
    box-shadow: 0 0 15px rgba(255, 166, 0, 0.1);
}

.product-selection-indicator {
    position: absolute;
    right: 22px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: var(--transition-smooth);
}

.product-card.selected .product-selection-indicator {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--bg-main);
}

.product-image {
    width: 80px;
    height: 50px;
    border-radius: 6px;
    margin-right: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    object-fit: cover;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.product-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #ffffff;
}

.main-badge {
    background: rgba(255, 123, 0, 0.2);
    color: #ffaa5a;
    border: 1px solid rgba(255, 123, 0, 0.3);
}

.upsell-badge {
    background: rgba(255, 123, 0, 0.15);
    color: #a3d3ff;
    border: 1px solid rgba(255, 123, 0, 0.2);
}

/* Method Fields containers */
.method-fields {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    animation: fadeSlideIn 0.3s ease;
}

/* Checkbox alignment */
.form-checkbox-group {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 25px;
    cursor: pointer;
}

.form-checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
    accent-color: var(--primary);
}

.form-checkbox-group label {
    font-size: 0.88rem;
    color: var(--text-muted);
    line-height: 1.4;
    cursor: pointer;
    user-select: none;
}

/* SUCCESS PAGE COMPONENT */
.success-body {
    padding: 50px 40px;
}

.success-icon-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 25px;
}

.success-icon-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(16, 185, 129, 0.12);
    border-radius: 50%;
    filter: blur(8px);
    animation: pulseGlow 2s infinite ease-in-out;
}

@keyframes pulseGlow {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.15); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 0.5; }
}

.success-checkmark {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: block;
    stroke-width: 2.5;
    stroke: var(--success);
    stroke-miterlimit: 10;
    box-shadow: inset 0px 0px 0px var(--success);
    animation: fillCheckmark .4s ease-in-out .4s forwards, scaleCheckmark .3s ease-in-out .9s forwards;
}

.success-checkmark-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2.5;
    stroke-miterlimit: 10;
    stroke: var(--success);
    fill: none;
    animation: strokeCheckmark .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.success-checkmark-check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: strokeCheckmark .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
}

@keyframes strokeCheckmark {
    100% { stroke-dashoffset: 0; }
}

@keyframes fillCheckmark {
    100% { box-shadow: inset 0px 0px 0px 40px rgba(16, 185, 129, 0.05); }
}

@keyframes scaleCheckmark {
    0%, 100% { transform: none; }
    50% { transform: scale3d(1.1, 1.1, 1); }
}

.success-body h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: #ffffff;
}

.success-text {
    color: var(--text-muted);
    font-size: 0.95rem;
    max-width: 500px;
    margin: 0 auto 35px;
    line-height: 1.5;
}

.receipt-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    padding: 20px 25px;
    max-width: 420px;
    margin: 0 auto 35px;
    text-align: left;
}

.receipt-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.receipt-row:last-child {
    border-bottom: none;
}

.receipt-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted);
}

.receipt-value {
    font-size: 0.88rem;
    font-weight: 600;
    color: #ffffff;
}

.success-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.notice-info {
    font-size: 0.8rem;
    color: #ffaa5a;
    background: rgba(255, 123, 0, 0.08);
    border: 1px solid rgba(255, 123, 0, 0.15);
    padding: 10px 18px;
    border-radius: 8px;
    max-width: 450px;
}

.text-center {
    text-align: center;
}

/* ADMIN PANEL STYLING */
.admin-card {
    animation: fadeSlideIn 0.5s ease forwards;
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 20px;
    margin-bottom: 25px;
}

.admin-header h1 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 5px;
    color: #ffffff;
}

.admin-header p {
    color: var(--text-muted);
    font-size: 0.85rem;
}

.admin-top-actions {
    display: flex;
    gap: 10px;
}

.btn-label {
    margin: 0;
}

/* Admin Dashboard Stats Grid */
.admin-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 30px;
}

.stat-box {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.stat-title {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 1.6rem;
    font-weight: 800;
}

.text-success { color: var(--success); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }

/* Filters & Search */
.admin-filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
}

.search-wrap {
    position: relative;
    flex: 1;
    max-width: 350px;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
}

.search-wrap input {
    padding-left: 42px;
}

.filter-tabs {
    display: flex;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-glass);
    padding: 4px;
    border-radius: 10px;
    gap: 4px;
}

.filter-tab {
    background: transparent;
    border: none;
    padding: 8px 16px;
    color: var(--text-muted);
    font-family: var(--font-family);
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 7px;
    cursor: pointer;
    transition: var(--transition-smooth);
}

.filter-tab:hover {
    color: white;
}

.filter-tab.active {
    background: rgba(255, 255, 255, 0.06);
    color: var(--primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Requests container & rows */
.admin-requests-container {
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

.requests-header-row {
    display: flex;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--border-glass);
    padding: 14px 20px;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.requests-list {
    min-height: 200px;
}

.no-data {
    padding: 60px 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
}

.request-item-row {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 0.88rem;
    cursor: pointer;
    transition: var(--transition-smooth);
}

.request-item-row:last-child {
    border-bottom: none;
}

.request-item-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

/* Col layouts */
.col-client { flex: 2.2; display: flex; flex-direction: column; gap: 2px; }
.col-products { flex: 2; display: flex; flex-direction: column; gap: 3px; }
.col-method { flex: 2.2; display: flex; flex-direction: column; gap: 2px; }
.col-date { flex: 1.1; color: var(--text-muted); font-size: 0.8rem; }
.col-status { flex: 1.1; }
.col-actions { flex: 1.6; display: flex; justify-content: flex-end; gap: 8px; }

.client-name-bold {
    font-weight: 600;
    color: #ffffff;
}

.client-contact-sub {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.admin-prod-tag {
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    color: var(--text-main);
}

.method-type-badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--primary);
}

.key-truncated {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: monospace;
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Status Badges */
.status-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 30px;
    text-align: center;
    text-transform: uppercase;
}

.status-badge.pending {
    background: rgba(245, 158, 11, 0.15);
    color: var(--warning);
    border: 1px solid rgba(245, 158, 11, 0.25);
}

.status-badge.refunded {
    background: rgba(16, 185, 129, 0.15);
    color: var(--success);
    border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-badge.rejected {
    background: rgba(239, 68, 68, 0.15);
    color: var(--danger);
    border: 1px solid rgba(239, 68, 68, 0.25);
}

/* MODAL OVERLAYS */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(3, 5, 8, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-glass);
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    overflow: hidden;
    animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.modal-large {
    max-width: 680px;
}

@keyframes scaleUp {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
}

.modal-close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: var(--transition-smooth);
}

.modal-close:hover {
    color: white;
}

.modal-body {
    padding: 24px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    background: rgba(0, 0, 0, 0.15);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Detail Modal content styles */
.detail-section {
    margin-bottom: 20px;
}

.detail-section:last-child {
    margin-bottom: 0;
}

.detail-section h4 {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.detail-info-block {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    padding: 14px 18px;
}

.detail-grid-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.detail-label-val {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.detail-label-val label {
    font-size: 0.72rem;
    color: var(--text-muted);
}

.detail-label-val span {
    font-size: 0.9rem;
    font-weight: 500;
}

.detail-reason-tag {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255, 123, 0, 0.1);
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 8px;
}

.feedback-text-quote {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #e5e7eb;
    font-style: italic;
    border-left: 3px solid var(--primary);
    padding-left: 12px;
}

.detail-modal-status-actions {
    display: flex;
    gap: 10px;
    margin-right: auto; /* Push cancel buttons to the right */
}

/* Footer alignment */
.app-footer {
    margin-top: auto;
    padding: 30px 0 10px;
    text-align: center;
}

.app-footer p {
    font-size: 0.78rem;
    color: var(--text-muted);
}

/* Phone input layout helper */
.phone-input-wrapper {
    display: flex;
}

/* Copy quick buttons */
.copy-btn-group {
    display: flex;
    gap: 8px;
    margin-top: 10px;
}

/* RESPONSIVE MEDIA QUERIES */
@media (max-width: 768px) {
    body {
        padding: 10px;
    }
    
    .card-body {
        padding: 24px;
    }
    
    .form-row {
        flex-direction: column;
        gap: 0;
    }
    
    .admin-stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .admin-filter-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
    
    .search-wrap {
        max-width: none;
    }
    
    .requests-header-row {
        display: none; /* Hide header on mobile, stack rows */
    }
    
    .request-item-row {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        position: relative;
        padding-bottom: 20px;
    }
    
    .col-client, .col-products, .col-method, .col-date, .col-status, .col-actions {
        flex: auto;
        text-align: left;
    }
    
    .col-actions {
        justify-content: flex-start;
        margin-top: 5px;
    }
    
    .detail-grid-info {
        grid-template-columns: 1fr;
    }
    
    .modal-footer {
        flex-direction: column-reverse;
    }
    
    .detail-modal-status-actions {
        margin-right: 0;
        flex-direction: column;
        width: 100%;
        gap: 8px;
        margin-bottom: 10px;
    }
    
    .detail-modal-status-actions .btn {
        width: 100%;
    }
    
    .step-label {
        display: none; /* Hide step labels on small screens to fit nodes */
    }
}

</style>
</head>
<body>
    <!-- Background Glow Effects -->
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <div class="container">
        <!-- Header -->
        <header class="app-header">
            <div class="logo-container">
                <div class="logo-text">
                    <span class="logo-title">Panel Administrativo</span>
                </div>
            </div>
            <button id="logout-btn" class="btn btn-secondary btn-sm" style="display: none;" onclick="logoutAdmin()">
                Cerrar Sesión
            </button>
        </header>

        <!-- Main Workspace -->
        <main class="main-content">
            
            <!-- ADMIN LOGIN CARD -->
            <section id="login-section" class="card-glass" style="max-width: 480px; margin: 50px auto;">
                <div class="card-header-accent admin-accent"></div>
                <div class="card-body">
                    <div class="form-intro">
                        <h2>Acceso Soporte</h2>
                        <p>Ingresa la contraseña para gestionar las solicitudes de reembolso.</p>
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label for="admin-password">Contraseña <span class="required">*</span></label>
                        <input type="password" id="admin-password" placeholder="Contraseña de soporte" onkeydown="if(event.key === 'Enter') loginAdmin()">
                        <small id="login-error" class="validation-error-text" style="display: none;">Contraseña incorrecta. Inténtalo de nuevo.</small>
                    </div>

                    <button class="btn btn-primary btn-wide" onclick="loginAdmin()">Ingresar</button>
                </div>
            </section>

            <!-- ADMIN DASHBOARD SECTION -->
            <section id="admin-section" class="card-glass admin-card" style="display: none;">
                <div class="card-header-accent admin-accent"></div>
                <div class="card-body">
                    <div class="admin-header">
                        <div>
                            <h1>Solicitudes de Reembolso</h1>
                            <p>Gestiona solicitudes pendientes, marca como procesado y exporta registros en tiempo real.</p>
                        </div>
                        <div class="admin-top-actions">
                            <button class="btn btn-secondary btn-sm" onclick="exportData()">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" class="icon-left">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Exportar (CSV)
                            </button>
                        </div>
                    </div>

                    <!-- Statistics Widgets -->
                    <div class="admin-stats-grid">
                        <div class="stat-box">
                            <span class="stat-title">Pendientes</span>
                            <span class="stat-value text-warning" id="stat-pending">0</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-title">Reembolsados</span>
                            <span class="stat-value text-success" id="stat-refunded">0</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-title">Rechazados</span>
                            <span class="stat-value text-danger" id="stat-rejected">0</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-title">Total Recibido</span>
                            <span class="stat-value" id="stat-total">0</span>
                        </div>
                    </div>

                    <!-- Filters & Search -->
                    <div class="admin-filter-bar">
                        <div class="search-wrap">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" class="search-icon">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input type="text" id="admin-search" placeholder="Buscar por nombre, correo o ID..." oninput="applyFilters()">
                        </div>
                        
                        <div class="filter-tabs">
                            <button class="filter-tab active" data-filter="all" onclick="setFilter('all')">Todos</button>
                            <button class="filter-tab" data-filter="pending" onclick="setFilter('pending')">Pendientes</button>
                            <button class="filter-tab" data-filter="refunded" onclick="setFilter('refunded')">Reembolsados</button>
                            <button class="filter-tab" data-filter="rejected" onclick="setFilter('rejected')">Rechazados</button>
                        </div>
                    </div>

                    <!-- Requests Content (Table / Card view for mobile) -->
                    <div class="admin-requests-container">
                        <div class="requests-header-row">
                            <div class="col-client">Cliente / Contacto</div>
                            <div class="col-products">Productos</div>
                            <div class="col-reason">Motivo</div>
                            <div class="col-date">Fecha</div>
                            <div class="col-status">Estado</div>
                            <div class="col-actions">Acción rápida</div>
                        </div>
                        
                        <div id="requests-list" class="requests-list">
                            <!-- Populated by JS -->
                            <div class="no-data">Cargando solicitudes desde el servidor...</div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        
        <!-- Footer -->
        <footer class="app-footer">
            <p>Todos los reembolsos se analizan en un plazo de hasta 48 horas hábiles. | @MartinRezende</p>
        </footer>
    </div>

    <!-- REQUEST DETAIL MODAL (FOR VIEWING FULL RECOMPLAINT DETAILS) -->
    <div id="request-detail-modal" class="modal-overlay" style="display: none;">
        <div class="modal-card modal-large">
            <div class="modal-header">
                <h2>Detalle de la Solicitud <span id="detail-ticket-id">#000</span></h2>
                <button class="modal-close" onclick="closeRequestDetail()">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body" id="detail-modal-body">
                <!-- Populated dynamically by JS -->
            </div>
            <div class="modal-footer">
                <div class="detail-modal-status-actions" id="detail-status-actions">
                    <!-- Populated by JS -->
                </div>
                <button class="btn btn-secondary" onclick="closeRequestDetail()">Cerrar</button>
            </div>
        </div>
    </div>

    <!-- Admin JavaScript -->
    <script>
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
        const response = await fetch(\`/api/refunds?id=\${encodeURIComponent(requestId)}\`, {
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
        const productsHTML = request.products.map(p => \`<span class="admin-prod-tag">\${p.name}</span>\`).join(' ');
        
        row.innerHTML = \`
            <div class="col-client">
                <span class="client-name-bold">\${request.name}</span>
                <span class="client-contact-sub">\${request.email}</span>
            </div>
            <div class="col-products">
                \${productsHTML}
            </div>
            <div class="col-reason">
                <span class="admin-prod-tag" style="background: rgba(255, 166, 0, 0.1); color: var(--accent); border-color: rgba(255, 166, 0, 0.2);">\${request.reasonText}</span>
            </div>
            <div class="col-date">
                \${formattedDate}
            </div>
            <div class="col-status">
                <span class="status-badge \${statusClass}">\${statusText}</span>
            </div>
            <div class="col-actions">
                <button class="btn btn-primary btn-sm" onclick="openRequestDetail('\${request.id}')">Ver Detalle</button>
            </div>
        \`;
        
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
    const productsHTML = req.products.map(p => \`<span class="admin-prod-tag" style="margin-right: 5px; margin-bottom: 5px; display: inline-block;">\${p.name}</span>\`).join('');
    
    const bodyEl = document.getElementById('detail-modal-body');
    bodyEl.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 15px;">
            <div>
                <span class="status-badge \${statusClass}">\${statusText}</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Registrado el: \${reqDate}</span>
        </div>
        
        <div class="detail-section">
            <h4>Datos del Cliente</h4>
            <div class="detail-info-block detail-grid-info">
                <div class="detail-label-val">
                    <label>Nombre del Cliente</label>
                    <span style="font-weight:600; color:white;">\${req.name}</span>
                </div>
                <div class="detail-label-val">
                    <label>Correo Electrónico de Compra</label>
                    <span>\${req.email}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Productos Seleccionados</h4>
            <div class="detail-info-block">
                \${productsHTML}
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Comentarios y Reclamo</h4>
            <div class="detail-info-block">
                <div class="detail-reason-tag">\${req.reasonText}</div>
                <div class="feedback-text-quote">"\${req.feedback}"</div>
            </div>
            
            <div class="copy-btn-group">
                <button class="btn btn-secondary btn-sm" onclick="copyRefundDetailsText('\${req.id}', this)">
                    Copiar Datos del Reclamo
                </button>
            </div>
        </div>
    \`;
    
    const footerActions = document.getElementById('detail-status-actions');
    footerActions.innerHTML = '';
    
    if (req.status === 'pending') {
        footerActions.innerHTML = \`
            <button class="btn btn-primary" onclick="changeRequestStatus('\${req.id}', 'refunded')">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" class="icon-left">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Marcar Reembolsado
            </button>
            <button class="btn btn-secondary" style="border-color: rgba(239, 68, 68, 0.4); color: #fca5a5;" onclick="changeRequestStatus('\${req.id}', 'rejected')">
                Rechazar Solicitud
            </button>
        \`;
    } else {
        footerActions.innerHTML = \`
            <button class="btn btn-secondary" onclick="changeRequestStatus('\${req.id}', 'pending')">
                Volver a Pendiente
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteRequest('\${req.id}')">
                Eliminar Registro
            </button>
        \`;
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
        btnElement.innerHTML = \`
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" class="icon-left">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            \${successMsg}
        \`;
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
    
    let textToCopy = \`REEMBOLSO MANUAL SOLICITADO
Ticket: \${req.id}
Cliente: \${req.name}
Correo: \${req.email}
Productos: \${req.products.map(p => p.name).join(', ')}
Razón: \${req.reasonText}
Comentarios: "\${req.feedback}"
Fecha de Registro: \${new Date(req.date).toLocaleDateString('es-ES')}\`;
    
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
        const name = \`"\${req.name.replace(/"/g, '""')}"\`;
        const email = \`"\${req.email.replace(/"/g, '""')}"\`;
        const productsList = \`"\${req.products.map(p => p.name).join('; ').replace(/"/g, '""')}"\`;
        const reason = \`"\${req.reasonText.replace(/"/g, '""')}"\`;
        const feedback = \`"\${req.feedback.replace(/"/g, '""')}"\`;
        const date = req.date;
        const status = req.status;
        
        const row = [id, name, email, productsList, reason, feedback, date, status].join(",");
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`solicitudes_reembolso_\${new Date().toISOString().slice(0,10)}.csv\`);
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
    errorDiv.innerHTML = \`
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        \${message}
    \`;
    parent.appendChild(errorDiv);
    
    inputEl.addEventListener('input', () => {
        inputEl.style.borderColor = '';
        errorDiv.remove();
    }, { once: true });
}

</script>
</body>
</html>
`;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // ------------------------------------------------------------------
        // 1. ROUTING: FRONTEND PAGES
        // ------------------------------------------------------------------
        if (path === "/" || path === "/index.html") {
            return new Response(HTML_CLIENT, {
                headers: { "Content-Type": "text/html; charset=utf-8" }
            });
        }

        if (path === "/admin.html" || path === "/admin") {
            return new Response(HTML_ADMIN, {
                headers: { "Content-Type": "text/html; charset=utf-8" }
            });
        }

        // ------------------------------------------------------------------
        // 2. ROUTING: BACKEND API ENDPOINTS
        // ------------------------------------------------------------------
        if (path === "/api/refunds") {
            const method = request.method;

            // GET /api/refunds - Fetch all requests
            if (method === "GET") {
                const authHeader = request.headers.get("Authorization");
                if (!authHeader || (authHeader !== "admin123" && authHeader !== "admin")) {
                    return new Response(JSON.stringify({ error: "Unauthorized" }), {
                        status: 401,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                try {
                    const list = await env.REFUNDS.get("requests_list");
                    return new Response(list || "[]", {
                        headers: { "Content-Type": "application/json" }
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: err.message }), {
                        status: 500,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }

            // POST /api/refunds - Submit new request
            if (method === "POST") {
                try {
                    const newRequest = await request.json();
                    
                    let listStr = await env.REFUNDS.get("requests_list");
                    let list = [];
                    if (listStr) {
                        list = JSON.parse(listStr);
                    }

                    list.unshift(newRequest);
                    await env.REFUNDS.put("requests_list", JSON.stringify(list));

                    return new Response(JSON.stringify({ result: "success", id: newRequest.id }), {
                        headers: { "Content-Type": "application/json" }
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: err.message }), {
                        status: 500,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }

            // PUT /api/refunds - Update request status
            if (method === "PUT") {
                const authHeader = request.headers.get("Authorization");
                if (!authHeader || (authHeader !== "admin123" && authHeader !== "admin")) {
                    return new Response(JSON.stringify({ error: "Unauthorized" }), {
                        status: 401,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                try {
                    const { id, status } = await request.json();
                    let listStr = await env.REFUNDS.get("requests_list");
                    if (!listStr) {
                        return new Response(JSON.stringify({ error: "No requests found" }), {
                            status: 404,
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                    let list = JSON.parse(listStr);
                    const index = list.findIndex(r => r.id === id);
                    if (index !== -1) {
                        list[index].status = status;
                        await env.REFUNDS.put("requests_list", JSON.stringify(list));
                        return new Response(JSON.stringify({ result: "success" }), {
                            headers: { "Content-Type": "application/json" }
                        });
                    } else {
                        return new Response(JSON.stringify({ error: "Request not found" }), {
                            status: 404,
                            headers: { "Content-Type": "application/json" }
                        });
                    }
                } catch (err) {
                    return new Response(JSON.stringify({ error: err.message }), {
                        status: 500,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }

            // DELETE /api/refunds - Delete request
            if (method === "DELETE") {
                const authHeader = request.headers.get("Authorization");
                if (!authHeader || (authHeader !== "admin123" && authHeader !== "admin")) {
                    return new Response(JSON.stringify({ error: "Unauthorized" }), {
                        status: 401,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                try {
                    const id = url.searchParams.get("id");
                    if (!id) {
                        return new Response(JSON.stringify({ error: "Missing id parameter" }), {
                            status: 400,
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                    let listStr = await env.REFUNDS.get("requests_list");
                    if (!listStr) {
                        return new Response(JSON.stringify({ error: "No requests found" }), {
                            status: 404,
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                    let list = JSON.parse(listStr);
                    const filtered = list.filter(r => r.id !== id);
                    await env.REFUNDS.put("requests_list", JSON.stringify(filtered));

                    return new Response(JSON.stringify({ result: "success" }), {
                        headers: { "Content-Type": "application/json" }
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: err.message }), {
                        status: 500,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }
        }

        // Fallback: 404
        return new Response("Not Found", { status: 404 });
    }
};
