export const generateAISummary = async (lecture, analytics, feedback) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const feedbackSample = feedback.slice(0, 30).map(f => ({
    understanding: f.understanding,
    attention: f.attention,
    confusionTime: f.confusionTime,
    comment: f.comment || null,
  }));

  const prompt = `
You are an educational analytics assistant. Analyze this lecture feedback and provide a concise summary.

Lecture: "${lecture.topic}" (${lecture.subject}, ${lecture.duration} mins)

Metrics:
- Total responses: ${analytics.totalResponses}
- Understanding score: ${analytics.understandingScore}%
- Attention score: ${analytics.attentionScore}%
- Overall effectiveness: ${Math.round((analytics.understandingScore + analytics.attentionScore) / 2)}%

Feedback sample:
${JSON.stringify(feedbackSample, null, 2)}

Provide a JSON response with exactly this structure:
{
  "overall": "2-3 sentence overall summary of the lecture session",
  "positives": ["up to 3 positive themes from feedback"],
  "concerns": ["up to 3 areas of confusion or concern"],
  "followUp": ["up to 3 suggested follow-up topics or actions"],
  "sentiment": "positive"
}

Return only valid JSON, no markdown, no explanation.
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();
  const text = data.choices[0].message.content.trim();
  return JSON.parse(text);
};