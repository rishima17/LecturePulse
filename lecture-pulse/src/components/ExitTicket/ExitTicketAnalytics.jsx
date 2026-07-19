import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EXIT_TICKET_TYPES } from "@/constants/exitTicketTypes";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle2, XCircle, ClipboardCheck, MessageSquareText, Award, Users } from "lucide-react";

export default function ExitTicketAnalytics({ exitTicket, responses }) {
  const totalResponses = responses.length;

  const stats = useMemo(() => {
    if (totalResponses === 0 || !exitTicket) return null;

    if (exitTicket.type === EXIT_TICKET_TYPES.SHORT_ANSWER) {
      return { totalResponses };
    }

    const correctResponses = responses.filter(
      (r) => String(r.response).toLowerCase() === String(exitTicket.correctAnswer).toLowerCase()
    ).length;
    const incorrectResponses = totalResponses - correctResponses;
    const percentCorrect = Math.round((correctResponses / totalResponses) * 100);
    const percentIncorrect = 100 - percentCorrect;

    // Distribution
    let distribution = [];
    if (exitTicket.type === EXIT_TICKET_TYPES.MULTIPLE_CHOICE) {
      distribution = exitTicket.options.map((opt) => {
        const count = responses.filter(
          (r) => String(r.response).toLowerCase() === String(opt).toLowerCase()
        ).length;
        return {
          name: opt,
          value: count,
          percentage: Math.round((count / totalResponses) * 100),
          isCorrect: String(opt).toLowerCase() === String(exitTicket.correctAnswer).toLowerCase(),
        };
      });
    } else if (exitTicket.type === EXIT_TICKET_TYPES.TRUE_FALSE) {
      distribution = ["true", "false"].map((val) => {
        const count = responses.filter(
          (r) => String(r.response).toLowerCase() === String(val).toLowerCase()
        ).length;
        return {
          name: val.charAt(0).toUpperCase() + val.slice(1),
          value: count,
          percentage: Math.round((count / totalResponses) * 100),
          isCorrect: String(val).toLowerCase() === String(exitTicket.correctAnswer).toLowerCase(),
        };
      });
    }

    return {
      totalResponses,
      correctResponses,
      incorrectResponses,
      percentCorrect,
      percentIncorrect,
      distribution,
    };
  }, [exitTicket, responses, totalResponses]);

  if (!exitTicket) return null;

  if (totalResponses === 0) {
    return (
      <Card className="border border-dashed border-border p-8 text-center bg-card">
        <CardContent className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Exit Ticket Published</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Question: "{exitTicket.question}"
          </p>
          <p className="text-xs text-muted-foreground bg-muted/50 py-2 px-4 rounded-full inline-block">
            Waiting for student responses...
          </p>
        </CardContent>
      </Card>
    );
  }

  const isScored = exitTicket.type !== EXIT_TICKET_TYPES.SHORT_ANSWER;

  return (
    <Card className="border border-border/60 bg-card overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/10 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
              Exit Ticket Results
            </span>
            <CardTitle className="text-xl md:text-2xl font-bold text-foreground mt-1.5">
              {exitTicket.question}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-muted-foreground mt-1">
              Question Type: <span className="capitalize font-semibold">{exitTicket.type.replace("-", " ")}</span>
            </CardDescription>
          </div>
          {isScored && stats && (
            <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-xl border border-border shrink-0">
              <Award className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Class Accuracy</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">
                  {stats.percentCorrect}%
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-8">
        
        {/* Scored stats blocks */}
        {isScored && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-center">
              <span className="text-xs text-muted-foreground font-medium block">Total Responses</span>
              <span className="text-2xl font-bold text-foreground mt-1 block flex items-center justify-center gap-1.5">
                <Users className="w-5 h-5 text-primary" />
                {stats.totalResponses}
              </span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">Correct Responses</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                {stats.correctResponses}
              </span>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-center">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium block">Incorrect Responses</span>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block flex items-center justify-center gap-1.5">
                <XCircle className="w-5 h-5" />
                {stats.incorrectResponses}
              </span>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <span className="text-xs text-primary font-medium block">Accuracy Rate</span>
              <span className="text-2xl font-bold text-primary mt-1 block">
                {stats.percentCorrect}%
              </span>
            </div>
          </div>
        )}

        {/* Charts & Distributions */}
        {isScored && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Chart list / distribution detail */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Answer Distribution Breakdown
              </h3>
              <div className="space-y-3">
                {stats.distribution.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                      item.isCorrect
                        ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                        : "bg-muted/20 border-border text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                        item.isCorrect ? "bg-emerald-500 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="font-medium truncate text-sm md:text-base">{item.name}</span>
                      {item.isCorrect && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold shrink-0">
                          Correct Option
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm md:text-base">{item.value} {item.value === 1 ? "student" : "students"}</span>
                      <span className="text-xs text-muted-foreground block">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recharts chart visualization */}
            <div className="lg:col-span-6 border border-border/50 rounded-xl p-4 bg-muted/10">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
                Responses Histogram
              </h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={stats.distribution}
                    margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                    isAnimationActive={false}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {stats.distribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isCorrect ? "#10b981" : "#6366f1"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Short Answer Results */}
        {exitTicket.type === EXIT_TICKET_TYPES.SHORT_ANSWER && (
          <div className="space-y-4">
            
            {/* Quick overview */}
            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 inline-flex items-center gap-3">
              <MessageSquareText className="w-5 h-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground font-medium block">Total Responses Received</span>
                <span className="text-xl font-bold text-foreground block">
                  {totalResponses} anonymous submissions
                </span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">
              Submitted Responses
            </h3>
            
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
              {responses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow transition-shadow flex flex-col gap-2"
                >
                  <p className="text-sm md:text-base text-foreground leading-relaxed font-medium">
                    "{item.response}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 mt-1 border-t pt-2 border-border/30">
                    <span>Anonymous Response #{idx + 1}</span>
                    <span>
                      {new Date(item.submittedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
