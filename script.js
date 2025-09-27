// Deep Time Whispers - Interactive Elements

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navigation background on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Parallax effect for stars
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const stars = document.querySelector('.stars');
    const stars2 = document.querySelector('.stars2');
    const stars3 = document.querySelector('.stars3');
    
    if (stars) stars.style.transform = `translateY(${scrolled * 0.5}px)`;
    if (stars2) stars2.style.transform = `translateY(${scrolled * 0.3}px)`;
    if (stars3) stars3.style.transform = `translateY(${scrolled * 0.1}px)`;
});

// Intersection Observer for fade-in animations
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

// Apply observer to sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
});

// Add floating animation to review cards on hover
document.querySelectorAll('.review-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Dynamic year for footer
document.addEventListener('DOMContentLoaded', () => {
    const year = new Date().getFullYear();
    const footerText = document.querySelector('.footer-bottom p');
    if (footerText) {
        footerText.innerHTML = `© ${year} Deep Time Whispers. You are made of ancient atoms.`;
    }
});

// Add subtle glow effect to buttons on hover
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.boxShadow = this.classList.contains('btn-primary') 
            ? '0 8px 40px rgba(123, 31, 162, 0.8)' 
            : '0 8px 40px rgba(77, 182, 172, 0.4)';
    });
    btn.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
    });
});

// Mobile menu toggle (if needed in future)
const mobileMenuToggle = () => {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('active');
};

// Platform links - Update these with your actual links
const platformLinks = {
    spotify: 'YOUR_SPOTIFY_LINK',
    apple: 'YOUR_APPLE_PODCASTS_LINK',
    youtube: 'YOUR_YOUTUBE_CHANNEL_LINK',
    google: 'YOUR_GOOGLE_PODCASTS_LINK'
};

// Update platform card links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.platform-card.spotify')?.setAttribute('href', platformLinks.spotify);
    document.querySelector('.platform-card.apple')?.setAttribute('href', platformLinks.apple);
    document.querySelector('.platform-card.youtube')?.setAttribute('href', platformLinks.youtube);
    document.querySelector('.platform-card.google')?.setAttribute('href', platformLinks.google);
});