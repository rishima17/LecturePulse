import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function LiveChat({ messages, onSendMessage, currentUserName }) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    onSendMessage(trimmed);
    setDraft("");
  };

  return (
    <Card className="bg-card border-border h-full">
      <CardContent className="p-4 flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-foreground" />
          <h2 className="font-semibold text-foreground">Live Chat</h2>
        </div>

        <div className="flex-1 min-h-[240px] max-h-[360px] overflow-y-auto space-y-3 pr-1">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-sm font-medium text-foreground">{message.senderName}</span>
                  <span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message.text}</p>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Start the conversation. Messages appear here as the session runs.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={currentUserName ? `Message as ${currentUserName}` : "Type a message"}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default LiveChat;
