import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { GraduationCap, Loader2, User, Lock, BadgeCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
// ... (keep state same)
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    password: "",
  });
  const [error, setError] = useState("");
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
// ... (keep handleSubmit same)
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay for "premium" feel
    await new Promise(resolve => setTimeout(resolve, 800));

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
       {/* Animated Background Mesh */}
       <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
       </div>

       <div className="w-full max-w-md z-10">
         {/* Brand Header */}
         <motion.div 
           initial={{ y: -20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="flex flex-col items-center mb-8"
         >
             <Link to="/" className="flex items-center gap-3 mb-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
                    <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">
                    LecturePulse
                </span>
             </Link>
             <p className="text-muted-foreground text-center max-w-xs">
               {isLogin ? "Welcome back, Professor. Your classroom analytics await." : "Join thousands of educators enhancing student engagement."}
             </p>
         </motion.div>

         <Card className="border-border/50 shadow-2xl backdrop-blur-xl bg-card/60 overflow-hidden relative">
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 transition-opacity duration-500 ${loading ? 'opacity-100' : 'opacity-0'}`} />

            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                    {isLogin ? "Sign In" : "Create Account"}
                </h2>
                {/* Mode Toggle */}
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => {
                        setIsLogin(!isLogin);
                        setError("");
                        setFormData({ name: "", teacherId: "", password: "" });
                   }}
                   className="text-xs text-muted-foreground hover:text-primary"
                >
                    {isLogin ? "Need an account?" : "Have an account?"}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <AnimatePresence mode="popLayout">
                    {!isLogin && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-2 mb-4">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="Prof. John Doe"
                                    className="pl-9 bg-background/50"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required={!isLogin}
                                />
                            </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div className="space-y-2">
                  <Label htmlFor="teacherId">Teacher ID</Label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="teacherId"
                      placeholder="e.g. T-1024"
                      className="pl-9 bg-background/50"
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                     <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 bg-background/50"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                     />
                  </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2"
                        >
                            <div className="w-1 h-4 bg-destructive rounded-full" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]" size="lg" disabled={loading}>
                  {loading ? (
                      <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running checks...
                      </>
                  ) : (
                      <span className="flex items-center gap-2">
                          {isLogin ? "Access Dashboard" : "Initiate Setup"}
                          <ArrowRight className="w-4 h-4" />
                      </span>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="bg-muted/30 p-4 justify-center">
                 <p className="text-xs text-muted-foreground text-center">
                    Protected by LecturePulse Security. <br/> By continuing, you agree to our Terms of Service.
                 </p>
            </CardFooter>
         </Card>
       </div>
    </div>
  );
}
