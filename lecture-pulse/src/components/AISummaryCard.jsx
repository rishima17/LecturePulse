import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ThumbsUp, AlertTriangle, BookOpen, Loader2, RefreshCw } from "lucide-react";
import { generateAISummary } from "@/utils/aiSummary";

const sentimentColor = {
  positive: "text-emerald-600 bg-emerald-50 border-emerald-200",
  neutral: "text-blue-600 bg-blue-50 border-blue-200",
  negative: "text-red-600 bg-red-50 border-red-200",
};

const AISummaryCard = ({ lecture, analytics, feedback }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateAISummary(lecture, analytics, feedback);
      setSummary(result);
    } catch (e) {
      setError("Failed to generate summary. Check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Feedback Summary
          </div>
          {summary && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${sentimentColor[summary.sentiment] || sentimentColor.neutral}`}>
              {summary.sentiment}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!summary && !loading && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Generate an AI-powered summary of this lecture's feedback
            </p>
            <Button onClick={handleGenerate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing feedback with Llama 3.3...</p>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            <p className="text-sm text-foreground leading-relaxed">{summary.overall}</p>

            {summary.positives?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Positives</span>
                </div>
                <ul className="space-y-1">
                  {summary.positives.map((p, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.concerns?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-yellow-600">Concerns</span>
                </div>
                <ul className="space-y-1">
                  {summary.concerns.map((c, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.followUp?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">Follow-up</span>
                </div>
                <ul className="space-y-1">
                  {summary.followUp.map((f, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={handleGenerate} className="w-full text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISummaryCard;