const CANONICAL_DEFAULTS = {
  annual_revenue: 0,
  employee_count: 50,
  funding_stage: 'Unknown',
  tech_stack: [],
  industry: 'Technology',
};

/**
 * Null-Safe Default Router: fills missing Apollo fields with canonical defaults
 * and tracks which fields were patched.
 */
export function nullSafeRoute(apolloData) {
  const enriched = { ...apolloData };
  const null_fields_patched = [];

  for (const [field, defaultValue] of Object.entries(CANONICAL_DEFAULTS)) {
    const value = apolloData[field];
    const isMissing =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);

    if (isMissing) {
      enriched[field] = defaultValue;
      null_fields_patched.push(field);
    }
  }

  return { enriched, null_fields_patched };
}
