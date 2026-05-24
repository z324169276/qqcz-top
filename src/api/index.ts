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

export const ensureMembership = async (familyCode: string) => {
  if (USE_CLOUDBase) {
    return;
  }
  const { data: userData } = await supabaseApi.supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  await supabaseApi.supabase
    .from('family_memberships')
    .upsert(
      { user_id: userId, familycode: familyCode },
      { onConflict: 'user_id,familycode', ignoreDuplicates: true }
    );
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

export const getUser = async () => {
  if (USE_CLOUDBase) {
    return { user: null as any };
  }
  const { data } = await supabaseApi.supabase.auth.getUser();
  return { user: data.user };
};

export const sendEmailLink = async (email: string, redirectTo: string) => {
  if (USE_CLOUDBase) {
    throw new Error('当前未启用该功能');
  }
  const { error } = await supabaseApi.supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
};

export const bindFamilyOwnerEmail = async (familyCode: string) => {
  if (USE_CLOUDBase) {
    throw new Error('当前未启用该功能');
  }

  const { data } = await supabaseApi.supabase.auth.getUser();
  const user = data.user;
  if (!user) throw new Error('登录状态异常，请重新打开邮件链接');
  if (!user.email) throw new Error('未获取到邮箱信息');

  const { error } = await supabaseApi.supabase
    .from('families')
    .update({
      owner_user_id: user.id,
      owner_email: user.email,
      lastModified: new Date().toISOString(),
    })
    .eq('familycode', familyCode);

  if (error) throw error;

  await ensureMembership(familyCode);
};

export const listFamiliesByOwner = async () => {
  if (USE_CLOUDBase) {
    throw new Error('当前未启用该功能');
  }

  const { data } = await supabaseApi.supabase.auth.getUser();
  const user = data.user;
  if (!user) throw new Error('请先打开邮件里的登录链接');

  const { data: families, error } = await supabaseApi.supabase
    .from('families')
    .select('familycode, familyname')
    .eq('owner_user_id', user.id);

  if (error) throw error;
  return families || [];
};

export const getClient = () => {
  if (USE_CLOUDBase) {
    return { type: 'cloudbase', client: null };
  }
  return { type: 'supabase', client: supabaseApi.supabase };
};
