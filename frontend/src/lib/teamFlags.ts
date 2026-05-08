// Team name → flagcdn.com ISO-2 code lookup.
// Covers all 48 World Cup 2026 participants.
// Both display name and normalised name (used by the external sync API) are registered.
// England and Scotland use GB subdivision codes supported by flagcdn.com.
// Returns null for unknown teams so callers can render nothing gracefully.

const ISO2: Record<string, string> = {
  // Group A
  'mexico': 'mx',
  'south africa': 'za',
  'south korea': 'kr',
  'korea republic': 'kr',
  'czech republic': 'cz',
  'czechia': 'cz',
  // Group B
  'canada': 'ca',
  'bosnia & herzegovina': 'ba',
  'qatar': 'qa',
  'switzerland': 'ch',
  // Group C
  'brazil': 'br',
  'morocco': 'ma',
  'haiti': 'ht',
  'scotland': 'gb-sct',
  // Group D
  'usa': 'us',
  'united states': 'us',
  'paraguay': 'py',
  'australia': 'au',
  'turkey': 'tr',
  'türkiye': 'tr',
  // Group E
  'germany': 'de',
  'curaçao': 'cw',
  'ivory coast': 'ci',
  "cote d'ivoire": 'ci',
  'ecuador': 'ec',
  // Group F
  'netherlands': 'nl',
  'japan': 'jp',
  'sweden': 'se',
  'tunisia': 'tn',
  // Group G
  'belgium': 'be',
  'egypt': 'eg',
  'iran': 'ir',
  'ir iran': 'ir',
  'new zealand': 'nz',
  // Group H
  'spain': 'es',
  'cape verde': 'cv',
  'cabo verde': 'cv',
  'saudi arabia': 'sa',
  'uruguay': 'uy',
  // Group I
  'france': 'fr',
  'senegal': 'sn',
  'iraq': 'iq',
  'norway': 'no',
  // Group J
  'argentina': 'ar',
  'algeria': 'dz',
  'austria': 'at',
  'jordan': 'jo',
  // Group K
  'portugal': 'pt',
  'dr congo': 'cd',
  'congo dr': 'cd',
  'uzbekistan': 'uz',
  'colombia': 'co',
  // Group L
  'england': 'gb-eng',
  'croatia': 'hr',
  'ghana': 'gh',
  'panama': 'pa',
};

export function getTeamFlagCode(teamName: string): string | null {
  return ISO2[teamName.toLowerCase()] ?? null;
}

export function getTeamFlagUrl(teamName: string, width: 20 | 40 = 20): string | null {
  const code = getTeamFlagCode(teamName);
  return code ? `https://flagcdn.com/w${width}/${code}.png` : null;
}
