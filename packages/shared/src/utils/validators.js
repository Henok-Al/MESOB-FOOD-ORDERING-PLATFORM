const validator = require('validator');

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = email => {
    return validator.isEmail(email);
};

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidPhone = phone => {
    // Basic phone validation - accepts formats like +1234567890 or 1234567890
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
const validatePassword = password => {
    if (!password || password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
const isValidObjectId = id => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeString = input => {
    if (typeof input !== 'string') return '';
    return validator.escape(input.trim());
};

module.exports = {
    isValidEmail,
    isValidPhone,
    validatePassword,
    isValidObjectId,
    sanitizeString,
};
