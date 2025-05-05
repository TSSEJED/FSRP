/**
 * Account Dashboard Script
 * Created by Sejed TRABELLSSI | sejed.pages.dev
 * 
 * This script provides functionality for the account dashboard page,
 * displaying user information, roles, and permissions.
 */

// Helper function to determine contrast color (black or white) based on background color
function getContrastColor(hexColor) {
    // Remove the # if it exists
    hexColor = hexColor.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calculate luminance - weights from WCAG 2.0
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Account Dashboard | Created by Sejed TRABELLSSI', 'background: #4361ee; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Initialize the account dashboard
    initializeAccountDashboard();
    
    // Add event listeners for buttons
    document.getElementById('refresh-btn').addEventListener('click', refreshAccountInfo);
    document.getElementById('save-login-btn').addEventListener('click', toggleSaveLogin);
    document.getElementById('logout-btn').addEventListener('click', logoutAccount);
});

// Initialize the account dashboard
async function initializeAccountDashboard() {
    // Check if user is logged in
    const token = localStorage.getItem('discord_access_token') || sessionStorage.getItem('discord_access_token');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.replace('discord_login.html?destination=account.html');
        return;
    }
    
    // Show loading state
    document.getElementById('account-container').classList.add('loading');
    document.getElementById('loading-overlay').style.display = 'flex';
    
    try {
        // Load user information (async)
        await loadUserInfo();
        
        // Load roles (async)
        await loadUserRoles();
        
        // Load permissions (async)
        await loadUserPermissions();
        
        // Update permissions list with document access information
        updatePermissionsList();
        
        // Update login status
        updateLoginStatus();
        
        // Update save login button text
        updateSaveLoginButton();
    } catch (error) {
        console.error('Error initializing account dashboard:', error);
        // Show error message
        const accountContainer = document.getElementById('account-container');
        if (accountContainer) {
            accountContainer.innerHTML += `
                <div class="error-message" style="margin-top: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> Error loading account data: ${error.message}
                </div>
            `;
        }
    } finally {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        const accountContainer = document.getElementById('account-container');
        if (accountContainer) {
            accountContainer.classList.remove('loading');
        }
    }
}

// Load user information
async function loadUserInfo() {
    const token = localStorage.getItem('discord_access_token') || sessionStorage.getItem('discord_access_token');
    const timestamp = parseInt(localStorage.getItem('discord_auth_timestamp') || sessionStorage.getItem('discord_auth_timestamp') || '0');
    
    // Show loading state
    const usernameElement = document.getElementById('account-username');
    const idElement = document.getElementById('account-id');
    const avatarElement = document.getElementById('account-avatar');
    
    if (usernameElement) usernameElement.textContent = 'Loading...';
    if (idElement) idElement.textContent = 'Loading user info...';
    if (avatarElement) avatarElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        // Fetch user info directly from Discord API
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('User data fetched from Discord:', userData);
        
        // Update username
        const usernameElement = document.getElementById('account-username');
        if (usernameElement) usernameElement.textContent = userData.username;
        
        // Update user ID
        const idElement = document.getElementById('account-id');
        if (idElement) idElement.textContent = 'Discord ID: ' + userData.id;
        
        // Update avatar
        const avatarElement = document.getElementById('account-avatar');
        if (avatarElement) {
            if (userData.avatar) {
                // Use actual Discord avatar if available
                avatarElement.innerHTML = `<img src="https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png" alt="${userData.username}">`;
            } else {
                // Fallback to first letter of username
                avatarElement.innerHTML = `<span>${userData.username.charAt(0).toUpperCase()}</span>`;
            }
        }
        
        // Add additional user info if available
        const userDetailsContainer = document.getElementById('user-details');
        let additionalDetails = '';
        
        if (userData.email) {
            additionalDetails += `<div class="detail-item"><i class="fas fa-envelope"></i> ${userData.email}</div>`;
        }
        
        if (userData.verified !== undefined) {
            additionalDetails += `<div class="detail-item"><i class="fas ${userData.verified ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${userData.verified ? 'Verified Account' : 'Unverified Account'}</div>`;
        }
        
        if (userData.premium_type) {
            const nitroTypes = ['None', 'Nitro Classic', 'Nitro', 'Nitro Basic'];
            additionalDetails += `<div class="detail-item"><i class="fas fa-gem"></i> ${nitroTypes[userData.premium_type] || 'Nitro Subscriber'}</div>`;
        }
        
        if (additionalDetails && userDetailsContainer) {
            userDetailsContainer.innerHTML += additionalDetails;
        }
        
        // Store the updated user info
        localStorage.setItem('discord_username', userData.username);
        localStorage.setItem('discord_user_id', userData.id);
        
        // Update login date
        const loginDate = new Date(timestamp);
        const loginDateElement = document.getElementById('account-login-date');
        if (loginDateElement) loginDateElement.textContent = 'Login: ' + formatDate(loginDate);
        
        // Update login expiry
        const saveLogin = localStorage.getItem('discord_save_login') === 'true';
        const expiryDate = new Date(timestamp + (saveLogin ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000));
        const expiryElement = document.getElementById('account-login-expiry');
        if (expiryElement) expiryElement.textContent = 'Expires: ' + formatDate(expiryDate);
        
    } catch (error) {
        console.error('Error fetching user info:', error);
        
        // Fallback to stored data
        const username = localStorage.getItem('discord_username') || sessionStorage.getItem('discord_username') || 'Unknown User';
        const userId = localStorage.getItem('discord_user_id') || sessionStorage.getItem('discord_user_id') || 'Unknown';
        
        const usernameElement = document.getElementById('account-username');
        const idElement = document.getElementById('account-id');
        
        if (usernameElement) usernameElement.textContent = username;
        if (idElement) idElement.textContent = 'Discord ID: ' + userId;
        
        // Update avatar with first letter of username
        const avatarElement = document.getElementById('account-avatar');
        if (avatarElement) {
            if (username && username !== 'Unknown User') {
                avatarElement.innerHTML = `<span>${username.charAt(0).toUpperCase()}</span>`;
            } else {
                avatarElement.innerHTML = `<span>?</span>`;
            }
        }
        
        // Show error message
        const userDetailsElement = document.getElementById('user-details');
        if (userDetailsElement) {
            userDetailsElement.innerHTML += `
                <div class="detail-item error">
                    <i class="fas fa-exclamation-triangle"></i> Could not fetch live data from Discord
                </div>
            `;
        }
    }
}

// Load user roles
async function loadUserRoles() {
    const token = localStorage.getItem('discord_access_token') || sessionStorage.getItem('discord_access_token');
    const userId = localStorage.getItem('discord_user_id') || sessionStorage.getItem('discord_user_id');
    const rolesContainer = document.getElementById('roles-container');
    
    // If roles container doesn't exist, exit early
    if (!rolesContainer) {
        console.warn('Roles container not found in the DOM');
        return;
    }
    
    // Show loading state
    rolesContainer.innerHTML = `
        <div class="role-badge loading">
            <i class="fas fa-spinner fa-spin"></i> Loading roles...
        </div>
    `;
    
    try {
        // Get the guild ID from DISCORD_CONFIG in discord_auth.js
        let guildId = '';
        if (window.DISCORD_CONFIG && window.DISCORD_CONFIG.guildId) {
            guildId = window.DISCORD_CONFIG.guildId;
        } else {
            // Fallback guild ID if DISCORD_CONFIG is not available
            guildId = '1102648991167258735'; // Replace with your actual guild ID
        }
        
        // First, fetch all roles in the guild to get their names and colors
        const rolesResponse = await fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!rolesResponse.ok) {
            throw new Error(`Failed to fetch guild roles: ${rolesResponse.status}`);
        }
        
        const guildRoles = await rolesResponse.json();
        console.log('Guild roles fetched from Discord:', guildRoles);
        
        // Create a map of role IDs to role objects
        const roleMap = {};
        guildRoles.forEach(role => {
            roleMap[role.id] = role;
        });
        
        // Now fetch the user's guild membership to get their roles
        // First try the direct members endpoint
        let memberResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        // If that fails, try the alternative approach by getting user guilds
        if (!memberResponse.ok) {
            console.warn(`Direct member fetch failed with status: ${memberResponse.status}. Trying alternative approach...`);
            
            // Get user's guilds
            const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (!guildsResponse.ok) {
                console.error(`Failed to fetch user guilds: ${guildsResponse.status}`);
                throw new Error(`Failed to fetch user guilds: ${guildsResponse.status}`);
            }
            
            const guilds = await guildsResponse.json();
            console.log('User guilds:', guilds);
            
            // Check if user is in the target guild
            const targetGuild = guilds.find(g => g.id === guildId);
            if (!targetGuild) {
                throw new Error('User is not a member of the target guild');
            }
            
            // Try the members endpoint again with the bot token if available
            if (window.DISCORD_CONFIG && window.DISCORD_CONFIG.botToken) {
                memberResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
                    headers: {
                        Authorization: `Bot ${window.DISCORD_CONFIG.botToken}`
                    }
                });
            }
        }
        
        if (!memberResponse.ok) {
            throw new Error(`Failed to fetch member info: ${memberResponse.status}`);
        }
        
        const memberData = await memberResponse.json();
        console.log('Member data fetched from Discord:', memberData);
        
        // Get user roles
        const userRoleIds = memberData.roles || [];
        
        // Clear roles container
        rolesContainer.innerHTML = '';
        
        // Check if user has any roles
        if (userRoleIds.length === 0) {
            rolesContainer.innerHTML = `
                <div class="role-badge member">
                    <i class="fas fa-user"></i> Member
                </div>
            `;
            return;
        }
    
        // Add each role
        userRoleIds.forEach(roleId => {
            const role = roleMap[roleId];
            if (!role) return; // Skip if role not found
            
            // Skip @everyone role
            if (role.name === '@everyone') return;
            
            // Determine role icon based on role name
            let icon = 'fa-user';
            let roleClass = 'member';
            
            if (role.name.toLowerCase().includes('staff')) {
                icon = 'fa-shield-alt';
                roleClass = 'staff';
            } else if (role.name.toLowerCase().includes('trainer')) {
                icon = 'fa-graduation-cap';
                roleClass = 'trainer';
            } else if (role.name.toLowerCase().includes('admin')) {
                icon = 'fa-crown';
                roleClass = 'admin';
            } else if (role.name.toLowerCase().includes('moderator')) {
                icon = 'fa-gavel';
                roleClass = 'moderator';
            } else if (role.name.toLowerCase().includes('developer')) {
                icon = 'fa-code';
                roleClass = 'developer';
            } else if (role.name.toLowerCase().includes('vip')) {
                icon = 'fa-star';
                roleClass = 'vip';
            }
            
            // Convert role color from decimal to hex
            let roleColor = '#7289DA'; // Default Discord color
            if (role.color !== 0) {
                roleColor = '#' + role.color.toString(16).padStart(6, '0');
            }
            
            // Create role badge
            const roleBadge = document.createElement('div');
            roleBadge.className = `role-badge ${roleClass}`;
            roleBadge.style.backgroundColor = roleColor;
            roleBadge.style.color = getContrastColor(roleColor);
            roleBadge.innerHTML = `<i class="fas ${icon}"></i> ${role.name}`;
            
            // Add to container
            rolesContainer.appendChild(roleBadge);
        });
        
        // Store role names for other parts of the application
        const roleNames = userRoleIds.map(id => roleMap[id]?.name).filter(name => name && name !== '@everyone');
        localStorage.setItem('discord_roles', JSON.stringify(roleNames));
        
    } catch (error) {
        console.error('Error fetching roles:', error);
        
        // Try an alternative approach - fetch from discord_auth.js cached data
        try {
            console.log('Attempting to use cached role data from discord_auth.js...');
            
            // Check if we have the Discord config available
            if (window.DISCORD_CONFIG) {
                // Clear roles container
                rolesContainer.innerHTML = '';
                
                // Add default Member role
                const memberBadge = document.createElement('div');
                memberBadge.className = 'role-badge member';
                memberBadge.innerHTML = '<i class="fas fa-user"></i> Member';
                rolesContainer.appendChild(memberBadge);
                
                // Add roles from DISCORD_CONFIG if the user has them
                const isTrainer = localStorage.getItem('discord_is_trainer') === 'true' || sessionStorage.getItem('discord_is_trainer') === 'true';
                const isStaff = localStorage.getItem('discord_is_staff') === 'true' || sessionStorage.getItem('discord_is_staff') === 'true';
                
                if (isTrainer) {
                    const trainerBadge = document.createElement('div');
                    trainerBadge.className = 'role-badge trainer';
                    trainerBadge.innerHTML = '<i class="fas fa-graduation-cap"></i> Trainer';
                    rolesContainer.appendChild(trainerBadge);
                }
                
                if (isStaff) {
                    const staffBadge = document.createElement('div');
                    staffBadge.className = 'role-badge staff';
                    staffBadge.innerHTML = '<i class="fas fa-shield-alt"></i> Staff Member';
                    rolesContainer.appendChild(staffBadge);
                }
                
                // Add error badge
                const errorBadge = document.createElement('div');
                errorBadge.className = 'role-badge error';
                errorBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Using cached roles';
                rolesContainer.appendChild(errorBadge);
                
                return;
            }
            
            // If we don't have DISCORD_CONFIG, fall back to stored roles data
            throw new Error('DISCORD_CONFIG not available');
        } catch (alternativeError) {
            console.error('Alternative approach failed:', alternativeError);
            
            // Fallback to stored roles data
            let rolesJson = localStorage.getItem('discord_roles') || sessionStorage.getItem('discord_roles');
            let roles = [];
            
            try {
                if (rolesJson) {
                    roles = JSON.parse(rolesJson);
                }
            } catch (parseError) {
                console.error('Error parsing roles:', parseError);
            }
            
            // Clear roles container
            rolesContainer.innerHTML = '';
            
            // Check if user has any roles
            if (roles.length === 0) {
                rolesContainer.innerHTML = `
                    <div class="role-badge member">
                        <i class="fas fa-user"></i> Member
                    </div>
                    <div class="role-badge error">
                        <i class="fas fa-exclamation-triangle"></i> Could not fetch live roles
                    </div>
                `;
                return;
            }
        }
        
        // Add each role from stored data
        roles.forEach(role => {
            // Determine role icon
            let icon = 'fa-user';
            let roleClass = 'member';
            
            if (role.toLowerCase().includes('staff')) {
                icon = 'fa-shield-alt';
                roleClass = 'staff';
            } else if (role.toLowerCase().includes('trainer')) {
                icon = 'fa-graduation-cap';
                roleClass = 'trainer';
            } else if (role.toLowerCase().includes('admin')) {
                icon = 'fa-crown';
                roleClass = 'admin';
            } else if (role.toLowerCase().includes('moderator')) {
                icon = 'fa-gavel';
                roleClass = 'moderator';
            }
            
            // Create role badge
            const roleBadge = document.createElement('div');
            roleBadge.className = `role-badge ${roleClass}`;
            roleBadge.innerHTML = `<i class="fas ${icon}"></i> ${role}`;
            
            // Add to container
            rolesContainer.appendChild(roleBadge);
        });
        
        // Add error message
        const errorBadge = document.createElement('div');
        errorBadge.className = 'role-badge error';
        errorBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Using cached data';
        rolesContainer.appendChild(errorBadge);
    }
}

// Load user permissions
async function loadUserPermissions() {
    const token = localStorage.getItem('discord_access_token') || sessionStorage.getItem('discord_access_token');
    const userId = localStorage.getItem('discord_user_id') || sessionStorage.getItem('discord_user_id');
    const permissionsContainer = document.getElementById('permissions-container');
    
    // If permissions container doesn't exist, exit early
    if (!permissionsContainer) {
        console.warn('Permissions container not found in the DOM');
        return;
    }
    
    // Show loading state
    permissionsContainer.innerHTML = `
        <div class="permission-item loading">
            <i class="fas fa-spinner fa-spin"></i>
            <div class="permission-details">
                <h4>Loading Permissions</h4>
                <p>Fetching your access rights...</p>
            </div>
        </div>
    `;
    
    try {
        // Get the guild ID and role IDs from DISCORD_CONFIG
        let guildId = '';
        let trainerRoleId = '';
        let staffRoleId = '';
        
        if (window.DISCORD_CONFIG) {
            guildId = window.DISCORD_CONFIG.guildId;
            trainerRoleId = window.DISCORD_CONFIG.trainerRoleId;
            staffRoleId = window.DISCORD_CONFIG.staffRoleId;
        } else {
            // Fallback IDs if DISCORD_CONFIG is not available
            guildId = '1102648991167258735'; // Replace with your actual guild ID
            trainerRoleId = '1102649088701075456'; // Replace with your actual trainer role ID
            staffRoleId = '1102649088701075457'; // Replace with your actual staff role ID
        }
        
        // Fetch the user's guild membership to get their roles
        const memberResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!memberResponse.ok) {
            throw new Error(`Failed to fetch member info: ${memberResponse.status}`);
        }
        
        const memberData = await memberResponse.json();
        console.log('Member data for permissions:', memberData);
        
        // Get user roles
        const userRoleIds = memberData.roles || [];
        
        // Check if user has trainer or staff roles
        const isTrainer = userRoleIds.includes(trainerRoleId);
        const isStaff = userRoleIds.includes(staffRoleId);
        
        // Store role status for other parts of the application
        localStorage.setItem('discord_is_trainer', isTrainer ? 'true' : 'false');
        localStorage.setItem('discord_is_staff', isStaff ? 'true' : 'false');
        
        // Clear permissions container
        permissionsContainer.innerHTML = '';
        
        // Add permissions
        if (isTrainer) {
            permissionsContainer.innerHTML += `
                <div class="permission-item">
                    <i class="fas fa-check-circle"></i>
                    <div class="permission-details">
                        <h4>Trainer Documents</h4>
                        <p>You can access trainer-only documents</p>
                    </div>
                </div>
            `;
        } else {
            permissionsContainer.innerHTML += `
                <div class="permission-item denied">
                    <i class="fas fa-times-circle"></i>
                    <div class="permission-details">
                        <h4>Trainer Documents</h4>
                        <p>You cannot access trainer-only documents</p>
                    </div>
                </div>
            `;
        }
        
        if (isStaff) {
            permissionsContainer.innerHTML += `
                <div class="permission-item">
                    <i class="fas fa-check-circle"></i>
                    <div class="permission-details">
                        <h4>Staff Documents</h4>
                        <p>You can access staff-only documents</p>
                    </div>
                </div>
            `;
        } else {
            permissionsContainer.innerHTML += `
                <div class="permission-item denied">
                    <i class="fas fa-times-circle"></i>
                    <div class="permission-details">
                        <h4>Staff Documents</h4>
                        <p>You cannot access staff-only documents</p>
                    </div>
                </div>
            `;
        }
        
        // Add public documents permission (always allowed)
        permissionsContainer.innerHTML += `
            <div class="permission-item">
                <i class="fas fa-check-circle"></i>
                <div class="permission-details">
                    <h4>Public Documents</h4>
                    <p>You can access public documents</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error fetching permissions:', error);
        
        // Fallback to stored permissions
        const isTrainer = localStorage.getItem('discord_is_trainer') === 'true' || sessionStorage.getItem('discord_is_trainer') === 'true';
        const isStaff = localStorage.getItem('discord_is_staff') === 'true' || sessionStorage.getItem('discord_is_staff') === 'true';
        
        // Clear permissions container
        permissionsContainer.innerHTML = '';
        
        // Add permissions from stored data
        if (isTrainer) {
            permissionsContainer.innerHTML += `
                <div class="permission-item">
                    <i class="fas fa-check-circle"></i>
                    <div class="permission-details">
                        <h4>Trainer Documents</h4>
                        <p>You can access trainer-only documents</p>
                    </div>
                </div>
            `;
        } else {
            permissionsContainer.innerHTML += `
                <div class="permission-item denied">
                    <i class="fas fa-times-circle"></i>
                    <div class="permission-details">
                        <h4>Trainer Documents</h4>
                        <p>You cannot access trainer-only documents</p>
                    </div>
                </div>
            `;
        }
        
        if (isStaff) {
            permissionsContainer.innerHTML += `
                <div class="permission-item">
                    <i class="fas fa-check-circle"></i>
                    <div class="permission-details">
                        <h4>Staff Documents</h4>
                        <p>You can access staff-only documents</p>
                    </div>
                </div>
            `;
        } else {
            permissionsContainer.innerHTML += `
                <div class="permission-item denied">
                    <i class="fas fa-times-circle"></i>
                    <div class="permission-details">
                        <h4>Staff Documents</h4>
                        <p>You cannot access staff-only documents</p>
                    </div>
                </div>
            `;
        }
        
        // Add public documents permission (always allowed)
        permissionsContainer.innerHTML += `
            <div class="permission-item">
                <i class="fas fa-check-circle"></i>
                <div class="permission-details">
                    <h4>Public Documents</h4>
                    <p>You can access public documents</p>
                </div>
            </div>
        `;
        
        // Add error message
        permissionsContainer.innerHTML += `
            <div class="permission-item error">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="permission-details">
                    <h4>Error Fetching Live Data</h4>
                    <p>Using cached permissions data</p>
                </div>
            </div>
        `;
    }
}

// Update permissions list with document access information
function updatePermissionsList() {
    const permissionsList = document.getElementById('permissions-list');
    
    // If permissions list doesn't exist, exit early
    if (!permissionsList) {
        console.warn('Permissions list not found in the DOM');
        return;
    }
    
    const isTrainer = localStorage.getItem('discord_is_trainer') === 'true' || sessionStorage.getItem('discord_is_trainer') === 'true';
    const isStaff = localStorage.getItem('discord_is_staff') === 'true' || sessionStorage.getItem('discord_is_staff') === 'true';
    
    // Clear permissions list
    permissionsList.innerHTML = '';
    
    // Add permissions based on roles
    const permissions = [
        {
            name: 'Staff Training Document',
            description: 'Access to the full staff training document',
            access: isTrainer,
            icon: isTrainer ? 'fas fa-check-circle' : 'fas fa-times-circle',
            iconClass: isTrainer ? '' : 'denied',
            url: isTrainer ? 'STD.html' : 'discord_login.html?destination=STD.html'
        },
        {
            name: 'Staff Warning Policy Document',
            description: 'Access to the staff warning policy document',
            access: isStaff,
            icon: isStaff ? 'fas fa-check-circle' : 'fas fa-times-circle',
            iconClass: isStaff ? '' : 'denied',
            url: isStaff ? 'SWPD.html' : 'discord_login.html?destination=SWPD.html'
        },
        {
            name: 'Account Dashboard',
            description: 'Access to view and manage your account information',
            access: true,
            icon: 'fas fa-check-circle',
            iconClass: '',
            url: 'account.html'
        }
    ];
    
    // Add each permission
    permissions.forEach(permission => {
        const permissionItem = document.createElement('div');
        permissionItem.className = 'permission-item';
        
        permissionItem.innerHTML = `
            <div class="permission-icon ${permission.iconClass}">
                <i class="${permission.icon}"></i>
            </div>
            <div class="permission-text">
                <h4>${permission.name}</h4>
                <p>${permission.description}</p>
            </div>
            <a href="${permission.url}" class="account-btn account-btn-${permission.access ? 'primary' : 'secondary'}" style="margin-left: auto;">
                <i class="fas fa-${permission.access ? 'eye' : 'lock'}"></i> ${permission.access ? 'View' : 'Locked'}
            </a>
        `;
        
        // Add to container
        permissionsList.appendChild(permissionItem);
    });
}

// Update login status
function updateLoginStatus() {
    const loginStatus = document.getElementById('login-status');
    
    // If login status element doesn't exist, exit early
    if (!loginStatus) {
        console.warn('Login status element not found in the DOM');
        return;
    }
    
    const token = localStorage.getItem('discord_access_token') || sessionStorage.getItem('discord_access_token');
    const timestamp = parseInt(localStorage.getItem('discord_auth_timestamp') || sessionStorage.getItem('discord_auth_timestamp') || '0');
    const currentTime = Date.now();
    const saveLogin = localStorage.getItem('discord_save_login') === 'true';
    const authTimeout = saveLogin ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000;
    
    // Check if token has expired
    const isTokenExpired = currentTime - timestamp > authTimeout;
    
    if (!token || isTokenExpired) {
        // Token is expired or not present
        loginStatus.className = 'login-status inactive';
        loginStatus.innerHTML = '<i class="fas fa-times-circle"></i> Your login session has expired. Please log in again.';
    } else {
        // Token is valid
        loginStatus.className = 'login-status active';
        loginStatus.innerHTML = '<i class="fas fa-check-circle"></i> You are currently logged in. Your session is active.';
    }
}

// Update save login button text
function updateSaveLoginButton() {
    const saveLoginBtn = document.getElementById('save-login-btn');
    const saveLoginText = document.getElementById('save-login-text');
    
    // If save login button doesn't exist, exit early
    if (!saveLoginBtn || !saveLoginText) {
        console.warn('Save login button or text not found in the DOM');
        return;
    }
    
    const saveLogin = localStorage.getItem('discord_save_login') === 'true';
    
    if (saveLogin) {
        saveLoginText.textContent = 'Disable Save Login';
        saveLoginBtn.innerHTML = '<i class="fas fa-toggle-on"></i> Disable Save Login';
    } else {
        saveLoginText.textContent = 'Enable Save Login';
        saveLoginBtn.innerHTML = '<i class="fas fa-toggle-off"></i> Enable Save Login';
    }
}

// Refresh account information
function refreshAccountInfo() {
    // Show loading state
    document.getElementById('account-username').textContent = 'Refreshing...';
    document.getElementById('roles-container').innerHTML = '<div class="role-badge"><i class="fas fa-spinner fa-spin"></i> Refreshing roles...</div>';
    document.getElementById('permissions-list').innerHTML = '<div class="permission-item"><div class="permission-icon"><i class="fas fa-spinner fa-spin"></i></div><div class="permission-text"><h4>Refreshing permissions...</h4><p>Please wait while we update your access permissions.</p></div></div>';
    
    // Simulate refresh delay
    setTimeout(() => {
        // Reload user information
        loadUserInfo();
        
        // Reload roles
        loadUserRoles();
        
        // Reload permissions
        loadUserPermissions();
        
        // Update login status
        updateLoginStatus();
        
        // Show success notification
        if (window.DiscordPopup && typeof window.DiscordPopup.showWelcomeNotification === 'function') {
            const username = localStorage.getItem('discord_username') || sessionStorage.getItem('discord_username') || 'User';
            let roles = [];
            
            try {
                const rolesJson = localStorage.getItem('discord_roles') || sessionStorage.getItem('discord_roles');
                if (rolesJson) {
                    roles = JSON.parse(rolesJson);
                }
            } catch (error) {
                console.error('Error parsing roles:', error);
            }
            
            window.DiscordPopup.showWelcomeNotification(username, roles);
        }
    }, 1000);
}

// Toggle save login preference
function toggleSaveLogin() {
    const saveLogin = localStorage.getItem('discord_save_login') === 'true';
    const newSaveLogin = !saveLogin;
    
    // Update preference
    localStorage.setItem('discord_save_login', newSaveLogin ? 'true' : 'false');
    
    // If disabling save login, move token to session storage
    if (!newSaveLogin) {
        const token = localStorage.getItem('discord_access_token');
        const timestamp = localStorage.getItem('discord_auth_timestamp');
        
        if (token && timestamp) {
            sessionStorage.setItem('discord_access_token', token);
            sessionStorage.setItem('discord_auth_timestamp', timestamp);
            localStorage.removeItem('discord_access_token');
            localStorage.removeItem('discord_auth_timestamp');
        }
    } else {
        // If enabling save login, move token to local storage
        const token = sessionStorage.getItem('discord_access_token');
        const timestamp = sessionStorage.getItem('discord_auth_timestamp');
        
        if (token && timestamp) {
            localStorage.setItem('discord_access_token', token);
            localStorage.setItem('discord_auth_timestamp', timestamp);
            sessionStorage.removeItem('discord_access_token');
            sessionStorage.removeItem('discord_auth_timestamp');
        }
    }
    
    // Update button text
    updateSaveLoginButton();
    
    // Update login status
    updateLoginStatus();
    
    // Update login expiry
    loadUserInfo();
    
    // Show notification
    if (window.DiscordPopup && typeof window.DiscordPopup.showErrorNotification === 'function') {
        if (newSaveLogin) {
            window.DiscordPopup.showErrorNotification('Save Login Enabled', 'Your login information will be saved for 7 days.');
        } else {
            window.DiscordPopup.showErrorNotification('Save Login Disabled', 'Your login information will only be saved for this session.');
        }
    }
}

// Logout account
function logoutAccount() {
    // Clear authentication
    localStorage.removeItem('discord_access_token');
    localStorage.removeItem('discord_auth_timestamp');
    localStorage.removeItem('discord_username');
    localStorage.removeItem('discord_user_id');
    localStorage.removeItem('discord_is_trainer');
    localStorage.removeItem('discord_is_staff');
    localStorage.removeItem('discord_roles');
    
    sessionStorage.removeItem('discord_access_token');
    sessionStorage.removeItem('discord_auth_timestamp');
    sessionStorage.removeItem('discord_is_trainer');
    sessionStorage.removeItem('discord_is_staff');
    sessionStorage.removeItem('discord_just_logged_in');
    
    // Redirect to login page
    window.location.replace('discord_login.html');
}

// Format date
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Invalid Date';
    }
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}
