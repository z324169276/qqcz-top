export interface TaskTemplate {
  id: string;
  name: string;
  points: number;
  category: string;
  icon: string;
  description?: string;
}

export const taskTemplates: TaskTemplate[] = [
  // 学习类
  { id: 't1', name: '完成数学作业', points: 10, category: '学习', icon: '📐', description: '认真完成数学练习' },
  { id: 't2', name: '完成语文作业', points: 10, category: '学习', icon: '📖', description: '认真完成语文练习' },
  { id: 't3', name: '完成英语作业', points: 10, category: '学习', icon: '🔤', description: '认真完成英语练习' },
  { id: 't4', name: '阅读30分钟', points: 15, category: '学习', icon: '📚', description: '安静阅读课外书' },
  { id: 't5', name: '背诵古诗', points: 8, category: '学习', icon: '🎋', description: '背诵一首古诗词' },
  { id: 't6', name: '练字30分钟', points: 12, category: '学习', icon: '✍️', description: '认真练习写字' },
  { id: 't7', name: '预习新课', points: 8, category: '学习', icon: '🔍', description: '提前预习明天课程' },
  { id: 't8', name: '复习错题', points: 10, category: '学习', icon: '📝', description: '整理并复习错题' },

  // 家务类
  { id: 'h1', name: '整理房间', points: 15, category: '家务', icon: '🛏️', description: '收拾床铺，整理书桌' },
  { id: 'h2', name: '洗碗', points: 10, category: '家务', icon: '🍽️', description: '清洗餐具' },
  { id: 'h3', name: '扫地拖地', points: 12, category: '家务', icon: '🧹', description: '打扫地面' },
  { id: 'h4', name: '倒垃圾', points: 5, category: '家务', icon: '🗑️', description: '把垃圾拿到指定地点' },
  { id: 'h5', name: '洗衣服', points: 15, category: '家务', icon: '👕', description: '清洗自己的衣物' },
  { id: 'h6', name: '叠衣服', points: 8, category: '家务', icon: '👔', description: '叠好整理好的衣服' },
  { id: 'h7', name: '帮忙做饭', points: 12, category: '家务', icon: '🍳', description: '帮家长准备食材' },
  { id: 'h8', name: '浇花', points: 5, category: '家务', icon: '🌷', description: '给植物浇水' },

  // 运动类
  { id: 's1', name: '跑步30分钟', points: 15, category: '运动', icon: '🏃', description: '户外跑步锻炼' },
  { id: 's2', name: '跳绳200个', points: 12, category: '运动', icon: '🪢', description: '连续跳绳' },
  { id: 's3', name: '骑自行车', points: 15, category: '运动', icon: '🚴', description: '户外骑行' },
  { id: 's4', name: '游泳30分钟', points: 20, category: '运动', icon: '🏊', description: '游泳锻炼' },
  { id: 's5', name: '篮球运动', points: 15, category: '运动', icon: '🏀', description: '打篮球' },
  { id: 's6', name: '足球运动', points: 15, category: '运动', icon: '⚽', description: '踢足球' },
  { id: 's7', name: '做早操', points: 8, category: '运动', icon: '🧘', description: '做一套广播体操' },
  { id: 's8', name: '仰卧起坐30个', points: 10, category: '运动', icon: '💪', description: '核心力量训练' },

  // 习惯类
  { id: 'c1', name: '早起不赖床', points: 8, category: '习惯', icon: '⏰', description: '闹钟响后马上起床' },
  { id: 'c2', name: '早睡（21:30前）', points: 8, category: '习惯', icon: '🌙', description: '按时睡觉' },
  { id: 'c3', name: '自己起床整理', points: 5, category: '习惯', icon: '🛏️', description: '自己起床叠被' },
  { id: 'c4', name: '整理书包', points: 5, category: '习惯', icon: '🎒', description: '整理好第二天物品' },
  { id: 'c5', name: '饭前洗手', points: 3, category: '习惯', icon: '🧼', description: '养成卫生习惯' },
  { id: 'c6', name: '自己收拾玩具', points: 8, category: '习惯', icon: '🧸', description: '玩完玩具自己收' },
  { id: 'c7', name: '不挑食', points: 10, category: '习惯', icon: '🥦', description: '均衡饮食' },
  { id: 'c8', name: '主动问好', points: 5, category: '习惯', icon: '👋', description: '礼貌待人' },
];

export const templateCategories = [
  { name: '学习', icon: '📖', color: 'blue' },
  { name: '家务', icon: '🏠', color: 'amber' },
  { name: '运动', icon: '⚽', color: 'green' },
  { name: '习惯', icon: '✨', color: 'purple' },
];

export const defaultRewards: { name: string; points: number; stock: number; emoji: string }[] = [
  { name: '喝一杯奶茶', points: 50, stock: 10, emoji: '🧋' },
  { name: '看一部电影', points: 100, stock: 5, emoji: '🎬' },
  { name: '买想要的东西', points: 200, stock: 3, emoji: '🛍️' },
  { name: '玩1小时游戏', points: 30, stock: 10, emoji: '🎮' },
  { name: '外出游玩', points: 150, stock: 3, emoji: '🎢' },
];

export interface RewardTemplate {
  id: string;
  name: string;
  points: number;
  stock: number;
  emoji: string;
  category: string;
}

export const rewardTemplates: RewardTemplate[] = [
  { id: 'r1', name: '喝一杯奶茶', points: 50, stock: 10, emoji: '🧋', category: '美食' },
  { id: 'r2', name: '吃一次快餐', points: 80, stock: 5, emoji: '🍔', category: '美食' },
  { id: 'r3', name: '吃一次零食', points: 30, stock: 10, emoji: '🍿', category: '美食' },
  { id: 'r4', name: '吃冰淇淋', points: 40, stock: 10, emoji: '🍦', category: '美食' },
  { id: 'r5', name: '吃一顿大餐', points: 200, stock: 3, emoji: '🍽️', category: '美食' },
  
  { id: 'r6', name: '玩1小时游戏', points: 30, stock: 10, emoji: '🎮', category: '娱乐' },
  { id: 'r7', name: '看一部电影', points: 100, stock: 5, emoji: '🎬', category: '娱乐' },
  { id: 'r8', name: '看电视1小时', points: 20, stock: 10, emoji: '📺', category: '娱乐' },
  { id: 'r9', name: '去游乐园', points: 300, stock: 2, emoji: '🎢', category: '娱乐' },
  { id: 'r10', name: '去动物园', points: 200, stock: 3, emoji: '🦁', category: '娱乐' },
  { id: 'r11', name: '去博物馆', points: 150, stock: 3, emoji: '🏛️', category: '娱乐' },
  
  { id: 'r12', name: '买想要的东西', points: 200, stock: 3, emoji: '🛍️', category: '购物' },
  { id: 'r13', name: '买一本书', points: 80, stock: 5, emoji: '📚', category: '购物' },
  { id: 'r14', name: '买一个玩具', points: 150, stock: 3, emoji: '🧸', category: '购物' },
  { id: 'r15', name: '买新文具', points: 50, stock: 5, emoji: '✏️', category: '购物' },
  { id: 'r16', name: '买新衣服', points: 300, stock: 2, emoji: '👕', category: '购物' },
  
  { id: 'r17', name: '晚睡30分钟', points: 50, stock: 5, emoji: '🌙', category: '特权' },
  { id: 'r18', name: '选择晚餐', points: 30, stock: 5, emoji: '🍕', category: '特权' },
  { id: 'r19', name: '免做一次家务', points: 100, stock: 3, emoji: '🧹', category: '特权' },
  { id: 'r20', name: '选择周末活动', points: 150, stock: 2, emoji: '🎯', category: '特权' },
  
  { id: 'r21', name: '外出游玩', points: 150, stock: 3, emoji: '🎪', category: '外出' },
  { id: 'r22', name: '去公园玩', points: 50, stock: 5, emoji: '🌳', category: '外出' },
  { id: 'r23', name: '去游泳', points: 100, stock: 3, emoji: '🏊', category: '外出' },
  { id: 'r24', name: '去爬山', points: 120, stock: 3, emoji: '⛰️', category: '外出' },
];

export const rewardCategories = [
  { name: '美食', icon: '🍔', color: 'orange' },
  { name: '娱乐', icon: '🎮', color: 'purple' },
  { name: '购物', icon: '🛍️', color: 'pink' },
  { name: '特权', icon: '⭐', color: 'yellow' },
  { name: '外出', icon: '🎪', color: 'blue' },
];
