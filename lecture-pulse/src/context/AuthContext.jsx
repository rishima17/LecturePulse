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

  const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

  const sendOTP = (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpData = {
      otp,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      `lecturePulse_otp_${email}`,
      JSON.stringify(otpData)
    );

    return otp;
  };

  const verifyOTP = (email, otp) => {
    const storedData = localStorage.getItem(`lecturePulse_otp_${email}`);

    if (!storedData) {
      return { success: false, message: "OTP not found." };
    }

    const { otp: storedOtp, timestamp } = JSON.parse(storedData);

    const isExpired =
      Date.now() - timestamp > OTP_EXPIRY_TIME;

    if (isExpired) {
      localStorage.removeItem(`lecturePulse_otp_${email}`);
      return { success: false, message: "OTP has expired." };
    }

    if (storedOtp === otp) {
      localStorage.removeItem(`lecturePulse_otp_${email}`);

      const updatedSession = {
        ...teacher,
        email,
        emailVerified: true,
      };

      setTeacher(updatedSession);
      localStorage.setItem(
        "lecturePulse_teacher",
        JSON.stringify(updatedSession)
      );

      const teachersFn = localStorage.getItem(
        "lecturePulse_teachers_db"
      );

      if (teachersFn) {
        const teachers = JSON.parse(teachersFn);

        if (teachers[teacher.id]) {
          teachers[teacher.id].email = email;
          teachers[teacher.id].emailVerified = true;

          localStorage.setItem(
            "lecturePulse_teachers_db",
            JSON.stringify(teachers)
          );
        }
      }

      return { success: true };
    }

    return { success: false, message: "Invalid OTP." };
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
