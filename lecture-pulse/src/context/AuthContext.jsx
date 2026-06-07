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
      const sessionUser = { 
        id: teacherId, 
        name: user.name,
        email: user.email || null,
        emailVerified: user.emailVerified || false 
      };
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
      const sessionUser = { 
        id: teacherId, 
        name,
        email: null,
        emailVerified: false
      };
      setTeacher(sessionUser);
      localStorage.setItem("lecturePulse_teacher", JSON.stringify(sessionUser));
      return { success: true };
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem("lecturePulse_teacher");
  };

  const sendOTP = (email) => {
    // Simulate sending OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`lecturePulse_otp_${email}`, otp);
    return otp; // Returning OTP for hackathon demo purposes (to display in toast)
  };

  const verifyOTP = (email, otp) => {
    const storedOtp = localStorage.getItem(`lecturePulse_otp_${email}`);
    if (storedOtp && storedOtp === otp) {
      localStorage.removeItem(`lecturePulse_otp_${email}`);
      
      // Update teacher session
      const updatedSession = { ...teacher, email, emailVerified: true };
      setTeacher(updatedSession);
      localStorage.setItem("lecturePulse_teacher", JSON.stringify(updatedSession));

      // Update teacher in database
      const teachersFn = localStorage.getItem("lecturePulse_teachers_db");
      if (teachersFn) {
        const teachers = JSON.parse(teachersFn);
        if (teachers[teacher.id]) {
          teachers[teacher.id].email = email;
          teachers[teacher.id].emailVerified = true;
          localStorage.setItem("lecturePulse_teachers_db", JSON.stringify(teachers));
        }
      }
      return { success: true };
    }
    return { success: false, message: "Invalid or expired OTP." };
  };

  return (
    <AuthContext.Provider value={{ teacher, login, register, logout, sendOTP, verifyOTP, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
