import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import {
  clearCurrentTeacher,
  getCurrentTeacher,
  getLecturesByTeacher,
  getFeedbackByLecture,
} from "@/utils/storage";
import CreateLectureDialog from "@/components/CreateLectureDialog";
import LectureCard from "@/components/LectureCard";
import CreatePollDialog from "@/components/CreatePollDialog";
import PollCard from "@/components/PollCard";
import TemplateManager from "@/components/TemplateManager";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LogOut,
  Plus,
  Search,
  User,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [teacher, setTeacher] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [polls, setPolls] = useState([]);
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [bookmarkFilter, setBookmarkFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const currentTeacher = getCurrentTeacher();
    if (!currentTeacher) {
      navigate('/login');
      return;
    }
    const teacherLectures = getLecturesByTeacher(currentTeacher.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeacher(currentTeacher);
    setLectures(teacherLectures);
  }, [navigate]);

  const refreshLectures = (teacherId) => {
    setLectures(getLecturesByTeacher(teacherId));
  };

  const handleLogout = () => {
    clearCurrentTeacher();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleLectureCreated = () => {
    if (teacher) {
      refreshLectures(teacher.id);
    }
    setIsCreateOpen(false);
  };

  

  const filteredLectures = useMemo(() => {
    return lectures
      .filter((lecture) => {
        const matchesSearch =
          lecture.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lecture.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lecture.code?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && lecture.isActive) ||
          (statusFilter === 'completed' && !lecture.isActive);

        const matchesBookmark =
          bookmarkFilter === 'all' ||
          (bookmarkFilter === 'bookmarked' && lecture.bookmarked);

        return matchesSearch && matchesStatus && matchesBookmark;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);

        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [lectures, searchTerm, statusFilter, bookmarkFilter, sortOrder]);

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

if (!teacher) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-base sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">LecturePulse</h1>
              <p className="text-base text-muted-foreground">Welcome, {teacher.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
  
  {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="
                  w-10 h-10 rounded-full
                  flex items-center justify-center
                  border border-border/50
                  bg-[#00C2C5]/20
                  hover:bg-[#00C2C5]/30
                  transition-all duration-300
                  hover:scale-105
                "
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-foreground" />
                ) : (
                  <Moon className="w-4 h-4 text-foreground" />
                )}
              </button>

              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none">
            <CardContent className="p-8 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{lectures.length}</p>
                <p className="text-base text-muted-foreground">Total Lectures</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-none">
            <CardContent className="p-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeLectures.length}</p>
                <p className="text-base text-muted-foreground">Active Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-none">
            <CardContent className="p-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pastLectures.length}</p>
                <p className="text-base text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>
        {recentLectures.length > 0 && (
  <Card className="mb-8">
    <CardContent className="p-8">
      <h2 className="text-2xl font-semibold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-3">
        {recentLectures.map((lecture) => (
          <div
            key={lecture.id}
            className="flex items-center justify-between border-b pb-2"
          >
            <div>
              <p className="text-xl font-medium">{lecture.topic}</p>
              <p className="text-base text-muted-foreground">
                {lecture.subject}
              </p>
            </div>

            <span className="text-base text-muted-foreground">
              {getFeedbackByLecture(lecture.id).length} feedback
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">Your Lectures</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search lectures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-base border rounded-md bg-background"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setBookmarkFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  bookmarkFilter === 'all'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Lectures
              </button>
              <button
                type="button"
                onClick={() => setBookmarkFilter('bookmarked')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  bookmarkFilter === 'bookmarked'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Star className="w-3 h-3 fill-current text-amber-500" />
                Bookmarked Only
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortOrder('newest');
                setBookmarkFilter('all');
              }}
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsTemplatesOpen(true)}
              className="border-primary/30 text-foreground hover:bg-primary/10 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Lecture
            </Button>
            <Button
              onClick={() => setShowPollDialog(true)}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </div>

        {lectures.length === 0 ? (
         <Card className="border-dashed border-2 border-muted">
  <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center gap-6">
    <div className="relative">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 flex items-center justify-center ring-1 ring-emerald-500/20">
        <BookOpen className="w-9 h-9 text-emerald-500" />
      </div>
      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
        <Sparkles className="w-3 h-3 text-white" />
      </div>
    </div>
    <div className="space-y-2 max-w-sm">
      <h3 className="text-xl font-semibold text-foreground">No lectures yet</h3>
      <p className="text-base text-muted-foreground leading-relaxed">
        Get started by creating your first lecture. Share a session code with
        your students and collect real-time feedback instantly.
      </p>
    </div>
    <Button
      onClick={() => setIsCreateOpen(true)}
      size="lg"
      className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
    >
      <Plus className="w-5 h-5 mr-2" />
      Create Your First Lecture
    </Button>
    <p className="text-xs text-muted-foreground/60">
      Students can join using a 6-digit session code — no signup required.
    </p>
  </CardContent>
</Card>
) : filteredLectures.length === 0 ? (
<Card className="border-dashed border-2 border-muted">
  <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
      <Search className="w-7 h-7 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <h3 className="text-xl font-medium text-foreground">
        {bookmarkFilter === 'bookmarked' ? 'No bookmarked lectures found' : 'No lectures found'}
      </h3>
      <p className="text-base text-muted-foreground">
        {bookmarkFilter === 'bookmarked'
          ? 'No bookmarked lectures match your current filters.'
          : 'No lectures match your current filters.'}{" "}
        Try adjusting your search or{" "}
        <button
          onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSortOrder('newest'); setBookmarkFilter('all'); }}
          className="text-primary underline-offset-2 hover:underline focus:outline-none cursor-pointer"
        >
          clear all filters
        </button>
        .
      </p>
    </div>
  </CardContent>
</Card>
        ) : (
          <div className="space-y-6">
            {activeLectures.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                  Active Sessions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeLectures.map(lecture => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      onUpdate={() => refreshLectures(teacher.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {pastLectures.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Past Lectures
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastLectures.map(lecture => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      onUpdate={() => refreshLectures(teacher.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {polls.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-base font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Active Polls
            </h3>
            {polls.map(poll => (
              <PollCard key={poll.id} poll={poll}
                onVote={(opt) => {
                  setPolls(polls.map(p =>
                    p.id === poll.id
                      ? { ...p, options: p.options.map(o =>
                          o.label === opt ? { ...o, votes: o.votes + 1 } : o
                        )}
                      : p
                  ));
                }}
                isTeacher={true}
              />
            ))}
          </div>
        )}

        {showPollDialog && (
          <CreatePollDialog
            onSubmit={(poll) => setPolls([...polls, poll])}
            onClose={() => setShowPollDialog(false)}
          />
        )}
      </main>

      <CreateLectureDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        teacherId={teacher ? teacher.id : ''}
        onCreated={handleLectureCreated}
      />
      <TemplateManager
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
      />
    </div>
  );
};

export default Dashboard;
