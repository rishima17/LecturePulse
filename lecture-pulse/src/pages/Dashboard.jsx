import CreateLectureDialog from "@/components/CreateLectureDialog";
import LectureCard from "@/components/LectureCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  clearCurrentTeacher,
  getCurrentTeacher,
  getLecturesByTeacher,
  getFeedbackByLecture,
} from "@/utils/storage";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LogOut,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const [teacher] = useState(() => getCurrentTeacher());
  const [lectures, setLectures] = useState(() => {
    const t = getCurrentTeacher();
    return t ? getLecturesByTeacher(t.id) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const loadLectures = (teacherId) => {
    const teacherLectures = getLecturesByTeacher(teacherId);
    setLectures(teacherLectures);
  };

  useEffect(() => {
    if (!teacher) {
      navigate("/login");
    }
  }, [teacher, navigate]);

  const handleLogout = () => {
    clearCurrentTeacher();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleLectureCreated = () => {
    if (teacher) {
      loadLectures(teacher.id);
    }
    setIsCreateOpen(false);
  };

  if (!teacher) return null;

  const filteredLectures = lectures.filter(
    (lecture) =>
      lecture.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeLectures = filteredLectures.filter((l) => l.isActive);
  const pastLectures = filteredLectures.filter((l) => !l.isActive);
  const recentLectures = lectures // Get the latest 5 lectures that have received feedback
  .filter((lecture) => getFeedbackByLecture(lecture.id).length > 0)
  .sort((a, b) => {
    const feedbackA = getFeedbackByLecture(a.id);
    const feedbackB = getFeedbackByLecture(b.id);

    const latestA = feedbackA[feedbackA.length - 1]?.submittedAt || "";
    const latestB = feedbackB[feedbackB.length - 1]?.submittedAt || "";

    return new Date(latestB) - new Date(latestA);
  })
  .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                LecturePulse
              </h1>
              <p className="text-xs text-muted-foreground">
                Welcome, {teacher.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="ml-auto sm:ml-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {lectures.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Lectures</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-green-500/5 to-green-500/10 border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activeLectures.length}
                </p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-blue-500/5 to-blue-500/10 border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pastLectures.length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>
        {recentLectures.length > 0 && (
  <Card className="mb-8">
    <CardContent className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        Recent Activity
      </h2>

      <div className="space-y-3">
        {recentLectures.map((lecture) => (
          <div
            key={lecture.id}
            className="flex items-center justify-between border-b pb-2"
          >
            <div>
              <p className="font-medium">{lecture.topic}</p>
              <p className="text-sm text-muted-foreground">
                {lecture.subject}
              </p>
            </div>

            <span className="text-sm text-muted-foreground">
              {getFeedbackByLecture(lecture.id).length} feedback
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Your Lectures
          </h2>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search lectures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md bg-background"
              />
            </div>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Lecture
            </Button>
          </div>
        </div>

        {lectures.length === 0 ? (
          <Card className="text-center py-12 border-dashed">...</Card>
        ) : filteredLectures.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <CardContent>
              <h3 className="text-lg font-medium">No lectures found</h3>
              <p className="text-muted-foreground mt-2">
                Try a different search term.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeLectures.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Active Sessions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeLectures.map((lecture) => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      onUpdate={() => loadLectures(teacher.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {pastLectures.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Past Lectures
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastLectures.map((lecture) => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      onUpdate={() => loadLectures(teacher.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <CreateLectureDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        teacherId={teacher ? teacher.id : ""}
        onCreated={handleLectureCreated}
      />
    </div>
  );
};

export default Dashboard;
