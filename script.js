// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to elements
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const printBtn = document.getElementById('print-btn');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    const pdfObject = document.getElementById('pdf-object');
    const mobileMessage = document.getElementById('mobile-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    const pdfFallbackContainer = document.getElementById('pdf-fallback-container');
    const desktopControls = document.getElementById('desktop-controls');
    const pdfControls = document.getElementById('pdf-controls');
    
    // Variables for PDF viewer
    let currentScale = 1;
    const scaleStep = 0.25;
    const maxScale = 3;
    const minScale = 0.5;
    
    // Detect if device is Android
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    
    // Detect if device is iOS
    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }
    
    // Detect if device is mobile
    function isMobile() {
        return isAndroid() || isIOS() || window.innerWidth <= 768;
    }
    
    // Handle mobile devices specifically for PDF viewing
    function handleMobileDevice() {
        if (isMobile()) {
            mobileMessage.style.display = 'block';
            
            // For Android devices, which often have issues with embedded PDFs
            if (isAndroid()) {
                // Hide the PDF object and show the fallback container
                if (pdfObject) {
                    pdfObject.style.display = 'none';
                }
                if (pdfFallbackContainer) {
                    pdfFallbackContainer.style.display = 'block';
                }
                if (pdfControls) {
                    pdfControls.style.display = 'none';
                }
            }
        } else {
            mobileMessage.style.display = 'none';
            if (pdfObject) {
                pdfObject.style.display = 'block';
            }
            if (pdfFallbackContainer) {
                pdfFallbackContainer.style.display = 'none';
            }
            if (pdfControls) {
                pdfControls.style.display = 'block';
            }
        }
    }
    
    // Initial check for mobile device
    handleMobileDevice();
    
    // Add watermark with creator info
    function addWatermark() {
        const watermark = document.createElement('div');
        watermark.className = 'watermark';
        watermark.innerHTML = `Created by Sejed TRABELLSSI | <a href="https://sejed.pages.dev" target="_blank">sejed.pages.dev</a>`;
        
        // Style the link
        const link = watermark.querySelector('a');
        if (link) {
            link.style.color = 'white';
            link.style.textDecoration = 'underline';
        }
        
        // Add hover effect
        watermark.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        
        watermark.addEventListener('mouseleave', function() {
            this.style.opacity = '0.7';
        });
        
        document.body.appendChild(watermark);
    }
    
    // Call the function to add watermark
    addWatermark();
    
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    
    // Hide loading indicator when PDF is loaded or on error
    if (pdfObject) {
        pdfObject.addEventListener('load', function() {
            loadingIndicator.style.display = 'none';
            
            // Try to access PDF document to get page info
            try {
                // This might not work in all browsers due to security restrictions
                if (pdfObject.contentDocument && pdfObject.contentDocument.getElementById('pageNumber')) {
                    const pageNumberEl = pdfObject.contentDocument.getElementById('pageNumber');
                    const numPagesEl = pdfObject.contentDocument.getElementById('numPages');
                    
                    if (pageNumberEl && numPagesEl) {
                        currentPageEl.textContent = pageNumberEl.value;
                        totalPagesEl.textContent = numPagesEl.textContent.replace('of ', '');
                    }
                }
            } catch (e) {
                console.log('Could not access PDF document properties:', e);
            }
        });
        
        pdfObject.addEventListener('error', function() {
            loadingIndicator.style.display = 'none';
            
            // Show fallback for PDF error
            if (pdfFallbackContainer) {
                pdfFallbackContainer.style.display = 'block';
            }
            if (pdfObject) {
                pdfObject.style.display = 'none';
            }
            if (pdfControls) {
                pdfControls.style.display = 'none';
            }
        });
    }
    
    // Fullscreen functionality
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            if (pdfObject) {
                if (pdfObject.requestFullscreen) {
                    pdfObject.requestFullscreen();
                } else if (pdfObject.webkitRequestFullscreen) { /* Safari */
                    pdfObject.webkitRequestFullscreen();
                } else if (pdfObject.msRequestFullscreen) { /* IE11 */
                    pdfObject.msRequestFullscreen();
                }
            }
        });
    }
    
    // Print functionality
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.open('Full staff training document.pdf', '_blank').print();
        });
    }
    
    // Zoom in functionality
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            if (currentScale < maxScale) {
                currentScale += scaleStep;
                applyZoom();
            }
        });
    }
    
    // Zoom out functionality
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            if (currentScale > minScale) {
                currentScale -= scaleStep;
                applyZoom();
            }
        });
    }
    
    // Apply zoom to PDF object
    function applyZoom() {
        if (pdfObject) {
            // For browsers that support CSS transform
            pdfObject.style.transform = `scale(${currentScale})`;
            pdfObject.style.transformOrigin = 'center top';
            
            // For browsers that don't support transform, try to access PDF viewer controls
            try {
                if (pdfObject.contentDocument && pdfObject.contentDocument.getElementById('scaleSelect')) {
                    const scaleSelect = pdfObject.contentDocument.getElementById('scaleSelect');
                    // Find closest scale option
                    const scaleOptions = Array.from(scaleSelect.options).map(opt => parseFloat(opt.value) || 1);
                    const closestScale = scaleOptions.reduce((prev, curr) => {
                        return (Math.abs(curr - currentScale) < Math.abs(prev - currentScale) ? curr : prev);
                    });
                    scaleSelect.value = closestScale;
                    
                    // Trigger change event
                    const event = new Event('change');
                    scaleSelect.dispatchEvent(event);
                }
            } catch (e) {
                console.log('Could not access PDF viewer controls:', e);
            }
        }
    }
    
    // Page navigation
    if (prevPageBtn && nextPageBtn) {
        // Previous page
        prevPageBtn.addEventListener('click', function() {
            navigatePage(-1);
        });
        
        // Next page
        nextPageBtn.addEventListener('click', function() {
            navigatePage(1);
        });
    }
    
    // Navigate PDF pages
    function navigatePage(direction) {
        try {
            if (pdfObject.contentDocument) {
                // Try to find navigation buttons in the PDF viewer
                const prevButton = pdfObject.contentDocument.getElementById('previous');
                const nextButton = pdfObject.contentDocument.getElementById('next');
                
                if (direction < 0 && prevButton) {
                    prevButton.click();
                    updatePageInfo();
                } else if (direction > 0 && nextButton) {
                    nextButton.click();
                    updatePageInfo();
                }
            }
        } catch (e) {
            console.log('Could not navigate PDF pages:', e);
        }
    }
    
    // Update page information
    function updatePageInfo() {
        setTimeout(() => {
            try {
                if (pdfObject.contentDocument) {
                    const pageNumberEl = pdfObject.contentDocument.getElementById('pageNumber');
                    const numPagesEl = pdfObject.contentDocument.getElementById('numPages');
                    
                    if (pageNumberEl && numPagesEl) {
                        currentPageEl.textContent = pageNumberEl.value;
                        totalPagesEl.textContent = numPagesEl.textContent.replace('of ', '');
                    }
                }
            } catch (e) {
                console.log('Could not update page info:', e);
            }
        }, 100); // Small delay to allow PDF viewer to update
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Prevent default behavior for these keys
        if ([37, 39, 187, 189, 107, 109].includes(e.keyCode) && e.target === document.body) {
            e.preventDefault();
        }
        
        // Left arrow: previous page
        if (e.keyCode === 37 && e.target === document.body) {
            navigatePage(-1);
        }
        // Right arrow: next page
        else if (e.keyCode === 39 && e.target === document.body) {
            navigatePage(1);
        }
        // Plus or Equals with Shift: zoom in
        else if ((e.keyCode === 187 || e.keyCode === 107) && e.target === document.body) {
            if (currentScale < maxScale) {
                currentScale += scaleStep;
                applyZoom();
            }
        }
        // Minus: zoom out
        else if ((e.keyCode === 189 || e.keyCode === 109) && e.target === document.body) {
            if (currentScale > minScale) {
                currentScale -= scaleStep;
                applyZoom();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        handleMobileDevice();
    });
    
    // Add console signature
    console.log('%c Created by Sejed TRABELLSSI | https://sejed.pages.dev ', 
                'background: #3a6ea5; color: white; padding: 5px; border-radius: 3px; font-weight: bold;');
});
