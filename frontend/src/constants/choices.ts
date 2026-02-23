const API = import.meta.env.VITE_API_URL;

export type EnumBundle = {
  activityTypes: string[];
  groupTypes: string[];
  frequencyTypes: string[];
};

type Choice = { id: string; name: string };

let cache: EnumBundle | null = null;
let inflight: Promise<EnumBundle> | null = null;

const EMPTY: EnumBundle = { activityTypes: [], groupTypes: [], frequencyTypes: [] };

export async function fetchEnums(): Promise<EnumBundle> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(`${API}/api/enums`, { credentials: 'include' });
      if (!res.ok) throw new Error(`/api/enums ${res.status}`);
      const json = (await res.json()) as EnumBundle;
      cache = json ?? EMPTY;
      return cache;
    } catch (e) {
      cache = EMPTY;
      return cache;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function getActivityChoices(): Promise<Choice[]> {
  const e = await fetchEnums();
  return e.activityTypes.map(v => ({ id: v, name: v }));
}
export async function getGroupChoices(): Promise<Choice[]> {
  const e = await fetchEnums();
  return e.groupTypes.map(v => ({ id: v, name: v }));
}
export async function getFrequencyChoices(): Promise<Choice[]> {
  const e = await fetchEnums();
  return e.frequencyTypes.map(v => ({ id: v, name: v }));
}
