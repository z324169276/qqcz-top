import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjnpkfslayqlnzxhzlcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbnBrZnNsYXlxbG56eGh6bGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NzcwMzQsImV4cCI6MjA5NDA1MzAzNH0.-P6iiEA5FXAjU0od22KlqgB2fV4q3oLi7t9yj2bbdmI';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const generateFamilyCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createFamily = async (familyName: string): Promise<string> => {
  let familyCode: string;
  let attempts = 0;
  const maxAttempts = 10;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('登录状态异常，请刷新重试');
  }

  while (attempts < maxAttempts) {
    familyCode = generateFamilyCode();
    
    const { data, error } = await supabase
      .from('families')
      .select('familycode')
      .eq('familycode', familyCode)
      .single();
    
    if (error || !data) {
      const defaultMember = {
        id: Date.now().toString(),
        name: '我',
        avatar: '👦',
        points: 0,
        isOwner: true,
      };
      
      const { error: insertError } = await supabase
        .from('families')
        .insert({
          familycode: familyCode,
          familyname: familyName,
          points: 0,
          tasks: [],
          rewards: [],
          history: [],
          members: [defaultMember],
        });
      
      if (!insertError) {
        await supabase
          .from('family_memberships')
          .upsert(
            { user_id: userId, familycode: familyCode },
            { onConflict: 'user_id,familycode', ignoreDuplicates: true }
          );
        localStorage.setItem('familyId', familyCode);
        localStorage.setItem('memberId', defaultMember.id);
        return familyCode;
      }
    }
    attempts++;
  }

  throw new Error('无法生成唯一邀请码，请重试');
};

export const joinFamily = async (familyCode: string): Promise<{ success: boolean; message: string; familyName?: string }> => {
  const familyCodeUpper = familyCode.toUpperCase().trim();
  
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    return { success: false, message: '登录状态异常，请刷新重试' };
  }

  const { error: membershipError } = await supabase
    .from('family_memberships')
    .upsert(
      { user_id: userId, familycode: familyCodeUpper },
      { onConflict: 'user_id,familycode', ignoreDuplicates: true }
    );

  if (membershipError) {
    return { success: false, message: '邀请码不存在或无权限' };
  }

  const { data, error } = await supabase
    .from('families')
    .select('familycode, familyname')
    .eq('familycode', familyCodeUpper)
    .single();

  if (error || !data) {
    return { success: false, message: '邀请码不存在或无权限' };
  }

  localStorage.setItem('familyId', familyCodeUpper);
  return {
    success: true,
    message: '加入成功',
    familyName: data.familyname,
  };
};

export const initSupabase = async (): Promise<void> => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) return;
    await supabase.auth.signInAnonymously();
  } catch {
    return;
  }
};
