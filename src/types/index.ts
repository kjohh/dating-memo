import { z } from 'zod';

// 预设的标签
export const PRESET_POSITIVE_TAGS = [
  '幽默', '聪明', '善良', '体贴', '有趣', '有责任心', '浪漫', '有上进心',
  '有爱心', '会做饭', '会聆听', '有耐心', '有主见', '有才艺', '会照顾人'
];

export const PRESET_NEGATIVE_TAGS = [
  '粗心', '脾气差', '不守时', '爱抱怨', '小气', '自私', '不体贴', '懒惰',
  '爱玩手机', '不会沟通', '缺乏责任感', '拖延症', '爱占小便宜', '不尊重人'
];

export const PRESET_PERSONALITY_TAGS = [
  '内向', '外向', '理性', '感性', '乐观', '悲观', '冒险', '保守',
  '完美主义', '随性', '独立', '依赖', '务实', '理想主义', '领导型', '跟随型'
];

// 约会对象的模式定义
export const datePersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '名字不能为空'),
  age: z.number().min(18, '年龄必须大于或等于18岁').optional(),
  gender: z.enum(['男', '女', '其他']).optional(),
  occupation: z.string().optional(),
  contactInfo: z.string().optional(),
  meetDate: z.date().optional(),
  meetLocation: z.string().optional(),
  notes: z.string().optional(),
  positiveTags: z.array(z.string()),
  negativeTags: z.array(z.string()),
  personalityTags: z.array(z.string()),
  customTags: z.array(z.string()),
  rating: z.number().min(1).max(5).optional(),
  imageUrl: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 约会对象的类型
export type DatePerson = z.infer<typeof datePersonSchema>;

// 表单数据的模式定义
export const datePersonFormSchema = datePersonSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  age: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  meetDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  rating: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
});

// 表单数据的类型
export type DatePersonForm = z.infer<typeof datePersonFormSchema>; 