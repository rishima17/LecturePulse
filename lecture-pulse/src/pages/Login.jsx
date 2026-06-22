import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, Loader2, User, Lock, ArrowRight, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", teacherId: "", password: "" });
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.teacherId.trim()) return setError("Teacher ID is required.");
    if (!formData.password.trim()) return setError("Password is required.");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters long.");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    let result;
    if (isLogin) {
      result = login(formData.teacherId, formData.password);
    } else {
      if (!formData.name) {
        result = { success: false, message: "Name is required." };
      } else {
        result = register(formData.name, formData.teacherId, formData.password);
      }
    }
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-background">
      <Link to="/" className="absolute top-4 left-4 z-50 md:top-8 md:left-8">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl z-10">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold">LecturePulse</span>
          </Link>
          <p className="text-muted-foreground text-sm">{isLogin ? "Sign in to your account" : "Create a new account"}</p>
        </motion.div>

        <Card className="border shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div key="name" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="name" placeholder="Your name" className="pl-9 h-12 bg-background/50" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="teacherId">Teacher ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="teacherId" placeholder="Enter your teacher ID" className="pl-9 h-12 bg-background/50" value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-9 h-12 bg-background/50" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                    <div className="w-1 h-4 bg-destructive rounded-full" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]" size="lg" disabled={loading}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running checks...</>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Access Dashboard" : "Initiate Setup"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-sm text-primary hover:underline">
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/30 p-6 justify-center">
            <p className="text-xs text-muted-foreground text-center">
              Protected by LecturePulse Security. <br /> By continuing, you agree to our Terms of Service.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}