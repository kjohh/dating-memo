import { z } from 'zod';

// 預設的標籤
export const PRESET_POSITIVE_TAGS = [
  '幽默', '聰明', '善良', '體貼', '有趣', '有責任心', '浪漫', '有上進心',
  '有愛心', '會做飯', '會聆聽', '有耐心', '有主見', '有才藝', '會照顧人'
];

export const PRESET_NEGATIVE_TAGS = [
  '粗心', '脾氣差', '不守時', '愛抱怨', '小氣', '自私', '不體貼', '懶惰',
  '愛玩手機', '不會溝通', '缺乏責任感', '拖延症', '愛佔小便宜', '不尊重人'
];

export const PRESET_PERSONALITY_TAGS = [
  '內向', '外向', '理性', '感性', '樂觀', '悲觀', '冒險', '保守',
  '完美主義', '隨性', '獨立', '依賴', '務實', '理想主義', '領導型', '跟隨型'
];

// 關係狀態
export const RELATIONSHIP_STATUSES = [
  '觀察中', '約見面', '曖昧中', '穩定發展', '正式交往', '結束 / 無發展'
] as const;

export type RelationshipStatus = typeof RELATIONSHIP_STATUSES[number];

// 關係狀態的描述
export const RELATIONSHIP_STATUS_DESCRIPTIONS: Record<RelationshipStatus, string> = {
  '觀察中': '剛認識或剛開始聊天，還不確定是否有發展的可能。對方可能回應不積極，或自己還在評估是否有興趣繼續互動。',
  '約見面': '已經有一定程度的互動，並安排了見面，或是已經見過一次但還在觀察是否適合進一步發展。',
  '曖昧中': '互相有好感，雙方的互動頻率較高，可能有些曖昧的對話或行為，但尚未正式確認關係。',
  '穩定發展': '互動已經相當頻繁，彼此對對方的興趣明顯增加，關係趨向明確，可能正在固定約會，但尚未正式進入交往狀態。',
  '正式交往': '雙方已經確認彼此的關係，進入穩定的情侶階段。',
  '結束 / 無發展': '無進一步發展的可能，可能是因為互相無感、對方不感興趣、關係自然淡掉，或其他原因導致互動終止。'
};

// 關係狀態的顏色
export const RELATIONSHIP_STATUS_COLORS: Record<RelationshipStatus, { bg: string; text: string }> = {
  '觀察中': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  '約見面': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  '曖昧中': { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  '穩定發展': { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  '正式交往': { bg: 'bg-red-500/20', text: 'text-red-400' },
  '結束 / 無發展': { bg: 'bg-gray-500/20', text: 'text-gray-400' }
};

// 約會對象的模式定義
export const datePersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '姓名不能為空'),
  age: z.number().min(18, '年齡必須大於或等於18歲').optional(),
  gender: z.enum(['男', '女', '其他']).optional(),
  occupation: z.string().optional(),
  contactInfo: z.string().optional(),
  notes: z.string().optional(),
  instagramAccount: z.string().optional(),
  relationshipStatus: z.enum(RELATIONSHIP_STATUSES).default('觀察中'),
  firstDateAt: z.string().optional(),
  positiveTags: z.array(z.string()),
  negativeTags: z.array(z.string()),
  personalityTags: z.array(z.string()),
  rating: z.number().min(1).max(5).optional(),
  meetChannel: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 約會對象的類型
export type DatePerson = z.infer<typeof datePersonSchema>;

// 表單數據的模式定義 - 修改為接受字符串類型的age和rating
export const datePersonFormSchema = datePersonSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  age: true,
  rating: true,
}).extend({
  age: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  rating: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
});

// 表單數據的類型
export type DatePersonForm = z.infer<typeof datePersonFormSchema>; 