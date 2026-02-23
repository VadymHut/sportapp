import { API, getCsrfHeaderValue } from './httpClient';

export const authProvider = {
  login: async ({ username, password }: any) => {
    const xsrf = await getCsrfHeaderValue();

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;

    const res = await fetch(`${API}/login`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: new URLSearchParams({ username, password }).toString(),
    });

    if (!res.ok) {
      throw new Error('Invalid credentials');
    }
  },

  checkAuth: async () => {
    const res = await fetch(`${API}/api/me`, { credentials: 'include' });
    if (res.status === 401) throw new Error('unauthenticated');
    const json = await res.json();
    if (!json?.authenticated) throw new Error('unauthenticated');
  },

  logout: async () => {
    const xsrf = await getCsrfHeaderValue();
    const headers: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;

    await fetch(`${API}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers,
    });
  },

  getPermissions: async () => {
    const res = await fetch(`${API}/api/me`, { credentials: 'include' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.roles ?? [];
  },

  checkError: async (error: any) => {
    if (error.status === 401) throw error;
    return;
  },


  getIdentity: async () => {
  const meRes = await fetch(`${API}/api/me`, { credentials: 'include' });
  if (!meRes.ok) throw new Error('unauthenticated');
  const me = await meRes.json();
  if (!me?.authenticated) throw new Error('unauthenticated');

  let name: string | undefined;
  let surname: string | undefined;
  let fullName: string | undefined;
  let staffId: number | undefined;

  if (me.userId != null) {
    const staffRes = await fetch(`${API}/api/app-users/staffinfo/${me.userId}`, {
      credentials: 'include',
    });
    if (staffRes.ok) {
      const s = await staffRes.json();
      staffId = s?.id;
      name = s?.name;
      surname = s?.surname;
      fullName = [name, surname].filter(Boolean).join(' ') || undefined;
    }
  }

  return {
    id: me.userId ?? me.username,
    fullName: fullName || me.username,
    username: me.username,
    name,
    surname,
    roles: me.roles,
    staffId,
  };
},

};
