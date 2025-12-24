const SCORES = {
    understanding: {
        'clear': 5,
        'partial': 3,
        'confusing': 1
    },
    attention: {
        'high': 5,
        'medium': 3,
        'low': 1
    }
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
            suggestions: []
        };
    }

    const total = feedback.length;

    // Calculate averages using mapped scores
    const avgUnderstanding = feedback.reduce((sum, f) => {
        const score = SCORES.understanding[f.understanding] || 0;
        return sum + score;
    }, 0) / total;

    const avgAttention = feedback.reduce((sum, f) => {
        const score = SCORES.attention[f.attention] || 0;
        return sum + score;
    }, 0) / total;

    // Distributions
    const understandingDist = Object.entries(SCORES.understanding).map(([key, score]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: feedback.filter(f => f.understanding === key).length
    }));

    const attentionDist = Object.entries(SCORES.attention).map(([key, score]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: feedback.filter(f => f.attention === key).length
    }));

    // Confusion points
    const confusionCounts = {};
    feedback.forEach(f => {
        if (f.confusionTime) { // Changed property name to match StudentFeedback.jsx
            confusionCounts[f.confusionTime] = (confusionCounts[f.confusionTime] || 0) + 1;
        }
    });

    const confusionDist = Object.entries(confusionCounts)
        .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Keywords (Mock implementation)
    const comments = feedback.filter(f => f.comment).map(f => f.comment).join(" ");
    const commonKeywords = comments ? ["fast", "examples", "unclear", "good"] : [];

    // Suggestions based on scores
    const suggestions = [];
    if (avgUnderstanding < 3) suggestions.push("Consider reviewing the core concepts again.");
    if (avgAttention < 3) suggestions.push("Try adding more interactive elements to keep students engaged.");
    if (feedback.some(f => f.confusionTime === "examples")) suggestions.push("Provide more concrete examples."); // logic check

    // Add default suggestions if empty
    if (suggestions.length === 0) {
        if (avgUnderstanding >= 4) suggestions.push("Great explanation! Students understood well.");
        else suggestions.push("Monitor student engagement in the next session.");
    }

    return {
        totalResponses: total,
        understandingScore: Math.round((avgUnderstanding / 5) * 100), // Normalize 5-point scale to 100
        attentionScore: Math.round((avgAttention / 5) * 100),
        understandingDistribution: understandingDist,
        attentionDistribution: attentionDist,
        confusionPointDistribution: confusionDist,
        commonKeywords,
        suggestions
    };
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
