import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'MHT-CET Previous Year Paper — Practice Online'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { paperId: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: paper } = await supabase
    .from('pyq_papers')
    .select('title, year, shift, total_questions, duration_minutes, subject_group')
    .eq('id', params.paperId)
    .single()

  const title = paper?.title || 'MHT-CET Previous Year Paper'
  const year = paper?.year || '2024'
  const shift = paper?.shift || 'Morning'
  const totalQ = paper?.total_questions || 150
  const duration = paper?.duration_minutes || 180

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: '60px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Top: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            C
          </div>
          <span style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 600 }}>
            CET Mentor Hub
          </span>
        </div>

        {/* Middle: Paper Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {year}
            </div>
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {shift} Shift
            </div>
          </div>
          <h1
            style={{
              color: 'white',
              fontSize: '52px',
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '22px',
              margin: 0,
            }}
          >
            Practice online with auto-grading and detailed solutions
          </p>
        </div>

        {/* Bottom: Stats */}
        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#6366f1', fontSize: '32px', fontWeight: 700 }}>
              {totalQ}
            </span>
            <span style={{ color: '#64748b', fontSize: '16px' }}>Questions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#6366f1', fontSize: '32px', fontWeight: 700 }}>
              {duration}
            </span>
            <span style={{ color: '#64748b', fontSize: '16px' }}>Minutes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#6366f1', fontSize: '32px', fontWeight: 700 }}>
              Free
            </span>
            <span style={{ color: '#64748b', fontSize: '16px' }}>No Payment</span>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <span style={{ color: '#475569', fontSize: '16px' }}>
              cetmentorhub.com
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
