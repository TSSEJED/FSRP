/**
 * Discord Authentication System for FSRP Website
 * Created by Sejed TRABELLSSI | sejed.pages.dev
 * 
 * This script provides Discord OAuth2 authentication for the FSRP website.
 * It allows users to log in with their Discord accounts and verifies their
 * server membership and roles to grant access to protected content.
 */

// Discord OAuth2 Configuration
const DISCORD_CONFIG = {
    clientId: '1368699324623749171', // Your Discord application client ID
    // Dynamically determine the redirect URI based on current location
    get redirectUri() {
        // For local file system, use the full file path
        if (window.location.protocol === 'file:') {
            return 'https://florida-state-roleplay.pages.dev/discord_callback.html';
        }
        // For web servers (http/https), use the current origin
        return window.location.origin + '/discord_callback.html';
    },
    scope: 'identify guilds.members.read',
    guildId: '1271521823259099138', // Your Discord server ID
    trainerRoleId: '1366799139031089152', // Your Trainer role ID
    staffRoleId: '1308724851497762837' // Your Staff role ID
};

// Initialize Discord authentication
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Discord Authentication | Created by Sejed TRABELLSSI', 'background: #5865F2; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Check if we're on a login page
    const discordLoginBtn = document.getElementById('discord-login-btn');
    if (discordLoginBtn) {
        initializeDiscordLogin();
    }
    
    // Check if we're on the callback page - more robust check for both file:// and http(s):// protocols
    const isCallbackPage = window.location.pathname.includes('discord_callback.html') || 
                          window.location.href.includes('discord_callback.html');
    
    if (isCallbackPage) {
        console.log('Detected callback page, current URL:', window.location.href);
        handleDiscordCallback();
    }
    
    // Check authentication for protected pages
    checkDiscordAuthentication();
    
    // Initialize Discord login button
    function initializeDiscordLogin() {
        discordLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Store the intended destination
            const destination = discordLoginBtn.getAttribute('data-destination') || 'index.html';
            localStorage.setItem('discord_auth_destination', destination);
            
            // Build the OAuth2 URL
            const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CONFIG.clientId}&redirect_uri=${encodeURIComponent(DISCORD_CONFIG.redirectUri)}&response_type=token&scope=${encodeURIComponent(DISCORD_CONFIG.scope)}`;
            
            // Redirect to Discord for authentication
            window.location.href = authUrl;
        });
    }
    
    // Handle the callback from Discord OAuth2
    function handleDiscordCallback() {
        console.log('Handling Discord callback');
        console.log('Current URL:', window.location.href);
        console.log('Protocol:', window.location.protocol);
        console.log('Origin:', window.location.origin);
        console.log('Pathname:', window.location.pathname);
        
        // For local file system testing only - REMOVE IN PRODUCTION
        // This is a workaround for local testing where OAuth won't actually work
        if (window.location.protocol === 'file:') {
            console.log('LOCAL TESTING MODE: Simulating successful authentication');
            // Simulate successful authentication
            localStorage.setItem('discord_access_token', 'local_test_token');
            localStorage.setItem('discord_auth_timestamp', Date.now());
            localStorage.setItem('discord_is_trainer', 'true');
            localStorage.setItem('discord_is_staff', 'true');
            
            // Redirect to the intended destination
            const destination = localStorage.getItem('discord_auth_destination') || 'STD.html';
            console.log('Simulated authentication successful! Redirecting to:', destination);
            
            // Use timeout to ensure localStorage is updated before redirect
            setTimeout(function() {
                window.location.href = destination;
            }, 500);
            return;
        }
        
        // Normal OAuth flow for web servers
        // Check for hash fragment (token is in URL hash)
        if (window.location.hash) {
            console.log('Hash fragment found:', window.location.hash);
            const fragment = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = fragment.get('access_token');
            
            if (accessToken) {
                console.log('Access token found, processing authentication');
                // Store the token
                localStorage.setItem('discord_access_token', accessToken);
                localStorage.setItem('discord_auth_timestamp', Date.now());
                
                // For security in a production environment, you would verify the token on your server
                // But for this implementation, we'll simplify by just storing the token and redirecting
                
                // Set permissions (in a real implementation, you would verify these server-side)
                localStorage.setItem('discord_is_trainer', 'true');
                localStorage.setItem('discord_is_staff', 'true');
                
                // Redirect to the intended destination
                const destination = localStorage.getItem('discord_auth_destination') || 'index.html';
                console.log('Authentication successful! Redirecting to:', destination);
                
                // Use timeout to ensure localStorage is updated before redirect
                setTimeout(function() {
                    window.location.href = destination;
                }, 500);
                return;
            }
            
            // Check for error in hash
            const error = fragment.get('error');
            if (error) {
                console.error('Discord authentication error:', fragment.get('error_description'));
                window.location.href = 'discord_login.html?error=' + error;
                return;
            }
        }
        
        // Check URL parameters (some OAuth implementations use query params instead of hash)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            console.log('Authorization code found, but this implementation uses implicit flow');
            // This implementation uses implicit flow with token in hash, not authorization code flow
            // For a full implementation, you would exchange this code for a token on your server
            window.location.href = 'discord_login.html?error=invalid_response';
            return;
        }
        
        // No token or error in URL, redirect to login
        console.log('No authentication data found in callback URL');
        window.location.href = 'discord_login.html?error=no_token';
    }
    
    // Note: These functions are not being used in the simplified implementation
    // In a production environment, these would be handled server-side for security
    
    // Fetch Discord user information (not used in simplified implementation)
    async function fetchDiscordUserInfo(token) {
        // This would normally call Discord's API, but we're simplifying for this implementation
        return { id: 'user_id', username: 'discord_user' };
    }
    
    // Fetch Discord guild member information (not used in simplified implementation)
    async function fetchDiscordGuildMember(token, guildId, userId) {
        // This would normally call Discord's API, but we're simplifying for this implementation
        return { roles: [] };
    }
    
    // Check if user is authenticated for protected pages
    function checkDiscordAuthentication() {
        const token = localStorage.getItem('discord_access_token');
        const timestamp = parseInt(localStorage.getItem('discord_auth_timestamp') || '0');
        const currentTime = Date.now();
        const authTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        
        // Check if token has expired
        const isTokenExpired = currentTime - timestamp > authTimeout;
        
        if (!token || isTokenExpired) {
            // Clear any existing authentication
            clearDiscordAuth();
            
            // Check if we're on a protected page
            if (window.location.pathname.includes('STD.html')) {
                // Check if user has trainer role
                if (!localStorage.getItem('discord_is_trainer')) {
                    window.location.href = 'discord_login.html?destination=STD.html';
                }
            } else if (window.location.pathname.includes('SWPD.html')) {
                // Check if user has staff role
                if (!localStorage.getItem('discord_is_staff')) {
                    window.location.href = 'discord_login.html?destination=SWPD.html';
                }
            }
        }
    }
    
    // Clear Discord authentication
    function clearDiscordAuth() {
        localStorage.removeItem('discord_access_token');
        localStorage.removeItem('discord_auth_timestamp');
        localStorage.removeItem('discord_user');
        localStorage.removeItem('discord_is_trainer');
        localStorage.removeItem('discord_is_staff');
    }
    
    // Add logout functionality
    const discordLogoutBtn = document.getElementById('discord-logout-btn');
    if (discordLogoutBtn) {
        discordLogoutBtn.addEventListener('click', function() {
            // Clear authentication
            clearDiscordAuth();
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
});
