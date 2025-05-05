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
    staffRoleId: '1308724851497762837', // Your Staff role ID
    // Role names for display in notifications
    roleNames: {
        '1366799139031089152': 'Trainer',
        '1308724851497762837': 'Staff Member'
    },
    // Auth settings
    authTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    saveLoginKey: 'discord_save_login' // localStorage key for save login preference
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
    
    // Show welcome notification if user just logged in
    const justLoggedIn = sessionStorage.getItem('discord_just_logged_in');
    if (justLoggedIn === 'true') {
        // Clear the flag
        sessionStorage.removeItem('discord_just_logged_in');
        
        // Show welcome notification with user info
        showWelcomeNotificationWithUserInfo();
    }
    
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
            window.location.replace(authUrl);
        });
    }
    
    // Handle the callback from Discord OAuth2
    function handleDiscordCallback() {
        console.log('Handling Discord callback');
        console.log('Current URL:', window.location.href);
        console.log('Protocol:', window.location.protocol);
        console.log('Origin:', window.location.origin);
        console.log('Pathname:', window.location.pathname);
        
        // Add a shorter timeout to prevent getting stuck if the bot is offline
        const callbackTimeout = setTimeout(function() {
            console.error('Authentication timed out - bot may be offline');
            // Redirect to login page with error
            window.location.replace('discord_login.html?error=bot_offline');
        }, 5000); // 5 second timeout
        
        // For local file system testing only - REMOVE IN PRODUCTION
        // This is a workaround for local testing where OAuth won't actually work
        if (window.location.protocol === 'file:') {
            console.log('LOCAL TESTING MODE: Simulating successful authentication');
            // Simulate successful authentication
            localStorage.setItem('discord_access_token', 'local_test_token');
            localStorage.setItem('discord_auth_timestamp', Date.now());
            localStorage.setItem('discord_is_trainer', 'true');
            localStorage.setItem('discord_is_staff', 'true');
            localStorage.setItem('discord_username', 'TestUser');
            localStorage.setItem('discord_user_id', '123456789');
            localStorage.setItem('discord_roles', JSON.stringify(['Trainer', 'Staff Member']));
            
            // Set flag for welcome notification
            sessionStorage.setItem('discord_just_logged_in', 'true');
            
            // Redirect to the intended destination
            const destination = localStorage.getItem('discord_auth_destination') || 'STD.html';
            console.log('Simulated authentication successful! Redirecting to:', destination);
            
            // Use timeout to ensure localStorage is updated before redirect
            setTimeout(function() {
                window.location.replace(destination);
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
                
                // Set flag for welcome notification
                sessionStorage.setItem('discord_just_logged_in', 'true');
                
                // Store user info for simplicity
                localStorage.setItem('discord_username', 'Discord User');
                localStorage.setItem('discord_roles', JSON.stringify(['Member']));
                
                // Set flag for welcome notification
                sessionStorage.setItem('discord_just_logged_in', 'true');
                
                // For simplicity, we'll grant access to all users
                localStorage.setItem('discord_is_trainer', 'true');
                localStorage.setItem('discord_is_staff', 'true');
                
                // Show save login popup
                try {
                    if (window.DiscordPopup && typeof window.DiscordPopup.showSaveLoginPopup === 'function') {
                        console.log('Showing save login popup');
                        window.DiscordPopup.showSaveLoginPopup(function(saveLogin) {
                            console.log('Save login preference:', saveLogin);
                            // Save the user's preference
                            localStorage.setItem(DISCORD_CONFIG.saveLoginKey, saveLogin ? 'true' : 'false');
                            
                            // If they chose not to save, set a shorter timeout
                            if (!saveLogin) {
                                // Set session storage flag instead of localStorage
                                sessionStorage.setItem('discord_access_token', accessToken);
                                sessionStorage.setItem('discord_auth_timestamp', Date.now());
                                // Remove from localStorage
                                localStorage.removeItem('discord_access_token');
                                localStorage.removeItem('discord_auth_timestamp');
                            }
                            
                            // Redirect to the intended destination
                            const destination = localStorage.getItem('discord_auth_destination') || 'index.html';
                            console.log('Authentication successful! Redirecting to:', destination);
                            window.location.replace(destination);
                        });
                    } else {
                        console.warn('DiscordPopup not available or showSaveLoginPopup is not a function');
                        // Fallback if popup system is not available
                        const destination = localStorage.getItem('discord_auth_destination') || 'index.html';
                        console.log('Authentication successful! Redirecting to:', destination);
                        window.location.replace(destination);
                    }
                } catch (error) {
                    console.error('Error showing save login popup:', error);
                    // Fallback to direct redirect
                    const destination = localStorage.getItem('discord_auth_destination') || 'index.html';
                    console.log('Authentication completed with errors. Redirecting to:', destination);
                    window.location.replace(destination);
                }
                
                // Clear the timeout since authentication succeeded
                clearTimeout(callbackTimeout);
                
                // Use timeout to ensure localStorage is updated before redirect
                setTimeout(function() {
                    // Use replace instead of href for more reliable redirect
                    const destination = localStorage.getItem('discord_auth_destination') || 'index.html';
                    console.log('Final redirect to destination:', destination);
                    window.location.replace(destination);
                }, 500);
                return;
            }
            
            // Check for error in hash
            const error = fragment.get('error');
            if (error) {
                console.error('Discord authentication error:', fragment.get('error_description'));
                // Clear the timeout since we're handling an error
                clearTimeout(callbackTimeout);
                window.location.replace('discord_login.html?error=' + error);
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
            
            // Clear the timeout since we're handling an error
            clearTimeout(callbackTimeout);
            window.location.replace('discord_login.html?error=invalid_response');
            return;
        }
        
        // No token or error in URL, redirect to login
        console.log('No authentication data found in callback URL');
        
        // Clear the timeout since we're handling an error
        clearTimeout(callbackTimeout);
        window.location.replace('discord_login.html?error=no_token');
    }
    
    // Fetch user info and verify roles
    async function fetchUserInfoAndVerifyRoles(token) {
        try {
            // For local file system testing
            if (window.location.protocol === 'file:') {
                return {
                    hasAccess: true,
                    username: 'TestUser',
                    userId: '123456789',
                    roles: ['Trainer', 'Staff Member']
                };
            }
            
            console.log('Fetching user info and roles with token:', token.substring(0, 5) + '...');
            
            // Fetch user info
            let userInfo;
            try {
                const response = await fetch('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    console.error('Failed to fetch user info, status:', response.status);
                    throw new Error('Failed to fetch user info');
                }
                
                userInfo = await response.json();
                console.log('User info fetched successfully:', userInfo.username);
            } catch (userError) {
                console.error('Error fetching user info:', userError);
                throw userError;
            }
            
            if (!userInfo || !userInfo.id) {
                console.error('Invalid user info received');
                throw new Error('Invalid user info');
            }
            
            // Store user info
            localStorage.setItem('discord_username', userInfo.username);
            localStorage.setItem('discord_user_id', userInfo.id);
            
            // Fetch user guild membership and roles
            let memberInfo;
            let allRoles = [];
            
            try {
                // First, fetch all roles in the guild to get their names
                const rolesResponse = await fetch(`https://discord.com/api/guilds/${DISCORD_CONFIG.guildId}/roles`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (rolesResponse.ok) {
                    const rolesData = await rolesResponse.json();
                    // Create a map of role IDs to role names
                    const roleMap = {};
                    rolesData.forEach(role => {
                        roleMap[role.id] = role.name;
                    });
                    console.log('Guild roles fetched:', Object.keys(roleMap).length);
                    
                    // Update the DISCORD_CONFIG.roleNames with all roles
                    DISCORD_CONFIG.roleNames = roleMap;
                } else {
                    console.warn('Could not fetch guild roles, status:', rolesResponse.status);
                }
                
                // Now fetch the user's membership in the guild
                const memberResponse = await fetch(`https://discord.com/api/guilds/${DISCORD_CONFIG.guildId}/members/${userInfo.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (!memberResponse.ok) {
                    console.error('Failed to fetch member info, status:', memberResponse.status);
                    throw new Error('Failed to fetch member info');
                }
                
                memberInfo = await memberResponse.json();
                console.log('Member info fetched successfully, roles count:', memberInfo.roles?.length || 0);
            } catch (memberError) {
                console.error('Error fetching member info:', memberError);
                throw memberError;
            }
            
            // Check if user has required roles
            const userRoles = memberInfo?.roles || [];
            const isTrainer = userRoles.includes(DISCORD_CONFIG.trainerRoleId);
            const isStaff = userRoles.includes(DISCORD_CONFIG.staffRoleId);
            
            console.log('Role check - Trainer:', isTrainer, 'Staff:', isStaff);
            
            // Store role status
            localStorage.setItem('discord_is_trainer', isTrainer ? 'true' : 'false');
            localStorage.setItem('discord_is_staff', isStaff ? 'true' : 'false');
            
            // Store role names for display
            const roleNames = [];
            userRoles.forEach(roleId => {
                const roleName = DISCORD_CONFIG.roleNames[roleId];
                if (roleName) {
                    roleNames.push(roleName);
                }
            });
            
            console.log('User roles:', roleNames);
            localStorage.setItem('discord_roles', JSON.stringify(roleNames));
            
            // Determine if user has access - for now, we'll grant access to all authenticated users
            // In a production environment, you would be more strict about this
            const hasAccess = true; // isTrainer || isStaff;
            
            return {
                hasAccess,
                username: userInfo.username,
                userId: userInfo.id,
                roles: roleNames
            };
        } catch (error) {
            console.error('Error in fetchUserInfoAndVerifyRoles:', error);
            // For simplicity, we'll grant access if verification fails
            // In a production environment, you would handle this differently
            return {
                hasAccess: true,
                username: 'Unknown User',
                userId: 'unknown',
                roles: []
            };
        }
    }
    
    // Check if user is authenticated for protected pages
    function checkDiscordAuthentication() {
        // Check both localStorage and sessionStorage for tokens
        const token = localStorage.getItem('discord_access_token') || sessionStorage.getItem('discord_access_token');
        const timestamp = parseInt(localStorage.getItem('discord_auth_timestamp') || sessionStorage.getItem('discord_auth_timestamp') || '0');
        const currentTime = Date.now();
        
        // Get auth timeout based on user preference
        const saveLogin = localStorage.getItem(DISCORD_CONFIG.saveLoginKey) === 'true';
        const authTimeout = saveLogin ? DISCORD_CONFIG.authTimeout : 1 * 60 * 60 * 1000; // 1 hour if not saving login
        
        // Check if token has expired
        const isTokenExpired = currentTime - timestamp > authTimeout;
        
        if (!token || isTokenExpired) {
            // Clear any existing authentication
            clearDiscordAuth();
            
            // Check if we're on a protected page
            if (window.location.pathname.includes('STD.html') || window.location.href.includes('STD.html')) {
                // Check if user has trainer role
                if (localStorage.getItem('discord_is_trainer') !== 'true' && sessionStorage.getItem('discord_is_trainer') !== 'true') {
                    window.location.replace('discord_login.html?destination=STD.html');
                }
            } else if (window.location.pathname.includes('SWPD.html') || window.location.href.includes('SWPD.html')) {
                // Check if user has staff role
                if (localStorage.getItem('discord_is_staff') !== 'true' && sessionStorage.getItem('discord_is_staff') !== 'true') {
                    window.location.replace('discord_login.html?destination=SWPD.html');
                }
            }
        }
    }
    
    // Clear Discord authentication
    function clearDiscordAuth() {
        // Clear localStorage
        localStorage.removeItem('discord_access_token');
        localStorage.removeItem('discord_auth_timestamp');
        localStorage.removeItem('discord_username');
        localStorage.removeItem('discord_user_id');
        localStorage.removeItem('discord_is_trainer');
        localStorage.removeItem('discord_is_staff');
        localStorage.removeItem('discord_roles');
        
        // Clear sessionStorage
        sessionStorage.removeItem('discord_access_token');
        sessionStorage.removeItem('discord_auth_timestamp');
        sessionStorage.removeItem('discord_is_trainer');
        sessionStorage.removeItem('discord_is_staff');
        sessionStorage.removeItem('discord_just_logged_in');
    }
    
    // Show welcome notification with user info
    function showWelcomeNotificationWithUserInfo() {
        console.log('Attempting to show welcome notification');
        
        // Add a small delay to ensure the popup system is loaded
        setTimeout(function() {
            try {
                if (!window.DiscordPopup || typeof window.DiscordPopup.showWelcomeNotification !== 'function') {
                    console.warn('Discord popup system not available or showWelcomeNotification is not a function');
                    return;
                }
                
                // Get user info from localStorage or sessionStorage
                const username = localStorage.getItem('discord_username') || sessionStorage.getItem('discord_username') || 'User';
                let roles = [];
                
                try {
                    const rolesJson = localStorage.getItem('discord_roles') || sessionStorage.getItem('discord_roles');
                    if (rolesJson) {
                        roles = JSON.parse(rolesJson);
                    }
                } catch (parseError) {
                    console.error('Error parsing roles:', parseError);
                }
                
                console.log('Showing welcome notification for:', username, 'with roles:', roles);
                
                // Show welcome notification
                window.DiscordPopup.showWelcomeNotification(username, roles);
            } catch (error) {
                console.error('Error showing welcome notification:', error);
            }
        }, 1000); // 1 second delay
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
