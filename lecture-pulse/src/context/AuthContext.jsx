import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(() => {
    const stored = localStorage.getItem("lecturePulse_teacher");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading] = useState(false);

  const login = (teacherId, password) => {
    // Hackathon Logic: Retrieve from array of teachers or single object?
    // Let's assume we store a "teachers" object in LS: { [id]: { password, name } }
    
    const teachersFn = localStorage.getItem("lecturePulse_teachers_db");
    const teachers = teachersFn ? JSON.parse(teachersFn) : {};

    const user = teachers[teacherId];

    if (user && user.password === password) {
      const sessionUser = { id: teacherId, name: user.name };
      setTeacher(sessionUser);
      localStorage.setItem("lecturePulse_teacher", JSON.stringify(sessionUser));
      return { success: true };
    } else if (!user) {
        return { success: false, message: "Teacher ID not found." };
    } else {
        return { success: false, message: "Invalid password." };
    }
  };

  const register = (name, teacherId, password) => {
      const teachersFn = localStorage.getItem("lecturePulse_teachers_db");
      const teachers = teachersFn ? JSON.parse(teachersFn) : {};

      if (teachers[teacherId]) {
          return { success: false, message: "Teacher ID already exists." };
      }

      teachers[teacherId] = { name, password };
      localStorage.setItem("lecturePulse_teachers_db", JSON.stringify(teachers));
      
      // Auto login
      const sessionUser = { id: teacherId, name };
      setTeacher(sessionUser);
      localStorage.setItem("lecturePulse_teacher", JSON.stringify(sessionUser));
      return { success: true };
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem("lecturePulse_teacher");
  };

  return (
    <AuthContext.Provider value={{ teacher, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
