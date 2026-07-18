import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

function ParticipantList({ participants }) {
  return (
    <Card className="bg-card border-border h-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-foreground" />
          <h2 className="font-semibold text-foreground">Participants</h2>
        </div>

        <div className="space-y-2">
          {participants.length > 0 ? (
            participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{participant.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{participant.role || "student"}</p>
                </div>
                <span className="text-xs text-muted-foreground">{participant.role === "teacher" ? "Host" : "Guest"}</span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              No participants yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ParticipantList;
