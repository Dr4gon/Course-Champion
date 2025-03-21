/**
 * Service for managing course enrollments
 *
 * This service provides functions to manage user enrollments in courses.
 * For demo purposes, this uses localStorage but in a production environment
 * these would be API calls to the backend.
 */

const STORAGE_KEY = 'coursechampion_enrollments';

/**
 * Get all courses a user is enrolled in
 *
 * @returns {Array} Array of course IDs the user is enrolled in
 */
export function getEnrollments() {
  try {
    const enrollments = localStorage.getItem(STORAGE_KEY);
    return enrollments ? JSON.parse(enrollments) : [];
  } catch (error) {
    console.error('Error getting enrollments:', error);
    return [];
  }
}

/**
 * Enroll the current user in a course
 *
 * @param {number|string} courseId - ID of the course to enroll in
 * @returns {boolean} Whether the enrollment was successful
 */
export function enrollInCourse(courseId) {
  try {
    const enrollments = getEnrollments();

    // Check if already enrolled
    if (enrollments.some(id => id === courseId)) {
      return true; // Already enrolled
    }

    // Add to enrollments
    enrollments.push(courseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));

    // In a real app, we would also make an API call:
    // await api.courses.enroll(courseId);

    return true;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return false;
  }
}

/**
 * Unenroll the current user from a course
 *
 * @param {number|string} courseId - ID of the course to unenroll from
 * @returns {boolean} Whether the unenrollment was successful
 */
export function unenrollFromCourse(courseId) {
  try {
    let enrollments = getEnrollments();

    // Remove the course
    enrollments = enrollments.filter(id => id !== courseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));

    // In a real app, we would also make an API call:
    // await api.courses.unenroll(courseId);

    return true;
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    return false;
  }
}

/**
 * Check if the user is enrolled in a specific course
 *
 * @param {number|string} courseId - ID of the course to check
 * @returns {boolean} Whether the user is enrolled in the course
 */
export function isEnrolledInCourse(courseId) {
  try {
    const enrollments = getEnrollments();
    return enrollments.some(id => id === courseId);
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
}

/**
 * Get enrollment date for a course
 *
 * @param {number|string} courseId - ID of the course to check
 * @returns {string|null} ISO date string when enrolled, or null if not enrolled
 */
export function getEnrollmentDate(courseId) {
  try {
    const key = `${STORAGE_KEY}_date_${courseId}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting enrollment date:', error);
    return null;
  }
}

/**
 * Set enrollment date for a course
 *
 * @param {number|string} courseId - ID of the course
 */
export function setEnrollmentDate(courseId) {
  try {
    const key = `${STORAGE_KEY}_date_${courseId}`;
    localStorage.setItem(key, new Date().toISOString());
  } catch (error) {
    console.error('Error setting enrollment date:', error);
  }
}
