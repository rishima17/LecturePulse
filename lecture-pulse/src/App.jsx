import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import "./index.css";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Student from "./pages/StudentFeedback";
import Analytics from "./pages/Analytics";
import StudentFeedback from "./pages/StudentFeedback";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" theme="system" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student" element={<StudentFeedback />} />
        <Route path="/analytics/:sessionId" element={<Analytics />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
