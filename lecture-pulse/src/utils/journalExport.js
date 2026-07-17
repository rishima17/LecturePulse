import jsPDF from "jspdf";

/**
 * Exports the journal notes as a structured .txt file.
 * 
 * @param {string} sessionCode 
 * @param {Object} lecture 
 * @param {import("../types/journal").JournalNote[]} notes 
 * @returns {boolean}
 */
export const exportToTxt = (sessionCode, lecture, notes) => {
  try {
    let content = `==================================================\n`;
    content += `LECTUREPULSE - PERSONAL LEARNING JOURNAL\n`;
    content += `==================================================\n\n`;
    content += `Lecture Topic: ${lecture?.topic || "N/A"}\n`;
    content += `Subject: ${lecture?.subject || "N/A"}\n`;
    content += `Session Code: ${sessionCode}\n`;
    content += `Export Date: ${new Date().toLocaleString()}\n`;
    content += `Total Notes: ${notes.length}\n\n`;
    content += `--------------------------------------------------\n\n`;

    if (notes.length === 0) {
      content += `No notes in this journal.\n`;
    } else {
      notes.forEach((note, index) => {
        const dateStr = new Date(note.updatedAt || note.createdAt).toLocaleString();
        const starMarker = note.starred ? " [★ IMPORTANT]" : "";
        const reviseMarker = note.reviseLater ? " [⏳ REVISE LATER]" : "";
        
        content += `${index + 1}. ${note.title || "Untitled Note"}${starMarker}${reviseMarker}\n`;
        content += `Date: ${dateStr}\n`;
        content += `Content:\n${note.content}\n`;
        content += `\n--------------------------------------------------\n\n`;
      });
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `journal-${sessionCode}-${(lecture?.topic || "notes").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Failed to export TXT:", error);
    throw error;
  }
};

/**
 * Exports the journal notes as a styled PDF document using jsPDF.
 * Implements proper multiline text wrapping and automatic pagination.
 * 
 * @param {string} sessionCode 
 * @param {Object} lecture 
 * @param {import("../types/journal").JournalNote[]} notes 
 * @returns {boolean}
 */
export const exportToPdf = (sessionCode, lecture, notes) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - 2 * margin;
    
    let y = 20;

    // Header Helper
    const addHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(0, 194, 197); // primary teal color
      doc.text("LecturePulse", margin, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Personal Learning Journal`, pageWidth - margin, y, { align: "right" });
      
      y += 8;
      doc.setDrawColor(220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;
    };

    const addFooter = (pageNum) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${pageNum}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    };

    let pageNum = 1;
    addHeader();
    addFooter(pageNum);

    // Lecture Details Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text(`Lecture Journal: ${lecture?.topic || "General Session"}`, margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Subject: ${lecture?.subject || "N/A"}`, margin, y);
    y += 6;
    doc.text(`Session Code: ${sessionCode}`, margin, y);
    y += 6;
    doc.text(`Date of Export: ${new Date().toLocaleString()}`, margin, y);
    y += 6;
    doc.text(`Total Notes: ${notes.length}`, margin, y);
    y += 12;

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    if (notes.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(150);
      doc.text("No notes have been added to this journal yet.", margin, y);
    } else {
      notes.forEach((note, index) => {
        const dateStr = new Date(note.updatedAt || note.createdAt).toLocaleString();
        
        // Prepare tags text
        let tags = [];
        if (note.starred) tags.push("[★ Important]");
        if (note.reviseLater) tags.push("[⏳ Revise Later]");
        const tagsStr = tags.join(" ");

        const titleText = `${index + 1}. ${note.title || "Untitled Note"}`;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        const splitTitle = doc.splitTextToSize(titleText, contentWidth - 50);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const splitContent = doc.splitTextToSize(note.content, contentWidth);
        
        const noteHeaderHeight = (splitTitle.length * 6) + 12;
        const noteContentHeight = splitContent.length * 5;
        const totalNoteHeight = noteHeaderHeight + noteContentHeight + 10;

        // If this note exceeds current page limit, add a new page
        if (y + totalNoteHeight > pageHeight - 20) {
          doc.addPage();
          pageNum++;
          y = 20;
          addHeader();
          addFooter(pageNum);
        }

        // Draw note header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30);
        
        // Print title
        const startY = y;
        splitTitle.forEach((line) => {
          doc.text(line, margin, y);
          y += 6;
        });

        // Print tags if present (aligned right, matching the first line of title)
        if (tagsStr) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(0, 194, 197); // teal
          doc.text(tagsStr, pageWidth - margin, startY, { align: "right" });
        }

        // Print date
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(140);
        doc.text(`Last updated: ${dateStr}`, margin, y);
        y += 6;

        // Print content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(60);
        splitContent.forEach((line) => {
          doc.text(line, margin, y);
          y += 5;
        });

        // Separator between notes
        y += 6;
        doc.setDrawColor(240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      });
    }

    doc.save(`journal-${sessionCode}-${(lecture?.topic || "notes").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
    return true;
  } catch (error) {
    console.error("Failed to export PDF:", error);
    throw error;
  }
};
