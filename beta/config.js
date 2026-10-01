/* Configuração v2.0 — persistência online (Google Sheets + Login Google)
   Segurança: login Google + allowlist validada no servidor (Apps Script).
   O backend NÃO usa mais SYNC_TOKEN — a autorização é 100% pelo idToken + allowlist. */
window.GIDEAO_CONFIG = {
  SHEET_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbw6WpISI7l84vvryzLpPBCfkLiIOBX8IXLSNqWjF1rOJwzptQ2I0_XTN9zFrm1aWZk5Sw/exec',
  GOOGLE_CLIENT_ID: '476000543715-mah5unii34arb90lq2t3teln1hpcq0g7.apps.googleusercontent.com',
  ALLOWED_EMAILS: ['rogerio.s.ono@gmail.com', 'tania.eustaqui@gmail.com'],
  ADMIN_EMAILS: ['rogerio.s.ono@gmail.com']
};
