/**
 * Coming Soon Page Authentication Script
 * Created by Sejed TRABELLSSI | sejed.pages.dev
 * 
 * This script provides authentication functionality for the coming soon page,
 * with special handling for Android users requiring passcode verification.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Coming Soon Authentication | Created by Sejed TRABELLSSI', 'background: #4361ee; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Device detection function
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    // Check if user has already accessed the site
    // For Android users, we'll always require the passcode
    if (localStorage.getItem('fsrp_access') === 'granted' && !isAndroid()) {
        window.location.href = 'index.html';
        return;
    }
    
    const accessForm = document.getElementById('access-form');
    const errorMessage = document.getElementById('error-message');
    const comingSoonTitle = document.querySelector('.coming-soon-title');
    const comingSoonSubtitle = document.querySelector('.coming-soon-subtitle');
    
    // Update UI for Android users
    if (isAndroid()) {
        comingSoonTitle.textContent = 'Secure Access Required';
        comingSoonSubtitle.textContent = 'Please enter the passcode to access the Florida State Roleplay portal.';
        document.querySelector('label[for="access-code"]').textContent = 'Passcode';
        
        // Add Android-specific styling
        document.querySelector('.coming-soon-icon i').className = 'fas fa-lock';
        
        // Force show the form for Android users even if they've accessed before
        document.querySelector('.coming-soon-card').style.display = 'block';
    }
    
    if (accessForm) {
        accessForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const accessCode = document.getElementById('access-code').value.trim().toLowerCase();
            const correctCode = 'sejed'; // Case-insensitive access code
            
            if (accessCode === correctCode) {
                // Grant access and store in localStorage
                localStorage.setItem('fsrp_access', 'granted');
                
                // For Android users, we'll set a session-based flag
                if (isAndroid()) {
                    sessionStorage.setItem('android_auth', 'true');
                    sessionStorage.setItem('android_auth_timestamp', Date.now());
                }
                
                // Redirect to the main site
                window.location.href = 'index.html';
            } else {
                // Show error message
                errorMessage.classList.add('show');
                
                // Clear the input field
                document.getElementById('access-code').value = '';
                
                // Focus on the input field
                document.getElementById('access-code').focus();
                
                // Remove the error message after 3 seconds
                setTimeout(function() {
                    errorMessage.classList.remove('show');
                }, 3000);
            }
        });
    }
});
