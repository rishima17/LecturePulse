/**
 * Storage utility functions for Exit Tickets in LecturePulse.
 */

/**
 * Get exit ticket details for a specific session code.
 * @param {string} sessionCode 
 * @returns {object|null} The exit ticket or null if not found/error.
 */
export const getExitTicket = (sessionCode) => {
  if (!sessionCode) return null;
  try {
    const data = localStorage.getItem(`exitTicket_${sessionCode}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting exit ticket", error);
    return null;
  }
};

/**
 * Save exit ticket details for a specific session code.
 * @param {string} sessionCode 
 * @param {object} ticketData 
 * @returns {boolean} True if successfully saved, false otherwise.
 */
export const saveExitTicket = (sessionCode, ticketData) => {
  if (!sessionCode) return false;
  try {
    localStorage.setItem(`exitTicket_${sessionCode}`, JSON.stringify(ticketData));
    return true;
  } catch (error) {
    console.error("Error saving exit ticket", error);
    return false;
  }
};

/**
 * Get all responses for an exit ticket.
 * @param {string} sessionCode 
 * @returns {Array} The list of anonymous responses.
 */
export const getExitTicketResponses = (sessionCode) => {
  if (!sessionCode) return [];
  try {
    const data = localStorage.getItem(`exitTicketResponses_${sessionCode}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting exit ticket responses", error);
    return [];
  }
};

/**
 * Submit an exit ticket response for a session.
 * @param {string} sessionCode 
 * @param {any} responseVal 
 * @returns {boolean} True if successfully submitted, false otherwise.
 */
export const submitExitTicketResponse = (sessionCode, responseVal) => {
  if (!sessionCode) return false;
  try {
    const responses = getExitTicketResponses(sessionCode);
    const newResponse = {
      response: responseVal,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      `exitTicketResponses_${sessionCode}`,
      JSON.stringify([...responses, newResponse])
    );
    // Mark as submitted locally to prevent duplicate submissions
    localStorage.setItem(`exitTicketSubmitted_${sessionCode}`, "true");
    
    // Dispatch a custom event to notify other components/tabs
    window.dispatchEvent(new CustomEvent("exit-ticket-updated", {
      detail: { sessionCode }
    }));
    return true;
  } catch (error) {
    console.error("Error submitting exit ticket response", error);
    return false;
  }
};

/**
 * Check if the student has already submitted an exit ticket response for the session.
 * @param {string} sessionCode 
 * @returns {boolean} True if student has submitted, false otherwise.
 */
export const hasStudentSubmittedExitTicket = (sessionCode) => {
  if (!sessionCode) return false;
  try {
    return localStorage.getItem(`exitTicketSubmitted_${sessionCode}`) === "true";
  } catch (error) {
    console.error("Error checking exit ticket submission status", error);
    return false;
  }
};
