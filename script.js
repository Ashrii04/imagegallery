// Application state
let currentImages = [];
let currentImageIndex = 0;
let currentFilter = 'all';

// DOM elements (initialized after DOM load)
let welcomeSection, gallerySection, galleryGrid, lightbox;
let lightboxImage, lightboxTitle, lightboxDescription, lightboxCounter;
let filterButtons;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize DOM elements
    welcomeSection = document.getElementById('welcome-section');
    gallerySection = document.getElementById('gallery-section');
    galleryGrid = document.getElementById('gallery-grid');
    lightbox = document.getElementById('lightbox');
    lightboxImage = document.getElementById('lightbox-image');
    lightboxTitle = document.getElementById('lightbox-title');
    lightboxDescription = document.getElementById('lightbox-description');
    lightboxCounter = document.getElementById('lightbox-counter');
    filterButtons = document.querySelectorAll('.filter-btn');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize gallery items
    initializeGalleryItems();
    
    // Set up image loading
    setupImageLoading();
    
    // Show welcome page by default
    showWelcome();
}

function setupEventListeners() {
    // Filter button event listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            setActiveFilter(button);
            filterGallery(filter);
        });
    });
    
    // Gallery item click listeners
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
    
    // Touch/swipe support for mobile
    setupTouchEvents();
    
    // Close lightbox when clicking outside image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

function setupImageLoading() {
    const images = document.querySelectorAll('.gallery-item img, .preview-item img');
    
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });
}

function initializeGalleryItems() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    currentImages = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        return {
            src: img.src,
            title: img.getAttribute('data-title'),
            description: img.getAttribute('data-description'),
            category: item.getAttribute('data-category'),
            element: item
        };
    });
}

function showWelcome() {
    welcomeSection.classList.add('active');
    gallerySection.classList.remove('active');
    document.body.style.overflow = 'hidden';
}

function showGallery() {
    welcomeSection.classList.remove('active');
    gallerySection.classList.add('active');
    document.body.style.overflow = 'auto';
    
    // Trigger animation for gallery items
    setTimeout(() => {
        const visibleItems = document.querySelectorAll('.gallery-item:not(.hidden)');
        visibleItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 100);
        });
    }, 100);
}

function setActiveFilter(activeButton) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

function filterGallery(category) {
    currentFilter = category;
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        const itemCategory = item.getAttribute('data-category');
        const shouldShow = category === 'all' || itemCategory === category;
        
        if (shouldShow) {
            item.classList.remove('hidden');
            setTimeout(() => {
                item.classList.add('show');
            }, index * 50);
        } else {
            item.classList.add('hidden');
            item.classList.remove('show');
        }
    });
    
    // Update current images array for lightbox navigation
    updateCurrentImagesForFilter(category);
}

function updateCurrentImagesForFilter(category) {
    if (category === 'all') {
        currentImages = Array.from(document.querySelectorAll('.gallery-item')).map(item => {
            const img = item.querySelector('img');
            return {
                src: img.src,
                title: img.getAttribute('data-title'),
                description: img.getAttribute('data-description'),
                category: item.getAttribute('data-category'),
                element: item
            };
        });
    } else {
        currentImages = Array.from(document.querySelectorAll(`.gallery-item[data-category="${category}"]`)).map(item => {
            const img = item.querySelector('img');
            return {
                src: img.src,
                title: img.getAttribute('data-title'),
                description: img.getAttribute('data-description'),
                category: item.getAttribute('data-category'),
                element: item
            };
        });
    }
}

function openLightbox(index) {
    // Calculate the correct index based on current filter
    const visibleItems = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
    const clickedItem = visibleItems[index];
    
    if (!clickedItem) return;
    
    // Find the index in the current images array
    const img = clickedItem.querySelector('img');
    const imageSrc = img.src;
    
    currentImageIndex = currentImages.findIndex(image => image.src === imageSrc);
    
    if (currentImageIndex === -1) return;
    
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Preload adjacent images
    preloadAdjacentImages();
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function navigateLightbox(direction) {
    const visibleImages = getVisibleImages();
    
    if (visibleImages.length === 0) return;
    
    // Find current index in visible images
    const currentVisibleIndex = visibleImages.findIndex(img => img.src === currentImages[currentImageIndex].src);
    
    if (currentVisibleIndex === -1) return;
    
    let newVisibleIndex = currentVisibleIndex + direction;
    
    // Wrap around
    if (newVisibleIndex >= visibleImages.length) {
        newVisibleIndex = 0;
    } else if (newVisibleIndex < 0) {
        newVisibleIndex = visibleImages.length - 1;
    }
    
    // Find the new image in the original array
    const newImage = visibleImages[newVisibleIndex];
    currentImageIndex = currentImages.findIndex(img => img.src === newImage.src);
    
    updateLightboxContent();
    preloadAdjacentImages();
}

function getVisibleImages() {
    return currentImages.filter(image => {
        return !image.element.classList.contains('hidden');
    });
}

function updateLightboxContent() {
    const image = currentImages[currentImageIndex];
    const visibleImages = getVisibleImages();
    const visibleIndex = visibleImages.findIndex(img => img.src === image.src);
    
    lightboxImage.src = image.src;
    lightboxImage.alt = image.title;
    lightboxTitle.textContent = image.title;
    lightboxDescription.textContent = image.description;
    lightboxCounter.textContent = `${visibleIndex + 1} of ${visibleImages.length}`;
    
    // Add loading animation
    lightboxImage.style.opacity = '0';
    lightboxImage.onload = function() {
        lightboxImage.style.opacity = '1';
    };
}

function preloadAdjacentImages() {
    const visibleImages = getVisibleImages();
    const currentVisibleIndex = visibleImages.findIndex(img => img.src === currentImages[currentImageIndex].src);
    
    // Preload previous and next images
    const preloadIndexes = [
        currentVisibleIndex - 1 >= 0 ? currentVisibleIndex - 1 : visibleImages.length - 1,
        currentVisibleIndex + 1 < visibleImages.length ? currentVisibleIndex + 1 : 0
    ];
    
    preloadIndexes.forEach(index => {
        if (visibleImages[index]) {
            const img = new Image();
            img.src = visibleImages[index].src;
        }
    });
}

function handleKeyPress(e) {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            navigateLightbox(-1);
            break;
        case 'ArrowRight':
            navigateLightbox(1);
            break;
    }
}

function setupTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                navigateLightbox(1);
            } else {
                // Swipe right - previous image
                navigateLightbox(-1);
            }
        }
    }
}

// Smooth scrolling enhancement
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Performance optimization: Intersection Observer for lazy loading
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', setupLazyLoading);

// Export functions for external use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showWelcome,
        showGallery,
        openLightbox,
        closeLightbox,
        navigateLightbox,
        filterGallery
    };
}