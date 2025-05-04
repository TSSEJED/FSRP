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
    const mobileMessage = document.querySelector('.mobile-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Variables for PDF viewer
    let currentScale = 1;
    const scaleStep = 0.25;
    const maxScale = 3;
    const minScale = 0.5;
    
    // Add watermark with creator info
    function addWatermark() {
        const watermark = document.createElement('div');
        watermark.className = 'watermark';
        watermark.innerHTML = `Created by Sejed TRABELLSSI | <a href="https://sejed.pages.dev" target="_blank">sejed.pages.dev</a>`;
        
        // Style the watermark
        watermark.style.position = 'fixed';
        watermark.style.bottom = '5px';
        watermark.style.right = '10px';
        watermark.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        watermark.style.color = 'white';
        watermark.style.padding = '5px 10px';
        watermark.style.borderRadius = '4px';
        watermark.style.fontSize = '12px';
        watermark.style.zIndex = '1000';
        watermark.style.opacity = '0.7';
        watermark.style.transition = 'opacity 0.3s';
        
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
    
    // Show mobile message on small screens
    function checkMobileView() {
        if (window.innerWidth <= 768) {
            mobileMessage.style.display = 'block';
        } else {
            mobileMessage.style.display = 'none';
        }
    }
    
    // Initial check for mobile view
    checkMobileView();
    
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
            // The fallback message will be shown automatically by the object tag
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
        checkMobileView();
    });
    
    // Add fallback for browsers that don't support embedded PDFs
    if (pdfObject) {
        pdfObject.addEventListener('error', function() {
            const fallbackMessage = document.createElement('div');
            fallbackMessage.className = 'fallback-message';
            fallbackMessage.innerHTML = `
                <div style="text-align: center; padding: 30px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; color: #721c24; margin: 20px 0;">
                    <h3>PDF Viewer Not Available</h3>
                    <p>Your browser doesn't support embedded PDFs or the PDF failed to load.</p>
                    <p>Please <a href="Full staff training document.pdf" download style="color: #721c24; font-weight: bold;">download the PDF</a> to view it.</p>
                    <p><small>Created by Sejed TRABELLSSI</small></p>
                </div>
            `;
            pdfObject.parentNode.replaceChild(fallbackMessage, pdfObject);
        });
    }
    
    // Add console signature
    console.log('%c Created by Sejed TRABELLSSI | https://sejed.pages.dev ', 
                'background: #3a6ea5; color: white; padding: 5px; border-radius: 3px; font-weight: bold;');
});
