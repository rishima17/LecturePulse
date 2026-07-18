import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EXIT_TICKET_TYPES } from "@/constants/exitTicketTypes";
import { submitExitTicketResponse } from "@/utils/exitTicketStorage";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExitTicketForm({ exitTicket, sessionCode, onComplete }) {
  const [selectedValue, setSelectedValue] = useState(null); // MC or TF
  const [textValue, setTextValue] = useState(""); // Short answer
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };

  const handleSelectMC = (opt) => {
    setSelectedValue(opt);
  };

  const handleSelectTF = (val) => {
    setSelectedValue(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    let submissionValue = null;
    if (exitTicket.type === EXIT_TICKET_TYPES.MULTIPLE_CHOICE) {
      if (!selectedValue) {
        toast.error("Please select an option.");
        return;
      }
      submissionValue = selectedValue;
    } else if (exitTicket.type === EXIT_TICKET_TYPES.TRUE_FALSE) {
      if (!selectedValue) {
        toast.error("Please select True or False.");
        return;
      }
      submissionValue = selectedValue;
    } else if (exitTicket.type === EXIT_TICKET_TYPES.SHORT_ANSWER) {
      if (!textValue.trim()) {
        toast.error("Please enter your answer.");
        return;
      }
      submissionValue = textValue.trim();
    }

    setSubmitting(true);
    try {
      // Small simulated delay for smoother visual feedback
      await new Promise((resolve) => setTimeout(resolve, 650));
      submitExitTicketResponse(sessionCode, submissionValue);
      setSubmitted(true);
      toast.success("Exit Ticket submitted anonymously!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit response.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="exit-ticket-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-card rounded-2xl border border-border shadow-xl relative overflow-hidden"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500" />
            
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
                Class Exit Ticket
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-muted-foreground mt-1.5">
                Let your teacher know how you did in today's class. Completely anonymous.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Question Box */}
              <div className="p-5 rounded-xl bg-muted/30 border border-border/50 text-center">
                <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
                  {exitTicket.question}
                </p>
              </div>

              {/* Input section based on type */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {exitTicket.type === EXIT_TICKET_TYPES.MULTIPLE_CHOICE && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {exitTicket.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectMC(opt)}
                        disabled={submitting}
                        className={`w-full py-3.5 px-5 text-left rounded-xl border-2 transition-all font-medium flex items-center justify-between ${
                          selectedValue === opt
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-border bg-card hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <span className="text-sm md:text-base">{opt}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedValue === opt ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}>
                          {selectedValue === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {exitTicket.type === EXIT_TICKET_TYPES.TRUE_FALSE && (
                  <div className="grid grid-cols-2 gap-4">
                    {["true", "false"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectTF(val)}
                        disabled={submitting}
                        className={`w-full py-5 rounded-xl border-2 font-bold capitalize transition-all flex flex-col items-center gap-1 ${
                          selectedValue === val
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-border bg-card hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <span className="text-xl">{val === "true" ? "👍" : "👎"}</span>
                        <span className="text-sm md:text-base">{val}</span>
                      </button>
                    ))}
                  </div>
                )}

                {exitTicket.type === EXIT_TICKET_TYPES.SHORT_ANSWER && (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Type your response here..."
                      value={textValue}
                      onChange={handleTextChange}
                      disabled={submitting}
                      className="w-full min-h-[120px] p-4 rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-background text-sm md:text-base resize-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/10 rounded-xl"
                >
                  {submitting ? "Submitting..." : "Submit Answer"}
                </Button>
              </form>
            </CardContent>
          </motion.div>
        ) : (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto text-center p-8 bg-card border border-border rounded-2xl shadow-2xl relative overflow-hidden"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500" />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Answer Submitted!</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xs mx-auto mb-8">
              Your response is saved anonymously. Thank you for participating.
            </p>

            <Button
              variant="default"
              size="lg"
              onClick={onComplete}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 rounded-xl cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                Continue to Mood Meter
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
