/**
 * Android Authentication Check Script
 * Created by Sejed TRABELLSSI | sejed.pages.dev
 * 
 * This script checks if Android users have authenticated with a passcode
 * before allowing access to the main site. If not, they are redirected
 * to the coming soon page to enter the passcode.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Android Auth Check | Created by Sejed TRABELLSSI', 'background: #4361ee; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Device detection function
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    
    // Only apply this check for Android devices
    if (isAndroid()) {
        // Check if we're on the coming soon page (to avoid redirect loop)
        if (window.location.pathname.includes('coming_soon.html')) {
            return;
        }
        
        // Check if Android user has authenticated this session
        const isAuthenticated = sessionStorage.getItem('android_auth') === 'true';
        const authTimestamp = parseInt(sessionStorage.getItem('android_auth_timestamp') || '0');
        const currentTime = Date.now();
        const authTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        // Check if authentication has expired
        const isAuthExpired = currentTime - authTimestamp > authTimeout;
        
        // If not authenticated or auth expired, redirect to coming soon page
        if (!isAuthenticated || isAuthExpired) {
            // Clear any existing authentication
            sessionStorage.removeItem('android_auth');
            sessionStorage.removeItem('android_auth_timestamp');
            
            // Redirect to coming soon page
            window.location.href = 'coming_soon.html';
        }
    }
});
