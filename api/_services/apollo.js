export async function searchApolloProspects(icp) {
  try {
    const {
      titles = [],
      industries = [],
      employee_range = [50, 500],
      limit = 5,
    } = icp;

    const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.APOLLO_API_KEY,
      },
      body: JSON.stringify({
        person_titles: titles,
        organization_industry_tag_ids: [],
        organization_industries: industries,
        organization_num_employees_ranges: [`${employee_range[0]},${employee_range[1]}`],
        per_page: Math.min(limit, 25),
        page: 1,
      }),
    });

    if (!res.ok) {
      console.warn('[apollo] searchProspects non-200:', res.status);
      return [];
    }

    const data = await res.json();
    const people = data.people ?? [];

    return people
      .filter(p => p.email)
      .map(p => {
        const org = p.organization ?? {};
        return {
          email: p.email,
          first_name: p.first_name ?? null,
          last_name: p.last_name ?? null,
          title: p.title ?? null,
          linkedin_url: p.linkedin_url ?? null,
          company_name: p.organization_name ?? org.name ?? null,
          annual_revenue: org.annual_revenue ?? null,
          employee_count: org.estimated_num_employees ?? null,
          industry: org.industry ?? null,
          tech_stack: org.technology_names ?? [],
          funding_stage: org.latest_funding_stage ?? null,
          headquarters: org.city && org.country
            ? `${org.city}, ${org.country}`
            : (org.city ?? org.country ?? null),
        };
      });
  } catch (err) {
    console.error('[apollo] searchProspects error:', err.message);
    return [];
  }
}

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
