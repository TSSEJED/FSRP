// Authentication script for Document Portal
// Created by Sejed TRABELLSSI | sejed.pages.dev

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Authentication System | Created by Sejed TRABELLSSI', 'background: #3a6ea5; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Check if we're on the login page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        initializeLoginPage();
    } else {
        // For protected pages (STD.html)
        checkAuthentication();
    }
    
    // Initialize login page functionality
    function initializeLoginPage() {
        const errorMessage = document.getElementById('error-message');
        
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const passcode = document.getElementById('passcode').value.trim().toLowerCase();
            const correctPasscode = "trainer"; // The required passcode (case-insensitive)
            
            if (passcode === correctPasscode) {
                // Set authentication in session storage
                sessionStorage.setItem('authenticated', 'true');
                sessionStorage.setItem('authTimestamp', Date.now());
                
                // Redirect to the protected page
                window.location.href = 'STD.html';
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
        const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
        const authTimestamp = parseInt(sessionStorage.getItem('authTimestamp') || '0');
        const currentTime = Date.now();
        const authTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        // Check if authentication has expired
        const isAuthExpired = currentTime - authTimestamp > authTimeout;
        
        // If we're on STD.html and not authenticated or auth expired, redirect to login
        if (window.location.pathname.includes('STD.html') && (!isAuthenticated || isAuthExpired)) {
            // Clear any existing authentication
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('authTimestamp');
            
            // Redirect to login page
            window.location.href = 'login.html';
        }
    }
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear authentication
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('authTimestamp');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
});
