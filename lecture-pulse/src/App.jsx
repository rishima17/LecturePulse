import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import "./index.css";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import StudentFeedback from "./pages/StudentFeedback";
import Profile from "./pages/Profile";
import LiveSession from "./pages/LiveSession";
import BackToTop from "./components/BackToTop";
import Footer from './components/Footer';


function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthProvider>
        <Toaster position="top-right" theme="system" />
        
        {/* The main tag expands to fill empty space, pinning the footer to the bottom */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student" element={<StudentFeedback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics/:sessionId" element={<Analytics />} />
            <Route path="/live/:sessionId" element={<LiveSession />} />
          </Routes>
        </main>

        <BackToTop />
      </AuthProvider>

      {/* Render the global footer here */}
      <Footer />
    </div>
  );
}

export default App;
