// TopicDetails.jsx – expands to show detailed metrics and a chart
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { HEATMAP_CONFIG } from "@/config/heatmap";

/**
 * Props:
 *  topic – object returned from analyzeTopics
 *  onClose – callback to close the panel
 */
export const TopicDetails = ({ topic, onClose }) => {
  if (!topic) return null;

  const { colors, labels } = HEATMAP_CONFIG;
  const difficultyColor = colors[topic.difficulty];

  const data = Object.entries(topic.understandingDist).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          className="w-full max-w-md mx-4"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <Card variant="glass" className="relative">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{topic.name}</CardTitle>
              <button
                onClick={onClose}
                className="text-foreground hover:text-primary"
                aria-label="Close details"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: difficultyColor }} />
                <span>{labels[topic.difficulty]} Difficulty</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Confusion: {topic.confusionPercent}%</div>
                <div>Attention: {topic.attentionPercent}%</div>
                <div>Comments: {topic.totalFeedback}</div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--chart-foreground)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {topic.recentComments && topic.recentComments.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Recent Feedback</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {topic.recentComments.map((c, i) => (
                      <li key={i}>"{c}"</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
              >
                Close
              </button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TopicDetails;
