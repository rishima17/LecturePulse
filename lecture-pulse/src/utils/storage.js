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
            status: "active",
            ...lectureData,
            code,
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

// Attendance Management
export const addAttendance = (lectureId, studentId) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        const updatedSessions = allSessions.map((s) => {
            if (s.id === lectureId) {
                const attendance = s.attendance ? [...s.attendance] : [];
                attendance.push({ studentId, timestamp: new Date().toISOString() });
                return { ...s, attendance };
            }
            return s;
        });
        localStorage.setItem("lecturePulse_sessions", JSON.stringify(updatedSessions));
    } catch (error) {
        console.error("Error adding attendance", error);
    }
};

export const getAttendance = (lectureId) => {
    try {
        const allSessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
        const lecture = allSessions.find((s) => s.id === lectureId);
        return lecture?.attendance || [];
    } catch (error) {
        console.error("Error getting attendance", error);
        return [];
    }
};

// Live Session Management
export const getLiveSessions = () => {
    try {
        return JSON.parse(localStorage.getItem(LIVE_SESSIONS_KEY) || "[]");
    } catch (error) {
        console.error("Error getting live sessions", error);
        return [];
    }
};

export const getLiveSessionByLectureId = (lectureId) => {
    try {
        return getLiveSessions().find((session) => session.lectureId === lectureId) || null;
    } catch (error) {
        console.error("Error getting live session", error);
        return null;
    }
};

export const getActiveLiveSessionByLectureId = (lectureId) => {
    const liveSession = getLiveSessionByLectureId(lectureId);
    return liveSession?.isLive ? liveSession : null;
};

const saveLiveSessions = (liveSessions) => {
    localStorage.setItem(LIVE_SESSIONS_KEY, JSON.stringify(liveSessions));
};

export const startLiveSession = (lecture, teacher) => {
    try {
        const liveSessions = getLiveSessions();
        const now = new Date().toISOString();
        const existingIndex = liveSessions.findIndex((session) => session.lectureId === lecture.id);

        const nextSession = {
            id: lecture.id,
            lectureId: lecture.id,
            teacherId: lecture.teacherId,
            teacherName: teacher?.name || lecture.teacherName || null,
            lectureTopic: lecture.topic,
            lectureSubject: lecture.subject,
            isLive: true,
            participants: [
                {
                    id: teacher?.id || lecture.teacherId,
                    name: teacher?.name || lecture.teacherName || "Teacher",
                    role: "teacher",
                    joinedAt: now,
                },
            ],
            startedAt: now,
            endedAt: null,
            chatMessages: [],
        };

        const updatedSessions = [...liveSessions];
        if (existingIndex >= 0) {
            updatedSessions[existingIndex] = {
                ...updatedSessions[existingIndex],
                ...nextSession,
            };
        } else {
            updatedSessions.push(nextSession);
        }

        saveLiveSessions(updatedSessions);
        return nextSession;
    } catch (error) {
        console.error("Error starting live session", error);
        throw error;
    }
};

export const endLiveSession = (lectureId) => {
    try {
        const liveSessions = getLiveSessions();
        const updatedSessions = liveSessions.map((session) =>
            session.lectureId === lectureId
                ? {
                      ...session,
                      isLive: false,
                      endedAt: new Date().toISOString(),
                  }
                : session
        );
        saveLiveSessions(updatedSessions);
    } catch (error) {
        console.error("Error ending live session", error);
    }
};

export const joinLiveSession = (lectureId, participant) => {
    try {
        const liveSessions = getLiveSessions();
        const now = new Date().toISOString();
        const updatedSessions = liveSessions.map((session) => {
            if (session.lectureId !== lectureId) {
                return session;
            }

            const nextParticipant = {
                ...participant,
                joinedAt: participant.joinedAt || now,
            };

            return {
                ...session,
                participants: [
                    ...(session.participants || []).filter((item) => item.id !== nextParticipant.id),
                    nextParticipant,
                ],
            };
        });
        saveLiveSessions(updatedSessions);
    } catch (error) {
        console.error("Error joining live session", error);
    }
};

export const leaveLiveSession = (lectureId, participantId) => {
    try {
        const liveSessions = getLiveSessions();
        const updatedSessions = liveSessions.map((session) =>
            session.lectureId === lectureId
                ? {
                      ...session,
                      participants: (session.participants || []).filter((participant) => participant.id !== participantId),
                  }
                : session
        );
        saveLiveSessions(updatedSessions);
    } catch (error) {
        console.error("Error leaving live session", error);
    }
};

export const appendLiveChatMessage = (lectureId, message) => {
    try {
        const liveSessions = getLiveSessions();
        const updatedSessions = liveSessions.map((session) =>
            session.lectureId === lectureId
                ? {
                      ...session,
                      chatMessages: [...(session.chatMessages || []), message],
                  }
                : session
        );
        saveLiveSessions(updatedSessions);
    } catch (error) {
        console.error("Error appending live chat message", error);
    }
};
