import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Home } from "lucide-react";
import { toast } from "sonner";
import { MOOD_DETAILS } from "@/constants/moodTypes";
import { getVotedMood, submitMood } from "@/utils/moodStorage";
import MoodButton from "./MoodButton";

export default function MoodMeter({ sessionCode, onBackToHome }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const votedMood = getVotedMood(sessionCode);
    if (votedMood) {
      setSelectedMood(votedMood);
      setHasVoted(true);
    }
  }, [sessionCode]);

  const handleVote = async (moodType) => {
    if (hasVoted || submitting) return;
    setSubmitting(true);
    setSelectedMood(moodType);

    try {
      // Small simulated delay for smoother transition
      await new Promise((resolve) => setTimeout(resolve, 600));
      submitMood(sessionCode, moodType);
      toast.success("Mood submitted successfully! Thank you!");
      setHasVoted(true);
    } catch (error) {
      toast.error(error.message || "Failed to submit mood");
      setSelectedMood(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-2xl backdrop-blur-xl bg-card/80 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500" />

      <AnimatePresence mode="wait">
        {!hasVoted ? (
          <motion.div
            key="vote-flow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl md:text-3xl font-bold">Lecture Finished!</CardTitle>
              <CardDescription className="text-base md:text-lg text-muted-foreground mt-2">
                How did today's lecture make you feel?
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.keys(MOOD_DETAILS).map((key) => {
                  const details = MOOD_DETAILS[key];
                  return (
                    <MoodButton
                      key={key}
                      emoji={details.emoji}
                      label={details.label}
                      color={details.color}
                      borderClass={details.borderClass}
                      bgClass={details.bgClass}
                      textClass={details.textClass}
                      hoverBg={details.hoverBg}
                      isSelected={selectedMood === key}
                      disabled={submitting}
                      onClick={() => handleVote(key)}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-center text-muted-foreground/60 mt-6">
                Your response is completely anonymous. Only aggregated moods are shared with the teacher.
              </p>
            </CardContent>
          </motion.div>
        ) : (
          <motion.div
            key="thank-you-flow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center p-8 flex flex-col items-center justify-center min-h-[300px]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold mb-2">Thank you!</h2>
            <p className="text-muted-foreground text-base max-w-sm mb-8">
              Your feedback is anonymous and helps your teacher understand the classroom energy.
            </p>

            {selectedMood && (
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted/60 border rounded-full text-sm font-medium mb-8">
                <span>Your feeling:</span>
                <span className="text-lg select-none">{MOOD_DETAILS[selectedMood]?.emoji}</span>
                <span className={MOOD_DETAILS[selectedMood]?.textClass}>
                  {MOOD_DETAILS[selectedMood]?.label}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={onBackToHome}
              className="border-input hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
