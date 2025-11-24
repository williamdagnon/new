import { randomUUID } from 'crypto';

/**
 * Generate UUID v4
 * MySQL doesn't have native UUID support, so we generate it in the application
 * Returns UUID without dashes for MySQL CHAR(36) compatibility
 */
export const generateUUID = (): string => {
  return randomUUID();
};

/**
 * Generate UUID without dashes for MySQL
 */
export const generateUUIDNoDash = (): string => {
  return randomUUID().replace(/-/g, '');
};
