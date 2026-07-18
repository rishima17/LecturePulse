// Utility for lightweight client‑side comment clustering
// No external dependencies, uses simple keyword matching

/**
 * Normalize comment text: lower‑case and remove punctuation.
 */
export function normalizeComment(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:(){}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Mapping of topics to associated keywords
const TOPIC_KEYWORDS = {
  Inheritance: ["inheritance", "parent class", "child class", "extends"],
  Polymorphism: ["polymorphism", "overriding", "overloading"],
  Constructors: ["constructor", "default constructor", "parameterized constructor"],
  Encapsulation: ["encapsulation", "private", "getter", "setter"],
};

/**
 * Extract the most relevant topic from a comment.
 * Returns the topic string or null if none match.
 */
export function extractTopic(comment) {
  const normalized = normalizeComment(comment);
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) return topic;
    }
  }
  return null;
}

/**
 * Cluster an array of comment strings.
 * Returns an array of objects: { topic, count, severity, comments }
 */
export function clusterComments(comments) {
  const map = {};
  const other = { topic: "Other Doubts", comments: [] };
  comments.forEach((c) => {
    const topic = extractTopic(c);
    if (topic) {
      if (!map[topic]) map[topic] = { topic, comments: [] };
      map[topic].comments.push(c);
    } else {
      other.comments.push(c);
    }
  });

  const clusters = Object.values(map);
  if (other.comments.length) clusters.push(other);

  // Add count and severity, then sort descending by count
  clusters.forEach((cl) => {
    cl.count = cl.comments.length;
    if (cl.count >= 15) cl.severity = "high";
    else if (cl.count >= 7) cl.severity = "medium";
    else cl.severity = "low";
  });
  clusters.sort((a, b) => b.count - a.count);
  return clusters;
}
