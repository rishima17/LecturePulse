import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Mail, ShieldAlert } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function Profile() {
  const { teacher, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP
  const [isEditing, setIsEditing] = useState(false);

  if (!teacher) {
    navigate("/login");
    return null;
  }

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    const generatedOtp = sendOTP(email);
    setStep(2);
    // Simulating sending email
    toast.success("Verification code sent!", {
      description: `For hackathon demo, your code is: ${generatedOtp}`,
      duration: 10000,
    });
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the verification code");
      return;
    }
    const result = verifyOTP(email, otp);
    if (result.success) {
      toast.success("Email verified successfully!");
      setStep(1);
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-background py-12 px-4">
      {/* Theme Toggle */}
      <div className="fixed top-10 right-4 z-[9999]">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="
            w-11 h-11 rounded-full
            flex items-center justify-center
            border border-border/50
            bg-[#00C2C5]/20
            hover:bg-[#00C2C5]/30
            transition-all duration-300
            hover:scale-105
            shadow-lg
          "
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>
      <div className="container mx-auto max-w-2xl">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Name</p>
                <p className="text-lg">{teacher.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Teacher ID</p>
                <p className="text-lg font-mono">{teacher.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Link an email address to your account for recovery and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacher.emailVerified && !isEditing ? (
                <div className="flex items-center justify-between p-4 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-medium">Email Verified</p>
                      <p className="text-sm truncate">{teacher.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsEditing(true);
                      setEmail(teacher.email);
                      setStep(1);
                    }}
                    className="ml-4"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!isEditing && (
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20 mb-6">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <p className="text-sm">
                        Your account does not have a verified email address. Please link one to secure your account.
                      </p>
                    </div>
                  )}

                  {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            placeholder="teacher@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1 sm:flex-none">
                          Send Verification Code
                        </Button>
                        {isEditing && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Code</label>
                        <p className="text-xs text-muted-foreground">
                          Enter the 6-digit code sent to {email}
                        </p>
                        <input
                          type="text"
                          placeholder="000000"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full px-4 py-2 border rounded-md bg-background font-mono text-center tracking-widest text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1 sm:flex-none">
                          Verify Code
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setStep(1)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
