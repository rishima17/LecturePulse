import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TopicLegend } from "./TopicLegend";
import { TopicDetails } from "./TopicDetails";
import { analyzeTopics, filterTopics, sortTopics } from "@/utils/topicAnalysis";
import { HEATMAP_CONFIG } from "@/config/heatmap";

/**
 * Props:
 *   feedback – array of feedback objects from localStorage (already loaded in Analytics page)
 */
export const TopicCoverageHeatmap = ({ feedback = [] }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | low | medium | high
  const [sortKey, setSortKey] = useState("confusionDesc"); // default highest confusion
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Compute raw topic analysis once
  const rawTopics = useMemo(() => analyzeTopics(feedback), [feedback]);

  // Apply search (case‑insensitive)
  const searched = useMemo(() => {
    if (!search) return rawTopics;
    const lower = search.toLowerCase();
    return rawTopics.filter((t) => t.name.toLowerCase().includes(lower));
  }, [rawTopics, search]);

  // Apply filter
  const filtered = useMemo(() => filterTopics(searched, filter), [searched, filter]);

  // Apply sorting
  const displayed = useMemo(() => sortTopics(filtered, sortKey), [filtered, sortKey]);

  const handleCardClick = useCallback((topic) => {
    setSelectedTopic(topic);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedTopic(null);
  }, []);

  // Empty state handling
  if (!feedback || feedback.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No topic insights available yet.
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No topic insights match the current criteria.
      </div>
    );
  }

  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Topic Coverage Heatmap</h2>
      <TopicLegend />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search topics…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Search topics"
        />
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Filter by difficulty"
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {/* Sort */}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Sort topics"
        >
          <option value="confusionDesc">Highest Confusion</option>
          <option value="confusionAsc">Lowest Confusion</option>
          <option value="commentsDesc">Most Comments</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {displayed.map((topic) => (
            <motion.div
              key={topic.name}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card
                variant="glass"
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCardClick(topic)}
                aria-label={`Open details for ${topic.name}`}
              >
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-base">{topic.name}</CardTitle>
                  <span
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: HEATMAP_CONFIG.colors[topic.difficulty] }}
                    aria-label={HEATMAP_CONFIG.labels[topic.difficulty]}
                  />
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-foreground">
                  <div>Confusion: {topic.confusionPercent}%</div>
                  <div>Comments: {topic.totalFeedback}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Details modal */}
      <AnimatePresence>
        {selectedTopic && (
          <TopicDetails topic={selectedTopic} onClose={closeDetails} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default TopicCoverageHeatmap;
