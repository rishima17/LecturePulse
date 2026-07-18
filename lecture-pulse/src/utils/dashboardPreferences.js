/**
 * Utility functions for managing user preferences for the Analytics Dashboard.
 * Persists widget order and visibility options in localStorage.
 */

const STORAGE_KEY = "lecturePulse_dashboard_preferences";

export const VALID_WIDGET_IDS = [
  "summary",
  "understanding",
  "attention",
  "confusion",
  "comments"
];

/**
 * Returns the default dashboard preferences.
 * @returns {{widgetOrder: string[], hiddenWidgets: string[]}} Default preferences object.
 */
export const getDefaultPreferences = () => ({
  widgetOrder: [...VALID_WIDGET_IDS],
  hiddenWidgets: []
});

/**
 * Validates a preferences object to ensure it is structurally sound and contains only valid widget IDs.
 * @param {any} prefs - The object to validate.
 * @returns {boolean} True if the preferences are valid, false otherwise.
 */
export const validatePreferences = (prefs) => {
  if (!prefs || typeof prefs !== "object") return false;
  if (!Array.isArray(prefs.widgetOrder) || !Array.isArray(prefs.hiddenWidgets)) return false;

  // Verify all elements in widgetOrder are valid widget IDs and there are no duplicates
  const orderSet = new Set(prefs.widgetOrder);
  if (orderSet.size !== VALID_WIDGET_IDS.length) return false;
  for (const id of prefs.widgetOrder) {
    if (!VALID_WIDGET_IDS.includes(id)) return false;
  }

  // Verify all elements in hiddenWidgets are valid widget IDs
  for (const id of prefs.hiddenWidgets) {
    if (!VALID_WIDGET_IDS.includes(id)) return false;
  }

  return true;
};

/**
 * Safely retrieves dashboard preferences from localStorage.
 * Falls back to default preferences if not found, corrupted, or invalid.
 * @returns {{widgetOrder: string[], hiddenWidgets: string[]}} The validated dashboard preferences.
 */
export const getDashboardPreferences = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return getDefaultPreferences();
    }

    const parsed = JSON.parse(rawData);
    if (validatePreferences(parsed)) {
      return parsed;
    }

    // Attempt to recover if the structure is partially valid but missing some widgets
    if (parsed && typeof parsed === "object") {
      const widgetOrder = Array.isArray(parsed.widgetOrder)
        ? parsed.widgetOrder.filter(id => VALID_WIDGET_IDS.includes(id))
        : [];
      
      const hiddenWidgets = Array.isArray(parsed.hiddenWidgets)
        ? parsed.hiddenWidgets.filter(id => VALID_WIDGET_IDS.includes(id))
        : [];

      // Add missing widgets to widgetOrder
      VALID_WIDGET_IDS.forEach(id => {
        if (!widgetOrder.includes(id)) {
          widgetOrder.push(id);
        }
      });

      const recovered = { widgetOrder, hiddenWidgets };
      if (validatePreferences(recovered)) {
        // Save recovered preferences to clean up storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered));
        return recovered;
      }
    }

    return getDefaultPreferences();
  } catch (error) {
    console.error("Error reading dashboard preferences:", error);
    return getDefaultPreferences();
  }
};

/**
 * Saves dashboard preferences to localStorage.
 * Handles errors like QuotaExceededError gracefully.
 * @param {{widgetOrder: string[], hiddenWidgets: string[]}} preferences - The preferences to save.
 * @returns {boolean} True if successfully saved.
 */
export const saveDashboardPreferences = (preferences) => {
  try {
    if (!validatePreferences(preferences)) {
      throw new Error("Invalid dashboard preferences structure");
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error("Error saving dashboard preferences:", error);
    // Gracefully handle storage errors (e.g. quota exceeded or unavailable in incognito mode)
    return false;
  }
};

/**
 * Restores dashboard preferences to defaults, saving them to localStorage.
 * @returns {{widgetOrder: string[], hiddenWidgets: string[]}} The default preferences object.
 */
export const restoreDefaultPreferences = () => {
  const defaults = getDefaultPreferences();
  saveDashboardPreferences(defaults);
  return defaults;
};
