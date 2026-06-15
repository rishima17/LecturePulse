const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value).replace(/\r?\n/g, " ");

  if (/[",]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const buildCsvLine = (values) => values.map(escapeCsvValue).join(",");

const triggerDownload = (content, filename) => {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

const toPercentage = (value) => `${value ?? 0}%`;

export const generateLectureCSV = ({ lecture, analytics, teacher, feedback = [] }) => {
  const rows = [];

  rows.push(["Lecture Analytics Report"]);
  rows.push([]);
  rows.push(["Field", "Value"]);
  rows.push(["Teacher", teacher?.name || "N/A"]);
  rows.push(["Subject", lecture?.subject || "N/A"]);
  rows.push(["Topic", lecture?.topic || "N/A"]);
  rows.push(["Session Code", lecture?.code || "N/A"]);
  rows.push(["Duration", lecture?.duration ? `${lecture.duration} Minutes` : "N/A"]);
  rows.push(["Created At", lecture?.createdAt ? new Date(lecture.createdAt).toLocaleString() : "N/A"]);
  rows.push(["Total Responses", analytics?.totalResponses ?? 0]);
  rows.push(["Overall Effectiveness", toPercentage(analytics?.effectiveness)]);
  rows.push(["Understanding Score", toPercentage(analytics?.understandingScore)]);
  rows.push(["Attention Score", toPercentage(analytics?.attentionScore)]);
  rows.push(["Common Keywords", analytics?.commonKeywords?.length ? analytics.commonKeywords.join("; ") : "None"]);
  rows.push(["Suggestions", analytics?.suggestions?.length ? analytics.suggestions.join(" | ") : "None"]);

  rows.push([]);
  rows.push(["Feedback Entries"]);
  rows.push(["Submitted At", "Understanding", "Attention", "Confusion Time", "Comment"]);

  if (feedback.length === 0) {
    rows.push(["No feedback responses available", "", "", "", ""]);
  } else {
    feedback.forEach((item) => {
      rows.push([
        item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A",
        item.understanding || "N/A",
        item.attention || "N/A",
        item.confusionTime || "N/A",
        item.comment || "",
      ]);
    });
  }

  const csv = rows.map(buildCsvLine).join("\n");
  const safeSubject = (lecture?.subject || "lecture").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  const safeTopic = (lecture?.topic || "analytics").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");

  triggerDownload(csv, `${safeSubject}-${safeTopic}-report.csv`);
};
