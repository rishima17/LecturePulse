import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Users,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroBg from "@/assets/hero-bg.png";

const features = [
  {
    icon: Users,
    title: "Anonymous Feedback",
    description:
      "Students share honest opinions without fear, leading to more authentic insights.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Visualize understanding levels, attention patterns, and confusion points instantly.",
  },
  {
    icon: Activity,
    title: "Attention Tracking",
    description:
      "Identify when students lose focus and adapt your teaching accordingly.",
  },
  {
    icon: MessageSquare,
    title: "Smart Suggestions",
    description: "AI-powered recommendations to improve your future lectures.",
  },
];

const stats = [
  { value: "95%", label: "More Honest Feedback" },
  { value: "3x", label: "Faster Insights" },
  { value: "40%", label: "Better Engagement" },
];


function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              LecturePulse
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/student">Student Feedback</Link>
            </Button>
            <Button variant="default" asChild>
              <Link to="/login">Teacher Login</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="p-4 flex flex-col gap-4">
                <Button variant="ghost" asChild className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to="/student">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Student Feedback
                  </Link>
                </Button>
                <Button variant="default" asChild className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to="/login">
                    <Users className="w-4 h-4 mr-2" />
                    Teacher Login
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 z-0" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl z-0" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl z-0" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              Smart Lecture Analytics
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              Transform Every Lecture
              <br />
              <span className="text-gradient-primary">
                Into Actionable Insights
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Receive anonymous, real-time feedback from students. Understand
              attention patterns, identify confusion points, and improve your
              teaching with data-driven insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild className="w-full sm:w-auto">
                <Link to="/login">
                  Start Teaching Smarter
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
                <Link to="/student">Give Feedback</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 sm:p-0 bg-card/50 sm:bg-transparent rounded-xl sm:rounded-none backdrop-blur-sm sm:backdrop-blur-none border sm:border-none border-border/50">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Improve
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Powerful features designed for educators who want to make a real
              difference.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card
              variant="elevated"
              className="bg-cover bg-center text-primary-foreground p-12 text-center relative overflow-hidden"
              style={{ backgroundImage: "url('https://img.freepik.com/premium-photo/photo-elementary-school-students-teaching-learning-activities_889227-69551.jpg')" }}
            >
              <div className="absolute inset-0 bg-slate-900/80" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your Teaching?
                </h2>
                <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                  Join educators who are already using data-driven insights to
                  improve student engagement and understanding.
                </p>
                <Button variant="heroOutline" size="xl" asChild>
                  <Link to="/login">
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-foreground">LecturePulse</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for educators who care about student success.
          </p>
        </div>
      </footer>
    </div>
  );
}
export default Landing;
