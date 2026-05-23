import * as supabaseApi from '../supabase';
import * as cloudbaseApi from '../cloudbase';

const USE_CLOUDBase = false;

export const generateFamilyCode = supabaseApi.generateFamilyCode;

export const createFamily = async (familyName: string): Promise<string> => {
  if (USE_CLOUDBase) {
    return cloudbaseApi.createFamily(familyName);
  }
  return supabaseApi.createFamily(familyName);
};

export const joinFamily = async (familyCode: string): Promise<{ success: boolean; message: string; familyName?: string }> => {
  if (USE_CLOUDBase) {
    return cloudbaseApi.joinFamily(familyCode);
  }
  return supabaseApi.joinFamily(familyCode);
};

export const updateFamily = async (familyCode: string, data: Record<string, any>) => {
  if (USE_CLOUDBase) {
    return cloudbaseApi.updateFamily(familyCode, data);
  }
  // #region debug-point familycode-multi-device-sync.api-update-start
  const debugEnabled = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
  const startedAt = Date.now();
  if (debugEnabled) {
    const prev = localStorage.getItem('__sync_debug');
    const prevObj = prev ? (() => { try { return JSON.parse(prev); } catch { return {}; } })() : {};
    localStorage.setItem('__sync_debug', JSON.stringify({
      ...prevObj,
      apiUpdateFamily: {
        at: new Date().toISOString(),
        familyCode,
        ok: null,
      },
    }));
  }
  // #endregion debug-point familycode-multi-device-sync.api-update-start

  const result = await supabaseApi.supabase
    .from('families')
    .update({
      ...data,
      lastModified: new Date().toISOString(),
    })
    .eq('familycode', familyCode);

  // #region debug-point familycode-multi-device-sync.api-update-end
  if (debugEnabled) {
    const prev = localStorage.getItem('__sync_debug');
    const prevObj = prev ? (() => { try { return JSON.parse(prev); } catch { return {}; } })() : {};
    localStorage.setItem('__sync_debug', JSON.stringify({
      ...prevObj,
      apiUpdateFamily: {
        at: new Date().toISOString(),
        familyCode,
        ok: !result.error,
        ms: Date.now() - startedAt,
        error: result.error?.message || null,
      },
    }));
  }
  // #endregion debug-point familycode-multi-device-sync.api-update-end

  return result;
};

export const getFamily = async (familyCode: string) => {
  if (USE_CLOUDBase) {
    return cloudbaseApi.getFamily(familyCode);
  }
  // #region debug-point familycode-multi-device-sync.api-get-start
  const debugEnabled = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
  const startedAt = Date.now();
  if (debugEnabled) {
    const prev = localStorage.getItem('__sync_debug');
    const prevObj = prev ? (() => { try { return JSON.parse(prev); } catch { return {}; } })() : {};
    localStorage.setItem('__sync_debug', JSON.stringify({
      ...prevObj,
      apiGetFamily: {
        at: new Date().toISOString(),
        familyCode,
        ok: null,
      },
    }));
  }
  // #endregion debug-point familycode-multi-device-sync.api-get-start

  const { data, error } = await supabaseApi.supabase
    .from('families')
    .select('*')
    .eq('familycode', familyCode)
    .maybeSingle();

  // #region debug-point familycode-multi-device-sync.api-get-end
  if (debugEnabled) {
    const lastModified = (data as any)?.lastModified || (data as any)?.lastmodified || null;
    const prev = localStorage.getItem('__sync_debug');
    const prevObj = prev ? (() => { try { return JSON.parse(prev); } catch { return {}; } })() : {};
    localStorage.setItem('__sync_debug', JSON.stringify({
      ...prevObj,
      apiGetFamily: {
        at: new Date().toISOString(),
        familyCode,
        ok: !error && !!data,
        ms: Date.now() - startedAt,
        error: error?.message || null,
        remoteLastModified: lastModified,
        counts: data
          ? {
              members: ((data as any).members || []).length,
              tasks: ((data as any).tasks || []).length,
              rewards: ((data as any).rewards || []).length,
              history: ((data as any).history || []).length,
              points: (data as any).points ?? null,
            }
          : null,
      },
    }));
  }
  // #endregion debug-point familycode-multi-device-sync.api-get-end

  if (error) return null;
  return data;
};

export const initCloud = async () => {
  if (USE_CLOUDBase) {
    return cloudbaseApi.initCloudbase();
  }
  return supabaseApi.initSupabase();
};

export const getClient = () => {
  if (USE_CLOUDBase) {
    return { type: 'cloudbase', client: null };
  }
  return { type: 'supabase', client: supabaseApi.supabase };
};
