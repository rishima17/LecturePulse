import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Glassmorphism card displaying a doubt cluster.
 * Props:
 *   cluster: { topic: string, count: number, severity: 'high'|'medium'|'low', comments: string[] }
 */
export default function DoubtClusterCard({ cluster }) {
  const { topic, count, severity, comments } = cluster;
  const [open, setOpen] = useState(false);

  const severityStyles = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-green-100 text-green-800",
  };

  return (
    <Card variant="glass" className="mb-4">
      <CardHeader className="flex flex-col gap-2 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <CardTitle>{topic}</CardTitle>
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", severityStyles[severity])}>
            {severity}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{count} comment{count !== 1 ? "s" : ""}</p>
      </CardHeader>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4"
          >
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
              {comments.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
