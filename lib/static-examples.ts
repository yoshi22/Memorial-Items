import type { ContentExample } from '@/lib/supabase/types'

// 画像は public/examples/ に配置してください。
// ファイル名を image_url に設定するだけで表示されます（例: /examples/shiba.jpg）
// DBに作例が登録されている場合はDBが優先されます。

export const STATIC_EXAMPLES: ContentExample[] = [
  {
    id: 'static-1',
    title: 'ペットポートレート',
    short_description: null,
    image_url: '/examples/memorial_pet_portrait_.png',
    tags: [],
    sort_order: 1,
    is_published: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'static-2',
    title: '水彩スタイル',
    short_description: null,
    image_url: '/examples/memorial_pet_watercolor_.png',
    tags: [],
    sort_order: 2,
    is_published: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'static-3',
    title: '絵本スタイル',
    short_description: null,
    image_url: '/examples/memorial_pet_storybook_.png',
    tags: [],
    sort_order: 3,
    is_published: true,
    created_at: '',
    updated_at: '',
  },
]
