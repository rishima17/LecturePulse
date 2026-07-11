/**
 * Utility functions for managing lecture templates in local storage.
 */

const TEMPLATES_KEY = "lecturePulse_templates";

/**
 * Validate template fields.
 * @param {Object} template Data to validate.
 * @returns {string|null} Error message or null if valid.
 */
export const validateTemplate = (template) => {
  if (!template.name || !template.name.trim()) {
    return "Template Name is required";
  }
  if (template.name.length > 50) {
    return "Template Name cannot exceed 50 characters";
  }
  if (template.subject && template.subject.length > 100) {
    return "Subject cannot exceed 100 characters";
  }
  if (template.topic && template.topic.length > 100) {
    return "Topic cannot exceed 100 characters";
  }
  if (template.description && template.description.length > 500) {
    return "Description cannot exceed 500 characters";
  }
  if (template.defaultNotes && template.defaultNotes.length > 10000) {
    return "Default Notes cannot exceed 10000 characters";
  }
  return null;
};

/**
 * Get all templates from local storage.
 * @returns {Array} List of templates.
 */
export const getTemplates = () => {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error("Error reading templates from localStorage", error);
    return [];
  }
};

/**
 * Save a new template.
 * @param {Object} templateData Template input.
 * @returns {Object} The saved template.
 */
export const saveTemplate = (templateData) => {
  try {
    const templates = getTemplates();
    const newTemplate = {
      id: crypto.randomUUID(),
      name: templateData.name.trim(),
      subject: (templateData.subject || "").trim(),
      topic: (templateData.topic || "").trim(),
      description: (templateData.description || "").trim(),
      defaultNotes: (templateData.defaultNotes || "").trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const validationError = validateTemplate(newTemplate);
    if (validationError) {
      throw new Error(validationError);
    }

    const updatedTemplates = [...templates, newTemplate];
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    return newTemplate;
  } catch (error) {
    console.error("Error saving template", error);
    throw error;
  }
};

/**
 * Update an existing template.
 * @param {string} templateId The ID of the template.
 * @param {Object} updatedData Updated fields.
 * @returns {Object|null} The updated template.
 */
export const updateTemplate = (templateId, updatedData) => {
  try {
    const templates = getTemplates();
    let updatedTemplate = null;
    const updatedTemplates = templates.map((t) => {
      if (t.id === templateId) {
        updatedTemplate = {
          ...t,
          ...updatedData,
          name: updatedData.name !== undefined ? updatedData.name.trim() : t.name,
          subject: updatedData.subject !== undefined ? updatedData.subject.trim() : t.subject,
          topic: updatedData.topic !== undefined ? updatedData.topic.trim() : t.topic,
          description: updatedData.description !== undefined ? updatedData.description.trim() : t.description,
          defaultNotes: updatedData.defaultNotes !== undefined ? updatedData.defaultNotes.trim() : t.defaultNotes,
          updatedAt: new Date().toISOString(),
        };
        
        const validationError = validateTemplate(updatedTemplate);
        if (validationError) {
          throw new Error(validationError);
        }
        return updatedTemplate;
      }
      return t;
    });

    if (!updatedTemplate) return null;
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    return updatedTemplate;
  } catch (error) {
    console.error("Error updating template", error);
    throw error;
  }
};

/**
 * Delete a template.
 * @param {string} templateId The ID of the template.
 * @returns {boolean} True if successfully deleted.
 */
export const deleteTemplate = (templateId) => {
  try {
    const templates = getTemplates();
    const filtered = templates.filter((t) => t.id !== templateId);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting template", error);
    return false;
  }
};

/**
 * Duplicate an existing template.
 * @param {string} templateId The ID of the template.
 * @returns {Object} The duplicated template.
 */
export const duplicateTemplate = (templateId) => {
  try {
    const templates = getTemplates();
    const existing = templates.find((t) => t.id === templateId);
    if (!existing) {
      throw new Error("Template not found");
    }

    const baseName = existing.name;
    const newName = `${baseName} (Copy)`;

    const copyTemplate = {
      ...existing,
      id: crypto.randomUUID(),
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(TEMPLATES_KEY, JSON.stringify([...templates, copyTemplate]));
    return copyTemplate;
  } catch (error) {
    console.error("Error duplicating template", error);
    throw error;
  }
};

/**
 * Search templates by name, subject, or topic.
 * @param {string} query Search query.
 * @returns {Array} Matching templates.
 */
export const searchTemplates = (query) => {
  const templates = getTemplates();
  if (!query || !query.trim()) return templates;
  const lowerQuery = query.toLowerCase().trim();
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      (t.subject && t.subject.toLowerCase().includes(lowerQuery)) ||
      (t.topic && t.topic.toLowerCase().includes(lowerQuery))
  );
};
