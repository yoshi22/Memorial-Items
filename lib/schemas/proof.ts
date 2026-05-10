import { z } from 'zod'

export const revisionRequestSchema = z.object({
  request_text: z
    .string()
    .min(1, '修正依頼の内容を入力してください')
    .max(2000, '2000文字以内で入力してください'),
})

export type RevisionRequestValues = z.infer<typeof revisionRequestSchema>
