/**
 * Storage utility functions for LecturePulse
 */

const TEACHER_SESSION_KEY = "lecturePulse_teacher";
const TEACHERS_DB_KEY = "lecturePulse_teachers_db";

const clearStoredTeacherSession = () => {
    localStorage.removeItem(TEACHER_SESSION_KEY);
};

const isValidTeacherSession = (sessionTeacher, storedTeacher) => {
    if (!sessionTeacher || !sessionTeacher.id) {
        return false;
    }

    if (!storedTeacher) {
        return false;
    }

    if (storedTeacher.name !== sessionTeacher.name) {
        return false;
    }

    if (storedTeacher.email && storedTeacher.email !== sessionTeacher.email) {
        return false;
    }

    if (
        storedTeacher.emailVerified !== undefined &&
        storedTeacher.emailVerified !== sessionTeacher.emailVerified
    ) {
        return false;
    }

    return true;
};

// Teacher Management
export const getCurrentTeacher = () => {
    try {
        const teacher = localStorage.getItem(TEACHER_SESSION_KEY);
        if (!teacher) {
            return null;
        }

        const sessionTeacher = JSON.parse(teacher);
        const teachersDb = JSON.parse(localStorage.getItem(TEACHERS_DB_KEY) || "{}");
        const storedTeacher = teachersDb[sessionTeacher.id];

        if (!isValidTeacherSession(sessionTeacher, storedTeacher)) {
            clearStoredTeacherSession();
            return null;
        }

        return sessionTeacher;
    } catch (error) {
        console.error("Error getting current teacher", error);
        clearStoredTeacherSession();
        return null;
    }
};

export const clearCurrentTeacher = () => {
    clearStoredTeacherSession();
};

// Lecture/Session Management
export const getLectureById = (lectureId) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        return allSessions.find(s => s.id === lectureId) || null;
    } catch (error) {
        console.error("Error getting lecture by ID", error);
        return null;
    }
};

export const getFeedbackByLecture = (lectureId) => {
    try {
        const allFeedback = JSON.parse(localStorage.getItem("lecturePulse_feedback") || "[]");
        return allFeedback.filter(f => f.lectureId === lectureId);
    } catch (error) {
        console.error("Error getting feedback by lecture", error);
        return [];
    }
};

export const getLecturesByTeacher = (teacherId) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        // Sort by newest first
        return allSessions
            .filter(s => s.teacherId === teacherId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(s => ({
                ...s,
                // Determine 'isActive' based on status or logic. For now, trust the 'status' field or default to checking dates/duration if needed
                isActive: s.status === 'active'
            }));
    } catch (error) {
        console.error("Error getting lectures", error);
        return [];
    }
};

export const createLecture = (lectureData) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
       let code = lectureData.code;

while (allSessions.some(session => session.code === code)) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
}

const newLecture = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'active',
    ...lectureData,
    code
};
        localStorage.setItem("lecturePulse_sessions", JSON.stringify([...allSessions, newLecture]));
        return newLecture;
    } catch (error) {
        console.error("Error creating lecture", error);
        throw error;
    }
};

export const updateLectureStatus = (lectureId, status) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        const updatedSessions = allSessions.map(s =>
            s.id === lectureId ? { ...s, status } : s
        );
        localStorage.setItem("lecturePulse_sessions", JSON.stringify(updatedSessions));
    } catch (error) {
        console.error("Error updating lecture status", error);
    }
};

export const deleteLecture = (lectureId) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        const updatedSessions = allSessions.filter(s => s.id !== lectureId);
        localStorage.setItem("lecturePulse_sessions", JSON.stringify(updatedSessions));
    } catch (error) {
        console.error("Error deleting lecture", error);
    }
};
