import { z } from 'zod'

export const faqSchema = z.object({
  question: z.string().min(1, '質問を入力してください'),
  answer: z.string().min(1, '回答を入力してください'),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.boolean().default(true),
})

export const exampleSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  short_description: z.string().optional(),
  tags: z.string().transform((v) => v.split(',').map((t) => t.trim()).filter(Boolean)),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.boolean().default(true),
})

export type FaqFormValues = z.infer<typeof faqSchema>
export type ExampleFormValues = z.infer<typeof exampleSchema>
