/**
 * Service for managing video playback progress
 *
 * This service provides functions to save and retrieve
 * video playback progress from localStorage. In a production
 * environment, this would be replaced with API calls to a backend
 * to persist progress across devices.
 */

const STORAGE_PREFIX = "coursechampion_video_progress_";

/**
 * Save video playback progress
 *
 * @param {string} videoId - Unique identifier for the video (typically courseId_lessonId_videoUrl)
 * @param {object} progressData - Progress data to save
 * @param {number} progressData.currentTime - Current playback position in seconds
 * @param {number} progressData.duration - Total duration of the video
 * @param {number} progressData.progress - Percentage of video watched (0-100)
 * @param {boolean} progressData.completed - Whether the video has been completed
 * @param {string} progressData.timestamp - ISO timestamp of when progress was saved
 */
export function saveVideoProgress(videoId, progressData) {
  if (!videoId) return;

  try {
    // Store in localStorage
    localStorage.setItem(
      `${STORAGE_PREFIX}${videoId}`,
      JSON.stringify(progressData)
    );

    // In a real app, we would also send to the API
    // api.post('/progress', { videoId, progressData });

    return true;
  } catch (error) {
    console.error("Error saving video progress:", error);
    return false;
  }
}

/**
 * Get saved video playback progress
 *
 * @param {string} videoId - Unique identifier for the video
 * @returns {object|null} Progress data or null if not found
 */
export function getVideoProgress(videoId) {
  if (!videoId) return null;

  try {
    const savedData = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Error getting video progress:", error);
    return null;
  }
}

/**
 * Delete saved video playback progress
 *
 * @param {string} videoId - Unique identifier for the video
 * @returns {boolean} Success status
 */
export function deleteVideoProgress(videoId) {
  if (!videoId) return false;

  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
    return true;
  } catch (error) {
    console.error("Error deleting video progress:", error);
    return false;
  }
}

/**
 * Get all saved video progress for a course
 *
 * @param {string|number} courseId - Course identifier
 * @returns {object} Map of lessonId to progress data
 */
export function getCourseProgress(courseId) {
  if (!courseId) return {};

  try {
    const prefix = `${STORAGE_PREFIX}${courseId}_`;
    const progressMap = {};

    // Iterate through localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        // Extract lessonId from the key
        const lessonId = key.split("_")[1];
        if (lessonId) {
          progressMap[lessonId] = JSON.parse(localStorage.getItem(key));
        }
      }
    }

    return progressMap;
  } catch (error) {
    console.error("Error getting course progress:", error);
    return {};
  }
}

/**
 * Calculate the overall progress for a course
 *
 * @param {string|number} courseId - Course identifier
 * @param {array} lessons - Array of lesson objects
 * @returns {object} Course progress stats
 */
export function calculateCourseProgress(courseId, lessons) {
  if (!courseId || !lessons || !lessons.length) {
    return {
      completedLessons: 0,
      totalLessons: 0,
      percentComplete: 0,
      completedLessonIds: [],
    };
  }

  const progressMap = getCourseProgress(courseId);
  const completedLessonIds = [];
  let completedLessons = 0;

  lessons.forEach((lesson) => {
    const lessonProgress = progressMap[lesson.id];
    // Consider a lesson completed if it has progress data and is marked as completed
    // or if progress is over 90%
    if (
      lessonProgress &&
      (lessonProgress.completed || lessonProgress.progress >= 90)
    ) {
      completedLessons++;
      completedLessonIds.push(lesson.id);
    }
  });

  return {
    completedLessons,
    totalLessons: lessons.length,
    percentComplete: Math.round((completedLessons / lessons.length) * 100),
    completedLessonIds,
  };
}
