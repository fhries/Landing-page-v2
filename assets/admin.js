/**
 * NexaLink - Admin Panel Script
 * SHA-256 Authentication + Link CRUD
 */

// ===== CONSTANTS =====
const STORED_HASH = 'dcfd2138a66dc5b4401831c2783a25559ed483104454fa9c42e37bce28f960dc';
const SESSION_KEY = 'nexalink_admin';
const STORAGE_KEY = 'nexalink_links';

const colors = [
    '#6366f1', '#ec4899', '#06b6d4', '#8b5cf6', '#f59e0b',
    '#10b981', '#ef4444', '#3b82f6', '#14b8a6', '#f97316',
    '#84cc16', '#d946ef', '#64748b', '#1e293b', '#7c3aed',
    '#0ea5e9', '#22c55e', '#e11d48', '#f43f5e', '#0d9488'
];

const icons = [
    'fas fa-link', 'fab fa-google', 'fab fa-github', 'fab fa-youtube',
    'fab fa-instagram', 'fab fa-twitter', 'fab fa-facebook', 'fab fa-linkedin',
    'fab fa-discord', 'fab fa-telegram', 'fab fa-whatsapp', 'fab fa-tiktok',
    'fas fa-globe', 'fas fa-shopping-bag', 'fas fa-music', 'fas fa-video',
    'fas fa-gamepad', 'fas fa-book', 'fas fa-graduation-cap', 'fas fa-briefcase',
    'fas fa-heart', 'fas fa-star', 'fas fa-bolt', 'fas fa-fire',
    'fas fa-code', 'fas fa-terminal', 'fas fa-database', 'fas fa-server',
    'fas fa-cloud', 'fas fa-envelope', 'fas fa-calendar', 'fas fa-map-marker-alt',
    'fab fa-spotify', 'fab fa-netflix', 'fab fa-reddit', 'fab fa-pinterest',
    'fas fa-newspaper', 'fas fa-coffee', 'fas fa-camera', 'fas fa-plane'
];

// ===== DOM ELEMENTS =====
const loginScreen = document.getElementById('login-screen');
const panelScreen = document.getElementById('panel-screen');
const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');
const togglePassword = document.getElementById('toggle-password');
const hashCopy = document.getElementById('hash-copy');
const modal = document.getElementById('modal');
const linkForm = document.getElementById('link-form');
const toast = document.getElementById('toast');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        showPanel();
    }
    initColorPicker();
    initIconPicker();
    initEventListeners();
});

function initEventListeners() {
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Toggle password
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}" aria-hidden="true"></i>`;
        });
    }

    // Copy hash
    if (hashCopy) {
        hashCopy.addEventListener('click', copyHash);
    }

    // Link form
    if (linkForm) {
        linkForm.addEventListener('submit', handleLinkSubmit);
    }

    // Modal overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeModal();
        }
    });
}

// ===== AUTHENTICATION =====
async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleLogin(e) {
    e.preventDefault();

    const password = passwordInput.value;
    if (!password) return;

    // Show loader
    setLoading(true);

    // Small delay for UX
    await new Promise(r => setTimeout(r, 400));

    const hash = await sha256(password);

    if (hash === STORED_HASH) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        loginError.classList.remove('show');
        showToast('Berhasil masuk!', 'success');
        showPanel();
    } else {
        loginError.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        // Shake animation
        loginScreen.style.animation = 'shake 0.5s ease';
        setTimeout(() => loginScreen.style.animation = '', 500);
    }

    setLoading(false);
}

function setLoading(loading) {
    if (!loginBtn) return;
    const text = loginBtn.querySelector('.btn-text');
    const loader = loginBtn.querySelector('.btn-loader');

    loginBtn.disabled = loading;
    if (text) text.style.display = loading ? 'none' : 'flex';
    if (loader) loader.style.display = loading ? 'flex' : 'none';
}

function showPanel() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (panelScreen) {
        panelScreen.style.display = 'block';
        panelScreen.style.animation = 'fadeInUp 0.5s ease both';
    }
    renderAdminLinks();
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    if (loginScreen) {
        loginScreen.style.display = 'block';
        loginScreen.style.animation = 'fadeInUp 0.5s ease both';
    }
    if (panelScreen) panelScreen.style.display = 'none';
    if (passwordInput) passwordInput.value = '';
    if (loginError) loginError.classList.remove('show');
}

function copyHash() {
    const hashText = document.querySelector('.hash-text');
    if (!hashText) return;

    navigator.clipboard.writeText(hashText.textContent).then(() => {
        hashCopy.classList.add('copied');
        hashCopy.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
        showToast('Hash disalin!', 'success');

        setTimeout(() => {
            hashCopy.classList.remove('copied');
            hashCopy.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i>';
        }, 2000);
    });
}

// ===== DATA MANAGEMENT =====
function getLinks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading links:', e);
        return [];
    }
}

function saveLinks(links) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    // Notify other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
}

// ===== RENDER =====
function renderAdminLinks() {
    const tbody = document.getElementById('admin-links-body');
    const emptyState = document.getElementById('admin-empty');

    if (!tbody || !emptyState) return;

    const links = getLinks();

    if (links.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = links.map(link => {
        const date = link.createdAt 
            ? new Date(link.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-';

        return `
            <tr>
                <td data-label="Link">
                    <div class="link-info">
                        <div class="link-info-icon" style="background: ${escapeHtml(link.color || '#6366f1')};">
                            <i class="${escapeHtml(link.icon || 'fas fa-link')}" aria-hidden="true"></i>
                        </div>
                        <div class="link-info-text">
                            <h4>${escapeHtml(link.title)}</h4>
                            <span>${escapeHtml(link.description)}</span>
                        </div>
                    </div>
                </td>
                <td class="hide-mobile url-cell" data-label="URL">${escapeHtml(truncateUrl(link.url))}</td>
                <td class="hide-mobile date-cell" data-label="Dibuat">${date}</td>
                <td data-label="Aksi" style="text-align: right;">
                    <button class="btn-icon btn-edit" onclick="editLink('${link.id}')" title="Edit" aria-label="Edit ${escapeHtml(link.title)}">
                        <i class="fas fa-pen" aria-hidden="true"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteLink('${link.id}')" title="Hapus" aria-label="Hapus ${escapeHtml(link.title)}">
                        <i class="fas fa-trash" aria-hidden="true"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function truncateUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname + urlObj.pathname;
    } catch {
        return url.length > 40 ? url.substring(0, 40) + '...' : url;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== CRUD OPERATIONS =====
function deleteLink(id) {
    const link = getLinks().find(l => l.id === id);
    if (!link) return;

    if (!confirm(`Yakin ingin menghapus "${link.title}"?`)) return;

    const links = getLinks().filter(l => l.id !== id);
    saveLinks(links);
    renderAdminLinks();
    showToast(`"${link.title}" dihapus`, 'success');
}

function editLink(id) {
    const link = getLinks().find(l => l.id === id);
    if (!link) return;

    document.getElementById('link-id').value = link.id;
    document.getElementById('link-title').value = link.title;
    document.getElementById('link-desc').value = link.description;
    document.getElementById('link-url').value = link.url;
    document.getElementById('link-color').value = link.color || '#6366f1';
    document.getElementById('link-icon').value = link.icon || 'fas fa-link';

    // Update picker selections
    document.querySelectorAll('.color-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.color === (link.color || '#6366f1'));
    });
    document.querySelectorAll('.icon-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.icon === (link.icon || 'fas fa-link'));
    });

    document.getElementById('modal-title').textContent = 'Edit Link';
    document.getElementById('modal-submit-text').textContent = 'Update';
    openModal();
}

function handleLinkSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('link-id').value;
    const title = document.getElementById('link-title').value.trim();
    const description = document.getElementById('link-desc').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const color = document.getElementById('link-color').value;
    const icon = document.getElementById('link-icon').value;

    if (!title || !description || !url) return;

    // Ensure URL has protocol
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
        finalUrl = 'https://' + url;
    }

    let links = getLinks();

    if (id) {
        const index = links.findIndex(l => l.id === id);
        if (index !== -1) {
            links[index] = { ...links[index], title, description, url: finalUrl, color, icon };
            showToast('Link diperbarui!', 'success');
        }
    } else {
        const newLink = {
            id: Date.now().toString(),
            title,
            description,
            url: finalUrl,
            color,
            icon,
            createdAt: Date.now()
        };
        links.push(newLink);
        showToast('Link ditambahkan!', 'success');
    }

    saveLinks(links);
    renderAdminLinks();
    closeModal();
}

// ===== MODAL =====
function openModal() {
    if (!modal) return;

    // Reset form if adding new
    const id = document.getElementById('link-id').value;
    if (!id) {
        linkForm?.reset();
        document.getElementById('link-id').value = '';
        document.getElementById('link-color').value = '#6366f1';
        document.getElementById('link-icon').value = 'fas fa-link';

        document.querySelectorAll('.color-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.color === '#6366f1');
        });
        document.querySelectorAll('.icon-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.icon === 'fas fa-link');
        });

        document.getElementById('modal-title').textContent = 'Tambah Link Baru';
        document.getElementById('modal-submit-text').textContent = 'Simpan';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input
    setTimeout(() => document.getElementById('link-title')?.focus(), 100);
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== PICKERS =====
function initColorPicker() {
    const container = document.getElementById('color-options');
    if (!container) return;

    container.innerHTML = colors.map(color => `
        <div class="color-option ${color === '#6366f1' ? 'selected' : ''}" 
             data-color="${color}" 
             style="background: ${color};"
             onclick="selectColor('${color}')"
             role="button"
             tabindex="0"
             aria-label="Select color ${color}">
        </div>
    `).join('');
}

function selectColor(color) {
    const input = document.getElementById('link-color');
    if (input) input.value = color;

    document.querySelectorAll('.color-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.color === color);
    });
}

function initIconPicker() {
    const container = document.getElementById('icon-options');
    if (!container) return;

    container.innerHTML = icons.map(icon => `
        <div class="icon-option ${icon === 'fas fa-link' ? 'selected' : ''}" 
             data-icon="${icon}"
             onclick="selectIcon('${icon}')"
             role="button"
             tabindex="0"
             aria-label="Select icon ${icon}">
            <i class="${icon}" aria-hidden="true"></i>
        </div>
    `).join('');
}

function selectIcon(icon) {
    const input = document.getElementById('link-icon');
    if (input) input.value = icon;

    document.querySelectorAll('.icon-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.icon === icon);
    });
}

// ===== EXPORT / IMPORT =====
function exportData() {
    const links = getLinks();
    const data = {
        app: 'NexaLink',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        links: links
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexalink-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Backup ${links.length} link berhasil di-download!`, 'success');
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;

    // Reset input so same file can be selected again
    input.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Validate structure
            if (!data.links || !Array.isArray(data.links)) {
                throw new Error('Format file tidak valid');
            }

            // Validate each link
            const validLinks = data.links.filter(link => 
                link.id && link.title && link.url
            );

            if (validLinks.length === 0) {
                throw new Error('Tidak ada link valid di file');
            }

            // Show confirmation
            const currentCount = getLinks().length;
            const importCount = validLinks.length;
            const message = currentCount > 0 
                ? `Timpa ${currentCount} link existing dengan ${importCount} link dari backup?`
                : `Import ${importCount} link dari backup?`;

            if (confirm(message)) {
                saveLinks(validLinks);
                renderAdminLinks();
                showToast(`${importCount} link berhasil di-import!`, 'success');
            }
        } catch (err) {
            showToast('Gagal import: ' + err.message, 'error');
        }
    };

    reader.onerror = () => {
        showToast('Gagal membaca file', 'error');
    };

    reader.readAsText(file);
}

// ===== TOAST =====
function showToast(message, type = 'success') {
    if (!toast) return;

    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');

    toast.className = `toast ${type}`;
    if (icon) icon.className = `toast-icon fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`;
    if (msg) msg.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== SHAKE ANIMATION =====
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-5px); }
        80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);
