// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Created by Sejed TRABELLSSI | sejed.pages.dev', 'background: #3a6ea5; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Elements
    const pdfObject = document.getElementById('pdf-object');
    const loadingIndicator = document.getElementById('loading-indicator');
    const androidMessage = document.getElementById('android-message');
    const mobileMessage = document.getElementById('mobile-message');
    const desktopExperience = document.getElementById('desktop-experience');
    
    // PDF Control Buttons
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomResetBtn = document.getElementById('zoom-reset-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const printBtn = document.getElementById('print-btn');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');
    const totalPagesSpan = document.getElementById('total-pages');
    
    // State variables
    let currentZoom = 100;
    let currentPage = 1;
    let totalPages = 0;
    let pdfDoc = null;
    
    // Device detection
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    
    function isMobile() {
        return window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
    
    // Initialize the UI based on device
    function initializeUI() {
        if (isAndroid()) {
            // Show Android-specific message
            androidMessage.style.display = 'block';
            desktopExperience.style.display = 'none';
            
            // Add watermark for Android
            addWatermark();
        } else if (isMobile()) {
            // Show mobile message for non-Android mobile devices
            mobileMessage.style.display = 'block';
            desktopExperience.style.display = 'block';
            
            // Add watermark for mobile
            addWatermark();
        } else {
            // Desktop experience
            desktopExperience.style.display = 'flex';
            
            // Initialize PDF viewer features
            initializePdfViewer();
        }
    }
    
    // Add watermark
    function addWatermark() {
        const watermark = document.createElement('div');
        watermark.className = 'watermark';
        watermark.innerHTML = 'Created by <a href="https://sejed.pages.dev" target="_blank">Sejed TRABELLSSI</a>';
        document.body.appendChild(watermark);
    }
    
    // Initialize PDF viewer
    function initializePdfViewer() {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        // Wait for PDF to load
        pdfObject.addEventListener('load', function() {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            
            // Try to get the PDF document from the object
            try {
                // This is a simplified approach - actual PDF.js implementation would be more robust
                setTimeout(function() {
                    // Set default values for demonstration
                    currentPage = 1;
                    totalPages = 10; // This would normally come from the PDF itself
                    updatePageInfo();
                    
                    // Enable controls
                    enableControls();
                }, 1000);
            } catch (error) {
                console.error('Error loading PDF:', error);
            }
        });
    }
    
    // Update page information
    function updatePageInfo() {
        if (currentPageSpan && totalPagesSpan) {
            currentPageSpan.textContent = currentPage;
            totalPagesSpan.textContent = totalPages;
        }
    }
    
    // Enable controls
    function enableControls() {
        // Zoom controls
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function() {
                zoomIn();
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function() {
                zoomOut();
            });
        }
        
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', function() {
                resetZoom();
            });
        }
        
        // Page navigation
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function() {
                goToPreviousPage();
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                goToNextPage();
            });
        }
        
        // Fullscreen
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                toggleFullscreen();
            });
        }
        
        // Print
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                printPdf();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
    
    // Zoom functions
    function zoomIn() {
        if (currentZoom < 200) {
            currentZoom += 25;
            applyZoom();
        }
    }
    
    function zoomOut() {
        if (currentZoom > 50) {
            currentZoom -= 25;
            applyZoom();
        }
    }
    
    function resetZoom() {
        currentZoom = 100;
        applyZoom();
    }
    
    function applyZoom() {
        if (pdfObject) {
            pdfObject.style.transform = `scale(${currentZoom / 100})`;
            pdfObject.style.transformOrigin = 'center top';
        }
    }
    
    // Page navigation functions
    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            updatePageInfo();
            // In a real implementation, you would use PDF.js to change pages
        }
    }
    
    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            updatePageInfo();
            // In a real implementation, you would use PDF.js to change pages
        }
    }
    
    // Fullscreen toggle
    function toggleFullscreen() {
        const container = document.querySelector('.container');
        
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i><span>Exit Fullscreen</span>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i><span>Fullscreen</span>';
        }
    }
    
    // Print PDF
    function printPdf() {
        if (pdfObject) {
            // Create a temporary iframe to print just the PDF
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = pdfObject.data;
            document.body.appendChild(iframe);
            
            iframe.onload = function() {
                iframe.contentWindow.print();
                // Remove the iframe after printing
                setTimeout(function() {
                    document.body.removeChild(iframe);
                }, 1000);
            };
        }
    }
    
    // Handle keyboard shortcuts
    function handleKeyboardShortcuts(event) {
        // Only process shortcuts if not in Android mode
        if (androidMessage.style.display === 'none') {
            switch (event.key) {
                case 'ArrowLeft':
                    goToPreviousPage();
                    break;
                case 'ArrowRight':
                    goToNextPage();
                    break;
                case '+':
                case '=': // For keyboards where + requires shift
                    zoomIn();
                    break;
                case '-':
                    zoomOut();
                    break;
                case '0':
                    resetZoom();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'p':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        printPdf();
                    }
                    break;
            }
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Reinitialize UI on resize to handle orientation changes
        initializeUI();
    });
    
    // Initialize the UI
    initializeUI();
});
