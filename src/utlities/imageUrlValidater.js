// imageUrlValidator.js - Utility for validating image URLs

/**
 * Validates if a URL is a proper image URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check if it's a valid URL format
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  if (!urlPattern.test(url)) {
    return false;
  }

  // Check if URL contains common image extensions or known image hosting patterns
  const imagePatterns = [
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i, // Image extensions
    /gravatar\.com/i, // Gravatar
    /googleusercontent\.com/i, // Google
    /cloudinary\.com/i, // Cloudinary
    /imgur\.com/i, // Imgur
    /unsplash\.com/i, // Unsplash
    /amazonaws\.com/i, // AWS S3
    /firebase(storage)?\.com/i, // Firebase
    /cdn\./i, // Generic CDN
  ];

  return imagePatterns.some(pattern => pattern.test(url));
};

/**
 * Validates image URL with async loading check
 * @param {string} url - The URL to validate
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<boolean>} - True if image loads, false otherwise
 */
export const validateImageUrlAsync = (url, timeout = 5000) => {
  return new Promise((resolve) => {
    if (!isValidImageUrl(url)) {
      resolve(false);
      return;
    }

    const img = new Image();
    const timer = setTimeout(() => {
      img.src = ''; // Stop loading
      resolve(false);
    }, timeout);

    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };

    img.src = url;
  });
};

/**
 * Cache for validated URLs to avoid repeated checks
 */
const urlCache = new Map();

/**
 * Validates image URL with caching
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid (from cache or validation)
 */
export const isValidImageUrlCached = (url) => {
  if (!url) return false;

  // Check cache first
  if (urlCache.has(url)) {
    return urlCache.get(url);
  }

  // Validate and cache result
  const isValid = isValidImageUrl(url);
  urlCache.set(url, isValid);

  // Limit cache size to prevent memory issues
  if (urlCache.size > 100) {
    const firstKey = urlCache.keys().next().value;
    urlCache.delete(firstKey);
  }

  return isValid;
};

/**
 * Clear the URL validation cache
 */
export const clearUrlCache = () => {
  urlCache.clear();
};

/**
 * Get fallback initials from name
 * @param {string} name - User name
 * @returns {string} - First letter uppercase or '?'
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  return name.trim().charAt(0).toUpperCase() || '?';
};