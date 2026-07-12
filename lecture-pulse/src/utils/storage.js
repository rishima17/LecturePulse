/**
 * Storage utility functions for LecturePulse
 */

const TEACHER_SESSION_KEY = "lecturePulse_teacher";
const TEACHERS_DB_KEY = "lecturePulse_teachers_db";
const STUDENT_ID_KEY = "lecturePulse_student_id";
const LIVE_SESSIONS_KEY = "lecturePulse_liveSessions";

const clearStoredTeacherSession = () => {
    localStorage.removeItem(TEACHER_SESSION_KEY);
};

// Student Identity Management
export const getOrCreateStudentId = () => {
    try {
        let studentId = localStorage.getItem(STUDENT_ID_KEY);
        if (!studentId) {
            studentId = crypto.randomUUID();
            localStorage.setItem(STUDENT_ID_KEY, studentId);
        }
        return studentId;
    } catch (error) {
        console.error("Error managing student ID", error);
        return "anonymous-student";
    }
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
        return allSessions.find((s) => s.id === lectureId) || null;
    } catch (error) {
        console.error("Error getting lecture by ID", error);
        return null;
    }
};

export const getFeedbackByLecture = (lectureId) => {
    try {
        const allFeedback = JSON.parse(localStorage.getItem("lecturePulse_feedback") || "[]");
        return allFeedback.filter((f) => f.lectureId === lectureId);
    } catch (error) {
        console.error("Error getting feedback by lecture", error);
        return [];
    }
};

export const hasStudentSubmitted = (lectureId, studentId) => {
    try {
        const allFeedback = JSON.parse(localStorage.getItem("lecturePulse_feedback") || "[]");
        return allFeedback.some((f) => f.lectureId === lectureId && f.studentId === studentId);
    } catch (error) {
        console.error("Error checking student submission", error);
        return false;
    }
};

export const submitFeedback = (feedbackData) => {
    try {
        const allFeedback = JSON.parse(localStorage.getItem("lecturePulse_feedback") || "[]");

        // Final server-side style check before persistence
        if (hasStudentSubmitted(feedbackData.lectureId, feedbackData.studentId)) {
            throw new Error("Already submitted feedback for this session");
        }

        const newFeedback = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...feedbackData,
        };

        localStorage.setItem("lecturePulse_feedback", JSON.stringify([...allFeedback, newFeedback]));
        return newFeedback;
    } catch (error) {
        console.error("Error submitting feedback", error);
        throw error;
    }
};

export const getLecturesByTeacher = (teacherId) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        const liveSessions = getLiveSessions();

        return allSessions
            .filter((s) => s.teacherId === teacherId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((s) => {
                const liveSession = liveSessions.find((session) => session.lectureId === s.id);
                return {
                    ...s,
                    isActive: s.status === "active",
                    isLive: Boolean(liveSession?.isLive),
                    liveSessionId: liveSession?.id || null,
                    liveStartedAt: liveSession?.startedAt || null,
                    liveParticipants: liveSession?.participants || [],
                };
            });
    } catch (error) {
        console.error("Error getting lectures", error);
        return [];
    }
};

export const createLecture = (lectureData) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        let code = lectureData.code;

        while (allSessions.some((session) => session.code === code)) {
            code = Math.floor(100000 + Math.random() * 900000).toString();
        }

const newLecture = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    lectureNotes: '',
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
        const updatedSessions = allSessions.map((s) =>
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
        const updatedSessions = allSessions.filter((s) => s.id !== lectureId);
        localStorage.setItem("lecturePulse_sessions", JSON.stringify(updatedSessions));
    } catch (error) {
        console.error("Error deleting lecture", error);
    }
};

export const updateLecture = (lectureId, updatedData) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        const updatedSessions = allSessions.map(s => {
            if (s.id === lectureId) {
                return {
                    ...s,
                    ...updatedData,
                    updatedAt: new Date().toISOString()
                };
            }
            return s;
        });
        localStorage.setItem("lecturePulse_sessions", JSON.stringify(updatedSessions));
        return updatedSessions.find(s => s.id === lectureId) || null;
    } catch (error) {
        console.error("Error updating lecture", error);
        return null;
    }
};

export const getLectureNotes = (lectureId) => {
    const lecture = getLectureById(lectureId);
    return lecture ? lecture.lectureNotes || "" : "";
};

export const saveLectureNotes = (lectureId, notes) => {
    if (typeof notes !== "string") {
        throw new Error("Notes must be a string");
    }
    const trimmedNotes = notes.trim();
    if (!trimmedNotes) {
        throw new Error("Notes cannot be empty");
    }
    if (trimmedNotes.length > 10000) {
        throw new Error("Notes cannot exceed 10000 characters");
    }
    return updateLecture(lectureId, { lectureNotes: trimmedNotes });
};

export const updateLectureNotes = (lectureId, notes) => {
    return saveLectureNotes(lectureId, notes);
};
