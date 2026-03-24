export async function enrichWithApollo(email) {
  try {
    const res = await fetch('https://api.apollo.io/v1/people/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.APOLLO_API_KEY,
      },
      body: JSON.stringify({ email, reveal_personal_emails: false }),
    });

    if (!res.ok) {
      console.warn('[apollo] non-200:', res.status);
      return {};
    }

    const data = await res.json();
    const person = data.person ?? {};
    const org = person.organization ?? {};

    return {
      company_name: person.organization_name ?? org.name ?? null,
      annual_revenue: org.annual_revenue ?? null,
      employee_count: org.estimated_num_employees ?? null,
      industry: org.industry ?? null,
      tech_stack: org.technology_names ?? [],
      funding_stage: org.latest_funding_stage ?? null,
      headquarters: org.city && org.country
        ? `${org.city}, ${org.country}`
        : (org.city ?? org.country ?? null),
      linkedin_url: person.linkedin_url ?? org.linkedin_url ?? null,
    };
  } catch (err) {
    console.error('[apollo] error:', err.message);
    return {};
  }
}
