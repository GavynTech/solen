import { setCors } from '../_services/cors.js';

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pin, domain } = req.body ?? {};
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const host = domain ? domain.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'yoursite.com';

  const snippet = `<!-- Solens Lead Intelligence — paste before </body> -->
<script src="https://${host}/solens-embed.js" defer></script>`;

  return res.status(200).json({ ok: true, snippet, host });
}
