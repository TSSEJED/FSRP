/**
 * Discord Popup and Notification System
 * Created by Sejed TRABELLSSI | sejed.pages.dev
 * 
 * This script provides custom popups and notifications for the Discord authentication system,
 * including save login info popup and welcome notifications with user roles.
 */

// Initialize the popup system
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Discord Popup System | Created by Sejed TRABELLSSI', 'background: #5865F2; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    // Create popup container if it doesn't exist
    if (!document.querySelector('.popup-container')) {
        const popupContainer = document.createElement('div');
        popupContainer.className = 'popup-container';
        document.body.appendChild(popupContainer);
    }
    
    // Create notification container if it doesn't exist
    if (!document.querySelector('.notification')) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
});

// Show save login info popup
function showSaveLoginPopup(callback) {
    const popupContainer = document.querySelector('.popup-container');
    
    // Clear any existing content
    popupContainer.innerHTML = '';
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    
    popupContent.innerHTML = `
        <button class="popup-close"><i class="fas fa-times"></i></button>
        <div class="popup-icon"><i class="fas fa-save"></i></div>
        <div class="popup-header">
            <h2>Save Login Information?</h2>
            <p>Would you like to save your Discord login information for future visits? This will keep you logged in for 7 days.</p>
        </div>
        <div class="popup-buttons">
            <button class="popup-btn popup-btn-primary" id="save-login-yes">Yes, Save Login</button>
            <button class="popup-btn popup-btn-secondary" id="save-login-no">No, Thanks</button>
        </div>
    `;
    
    popupContainer.appendChild(popupContent);
    
    // Show the popup
    setTimeout(() => {
        popupContainer.classList.add('show');
    }, 100);
    
    // Handle close button
    popupContent.querySelector('.popup-close').addEventListener('click', function() {
        hidePopup();
        if (callback) callback(false);
    });
    
    // Handle yes button
    document.getElementById('save-login-yes').addEventListener('click', function() {
        hidePopup();
        if (callback) callback(true);
    });
    
    // Handle no button
    document.getElementById('save-login-no').addEventListener('click', function() {
        hidePopup();
        if (callback) callback(false);
    });
}

// Hide popup
function hidePopup() {
    const popupContainer = document.querySelector('.popup-container');
    popupContainer.classList.remove('show');
}

// Show welcome notification with user info and roles
function showWelcomeNotification(username, roles) {
    const notification = document.querySelector('.notification');
    
    // Clear any existing content
    notification.innerHTML = '';
    
    // Create role items HTML
    let rolesHTML = '';
    if (roles && roles.length > 0) {
        rolesHTML = '<div class="roles-list">';
        roles.forEach(role => {
            rolesHTML += `<div class="role-item"><span class="role-icon"><i class="fas fa-check-circle"></i></span> ${role}</div>`;
        });
        rolesHTML += '</div>';
    }
    
    // Create notification content
    notification.innerHTML = `
        <button class="notification-close"><i class="fas fa-times"></i></button>
        <div class="notification-header">
            <div class="notification-icon"><i class="fas fa-user-check"></i></div>
            <div class="notification-title">Welcome, ${username}!</div>
        </div>
        <div class="notification-message">
            You have successfully logged in with Discord.
            ${rolesHTML}
        </div>
    `;
    
    // Show the notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Handle close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        hideNotification();
    });
    
    // Auto hide after 8 seconds
    setTimeout(() => {
        hideNotification();
    }, 8000);
}

// Hide notification
function hideNotification() {
    const notification = document.querySelector('.notification');
    notification.classList.remove('show');
}

// Show error notification
function showErrorNotification(title, message) {
    const notification = document.querySelector('.notification');
    
    // Clear any existing content
    notification.innerHTML = '';
    
    // Create notification content
    notification.innerHTML = `
        <button class="notification-close"><i class="fas fa-times"></i></button>
        <div class="notification-header">
            <div class="notification-icon"><i class="fas fa-exclamation-circle"></i></div>
            <div class="notification-title">${title}</div>
        </div>
        <div class="notification-message">
            ${message}
        </div>
    `;
    
    // Change border color to indicate error
    notification.style.borderLeftColor = 'var(--danger-color, #f94144)';
    
    // Show the notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Handle close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        hideNotification();
    });
    
    // Auto hide after 8 seconds
    setTimeout(() => {
        hideNotification();
    }, 8000);
}

// Reset notification style (called before showing new notifications)
function resetNotificationStyle() {
    const notification = document.querySelector('.notification');
    notification.style.borderLeftColor = 'var(--primary-color, #4361ee)';
}

// Fetch user info from Discord API
async function fetchDiscordUserInfo(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching Discord user info:', error);
        return null;
    }
}

// Fetch user's guild (server) roles from Discord API
async function fetchDiscordUserRoles(token, guildId, userId) {
    try {
        const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user roles');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching Discord user roles:', error);
        return null;
    }
}

// Check if user has required roles
function hasRequiredRoles(userRoles, requiredRoleIds) {
    if (!userRoles || !requiredRoleIds) return false;
    
    // Check if the user has at least one of the required roles
    return requiredRoleIds.some(roleId => userRoles.includes(roleId));
}

// Export functions
window.DiscordPopup = {
    showSaveLoginPopup,
    hidePopup,
    showWelcomeNotification,
    showErrorNotification,
    hideNotification,
    fetchDiscordUserInfo,
    fetchDiscordUserRoles,
    hasRequiredRoles
};
