/**
 * FSRP Access Control Script
 * Created by Sejed TRABELLSSI | sejed.pages.dev
 * 
 * This script redirects users to the coming_soon.html page
 * unless they have entered the correct access code.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if the current page is already the coming soon page
    if (window.location.pathname.includes('coming_soon.html')) {
        return; // Don't redirect if already on the coming soon page
    }
    
    // Check if user has already accessed the site
    if (localStorage.getItem('fsrp_access') !== 'granted') {
        // Redirect to coming soon page
        window.location.href = 'coming_soon.html';
    }
});
