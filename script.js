document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const pdfEmbed = document.getElementById('pdf-embed');
    const pdfIframe = document.getElementById('pdf-iframe');
    const currentDocumentTitle = document.getElementById('current-document-title');
    const themeToggle = document.querySelector('.theme-toggle');
    const closeButton = document.getElementById('close-pdf');
    const viewButtons = document.querySelectorAll('.view-btn');
    const quickAccessButtons = document.querySelectorAll('.quick-access-btn');
    const fullTrainingBtn = document.getElementById('full-training-btn');
    const warningPolicyBtn = document.getElementById('warning-policy-btn');
    const trainerInfoBtn = document.getElementById('trainer-info-btn');
    const trainerInfoQuickBtn = document.getElementById('trainer-info-quick-btn');
    const joinGameBtn = document.getElementById('join-game-btn');
    const openInBrowserLink = document.getElementById('open-in-browser');
    
    // Theme Management
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const toggleBall = document.querySelector('.toggle-ball');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            toggleBall.style.transform = 'translateX(30px)';
        } else {
            toggleBall.style.transform = 'translateX(0)';
        }
    }
    
    // Initialize theme
    initTheme();
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        
        // Update the toggle ball position
        const toggleBall = document.querySelector('.toggle-ball');
        if (document.body.classList.contains('dark-mode')) {
            toggleBall.style.transform = 'translateX(30px)';
        } else {
            toggleBall.style.transform = 'translateX(0)';
        }
    });
    
    // Check if device is mobile
    function isMobileDevice() {
        return (window.innerWidth <= 768) || 
               (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
    
    // Helper function to resolve relative PDF paths to absolute URLs
    function getAbsolutePdfPath(relativePath) {
        // Get the base URL of the current page (without the filename)
        const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        
        // If the path starts with '../', go up one directory
        if (relativePath.startsWith('../')) {
            // Remove the '../' and go up one directory in the baseUrl
            const parentBaseUrl = baseUrl.substring(0, baseUrl.slice(0, -1).lastIndexOf('/') + 1);
            
            // Get the filename part and properly encode it
            const pathWithoutPrefix = relativePath.substring(3);
            const lastSlashIndex = pathWithoutPrefix.lastIndexOf('/');
            
            if (lastSlashIndex !== -1) {
                // If there are subdirectories in the path
                const directory = pathWithoutPrefix.substring(0, lastSlashIndex + 1);
                const filename = pathWithoutPrefix.substring(lastSlashIndex + 1);
                return parentBaseUrl + directory + encodeURIComponent(filename);
            } else {
                // If it's just a filename
                return parentBaseUrl + encodeURIComponent(pathWithoutPrefix);
            }
        }
        
        // Otherwise, just join the base URL and the properly encoded relative path
        return baseUrl + encodeURIComponent(relativePath);
    }
    
    // PDF Viewing Functions
    function openPdfViewer(pdfUrl, title) {
        
        // For other PDF links
        // Get the absolute path to the PDF
        const absolutePdfUrl = getAbsolutePdfPath(pdfUrl);
        
        // For mobile devices, open PDF directly in a new tab
        if (isMobileDevice()) {
            window.open(absolutePdfUrl, '_blank');
            return;
        }
        
        // For desktop devices, continue with the embedded viewer
        // Set the title in the viewer
        currentDocumentTitle.textContent = title;
        
        // Show the PDF viewer
        pdfEmbed.classList.remove('hidden');
        
        // Set iframe source to the PDF
        // Make sure we're using the correct path format with proper encoding
        try {
            // Always use the absolute URL for PDFs when in the iframe
            // This ensures it works both locally and when hosted online
            pdfIframe.src = absolutePdfUrl;
            
            // For debugging
            console.log('Setting PDF iframe source to:', absolutePdfUrl);
        } catch (error) {
            console.error('Error setting PDF iframe source:', error);
            alert('There was an error loading the PDF. Please try again.');
        }
        
        // Update the 'Open in Browser' link
        if (openInBrowserLink) {
            openInBrowserLink.href = absolutePdfUrl;
        }
        
        console.log('Opening PDF:', absolutePdfUrl);
    }

    // Add click listeners to view buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pdfUrl = button.getAttribute('data-pdf');
            const title = button.getAttribute('data-title');
            
            if (pdfUrl && title) {
                openPdfViewer(pdfUrl, title);
            }
        });
    });
    
    // Close PDF viewer
    closeButton.addEventListener('click', () => {
        pdfEmbed.classList.add('hidden');
        pdfIframe.src = '';
    });
    
    // Quick access buttons
    fullTrainingBtn.addEventListener('click', () => {
        const pdfUrl = fullTrainingBtn.getAttribute('data-pdf');
        const title = fullTrainingBtn.getAttribute('data-title');
        if (pdfUrl && title) {
            openPdfViewer(pdfUrl, title);
        }
    });
    
    warningPolicyBtn.addEventListener('click', () => {
        const pdfUrl = warningPolicyBtn.getAttribute('data-pdf');
        const title = warningPolicyBtn.getAttribute('data-title');
        if (pdfUrl && title) {
            openPdfViewer(pdfUrl, title);
        }
    });
    
    // Trainer Info button functionality
    if (trainerInfoBtn) {
        trainerInfoBtn.addEventListener('click', () => {
            const pdfUrl = trainerInfoBtn.getAttribute('data-pdf');
            const title = trainerInfoBtn.getAttribute('data-title');
            if (pdfUrl && title) {
                openPdfViewer(pdfUrl, title);
            }
        });
    }
    
    // Trainer Info quick access button
    if (trainerInfoQuickBtn) {
        trainerInfoQuickBtn.addEventListener('click', () => {
            const pdfUrl = trainerInfoQuickBtn.getAttribute('data-pdf');
            const title = trainerInfoQuickBtn.getAttribute('data-title');
            if (pdfUrl && title) {
                openPdfViewer(pdfUrl, title);
            }
        });
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (pdfEmbed.classList.contains('hidden')) return;
        
        if (e.key === 'Escape') {
            pdfEmbed.classList.add('hidden');
            pdfIframe.src = '';
        }
    });

    // Join Game button functionality
    joinGameBtn.addEventListener('click', () => {
        window.open('https://policeroleplay.community/join/AebBj', '_blank');
    });

    // Console Branding
    console.log('%cFSRP Trainers Portal', 'color: #3a86ff; font-size: 20px; font-weight: bold;');
    console.log('%cDesigned by Sejed TRABELLSSI | sejed.pages.dev', 'color: #8338ec; font-size: 12px;');
    
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable keyboard shortcuts for saving, printing, etc.
    document.addEventListener('keydown', function(e) {
        // Prevent Ctrl+S, Ctrl+P, Ctrl+Shift+I
        if ((e.ctrlKey && e.key === 's') || 
            (e.ctrlKey && e.key === 'p') || 
            (e.ctrlKey && e.shiftKey && e.key === 'i')) {
            e.preventDefault();
            return false;
        }
    });
});
