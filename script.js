// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        if (mobileMenu.classList.contains('hidden') === false) {
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

// Project Modal Logic
const projectCards = document.querySelectorAll('.project-card');
const projectModal = document.getElementById('project-modal');
const closeModalButton = document.getElementById('close-modal-button');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalTagsContainer = document.getElementById('modal-tags');
const modalDescription = document.getElementById('modal-description');
const viewDetailsButtons = document.querySelectorAll('.view-details-button');

viewDetailsButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        const title = card.dataset.title;
        const description = card.dataset.description;
        const image = card.dataset.image;
        const tags = card.dataset.tags.split(',');

        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalImage.src = image;
        modalImage.alt = title + " のイメージ";

        modalTagsContainer.innerHTML = ''; // Clear previous tags
        tags.forEach(tagText => {
            const tagElement = document.createElement('span');
            tagElement.classList.add('tag', 'mr-2', 'mb-2', 'inline-block');
            tagElement.textContent = tagText.trim();
            modalTagsContainer.appendChild(tagElement);
        });

        projectModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
});

closeModalButton.addEventListener('click', () => {
    projectModal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore scrolling
});

projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) { // Clicked on backdrop
        projectModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
});

// Contact form handling
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
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

// Header background change on scroll
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(17, 24, 39, 0.95)';
    } else {
        navbar.style.backgroundColor = 'rgba(17, 24, 39, 0.8)';
    }
});

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
});

// Keyboard navigation for modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !projectModal.classList.contains('hidden')) {
        projectModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
});

// Lazy loading for images (optional enhancement)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}