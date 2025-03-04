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

// 約會對象的模式定義
export const datePersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '姓名不能為空'),
  age: z.number().min(18, '年齡必須大於或等於18歲').optional(),
  gender: z.enum(['男', '女', '其他']).optional(),
  occupation: z.string().optional(),
  contactInfo: z.string().optional(),
  notes: z.string().optional(),
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