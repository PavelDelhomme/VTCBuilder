/**
 * Tenant Features - Utility functions for checking feature availability
 */

/**
 * Check if a feature is enabled for the tenant
 * @param featureId - The feature ID to check
 * @param enabledFeatures - Array of enabled feature IDs
 * @returns true if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(featureId: string | undefined, enabledFeatures: string[]): boolean {
  if (!featureId) {
    return true // If no feature ID is specified, show the item by default
  }
  return enabledFeatures.includes(featureId)
}

