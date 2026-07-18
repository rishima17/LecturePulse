import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smile, Users } from "lucide-react";
import { MOOD_DETAILS } from "@/constants/moodTypes";
import MoodChart from "./MoodChart";

export default function MoodSummaryCard({ moods }) {
  const total = moods?.totalResponses || 0;

  // Format data for Recharts MoodChart
  const chartData = Object.keys(MOOD_DETAILS).map((key) => {
    const details = MOOD_DETAILS[key];
    return {
      name: details.label,
      value: moods ? moods[key] : 0,
    };
  });

  return (
    <Card className="border-border/50 shadow-lg backdrop-blur-xl bg-card/60 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Smile className="w-5 h-5 text-primary" />
              Class Mood Summary
            </CardTitle>
            <CardDescription>
              Anonymous student feelings after the lecture ended
            </CardDescription>
          </div>
          {total > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              <Users className="w-3.5 h-3.5" />
              {total} response{total !== 1 && "s"}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {total === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
            <Smile className="w-10 h-10 text-muted-foreground/45" />
            <p>No mood feedback submitted yet.</p>
            <p className="text-xs text-muted-foreground/60 max-w-xs">
              Students will see the Mood Meter as soon as the lecture is marked as ended.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Chart */}
            <div className="w-full">
              <MoodChart data={chartData} />
            </div>

            {/* List breakdown */}
            <div className="space-y-4">
              {Object.keys(MOOD_DETAILS).map((key) => {
                const details = MOOD_DETAILS[key];
                const count = moods ? moods[key] : 0;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">{details.emoji}</span>
                        <span className="text-foreground/80">{details.label}</span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        <span className="font-semibold text-foreground mr-1">{count}</span>
                        <span>({percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${details.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
