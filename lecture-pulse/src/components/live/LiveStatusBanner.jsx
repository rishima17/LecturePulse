import { Card, CardContent } from "@/components/ui/card";
import { BadgeInfo } from "lucide-react";

function LiveStatusBanner({ title, subtitle }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <BadgeInfo className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveStatusBanner;
