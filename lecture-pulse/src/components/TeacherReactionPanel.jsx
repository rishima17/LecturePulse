import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REACTION_DETAILS } from "@/constants/reactionTypes";
import useReactions from "@/hooks/useReactions";
import ReactionCounter from "./ReactionCounter";
import { Activity } from "lucide-react";

/**
 * Reactions dashboard card for teachers.
 * @param {{ sessionCode: string, lectureId: string }} props 
 */
export default function TeacherReactionPanel({ sessionCode, lectureId }) {
  const { reactions } = useReactions(sessionCode, lectureId, true);

  return (
    <Card className="border border-border/50 bg-card shadow-md mb-6 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
          <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
          Live Reactions
        </CardTitle>
        <span className="text-xs font-semibold text-muted-foreground uppercase bg-muted px-2.5 py-1 rounded-full select-none">
          Real-time
        </span>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(REACTION_DETAILS).map(([type, { emoji, label }]) => (
            <ReactionCounter
              key={type}
              emoji={emoji}
              label={label}
              count={reactions[type] || 0}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
