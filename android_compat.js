/**
 * Android Compatibility Script for FSRP Website
 * Created by Sejed TRABELLSSI | sejed.pages.dev
 * 
 * This script provides enhanced Android compatibility for all pages
 * on the FSRP website, with special handling for PDF documents and
 * optimized mobile experiences.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Android Compatibility | Created by Sejed TRABELLSSI', 'background: #ff5e62; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Device detection functions
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    
    function isMobile() {
        return window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
    
    // Initialize the UI based on device
    function initializeUI() {
        // Get elements that might be present on different pages
        const androidMessage = document.getElementById('android-message');
        const desktopExperience = document.getElementById('desktop-experience');
        const pdfObject = document.getElementById('pdf-object');
        
        if (isAndroid()) {
            // Show Android-specific message if it exists
            if (androidMessage) {
                androidMessage.style.display = 'block';
            }
            
            // Handle PDF viewing on Android
            if (pdfObject) {
                handleAndroidPDF();
            }
            
            // Add smooth scrolling for Android section links
            setupSmoothScrolling();
            
            // Add watermark for Android
            addWatermark();
            
            // Add Android-specific meta tags for better mobile experience
            addAndroidMetaTags();
            
            // Optimize touch interactions for Android
            optimizeTouchInteractions();
        }
    }
    
    // Handle PDF viewing on Android
    function handleAndroidPDF() {
        const pdfObject = document.getElementById('pdf-object');
        const androidMessage = document.getElementById('android-message');
        const desktopExperience = document.getElementById('desktop-experience');
        
        if (pdfObject && androidMessage && desktopExperience) {
            // Hide desktop experience on Android
            desktopExperience.style.display = 'none';
            
            // Show Android-specific message
            androidMessage.style.display = 'block';
        }
    }
    
    // Setup smooth scrolling for Android section links
    function setupSmoothScrolling() {
        const androidLinks = document.querySelectorAll('.android-btn');
        androidLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Add watermark for Android
    function addWatermark() {
        // Check if watermark already exists
        if (document.querySelector('.watermark')) {
            return;
        }
        
        const watermark = document.createElement('div');
        watermark.className = 'watermark';
        watermark.innerHTML = 'Created by <a href="https://sejed.pages.dev" target="_blank">Sejed TRABELLSSI</a>';
        watermark.style.position = 'fixed';
        watermark.style.bottom = '10px';
        watermark.style.right = '10px';
        watermark.style.background = 'rgba(0, 0, 0, 0.1)';
        watermark.style.padding = '5px 10px';
        watermark.style.borderRadius = '5px';
        watermark.style.fontSize = '12px';
        watermark.style.color = 'rgba(255, 255, 255, 0.7)';
        watermark.style.zIndex = '1000';
        document.body.appendChild(watermark);
    }
    
    // Add Android-specific meta tags for better mobile experience
    function addAndroidMetaTags() {
        // Add theme-color meta tag if not present
        if (!document.querySelector('meta[name="theme-color"]')) {
            const themeColorMeta = document.createElement('meta');
            themeColorMeta.setAttribute('name', 'theme-color');
            themeColorMeta.setAttribute('content', '#ff5e62');
            document.head.appendChild(themeColorMeta);
        }
        
        // Add mobile-web-app-capable meta tag if not present
        if (!document.querySelector('meta[name="mobile-web-app-capable"]')) {
            const webAppMeta = document.createElement('meta');
            webAppMeta.setAttribute('name', 'mobile-web-app-capable');
            webAppMeta.setAttribute('content', 'yes');
            document.head.appendChild(webAppMeta);
        }
    }
    
    // Optimize touch interactions for Android
    function optimizeTouchInteractions() {
        // Add touch feedback to buttons and links
        const interactiveElements = document.querySelectorAll('button, a, .item, .section, .card-btn, .document-card');
        interactiveElements.forEach(element => {
            // Remove any existing listeners to prevent duplicates
            element.removeEventListener('touchstart', touchStartHandler);
            element.removeEventListener('touchend', touchEndHandler);
            element.removeEventListener('touchcancel', touchEndHandler);
            
            // Add the event listeners
            element.addEventListener('touchstart', touchStartHandler);
            element.addEventListener('touchend', touchEndHandler);
            element.addEventListener('touchcancel', touchEndHandler);
        });
        
        // Fix any double-tap zoom issues
        const zoomDisableStyle = document.createElement('style');
        zoomDisableStyle.innerHTML = `
            a, button, .card-btn, .document-card {
                touch-action: manipulation;
            }
        `;
        document.head.appendChild(zoomDisableStyle);
        
        // Improve scrolling performance
        document.body.style.webkitOverflowScrolling = 'touch';
    }
    
    // Touch event handlers
    function touchStartHandler() {
        this.style.opacity = '0.7';
        this.style.transform = 'scale(0.98)';
    }
    
    function touchEndHandler() {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
    }
    
    // Initialize the UI
    initializeUI();
    
    // Handle window resize and orientation changes
    window.addEventListener('resize', function() {
        // Reinitialize UI on resize to handle orientation changes
        initializeUI();
    });
    
    // Handle orientation change specifically
    window.addEventListener('orientationchange', function() {
        // Reinitialize UI on orientation change
        setTimeout(initializeUI, 100); // Small delay to ensure DOM is updated
    });
});
