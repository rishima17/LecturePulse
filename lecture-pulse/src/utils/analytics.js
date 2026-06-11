const STOP_WORDS = new Set([
    "a","an","the","and","or","but","in","on","at","to","for","of","with",
    "is","it","its","was","are","were","be","been","being","have","has","had",
    "do","does","did","will","would","could","should","may","might","can",
    "i","we","you","he","she","they","me","us","my","your","our","their",
    "this","that","these","those","what","how","when","where","which","who",
    "not","no","so","just","very","more","also","as","if","then","than","too",
    "get","got","really","about","from","there","here","all","some","any"
  ]);
  
  const extractKeywords = (comments, topN = 8) => {
    const freq = {};
    comments
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word))
      .forEach(word => { freq[word] = (freq[word] || 0) + 1; });
  
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  };
  const SCORES = {
    understanding: { 'clear': 5, 'partial': 3, 'confusing': 1 },
    attention: { 'high': 5, 'medium': 3, 'low': 1 }
};

export const calculateAnalytics = (feedback = []) => {
    if (!feedback.length) {
        return {
            totalResponses: 0,
            understandingScore: 0,
            attentionScore: 0,
            understandingDistribution: [],
            attentionDistribution: [],
            confusionPointDistribution: [],
            commonKeywords: [],
            suggestions: [],
            timeline: []
        };
    }

    const total = feedback.length;

    const avgUnderstanding = feedback.reduce((sum, f) => sum + (SCORES.understanding[f.understanding] || 0), 0) / total;
    const avgAttention = feedback.reduce((sum, f) => sum + (SCORES.attention[f.attention] || 0), 0) / total;

    const understandingDist = Object.keys(SCORES.understanding).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: feedback.filter(f => f.understanding === key).length
    }));

    const attentionDist = Object.keys(SCORES.attention).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: feedback.filter(f => f.attention === key).length
    }));

    const confusionCounts = {};
    feedback.forEach(f => {
        if (f.confusionTime) {
            confusionCounts[f.confusionTime] = (confusionCounts[f.confusionTime] || 0) + 1;
        }
    });
    const confusionDist = Object.entries(confusionCounts)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const comments = feedback.filter(f => f.comment).map(f => f.comment).join(" ");
    const commonKeywords = comments ? extractKeywords(comments) : [];

    const suggestions = [];
    if (avgUnderstanding < 3) suggestions.push("Consider reviewing the core concepts again.");
    if (avgAttention < 3) suggestions.push("Try adding more interactive elements to keep students engaged.");
    if (feedback.some(f => f.confusionTime === "examples")) suggestions.push("Provide more concrete examples.");
    if (suggestions.length === 0) {
        if (avgUnderstanding >= 4) suggestions.push("Great explanation! Students understood well.");
        else suggestions.push("Monitor student engagement in the next session.");
    }

    // Timeline: group responses into intervals of ~2 minutes
    const timeline = buildTimeline(feedback);

    return {
        totalResponses: total,
        understandingScore: Math.round((avgUnderstanding / 5) * 100),
        attentionScore: Math.round((avgAttention / 5) * 100),
        understandingDistribution: understandingDist,
        attentionDistribution: attentionDist,
        confusionPointDistribution: confusionDist,
        commonKeywords,
        suggestions,
        timeline
    };
};

const buildTimeline = (feedback) => {
    const withTime = feedback.filter(f => f.timestamp);
    if (withTime.length === 0) {
        // No timestamps — spread evenly across 10 fake intervals for demo
        const interval = Math.ceil(feedback.length / 5);
        return Array.from({ length: 5 }, (_, i) => {
            const slice = feedback.slice(i * interval, (i + 1) * interval);
            return {
                label: `Min ${i * 2 + 2}`,
                responses: slice.length,
                understanding: slice.length ? Math.round(slice.reduce((s, f) => s + (f.understanding === 'clear' ? 100 : f.understanding === 'partial' ? 50 : 0), 0) / slice.length) : 0,
                attention: slice.length ? Math.round(slice.reduce((s, f) => s + (f.attention === 'high' ? 100 : f.attention === 'medium' ? 50 : 0), 0) / slice.length) : 0,
            };
        }).filter(d => d.responses > 0);
    }

    const sorted = [...withTime].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const start = new Date(sorted[0].timestamp).getTime();
    const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

    const buckets = {};
    sorted.forEach(f => {
        const elapsed = new Date(f.timestamp).getTime() - start;
        const bucket = Math.floor(elapsed / INTERVAL_MS);
        if (!buckets[bucket]) buckets[bucket] = [];
        buckets[bucket].push(f);
    });

    return Object.entries(buckets).map(([bucket, items]) => ({
        label: `Min ${parseInt(bucket) * 2 + 2}`,
        responses: items.length,
        understanding: Math.round(items.reduce((s, f) => s + (f.understanding === 'clear' ? 100 : f.understanding === 'partial' ? 50 : 0), 0) / items.length),
        attention: Math.round(items.reduce((s, f) => s + (f.attention === 'high' ? 100 : f.attention === 'medium' ? 50 : 0), 0) / items.length),
    }));
};

export const getOverallEffectiveness = (analytics) => {
    if (!analytics) return 0;
    return Math.round((analytics.understandingScore + analytics.attentionScore) / 2);
};

export const getEffectivenessLabel = (score) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500" };
    if (score >= 60) return { label: "Good", color: "text-blue-500" };
    if (score >= 40) return { label: "Average", color: "text-yellow-500" };
    return { label: "Needs Improvement", color: "text-red-500" };
};