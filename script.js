// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Project Modal Logic - 完全修正版
const projectModal = document.getElementById('project-modal');
const closeModalButton = document.getElementById('close-modal-button');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalTagsContainer = document.getElementById('modal-tags');
const modalDescription = document.getElementById('modal-description');
const viewDetailsButtons = document.querySelectorAll('.view-details-button');

// モーダルを閉じる関数
function closeModal() {
    if (projectModal) {
        projectModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        console.log('Modal closed');
    }
}

// モーダルを開く関数
function openModal(card) {
    if (!projectModal || !modalTitle || !modalDescription || !modalImage || !modalTagsContainer) {
        console.error('Modal elements not found');
        return;
    }

    const title = card.dataset.title;
    const description = card.dataset.description;
    const image = card.dataset.image;
    const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];

    modalTitle.textContent = title || 'プロジェクト';
    modalDescription.textContent = description || '説明がありません';
    modalImage.src = image || '';
    modalImage.alt = (title || 'プロジェクト') + " のイメージ";

    // タグをクリア
    modalTagsContainer.innerHTML = '';
    
    // タグを追加
    tags.forEach(tagText => {
        if (tagText && tagText.trim()) {
            const tagElement = document.createElement('span');
            tagElement.classList.add('tag', 'mr-2', 'mb-2', 'inline-block');
            tagElement.textContent = tagText.trim();
            modalTagsContainer.appendChild(tagElement);
        }
    });

    // モーダルを表示
    projectModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    console.log('Modal opened');
}

// 詳細ボタンのイベントリスナー
viewDetailsButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = e.target.closest('.project-card');
        if (card) {
            openModal(card);
        }
    });
});

// 閉じるボタンのイベントリスナー
if (closeModalButton) {
    closeModalButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
    });
}

// バックドロップクリックで閉じる
if (projectModal) {
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeModal();
        }
    });
}

// ESCキーで閉じる
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && !projectModal.classList.contains('hidden')) {
        closeModal();
    }
});

// デバッグ用グローバル関数
window.closeModal = closeModal;
window.debugModal = function() {
    console.log('Modal element:', projectModal);
    console.log('Modal classes:', projectModal ? projectModal.className : 'Not found');
    console.log('Close button:', closeModalButton);
};

// Contact form handling
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const message = document.getElementById('message')?.value || '';
        
        // Simple validation
        if (!name || !email || !message) {
            alert('すべてのフィールドを入力してください。');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('有効なメールアドレスを入力してください。');
            return;
        }
        
        // Simulate form submission
        alert('メッセージが送信されました！ありがとうございます。');
        this.reset();
    });
}

// Header background change on scroll
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(17, 24, 39, 0.95)';
        } else {
            navbar.style.backgroundColor = 'rgba(17, 24, 39, 0.8)';
        }
    });
}

// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.card, .section-title');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    console.log('Portfolio JavaScript loaded successfully');
});