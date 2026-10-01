/* Public key only. Passwords are checked by Supabase Auth, never in this app. */
window.SchoolAPI = (() => {
  const config = window.APP_CONFIG || {};
  const base = (config.SUPABASE_URL || '').replace(/\/$/, '');
  const key = 'clara-teacher-session-v3';
  let session;
  try { session = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (_) {}
  let refreshing;
  const save = value => { session = value; value ? sessionStorage.setItem(key, JSON.stringify(value)) : sessionStorage.removeItem(key); };
  async function request(path, body, token, method = 'POST') {
    if (!base || !config.SUPABASE_ANON_KEY) throw new Error('Die Verbindung zur Schule ist noch nicht eingerichtet.');
    const headers = {apikey: config.SUPABASE_ANON_KEY, 'Content-Type': 'application/json'};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(base + path, {method, headers, cache: 'no-store', ...(body === undefined ? {} : {body: JSON.stringify(body)})});
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(response.status === 401 ? 'Bitte erneut anmelden.' : response.status === 429 ? 'Zu viele Versuche. Bitte später erneut versuchen.' : data?.message || data?.msg || data?.error_description || 'Die Anfrage ist fehlgeschlagen.');
      error.status = response.status;
      throw error;
    }
    return data;
  }
  async function token() {
    if (!session) throw new Error('Bitte anmelden.');
    if (session.expires_at * 1000 < Date.now() + 60000) {
      refreshing ||= request('/auth/v1/token?grant_type=refresh_token', {refresh_token: session.refresh_token})
        .then(data => { save(data); return data; }).catch(error => { if (error.status === 400 || error.status === 401) save(null); throw error; }).finally(() => { refreshing = null; });
      await refreshing;
    }
    return session.access_token;
  }
  return {
    async login(username, password) {
      username = username.trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username)) throw new Error('Benutzername: 3–40 Zeichen, nur a–z, Ziffern, Punkt, Unterstrich oder Bindestrich.');
      const aliases = config.TEACHER_LOGIN_ALIASES || {};
      const email = Object.prototype.hasOwnProperty.call(aliases, username) ? aliases[username] : `${username}@lehrer.invalid`;
      try { save(await request('/auth/v1/token?grant_type=password', {email, password})); }
      catch (error) { throw new Error(error.status === 400 ? 'Benutzername oder Passwort stimmt nicht.' : error.message); }
    },
    async logout() { try { if (session) await request('/auth/v1/logout', undefined, await token()); } finally { save(null); } },
    hasSession: () => Boolean(session),
    async teacher(path, body, method = 'POST') { return request(path, body, await token(), method); },
    rpc: (name, body) => request(`/rest/v1/rpc/${name}`, body),
    normalizeCode: value => String(value || '').replace(/[\s-]/g, '').toLowerCase(),
    formatCode: value => String(value || '').toUpperCase()
  };
})();
