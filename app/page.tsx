import Link from 'next/link'
import Image from 'next/image'
import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'
import { createClient } from '@/lib/supabase/server'
import { STYLES } from '@/lib/variants'
import { trackServer } from '@/lib/analytics'
import { businessInfo } from '@/lib/public-business'
import type { ContentExample } from '@/lib/supabase/types'
import { STATIC_EXAMPLES } from '@/lib/static-examples'

export const dynamic = 'force-dynamic'

const STYLE_EN: Record<string, string> = {
  clean_illustration: 'Clean Illustration',
  soft_watercolor: 'Soft Watercolor',
  modern_portrait: 'Modern Portrait',
}

const STYLE_IMAGES: Record<string, string> = {
  clean_illustration: '/examples/memorial_pet_storybook_.png',
  soft_watercolor: '/examples/memorial_pet_watercolor_.png',
  modern_portrait: '/examples/memorial_pet_portrait_.png',
}

export default async function LandingPage() {
  await trackServer('lp_viewed')

  const supabase = await createClient()
  const { data: dbExamples } = await supabase
    .from('content_examples')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
    .limit(3)

  const examples: ContentExample[] = dbExamples && dbExamples.length > 0 ? dbExamples : STATIC_EXAMPLES

  return (
    <>
      <Nav />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-bg py-14 px-4 text-center">
          <p className="text-[11px] tracking-[0.22em] uppercase text-accent-ink font-medium mb-4">
            — うちの子を、飾れるかたちに —
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-[1.1] text-ink mb-4">
            大切なペットを、<br />一生残るアートに。
          </h1>
          <p className="text-ink-soft text-base max-w-md mx-auto mb-7">
            写真を送っていただくだけ。制作スタッフが手作業で整えた proof をご確認いただいた後、完成画像をデジタル納品します。
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 bg-ink text-bg rounded-full px-8 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            注文する
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </Link>

          {/* Layered hero image — room backdrop with framed art */}
          <div className="relative mt-10 rounded-2xl overflow-hidden aspect-[4/3] max-w-2xl mx-auto shadow-[0_4px_10px_rgba(42,37,32,0.06),0_14px_28px_rgba(42,37,32,0.05)] bg-bg-alt"
               style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 12px, rgba(42,37,32,0.025) 12px 13px)' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                style={{ width: '45%', aspectRatio: '3/4', border: '10px solid #EFE6D8' }}
              >
                {examples[0] ? (
                  <Image
                    src={examples[0].image_url}
                    alt={examples[0].title}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                ) : (
                  <div className="absolute inset-2 bg-bg-alt" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-14 px-4 bg-bg-alt">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.22em] uppercase text-accent-ink font-medium text-center mb-2">HOW IT WORKS</p>
            <h2 className="font-serif text-2xl text-center text-ink mb-8">ご注文の流れ</h2>
            <div className="flex flex-col gap-3">
              {[
                { n: '01', title: 'お写真を送る', desc: 'お気に入りの写真を3〜5枚ご用意ください。顔がはっきり見えるものがおすすめです。' },
                { n: '02', title: '初稿をご確認', desc: '制作した初稿をご確認いただけます。気になる点があれば修正依頼をお送りください。' },
                { n: '03', title: '完成画像を受け取る', desc: 'ご承認後、完成画像をダウンロード形式で納品します。物理額装は現在個別案内または準備中です。' },
              ].map((item) => (
                <div key={item.n} className="grid gap-4 p-4 bg-surface rounded-2xl border border-line" style={{ gridTemplateColumns: '52px 1fr' }}>
                  <div
                    className="font-serif text-3xl text-accent-ink leading-none flex items-center justify-center"
                    style={{ borderRight: '1px solid var(--color-line)', paddingRight: '10px' }}
                  >
                    {item.n}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-ink mb-1">{item.title}</h3>
                    <p className="text-xs text-ink-soft leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Styles */}
        <section className="py-14 px-4 bg-bg">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.22em] uppercase text-accent-ink font-medium mb-2">3 STYLES</p>
            <h2 className="font-serif text-2xl text-ink mb-2">仕上げのスタイル</h2>
            <p className="text-sm text-ink-soft mb-7">お部屋の雰囲気と、うちの子らしさに合う一枚を。</p>
            <div className="flex flex-col gap-3">
              {STYLES.map((s) => (
                <div
                  key={s.id}
                  className="grid gap-4 p-3 bg-surface rounded-2xl border border-line"
                  style={{ gridTemplateColumns: '96px 1fr' }}
                >
                  <div className="relative rounded-xl bg-bg-alt aspect-square overflow-hidden">
                    {STYLE_IMAGES[s.id] != null && (
                      <Image
                        src={STYLE_IMAGES[s.id]!}
                        alt={s.label}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center py-1">
                    <p className="text-[10px] tracking-widest text-ink-mute font-mono mb-1">{STYLE_EN[s.id] ?? s.id}</p>
                    <h3 className="text-sm font-semibold text-ink mb-1">{s.label}</h3>
                    <p className="text-xs text-ink-soft leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="py-14 px-4 bg-bg-alt">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.22em] uppercase text-accent-ink font-medium text-center mb-2">OUR PROMISE</p>
            <h2 className="font-serif text-2xl text-center text-ink mb-7">安心して任せていただくために</h2>
            <div className="flex flex-col gap-3">
              {[
                {
                  title: '人の手で整える',
                  desc: '最終調整はすべて、制作スタッフが手作業で。「うちの子らしさ」を見落とさないために。',
                  icon: <path d="M17 3l4 4L8 20H4v-4L17 3z"/>,
                },
                {
                  title: '初稿を見てから',
                  desc: '気に入らなければ完成扱いにしません。初稿をご確認いただき、必要に応じて修正依頼をお送りいただけます。',
                  icon: <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></>,
                },
                {
                  title: '思い出の保管',
                  desc: '仕上げたデータは、再注文や再案内に備えて管理します。',
                  icon: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>,
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-surface rounded-2xl border border-line">
                  <div className="w-9 h-9 rounded-lg bg-accent-soft text-accent-ink flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {item.icon}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink mb-1">{item.title}</h3>
                    <p className="text-xs text-ink-soft leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Examples */}
        {examples && examples.length > 0 && (
          <section className="py-14 px-4 bg-bg">
            <div className="max-w-4xl mx-auto">
              <p className="text-[11px] tracking-[0.22em] uppercase text-accent-ink font-medium mb-2">GALLERY</p>
              <h2 className="font-serif text-2xl text-ink mb-8">作例</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {examples.map((ex: ContentExample) => (
                  <div key={ex.id} className="rounded-xl border border-line bg-surface overflow-hidden">
                    <div className="aspect-square relative bg-bg-alt">
                      <Image
                        src={ex.image_url}
                        alt={ex.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-serif text-base text-ink">{ex.title}</p>
                      {ex.short_description && (
                        <p className="text-xs text-ink-mute mt-1">{ex.short_description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7 text-center">
                <Link href="/examples" className="text-sm text-ink-soft hover:text-ink underline transition-colors">
                  すべての作例を見る →
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="py-14 px-4 bg-bg-alt">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.22em] uppercase text-accent-ink font-medium text-center mb-2">SERVICE INFO</p>
            <h2 className="font-serif text-2xl text-center text-ink mb-7">ご注文前にご確認ください</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface p-4">
                <h3 className="text-sm font-semibold text-ink mb-2">提供内容</h3>
                <p className="text-xs text-ink-soft leading-relaxed">{businessInfo.productSummary}</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <h3 className="text-sm font-semibold text-ink mb-2">納品目安</h3>
                <p className="text-xs text-ink-soft leading-relaxed">{businessInfo.deliveryLeadTime}</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <h3 className="text-sm font-semibold text-ink mb-2">支払い方法</h3>
                <p className="text-xs text-ink-soft leading-relaxed">{businessInfo.paymentMethods.join(' / ')}</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <h3 className="text-sm font-semibold text-ink mb-2">返金・キャンセル</h3>
                <p className="text-xs text-ink-soft leading-relaxed">{businessInfo.refundSummary}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-ink text-center">
          <p className="text-[11px] tracking-[0.22em] uppercase font-medium mb-4" style={{ color: 'rgba(233,223,207,0.7)' }}>
            MEMORIAL ITEMS
          </p>
          <h2 className="font-serif text-3xl mb-3" style={{ color: '#fff' }}>
            あなたのペットをアートに
          </h2>
          <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: '#BEB3A3' }}>
            proof 確認と修正依頼を経て、納得いただいた後に完成画像をお渡しします。
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 bg-accent text-white rounded-full px-8 py-3 text-sm font-medium shadow-[0_8px_20px_rgba(184,153,104,0.35)] hover:brightness-105 transition"
          >
            注文する
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </Link>
        </section>

      </main>
      <Footer />
    </>
  )
}
