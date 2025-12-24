/**
 * @typedef {Object} Teacher
 * @property {string} id
 * @property {string} name
 * @property {string} [password]
 */

/**
 * @typedef {Object} Lecture
 * @property {string} id
 * @property {string} teacherId
 * @property {string} subject
 * @property {string} topic
 * @property {string} code
 * @property {number} duration
 * @property {string} createdAt
 * @property {'active' | 'completed'} status
 * @property {boolean} isActive
 */

export const Types = {}; // Dummy export to allow import
