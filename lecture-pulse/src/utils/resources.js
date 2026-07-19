import { toast } from "sonner";

/**
 * Supported categories for resources.
 */
export const RESOURCE_CATEGORIES = [
  "📚 Read",
  "🎥 Watch",
  "💻 Practice",
  "🧩 Challenge Yourself",
  "📄 Notes",
  "📑 Slides",
  "🌐 Other"
];

/**
 * Supported resource types.
 */
export const RESOURCE_TYPES = [
  "Documentation",
  "PDF",
  "YouTube",
  "Website",
  "Coding Platform",
  "Presentation",
  "External Link"
];

/**
 * Gets the localStorage key for a specific lecture session code.
 * @param {string} sessionCode 
 * @returns {string}
 */
const getStorageKey = (sessionCode) => {
  return `resources_${sessionCode}`;
};

/**
 * Validates if a URL is well-formed and has http/https protocol.
 * @param {string} urlStr 
 * @returns {boolean}
 */
export const validateUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const url = new URL(urlStr.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Retrieves all resources for a specific session code.
 * @param {string} sessionCode 
 * @returns {import("../types/resource").LectureResource[]}
 */
export const getResources = (sessionCode) => {
  if (!sessionCode) return [];
  try {
    const key = getStorageKey(sessionCode);
    const data = localStorage.getItem(key);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.error("Corrupted resources format - expected array");
      return [];
    }
    // Return resources sorted by newest first
    return parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error reading resources from localStorage:", error);
    return [];
  }
};

/**
 * Saves all resources to localStorage.
 * @param {string} sessionCode 
 * @param {import("../types/resource").LectureResource[]} resources 
 * @returns {boolean}
 */
export const saveResources = (sessionCode, resources) => {
  if (!sessionCode) return false;
  try {
    const key = getStorageKey(sessionCode);
    localStorage.setItem(key, JSON.stringify(resources));
    return true;
  } catch (error) {
    console.error("Error saving resources to localStorage:", error);
    if (error.name === "QuotaExceededError" || error.code === 22) {
      toast.error("Storage quota exceeded! Please delete some resources to free up space.");
    } else {
      toast.error("Failed to save resource. Local storage is unavailable.");
    }
    return false;
  }
};

/**
 * Creates a new resource.
 * @param {string} sessionCode 
 * @param {Object} data 
 * @param {string} data.title 
 * @param {string} [data.description] 
 * @param {string} data.category 
 * @param {string} data.resourceType 
 * @param {string} data.url 
 * @returns {import("../types/resource").LectureResource | null}
 */
export const createResource = (sessionCode, { title, description = "", category, resourceType, url }) => {
  const trimmedTitle = title?.trim() || "";
  const trimmedDescription = description?.trim() || "";
  const trimmedUrl = url?.trim() || "";

  if (!trimmedTitle) {
    toast.error("Resource title cannot be empty.");
    return null;
  }

  if (!category || !RESOURCE_CATEGORIES.includes(category)) {
    toast.error("Please select a valid category.");
    return null;
  }

  if (!resourceType || !RESOURCE_TYPES.includes(resourceType)) {
    toast.error("Please select a valid resource type.");
    return null;
  }

  if (!trimmedUrl) {
    toast.error("URL cannot be empty.");
    return null;
  }

  if (!validateUrl(trimmedUrl)) {
    toast.error("Invalid URL format. URL must start with http:// or https://");
    return null;
  }

  try {
    const currentResources = getResources(sessionCode);
    const now = new Date().toISOString();

    /** @type {import("../types/resource").LectureResource} */
    const newResource = {
      id: crypto.randomUUID(),
      sessionCode,
      title: trimmedTitle,
      description: trimmedDescription || undefined,
      category,
      resourceType,
      url: trimmedUrl,
      createdAt: now,
      updatedAt: now
    };

    const updated = [newResource, ...currentResources];
    if (saveResources(sessionCode, updated)) {
      toast.success("Resource added successfully.");
      return newResource;
    }
    return null;
  } catch (error) {
    console.error("Failed to create resource:", error);
    toast.error("Failed to add resource due to an error.");
    return null;
  }
};

/**
 * Updates an existing resource.
 * @param {string} sessionCode 
 * @param {string} id 
 * @param {Object} updatedFields 
 * @returns {import("../types/resource").LectureResource[] | null}
 */
export const updateResource = (sessionCode, id, updatedFields) => {
  if (!id) return null;

  const trimmedTitle = updatedFields.title !== undefined ? updatedFields.title?.trim() : null;
  const trimmedUrl = updatedFields.url !== undefined ? updatedFields.url?.trim() : null;

  if (trimmedTitle === "") {
    toast.error("Resource title cannot be empty.");
    return null;
  }

  if (updatedFields.category !== undefined && !RESOURCE_CATEGORIES.includes(updatedFields.category)) {
    toast.error("Please select a valid category.");
    return null;
  }

  if (updatedFields.resourceType !== undefined && !RESOURCE_TYPES.includes(updatedFields.resourceType)) {
    toast.error("Please select a valid resource type.");
    return null;
  }

  if (trimmedUrl === "") {
    toast.error("URL cannot be empty.");
    return null;
  }

  if (trimmedUrl !== null && !validateUrl(trimmedUrl)) {
    toast.error("Invalid URL format. URL must start with http:// or https://");
    return null;
  }

  try {
    const currentResources = getResources(sessionCode);
    const exists = currentResources.some(r => r.id === id);

    if (!exists) {
      toast.error("Resource not found.");
      return null;
    }

    const updated = currentResources.map(r => {
      if (r.id === id) {
        return {
          ...r,
          ...updatedFields,
          title: trimmedTitle !== null ? trimmedTitle : r.title,
          description: updatedFields.description !== undefined ? updatedFields.description?.trim() || undefined : r.description,
          url: trimmedUrl !== null ? trimmedUrl : r.url,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    if (saveResources(sessionCode, updated)) {
      toast.success("Resource updated successfully.");
      return updated;
    }
    return null;
  } catch (error) {
    console.error("Failed to update resource:", error);
    toast.error("Failed to update resource due to an error.");
    return null;
  }
};

/**
 * Deletes a resource.
 * @param {string} sessionCode 
 * @param {string} id 
 * @returns {import("../types/resource").LectureResource[] | null}
 */
export const deleteResource = (sessionCode, id) => {
  if (!id) return null;

  try {
    const currentResources = getResources(sessionCode);
    const updated = currentResources.filter(r => r.id !== id);

    if (saveResources(sessionCode, updated)) {
      toast.success("Resource deleted successfully.");
      return updated;
    }
    return null;
  } catch (error) {
    console.error("Failed to delete resource:", error);
    toast.error("Failed to delete resource due to an error.");
    return null;
  }
};
