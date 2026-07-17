import { getLectureById, updateLecture } from "./storage";

/**
 * Gets all bookmarked lectures from storage.
 * @returns {Array} List of bookmarked lectures
 */
export const getBookmarkedLectures = () => {
    try {
        const sessionsRaw = localStorage.getItem("lecturePulse_sessions");
        if (!sessionsRaw) return [];
        const allSessions = JSON.parse(sessionsRaw);
        if (!Array.isArray(allSessions)) return [];
        // Map over sessions and ensure older lectures default bookmarked to false
        return allSessions
            .filter(s => !!s.bookmarked)
            .map(s => ({
                ...s,
                bookmarked: true,
                isActive: s.status === 'active',
            }));
    } catch (error) {
        console.error("Error getting bookmarked lectures:", error);
        return [];
    }
};

/**
 * Checks if a lecture with the given ID is bookmarked.
 * @param {string} id - Lecture ID
 * @returns {boolean} True if bookmarked, otherwise false
 */
export const isBookmarked = (id) => {
    if (!id) return false;
    try {
        const lecture = getLectureById(id);
        return lecture ? !!lecture.bookmarked : false;
    } catch (error) {
        console.error("Error checking bookmark status:", error);
        return false;
    }
};

/**
 * Explicitly updates the bookmarked status of a lecture by ID.
 * @param {string} id - Lecture ID
 * @param {boolean} [bookmarkedState=true] - State to set
 * @returns {Object|null} The updated lecture object or null
 */
export const updateLectureBookmark = (id, bookmarkedState = true) => {
    if (!id) return null;
    try {
        return updateLecture(id, { bookmarked: !!bookmarkedState });
    } catch (error) {
        console.error("Error updating lecture bookmark status:", error);
        return null;
    }
};

/**
 * Toggles the bookmarked status of a lecture.
 * @param {string} id - Lecture ID
 * @returns {Object|null} The updated lecture object or null
 */
export const toggleBookmark = (id) => {
    if (!id) return null;
    try {
        const currentStatus = isBookmarked(id);
        return updateLectureBookmark(id, !currentStatus);
    } catch (error) {
        console.error("Error toggling bookmark:", error);
        return null;
    }
};

// Re-export getLectureById to centralize helper utilities
export { getLectureById };
