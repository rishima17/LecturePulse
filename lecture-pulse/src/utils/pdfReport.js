import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateLecturePDF = ({
  lecture,
  analytics,
  teacher,
  charts,
}) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  

  doc.setFontSize(22);
  doc.text("Lecture Analytics Report", pageWidth / 2, 20, {
    align: "center",
  });

  doc.setFontSize(12);

  autoTable(doc, {
    startY: 35,
    body: [
      ["Teacher", teacher?.name || "N/A"],
      ["Subject", lecture.subject],
      ["Topic", lecture.topic],
      ["Session Code", lecture.code],
      ["Duration", `${lecture.duration} Minutes`],
      [
        "Created At",
        new Date(lecture.createdAt).toLocaleString(),
      ],
    ],
  });

  

  doc.text(
    "Analytics Overview",
    14,
    doc.lastAutoTable.finalY + 15
  );

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    body: [
      ["Total Responses", analytics.totalResponses],
      ["Overall Effectiveness", `${analytics.effectiveness}%`],
      ["Understanding Score", `${analytics.understandingScore}%`],
      ["Attention Score", `${analytics.attentionScore}%`],
    ],
  });

  

  doc.addPage();

  let y = 20;

  doc.setFontSize(16);
  doc.text("Understanding Distribution", 14, y);

  y += 10;

  if (charts?.understandingChart) {
    doc.addImage(
      charts.understandingChart,
      "PNG",
      15,
      y,
      180,
      60
    );
  }

  y += 75;

  doc.text("Attention Distribution", 14, y);

  y += 10;

  if (charts?.attentionChart) {
    doc.addImage(
      charts.attentionChart,
      "PNG",
      15,
      y,
      180,
      60
    );
  }

  

  doc.addPage();

  y = 20;

  doc.text("Confusion Distribution", 14, y);

  y += 10;

  if (charts?.confusionChart) {
    doc.addImage(
      charts.confusionChart,
      "PNG",
      15,
      y,
      180,
      70
    );
  }

  

  y += 90;

  doc.text("Deep Analysis", 14, y);

  y += 10;

  const analysis = [];

  if (analytics.understandingScore < 60) {
    analysis.push(
      "Students struggled to understand key concepts."
    );
  }

  if (analytics.attentionScore < 60) {
    analysis.push(
      "Attention levels dropped during the lecture."
    );
  }

  if (
    analytics.confusionPointDistribution?.length > 0
  ) {
    analysis.push(
      "Several confusion points were identified."
    );
  }

  if (analysis.length === 0) {
    analysis.push(
      "Overall lecture performance was positive."
    );
  }

  analysis.forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item}`,
      18,
      y
    );

    y += 10;
  });

  

  if (analytics.commonKeywords?.length) {
    y += 10;

    doc.text("Common Keywords", 14, y);

    y += 10;

    doc.text(
      analytics.commonKeywords.join(", "),
      18,
      y
    );
  }

  

  y += 20;

  doc.text("Improvement Suggestions", 14, y);

  y += 10;

  analytics.suggestions.forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item}`,
      18,
      y
    );

    y += 10;
  });

  doc.save(
    `${lecture.subject}-${lecture.topic}-report.pdf`
  );
};