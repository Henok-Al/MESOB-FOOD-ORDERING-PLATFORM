/**
 * Generate a random order number
 * @returns {string} - Order number (e.g., "ORD-20240128-ABC123")
 */
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Calculate estimated delivery time based on distance
 * @param {number} distanceInMeters - Distance in meters
 * @param {number} preparationTime - Food preparation time in minutes
 * @returns {number} - Estimated delivery time in minutes
 */
const calculateDeliveryTime = (distanceInMeters, preparationTime = 15) => {
    // Assume average speed of 30 km/h for delivery
    const speedKmPerHour = 30;
    const speedMPerMin = (speedKmPerHour * 1000) / 60;
    const travelTime = Math.ceil(distanceInMeters / speedMPerMin);

    return preparationTime + travelTime;
};

/**
 * Generate a slug from a string
 * @param {string} text - Text to slugify
 * @returns {string} - Slugified text
 */
const slugify = text => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} - { data, page, totalPages, totalItems }
 */
const paginate = (array, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = array.slice(startIndex, endIndex);
    const totalPages = Math.ceil(array.length / limit);

    return {
        data,
        page,
        limit,
        totalPages,
        totalItems: array.length,
    };
};

module.exports = {
    generateOrderNumber,
    calculateDistance,
    calculateDeliveryTime,
    slugify,
    paginate,
};
