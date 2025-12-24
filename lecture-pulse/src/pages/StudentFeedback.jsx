import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Activity, Brain, Clock, HelpCircle, CheckCircle2, Frown, Meh, Smile, ArrowLeft, Loader2, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Student() {
  const [step, setStep] = useState("code"); // code, feedback, success
  const [sessionCode, setSessionCode] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Feedback State
  const [understanding, setUnderstanding] = useState(null); // 'clear', 'partial', 'confusing'
  const [attention, setAttention] = useState(null); // 'high', 'medium', 'low'
  const [confusionTime, setConfusionTime] = useState(null); // 'early', 'mid', 'late'
  const [comment, setComment] = useState("");

  const verifyCode = (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      // Simulate network
      setTimeout(() => {
          const sessions = JSON.parse(localStorage.getItem("lecturePulse_sessions") || "[]");
          const session = sessions.find(s => s.code === sessionCode && s.status === 'active');

          if(session) {
              setActiveSession(session);
              setStep("feedback");
          } else {
              setError("Invalid or inactive session code.");
          }
          setLoading(false);
      }, 600);
  };

  const submitFeedback = (e) => {
      e.preventDefault();
      if(!understanding || !attention) {
          setError("Please fill out the key fields.");
          return;
      }
      setLoading(true);

      const feedback = {
          id: crypto.randomUUID(),
          lectureId: activeSession.id,
          understanding,
          attention,
          confusionTime,
          comment,
          timestamp: new Date().toISOString()
      };

      const allFeedback = JSON.parse(localStorage.getItem("lecturePulse_feedback") || "[]");
      localStorage.setItem("lecturePulse_feedback", JSON.stringify([...allFeedback, feedback]));

      setTimeout(() => {
          setStep("success");
          setLoading(false);
      }, 800);
  };

  const UnderstandingOption = ({ value, icon: Icon, label, color }) => (
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => setUnderstanding(value)}
        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            understanding === value 
            ? `border-${color}-500 bg-${color}-500/10 text-${color}-600 shadow-md shadow-${color}-500/10` 
            : "border-muted bg-card hover:bg-muted/50 text-muted-foreground"
        }`}
      >
          <Icon className={`w-8 h-8 ${understanding === value ? `text-${color}-500` : ""}`} />
          <span className="font-medium text-sm">{label}</span>
      </motion.button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        
        {/* Navigation & Brand */}
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6 mb-8"
        >
             <Link to="/" className="flex items-center gap-3 mt-8 hover:opacity-80 transition-opacity">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                     <GraduationCap className="w-7 h-7 text-white" />
                 </div>
                 <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">
                     LecturePulse
                 </span>
             </Link>
        </motion.div>

        <AnimatePresence mode="wait">
            {step === "code" && (
                <motion.div
                    key="code"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <Card className="border-border/50 shadow-2xl backdrop-blur-xl bg-card/60">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl">Join Session</CardTitle>
                            <CardDescription>Enter the 6-digit code provided by your teacher</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={verifyCode} className="space-y-6">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <Input 
                                        className="relative text-center text-3xl tracking-[0.5em] font-mono uppercase h-16 bg-background/80 border-border/50 focus:border-primary/50 transition-all font-bold placeholder:tracking-normal placeholder:text-muted-foreground/30"
                                        placeholder="CODE"
                                        maxLength={6}
                                        value={sessionCode}
                                        onChange={(e) => setSessionCode(e.target.value)}
                                    />
                                </div>
                                {error && (
                                    <motion.p 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-md"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20" 
                                    disabled={loading || sessionCode.length < 6}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Join Lecture"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {step === "feedback" && (
                <motion.div
                    key="feedback"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                >
                    <Card className="border-border/50 shadow-2xl backdrop-blur-xl bg-card/80 overflow-visible">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500" />
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">{activeSession?.topic}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Clock className="w-4 h-4" />
                                        {activeSession?.subject}
                                    </CardDescription>
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-full animate-pulse">
                                    Live
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            
                            {/* Understanding */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                    <Brain className="w-4 h-4 text-primary" />
                                    How well are you understanding?
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    <UnderstandingOption value="clear" icon={Smile} label="Clear" color="emerald" />
                                    <UnderstandingOption value="partial" icon={Meh} label="Okay" color="amber" />
                                    <UnderstandingOption value="confusing" icon={Frown} label="Confused" color="rose" />
                                </div>
                            </div>

                            {/* Attention */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                    <Activity className="w-4 h-4 text-orange-500" />
                                    Current Attention Level
                                </label>
                                <div className="bg-muted/50 p-1.5 rounded-xl flex gap-1">
                                    {["Low", "Medium", "High"].map((level, i) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setAttention(level.toLowerCase())}
                                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                                                attention === level.toLowerCase()
                                                ? "bg-white text-primary shadow-sm scale-105"
                                                : "text-muted-foreground hover:bg-white/50"
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Confusion Point (Optional) */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                    <HelpCircle className="w-4 h-4 text-blue-500" />
                                    When did you get confused? (Optional)
                                </label>
                                <div className="flex gap-3">
                                    {["Early", "Mid", "Late"].map((time, i) => (
                                        <Button
                                            key={time}
                                            type="button"
                                            variant="outline"
                                            onClick={() => setConfusionTime(confusionTime === time.toLowerCase() ? null : time.toLowerCase())}
                                            className={`flex-1 border-input hover:bg-accent hover:text-accent-foreground transition-all ${
                                                confusionTime === time.toLowerCase() 
                                                ? "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" 
                                                : ""
                                            }`}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Comment */}
                            <div className="pt-2">
                                <Input 
                                    className="bg-background/50 border-input/50 focus:bg-background transition-all"
                                    placeholder="Any questions or comments?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}
                            
                            <Button 
                                onClick={submitFeedback} 
                                size="lg" 
                                className="w-full h-12 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Feedback"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {step === "success" && (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Card className="border-border/50 shadow-2xl backdrop-blur-xl bg-card/80 p-8 max-w-sm mx-auto">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                             <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Feedback Sent!</h2>
                        <p className="text-muted-foreground mb-8">Your input helps make the lecture better for everyone.</p>
                        <Button 
                            variant="outline" 
                            size="lg"
                            className="w-full border-input hover:bg-accent"
                            onClick={() => { setStep("code"); setSessionCode(""); setUnderstanding(null); setAttention(null); setConfusionTime(null); setComment(""); }}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Join Another Session
                        </Button>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
