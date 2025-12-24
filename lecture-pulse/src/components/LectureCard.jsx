import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Users, Trash2 } from "lucide-react";
import { deleteLecture, getFeedbackByLecture } from "@/utils/storage";
import { toast } from "sonner";

const LectureCard = ({ lecture, onUpdate }) => {
  const navigate = useNavigate();
  const feedbackCount = getFeedbackByLecture(lecture.id).length;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session?")) {
      deleteLecture(lecture.id);
      toast.success("Lecture deleted successfully");
      onUpdate();
    }
  };

  const handleNavigate = () => {
    navigate(`/analytics/${lecture.id}`);
  };

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lecture.code);
    toast.success("Code copied to clipboard");
  };

  return (
    <Card className="rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden">
      <CardContent className="p-5 flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
             <h3 className="font-bold text-lg leading-tight text-foreground">{lecture.topic}</h3>
             <p className="text-sm text-muted-foreground">{lecture.subject}</p>
          </div>
          {lecture.isActive ? (
             <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-full">
               Active
             </span>
          ) : (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
               Completed
             </span>
          )}
        </div>

        {/* Code Box */}
        <div 
           className="bg-muted/50 rounded-lg p-3 flex items-center justify-between group/code cursor-pointer hover:bg-muted transition-colors border border-transparent hover:border-border"
           onClick={copyCode}
        >
           <code className="text-xl font-mono mobile-font font-bold text-emerald-600 tracking-wider">
             {lecture.code}
           </code>
           <div className="opacity-0 group-hover/code:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-background shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
           </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground font-medium">
           {feedbackCount} responses • {lecture.duration} min
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2">
            <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium h-9"
                onClick={handleNavigate}
            >
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                    Analytics
                </div>
            </Button>
            
            <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-destructive border-input"
                onClick={handleDelete}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default LectureCard;
