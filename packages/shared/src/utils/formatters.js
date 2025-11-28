/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted date string
 */
const formatDate = (date, locale = 'en-US') => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Format date and time to readable string
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted date and time string
 */
const formatDateTime = (date, locale = 'en-US') => {
    const dateObj = new Date(date);
    return dateObj.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Format distance in meters to readable string
 * @param {number} meters - Distance in meters
 * @returns {string} - Formatted distance string
 */
const formatDistance = meters => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Calculate time ago from date
 * @param {Date|string} date - Date to calculate from
 * @returns {string} - Time ago string (e.g., "2 hours ago")
 */
const timeAgo = date => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return Math.floor(seconds) + ' seconds ago';
};

module.exports = {
    formatDate,
    formatDateTime,
    formatCurrency,
    formatDistance,
    timeAgo,
};
