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
    redirectUri: 'https://florida-state-roleplay.pages.dev/discord_callback.html', // Live website URL
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
    
    // Check if we're on the callback page
    if (window.location.pathname.includes('discord_callback.html')) {
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
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get('access_token');
        
        if (accessToken) {
            // Store the token
            localStorage.setItem('discord_access_token', accessToken);
            localStorage.setItem('discord_auth_timestamp', Date.now());
            
            // Fetch user information and verify roles
            fetchDiscordUserInfo(accessToken)
                .then(userData => {
                    // Store user info
                    localStorage.setItem('discord_user', JSON.stringify(userData));
                    
                    // Check guild membership and roles
                    return fetchDiscordGuildMember(accessToken, DISCORD_CONFIG.guildId, userData.id);
                })
                .then(memberData => {
                    // Check roles and set appropriate permissions
                    const roles = memberData.roles || [];
                    
                    if (roles.includes(DISCORD_CONFIG.trainerRoleId)) {
                        localStorage.setItem('discord_is_trainer', 'true');
                    }
                    
                    if (roles.includes(DISCORD_CONFIG.staffRoleId)) {
                        localStorage.setItem('discord_is_staff', 'true');
                    }
                    
                    // Redirect to the intended destination
                    const destination = localStorage.getItem('discord_auth_destination') || 'index.html';
                    window.location.href = destination;
                })
                .catch(error => {
                    console.error('Discord authentication error:', error);
                    // Redirect to error page or login page
                    window.location.href = 'discord_login.html?error=auth_failed';
                });
        } else if (fragment.get('error')) {
            // Handle error
            console.error('Discord authentication error:', fragment.get('error_description'));
            window.location.href = 'discord_login.html?error=' + fragment.get('error');
        }
    }
    
    // Fetch Discord user information
    async function fetchDiscordUserInfo(token) {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch Discord user info');
        }
        
        return response.json();
    }
    
    // Fetch Discord guild member information
    async function fetchDiscordGuildMember(token, guildId, userId) {
        const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch Discord guild member info');
        }
        
        return response.json();
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
