const envId = 'childlike-mission-d7dcn1bebdde0b';

let cloudbase: any = null;
let db: any = null;
let initPromise: Promise<any> | null = null;

// 简化初始化 - 不使用匿名登录，减少阻塞
export const initCloudbase = async () => {
  if (cloudbase) return cloudbase;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('Initializing CloudBase...');
      
      const tcb = await import('@cloudbase/js-sdk');
      const app = tcb.init({
        env: envId,
      });
      
      cloudbase = app;
      db = app.database();
      
      console.log('CloudBase initialized successfully');
      
      return cloudbase;
    } catch (error) {
      console.error('CloudBase init failed:', error);
      // 即使初始化失败也不阻塞应用
      cloudbase = null;
      db = null;
      return null;
    }
  })();

  return initPromise;
};

export const generateFamilyCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createFamily = async (familyName: string): Promise<string> => {
  await initCloudbase();
  
  if (!db) {
    throw new Error('CloudBase 未初始化');
  }

  let familyCode: string;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    familyCode = generateFamilyCode();
    
    const result = await db.collection('families')
      .where({ familycode: familyCode })
      .get();
    
    if (!result.data || result.data.length === 0) {
      const defaultMember = {
        id: Date.now().toString(),
        name: '我',
        avatar: '👦',
        points: 0,
        isOwner: true,
      };
      
      await db.collection('families').add({
        familycode: familyCode,
        familyname: familyName,
        points: 0,
        tasks: [],
        rewards: [],
        history: [],
        members: [defaultMember],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      localStorage.setItem('familyId', familyCode);
      localStorage.setItem('memberId', defaultMember.id);
      return familyCode;
    }
    attempts++;
  }

  throw new Error('无法生成唯一邀请码，请重试');
};

export const joinFamily = async (familyCode: string): Promise<{ success: boolean; message: string; familyName?: string }> => {
  await initCloudbase();
  
  if (!db) {
    return { success: false, message: 'CloudBase 未初始化' };
  }

  const familyCodeUpper = familyCode.toUpperCase().trim();
  
  const result = await db.collection('families')
    .where({ familycode: familyCodeUpper })
    .get();

  if (!result.data || result.data.length === 0) {
    return { success: false, message: '邀请码不存在' };
  }

  const data = result.data[0];
  localStorage.setItem('familyId', familyCodeUpper);
  return { 
    success: true, 
    message: '加入成功', 
    familyName: data.familyname 
  };
};

export const updateFamily = async (familyCode: string, data: Record<string, any>) => {
  await initCloudbase();
  
  if (!db) return;

  try {
    await db.collection('families')
      .where({ familycode: familyCode })
      .update({
        ...data,
        updatedAt: new Date(),
      });
  } catch (error: any) {
    console.error('updateFamily error:', error);
    throw error;
  }
};

export const getFamily = async (familyCode: string) => {
  await initCloudbase();
  
  if (!db) return null;

  const result = await db.collection('families')
    .where({ familycode: familyCode })
    .get();

  return result.data?.[0] || null;
};
