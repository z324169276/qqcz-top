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
  return supabaseApi.supabase
    .from('families')
    .update({
      ...data,
      lastModified: new Date().toISOString(),
    })
    .eq('familycode', familyCode);
};

export const getFamily = async (familyCode: string) => {
  if (USE_CLOUDBase) {
    return cloudbaseApi.getFamily(familyCode);
  }
  const { data, error } = await supabaseApi.supabase
    .from('families')
    .select('*')
    .eq('familycode', familyCode)
    .maybeSingle();
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
