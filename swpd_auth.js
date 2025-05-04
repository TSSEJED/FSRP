// Authentication script for SWPD Document Portal
// Created by Sejed TRABELLSSI | sejed.pages.dev

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c SWPD Authentication System | Created by Sejed TRABELLSSI', 'background: #3a6ea5; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Check if we're on the login page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        initializeLoginPage();
    } else {
        // For protected pages (SWPD.html)
        checkAuthentication();
    }
    
    // Initialize login page functionality
    function initializeLoginPage() {
        const errorMessage = document.getElementById('error-message');
        
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const passcode = document.getElementById('passcode').value.trim().toLowerCase();
            const correctPasscode = "staff"; // The required passcode (case-insensitive)
            
            if (passcode === correctPasscode) {
                // Set authentication in session storage
                sessionStorage.setItem('swpd_authenticated', 'true');
                sessionStorage.setItem('swpd_authTimestamp', Date.now());
                
                // Redirect to the protected page
                window.location.href = 'SWPD.html';
            } else {
                // Show error message with animation
                errorMessage.classList.add('show');
                
                // Clear the input field
                document.getElementById('passcode').value = '';
                
                // Focus on the input field
                document.getElementById('passcode').focus();
                
                // Remove the error message after 3 seconds
                setTimeout(function() {
                    errorMessage.classList.remove('show');
                }, 3000);
            }
        });
    }
    
    // Check if user is authenticated
    function checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem('swpd_authenticated') === 'true';
        const authTimestamp = parseInt(sessionStorage.getItem('swpd_authTimestamp') || '0');
        const currentTime = Date.now();
        const authTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        // Check if authentication has expired
        const isAuthExpired = currentTime - authTimestamp > authTimeout;
        
        // If we're on SWPD.html and not authenticated or auth expired, redirect to login
        if (window.location.pathname.includes('SWPD.html') && (!isAuthenticated || isAuthExpired)) {
            // Clear any existing authentication
            sessionStorage.removeItem('swpd_authenticated');
            sessionStorage.removeItem('swpd_authTimestamp');
            
            // Redirect to login page
            window.location.href = 'swpd_login.html';
        }
    }
    
    // Add logout functionality
    const logoutBtn = document.getElementById('swpd-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear authentication
            sessionStorage.removeItem('swpd_authenticated');
            sessionStorage.removeItem('swpd_authTimestamp');
            
            // Redirect to login page
            window.location.href = 'swpd_login.html';
        });
    }
});
