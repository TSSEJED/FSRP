/**
 * Account Dashboard Script
 * Created by Sejed TRABELLSSI | sejed.pages.dev
 * 
 * This script provides functionality for the account dashboard page,
 * displaying user information, roles, and permissions.
 */

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
function initializeAccountDashboard() {
    // Check if user is logged in
    const token = localStorage.getItem('discord_access_token') || sessionStorage.getItem('discord_access_token');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.replace('discord_login.html?destination=account.html');
        return;
    }
    
    // Load user information
    loadUserInfo();
    
    // Load roles
    loadUserRoles();
    
    // Load permissions
    loadUserPermissions();
    
    // Update login status
    updateLoginStatus();
    
    // Update save login button text
    updateSaveLoginButton();
}

// Load user information
function loadUserInfo() {
    const username = localStorage.getItem('discord_username') || sessionStorage.getItem('discord_username') || 'Unknown User';
    const userId = localStorage.getItem('discord_user_id') || sessionStorage.getItem('discord_user_id') || 'Unknown';
    const timestamp = parseInt(localStorage.getItem('discord_auth_timestamp') || sessionStorage.getItem('discord_auth_timestamp') || '0');
    
    // Update username
    document.getElementById('account-username').textContent = username;
    
    // Update user ID
    document.getElementById('account-id').textContent = 'Discord ID: ' + userId;
    
    // Update login date
    const loginDate = new Date(timestamp);
    document.getElementById('account-login-date').textContent = 'Login: ' + formatDate(loginDate);
    
    // Update login expiry
    const saveLogin = localStorage.getItem('discord_save_login') === 'true';
    const expiryDate = new Date(timestamp + (saveLogin ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000));
    document.getElementById('account-login-expiry').textContent = 'Expires: ' + formatDate(expiryDate);
    
    // Update avatar with first letter of username
    const avatarElement = document.getElementById('account-avatar');
    if (username && username !== 'Unknown User') {
        avatarElement.innerHTML = `<span>${username.charAt(0).toUpperCase()}</span>`;
    }
}

// Load user roles
function loadUserRoles() {
    const rolesContainer = document.getElementById('roles-container');
    let rolesJson = localStorage.getItem('discord_roles') || sessionStorage.getItem('discord_roles');
    let roles = [];
    
    try {
        if (rolesJson) {
            roles = JSON.parse(rolesJson);
        }
    } catch (error) {
        console.error('Error parsing roles:', error);
    }
    
    // Clear roles container
    rolesContainer.innerHTML = '';
    
    // Check if user has any roles
    if (roles.length === 0) {
        rolesContainer.innerHTML = `
            <div class="role-badge member">
                <i class="fas fa-user"></i> Member
            </div>
        `;
        return;
    }
    
    // Add each role
    roles.forEach(role => {
        let roleClass = 'member';
        let roleIcon = 'fas fa-user';
        
        // Determine role class and icon
        if (role.toLowerCase().includes('staff')) {
            roleClass = 'staff';
            roleIcon = 'fas fa-shield-alt';
        } else if (role.toLowerCase().includes('trainer')) {
            roleClass = 'trainer';
            roleIcon = 'fas fa-graduation-cap';
        }
        
        // Create role badge
        const roleBadge = document.createElement('div');
        roleBadge.className = `role-badge ${roleClass}`;
        roleBadge.innerHTML = `<i class="${roleIcon}"></i> ${role}`;
        
        // Add to container
        rolesContainer.appendChild(roleBadge);
    });
    
    // Always add Member role
    const memberBadge = document.createElement('div');
    memberBadge.className = 'role-badge member';
    memberBadge.innerHTML = '<i class="fas fa-user"></i> Member';
    rolesContainer.appendChild(memberBadge);
}

// Load user permissions
function loadUserPermissions() {
    const permissionsList = document.getElementById('permissions-list');
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
    const saveLogin = localStorage.getItem('discord_save_login') === 'true';
    
    if (saveLogin) {
        saveLoginText.textContent = 'Disable Save Login';
        saveLoginBtn.innerHTML = '<i class="fas fa-times"></i> Disable Save Login';
    } else {
        saveLoginText.textContent = 'Enable Save Login';
        saveLoginBtn.innerHTML = '<i class="fas fa-save"></i> Enable Save Login';
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
