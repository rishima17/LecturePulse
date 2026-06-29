import { createContext, useContext, useState } from "react";
import emailjs from "@emailjs/browser";
import { getCurrentTeacher } from "@/utils/storage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(() => {
    return getCurrentTeacher();
  });
  const [loading] = useState(false);

  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const login = async (teacherId, password) => {
    // Hackathon Logic: Retrieve from array of teachers or single object?
    // Let's assume we store a "teachers" object in LS: { [id]: { password, name } }
    
    const teachersFn = localStorage.getItem("lecturePulse_teachers_db");
    const teachers = teachersFn ? JSON.parse(teachersFn) : {};

    const user = teachers[teacherId];

    let isValidPassword = false;
    if (user) {
      const looksHashed = /^[a-f0-9]{64}$/i.test(user.password);
      if (looksHashed) {
        isValidPassword = user.password === await hashPassword(password);
      } else {
        isValidPassword = user.password === password;
        if (isValidPassword) {
          user.password = await hashPassword(password);
          localStorage.setItem(
            "lecturePulse_teachers_db",
            JSON.stringify(teachers)
          );
        }
      }
    }

    if (user && isValidPassword) {
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

  const register = async (name, teacherId, password) => {
      const teachersFn = localStorage.getItem("lecturePulse_teachers_db");
      const teachers = teachersFn ? JSON.parse(teachersFn) : {};

      if (teachers[teacherId]) {
          return { success: false, message: "Teacher ID already exists." };
      }

      teachers[teacherId] = {
        name,
        password: await hashPassword(password),
      };
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

  const sendOTP = async (email) => {
    const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
      return {
        success: false,
        message: "Email service is not configured. Please add the EmailJS environment variables.",
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpData = {
      otp,
      timestamp: Date.now(),
    };

    try {
      await emailjs.send(
        emailJsServiceId,
        emailJsTemplateId,
        {
          to_email: email,
          otp_code: otp,
          app_name: "LecturePulse",
        },
        {
          publicKey: emailJsPublicKey,
        }
      );

      localStorage.setItem(
        `lecturePulse_otp_${email}`,
        JSON.stringify(otpData)
      );

      return { success: true };
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return {
        success: false,
        message: "Could not send the verification code. Please try again.",
      };
    }
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
