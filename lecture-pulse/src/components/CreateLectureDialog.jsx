import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLecture } from "@/utils/storage";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { validateCode } from "@/lib/socket";

const CreateLectureDialog = ({ open, onOpenChange, teacherId, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    duration: "60",
  });

  if (!open) return null;

  const generateUniqueCode = async () => {
    let code = Math.floor(100000 + Math.random() * 900000).toString();
    const isAvailable = await validateCode(code);
    
    if (!isAvailable) {
      console.log(`Collision detected for code ${code}, regenerating...`);
      return await generateUniqueCode();
    }
    
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (formData.subject.trim().length < 3) {
      toast.error("Subject must be at least 3 characters");
      return;
    }

    if (!formData.topic.trim()) {
      toast.error("Topic is required");
      return;
    }

    if (formData.topic.trim().length < 3) {
      toast.error("Topic must be at least 3 characters");
      return;
    }

    if (!formData.duration) {
      toast.error("Duration is required");
      return;
    }

    const duration = Number(formData.duration);

    if (isNaN(duration)) {
      toast.error("Duration must be a number");
      return;
    }

    if (duration < 1) {
      toast.error("Duration must be at least 1 minute");
      return;
    }

    setLoading(true);
    try {
      const code = await generateUniqueCode();
      createLecture({
        teacherId,
        code,
        subject: formData.subject,
        topic: formData.topic,
        duration: parseInt(formData.duration),
      });
      toast.success(`Lecture created successfully! Code: ${code}`);
      setFormData({ subject: "", topic: "", duration: "60" });
      onCreated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Create New Lecture</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g. Physics"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              // required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g. Newton's Laws"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              // required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              // min="1"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              // required
            />
          </div>

          <div className="pt-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Lecture"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLectureDialog;
