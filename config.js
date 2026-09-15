/*
  Öffentliche Browser-Konfiguration.
  Der Supabase-"anon public"-Schlüssel darf hier stehen. Der service_role-Schlüssel
  gehört niemals in dieses Repository.
*/
window.APP_CONFIG = {
  SUPABASE_URL: 'https://ucmrwvofyadhnvrsrzpn.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_sWL69mOihUpvLw5LW3EJpA_51FrXk6k',
  APP_TITLE: 'Der Fall Clara Neumann',
  // Notfall-Freigabecode: nur nötig, wenn ein iPad die Freigabe nicht online
  // prüfen kann. Die Lehrkraft nennt ihn dann mündlich. Leer lassen = aus.
  RELEASE_CODE: 'clara-1912'
};
