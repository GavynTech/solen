export async function upsertHubSpotContact({ email, name, enriched, score }) {
  try {
    const properties = {
      email,
      ...(name ? { firstname: name.split(' ')[0], lastname: name.split(' ').slice(1).join(' ') || '' } : {}),
      company: enriched.company_name ?? '',
      industry: enriched.industry ?? '',
      numberofemployees: enriched.employee_count ? String(enriched.employee_count) : '',
      annualrevenue: enriched.annual_revenue ? String(enriched.annual_revenue) : '',
      hs_lead_status: score.vip_tier === 'VIP' ? 'IN_PROGRESS' : 'NEW',
      lifecyclestage: 'lead',
      // Custom properties (must be created in HubSpot first)
      vip_score: String(score.vip_score),
      vip_tier: score.vip_tier,
      funding_stage: enriched.funding_stage ?? '',
      solen_recommended_action: score.recommended_action ?? '',
    };

    // Try to create; if conflict (409), update instead
    const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ properties }),
    });

    if (createRes.ok) {
      const data = await createRes.json();
      return { hubspot_id: data.id, status: 'created' };
    }

    if (createRes.status === 409) {
      // Contact exists — search by email and update
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
          properties: ['email'],
          limit: 1,
        }),
      });

      const searchData = await searchRes.json();
      const contactId = searchData.results?.[0]?.id;

      if (contactId) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ properties }),
        });
        return { hubspot_id: contactId, status: 'updated' };
      }
    }

    console.warn('[hubspot] unexpected status:', createRes.status);
    return { hubspot_id: null, status: 'failed' };
  } catch (err) {
    console.error('[hubspot] error:', err.message);
    return { hubspot_id: null, status: 'error' };
  }
}
