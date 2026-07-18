import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXIT_TICKET_TYPES } from "@/constants/exitTicketTypes";
import { saveExitTicket } from "@/utils/exitTicketStorage";
import { updateLectureStatus } from "@/utils/storage";
import { toast } from "sonner";
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExitTicketDialog({ open, onClose, lecture, onUpdate }) {
  const [includeExitTicket, setIncludeExitTicket] = useState(true);
  const [questionType, setQuestionType] = useState(EXIT_TICKET_TYPES.MULTIPLE_CHOICE);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(null); // For MC (0-3)
  const [tfCorrect, setTfCorrect] = useState(null); // For T/F ("true" or "false")

  if (!open || !lecture) return null;

  const handleAddOption = () => {
    if (options.length >= 4) {
      toast.error("Maximum 4 options allowed.");
      return;
    }
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      toast.error("Multiple choice questions require at least 2 options.");
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    if (correctIndex === index) {
      setCorrectIndex(null);
    } else if (correctIndex > index) {
      setCorrectIndex(correctIndex - 1);
    }
  };

  const handleOptionChange = (index, val) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const validate = () => {
    if (!includeExitTicket) return true;

    if (!question.trim()) {
      toast.error("Please enter a question.");
      return false;
    }

    if (questionType === EXIT_TICKET_TYPES.MULTIPLE_CHOICE) {
      const activeOptions = options.map(o => o.trim());
      if (activeOptions.some(o => !o)) {
        toast.error("Please fill in all multiple choice options.");
        return false;
      }
      if (correctIndex === null || correctIndex < 0 || correctIndex >= options.length) {
        toast.error("Please select the correct answer.");
        return false;
      }
    }

    if (questionType === EXIT_TICKET_TYPES.TRUE_FALSE) {
      if (tfCorrect === null) {
        toast.error("Please select whether the statement is True or False.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // 1. End lecture
      updateLectureStatus(lecture.id, "completed");

      // 2. Save exit ticket if included
      if (includeExitTicket) {
        const ticketData = {
          id: crypto.randomUUID(),
          type: questionType,
          question: question.trim(),
          createdAt: new Date().toISOString(),
        };

        if (questionType === EXIT_TICKET_TYPES.MULTIPLE_CHOICE) {
          ticketData.options = options.map(o => o.trim());
          ticketData.correctAnswer = options[correctIndex].trim();
        } else if (questionType === EXIT_TICKET_TYPES.TRUE_FALSE) {
          ticketData.correctAnswer = tfCorrect;
        }

        saveExitTicket(lecture.code, ticketData);
        toast.success("Lecture ended and Exit Ticket published!");
      } else {
        toast.success("Lecture ended successfully.");
      }

      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete this action.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-foreground">End Lecture Session</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Session: {lecture.topic} ({lecture.code})</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Include Exit Ticket Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
            <div>
              <Label className="text-base font-semibold text-foreground cursor-pointer" htmlFor="include-ticket-toggle">
                Add an Exit Ticket
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Students will answer this short assessment before seeing the Mood Meter.
              </p>
            </div>
            <input
              id="include-ticket-toggle"
              type="checkbox"
              checked={includeExitTicket}
              onChange={(e) => setIncludeExitTicket(e.target.checked)}
              className="w-10 h-6 bg-muted rounded-full appearance-none relative checked:bg-primary transition-all duration-300 cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:left-5 before:transition-all before:duration-300 border border-border"
            />
          </div>

          <AnimatePresence mode="wait">
            {includeExitTicket ? (
              <motion.div
                key="exit-ticket-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 overflow-hidden"
              >
                {/* Question Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Question Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: EXIT_TICKET_TYPES.MULTIPLE_CHOICE, label: "Multiple Choice" },
                      { type: EXIT_TICKET_TYPES.TRUE_FALSE, label: "True / False" },
                      { type: EXIT_TICKET_TYPES.SHORT_ANSWER, label: "Short Answer" },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setQuestionType(item.type)}
                        className={`py-3 px-2 text-xs font-semibold rounded-xl border transition-all ${
                          questionType === item.type
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Input */}
                <div className="space-y-2">
                  <Label htmlFor="exit-question" className="text-sm font-semibold">
                    Question Prompt
                  </Label>
                  <Input
                    id="exit-question"
                    placeholder="e.g., What is the main takeaway from today's lesson?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="h-11 bg-background"
                  />
                </div>

                {/* Question Type Options Rendering */}
                {questionType === EXIT_TICKET_TYPES.MULTIPLE_CHOICE && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Answer Options & Correct Answer</Label>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        disabled={options.length >= 4}
                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCorrectIndex(idx)}
                            className={`p-1.5 rounded-full transition-colors ${
                              correctIndex === idx
                                ? "text-emerald-500 bg-emerald-500/10"
                                : "text-muted-foreground hover:text-emerald-500"
                            }`}
                            title="Mark as correct answer"
                          >
                            <CheckCircle2 className={`w-5 h-5 ${correctIndex === idx ? "fill-emerald-500 text-white" : ""}`} />
                          </button>
                          
                          <Input
                            placeholder={`Option ${idx + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            className="bg-background flex-1 h-10"
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={options.length <= 2}
                            onClick={() => handleRemoveOption(idx)}
                            className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 bg-muted/40 p-2.5 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                      Select the check circle next to the correct option. Used for analytics scoring.
                    </p>
                  </div>
                )}

                {questionType === EXIT_TICKET_TYPES.TRUE_FALSE && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Correct Answer</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["true", "false"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setTfCorrect(val)}
                          className={`py-3 px-4 font-bold rounded-xl border capitalize transition-all ${
                            tfCorrect === val
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-sm"
                              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {questionType === EXIT_TICKET_TYPES.SHORT_ANSWER && (
                  <div className="p-4 rounded-xl border border-border bg-muted/20 text-center">
                    <p className="text-xs text-muted-foreground">
                      Students will respond with a free-form text input. No correct answer is specified.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-exit-ticket"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl border border-dashed border-border bg-muted/10 text-center space-y-2"
              >
                <p className="text-sm text-foreground font-semibold">Ending without an Exit Ticket</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  The lecture will end immediately, and students will only be prompted to submit their overall mood.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="h-10">
              Cancel
            </Button>
            <Button
              type="submit"
              className={includeExitTicket ? "bg-primary text-primary-foreground hover:bg-primary/95 h-10" : "bg-destructive text-destructive-foreground hover:bg-destructive/95 h-10"}
            >
              {includeExitTicket ? "End & Publish Exit Ticket" : "End Lecture Session"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
