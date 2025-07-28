/**
 * This script provides shared functionality for all protected pages,
 * including checking for a valid login token and handling logout.
 */

// --- Authentication Check ---
// This code runs on every page that includes this script.
// It checks if a token exists. If not, it redirects to the login page.
const authToken = localStorage.getItem('authToken');
if (!authToken) {
    // If no token is found, redirect the user to the login page.
    window.location.href = 'index.html';
}

/**
 * Logs the user out by removing the token and redirecting to the login page.
 */
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
}

/**
 * A helper function to get the authorization headers required for API requests.
 * @returns {HeadersInit} A Headers object with the Authorization token.
 */
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}
