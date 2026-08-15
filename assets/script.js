/**
 * NexaLink - Landing Page Script
 * Pure vanilla JS, no dependencies
 */

// Default links data
const defaultLinks = [
    {
        id: '1',
        title: 'Google',
        description: 'Mesin pencari terbesar di dunia',
        url: 'https://google.com',
        icon: 'fab fa-google',
        color: '#4285F4',
        createdAt: Date.now()
    },
    {
        id: '2',
        title: 'GitHub',
        description: 'Platform pengembangan perangkat lunak',
        url: 'https://github.com',
        icon: 'fab fa-github',
        color: '#333',
        createdAt: Date.now() - 1000
    },
    {
        id: '3',
        title: 'YouTube',
        description: 'Platform video streaming terpopuler',
        url: 'https://youtube.com',
        icon: 'fab fa-youtube',
        color: '#FF0000',
        createdAt: Date.now() - 2000
    }
];

// Storage key
const STORAGE_KEY = 'nexalink_links';

// Initialize
function init() {
    initLinks();
    renderLinks();
    updateStats();
    initMobileMenu();
    initScrollSpy();
    initNavbarScroll();
    initAnimations();
}

// Initialize links in localStorage
function initLinks() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLinks));
    }
}

// Get links from localStorage
function getLinks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading links:', e);
        return [];
    }
}

// Render links to grid
function renderLinks() {
    const grid = document.getElementById('links-grid');
    const emptyState = document.getElementById('empty-state');

    if (!grid || !emptyState) return;

    const links = getLinks();

    if (links.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = links.map((link, index) => `
        <a href="${escapeHtml(link.url)}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="link-card"
           role="listitem"
           style="animation-delay: ${index * 0.1}s">
            <div class="link-icon" style="background: ${escapeHtml(link.color || '#6366f1')};">
                <i class="${escapeHtml(link.icon || 'fas fa-link')}" aria-hidden="true"></i>
            </div>
            <h3 class="link-title">${escapeHtml(link.title)}</h3>
            <p class="link-desc">${escapeHtml(link.description)}</p>
            <div class="link-arrow">
                <span>Kunjungi</span>
                <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </div>
        </a>
    `).join('');
}

// Update stats
function updateStats() {
    const countEl = document.getElementById('link-count');
    if (countEl) {
        const count = getLinks().length;
        animateNumber(countEl, 0, count, 1000);
    }
}

// Animate number
function animateNumber(el, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);

        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mobile menu
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
        });
    });
}

// Scroll spy
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
}

// Navbar scroll effect
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Simple animation on scroll
function initAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Listen for storage changes (sync across tabs)
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
        renderLinks();
        updateStats();
    }
});

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
