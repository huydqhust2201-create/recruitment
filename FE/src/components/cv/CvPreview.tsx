'use client';

import type { CvTemplate, CvBuilderContent } from '@/types';

interface Props {
  content: CvBuilderContent;
  template: CvTemplate;
}

const COLORS: Record<CvTemplate, { header: string; accent: string; sidebar?: string }> = {
  MODERN:       { header: '#1a4ba5', accent: '#1a4ba5' },
  CLASSIC:      { header: '#2d2d2d', accent: '#333' },
  CREATIVE:     { header: '#a62477', accent: '#a62477' },
  PROFESSIONAL: { header: '#1e3a5f', accent: '#1e3a5f', sidebar: '#1e3a5f' },
  MINIMAL:      { header: '#ffffff', accent: '#111111' },
};

function SectionTitle({ label, accent }: { label: string; accent: string }) {
  return (
    <p style={{
      fontWeight: 700, color: accent, marginBottom: 5, fontSize: 10,
      textTransform: 'uppercase', letterSpacing: 1.2,
      borderBottom: `1.5px solid ${accent}`, paddingBottom: 2,
    }}>
      {label}
    </p>
  );
}

// ── Standard layouts (MODERN / CLASSIC / CREATIVE) ────────
function StandardLayout({ content, colors }: { content: CvBuilderContent; colors: { header: string; accent: string } }) {
  const p = content.personalInfo ?? {};
  const isMinimal = colors.header === '#ffffff';

  return (
    <div style={{ fontFamily: isMinimal ? 'Georgia, serif' : 'Arial, sans-serif', minHeight: 500 }}>
      {/* Header */}
      {isMinimal ? (
        <div style={{ padding: '24px 28px 12px', borderBottom: '2px solid #111', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: 1 }}>{p.fullName || 'Họ và tên'}</p>
          {p.headline && <p style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{p.headline}</p>}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 6, fontSize: 9, color: '#666' }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.address && <span>{p.address}</span>}
          </div>
        </div>
      ) : (
        <div style={{ background: colors.header, color: '#fff', padding: '20px 24px' }}>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{p.fullName || 'Họ và tên'}</p>
          {p.headline && <p style={{ opacity: 0.85, fontSize: 10 }}>{p.headline}</p>}
          <div style={{ display: 'flex', gap: 14, marginTop: 6, opacity: 0.85, fontSize: 9 }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.address && <span>{p.address}</span>}
          </div>
        </div>
      )}

      <div style={{ padding: '14px 24px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 10 }}>
        {p.summary && (
          <div>
            <SectionTitle label="Giới thiệu" accent={colors.accent} />
            <p style={{ color: '#555', lineHeight: 1.55 }}>{p.summary}</p>
          </div>
        )}

        {(content.experiences ?? []).length > 0 && (
          <div>
            <SectionTitle label="Kinh nghiệm làm việc" accent={colors.accent} />
            {content.experiences.map((e, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: 700, color: '#222' }}>{e.position}</p>
                  <p style={{ color: '#888', fontSize: 9 }}>{e.startDate}{e.current ? ' – Nay' : e.endDate ? ` – ${e.endDate}` : ''}</p>
                </div>
                <p style={{ color: colors.accent, fontSize: 9, marginBottom: 2 }}>{e.company}</p>
                {e.description && <p style={{ color: '#555', lineHeight: 1.45 }}>{e.description}</p>}
              </div>
            ))}
          </div>
        )}

        {(content.educations ?? []).length > 0 && (
          <div>
            <SectionTitle label="Học vấn" accent={colors.accent} />
            {content.educations.map((e, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: 700, color: '#222' }}>{e.school}</p>
                  <p style={{ color: '#888', fontSize: 9 }}>{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</p>
                </div>
                <p style={{ color: '#555' }}>{e.degree}{e.major ? ` — ${e.major}` : ''}</p>
              </div>
            ))}
          </div>
        )}

        {(content.skills ?? []).length > 0 && (
          <div>
            <SectionTitle label="Kỹ năng" accent={colors.accent} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {content.skills.map((s, i) => (
                <span key={i} style={{
                  background: isMinimal ? '#f5f5f5' : '#f0f4ff',
                  color: isMinimal ? '#333' : colors.accent,
                  border: isMinimal ? '1px solid #ddd' : 'none',
                  borderRadius: 3, padding: '2px 7px', fontSize: 9,
                }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {(content.projects ?? []).length > 0 && (
          <div>
            <SectionTitle label="Dự án" accent={colors.accent} />
            {content.projects.map((pr, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <p style={{ fontWeight: 700, color: '#222' }}>{pr.name}</p>
                {pr.techStack && <p style={{ color: '#888', fontSize: 9 }}>{pr.techStack}</p>}
                {pr.description && <p style={{ color: '#555', lineHeight: 1.4 }}>{pr.description}</p>}
              </div>
            ))}
          </div>
        )}

        {(content.certifications ?? []).length > 0 && (
          <div>
            <SectionTitle label="Chứng chỉ" accent={colors.accent} />
            {content.certifications.map((c, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <p style={{ fontWeight: 600, color: '#222' }}>{c.name}</p>
                {c.issuer && <p style={{ color: '#888', fontSize: 9 }}>{c.issuer}{c.date ? ` · ${c.date}` : ''}</p>}
              </div>
            ))}
          </div>
        )}

        {(content.languages ?? []).length > 0 && (
          <div>
            <SectionTitle label="Ngôn ngữ" accent={colors.accent} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {content.languages.map((l, i) => (
                <span key={i} style={{ color: '#555' }}>{l.name}{l.level ? ` (${l.level})` : ''}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Professional: dark sidebar + content ──────────────────
function ProfessionalLayout({ content, colors }: { content: CvBuilderContent; colors: { header: string; accent: string; sidebar: string } }) {
  const p = content.personalInfo ?? {};
  const sidebarBg = colors.sidebar;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', minHeight: 500, fontSize: 10 }}>
      {/* Sidebar */}
      <div style={{ width: '32%', background: sidebarBg, color: '#fff', padding: '20px 14px', flexShrink: 0 }}>
        {/* Avatar placeholder */}
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
          margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: '#fff',
        }}>
          {(p.fullName || 'N')[0]}
        </div>

        <p style={{ fontWeight: 700, fontSize: 13, color: '#fff', textAlign: 'center', marginBottom: 3 }}>{p.fullName || 'Họ và tên'}</p>
        {p.headline && <p style={{ fontSize: 9, opacity: 0.8, textAlign: 'center', marginBottom: 12 }}>{p.headline}</p>}

        {/* Contact */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10, marginBottom: 10 }}>
          <p style={{ fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 6 }}>Liên hệ</p>
          {p.email && <p style={{ fontSize: 9, opacity: 0.85, marginBottom: 3, wordBreak: 'break-all' }}>{p.email}</p>}
          {p.phone && <p style={{ fontSize: 9, opacity: 0.85, marginBottom: 3 }}>{p.phone}</p>}
          {p.address && <p style={{ fontSize: 9, opacity: 0.85 }}>{p.address}</p>}
        </div>

        {/* Skills in sidebar */}
        {(content.skills ?? []).length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10, marginBottom: 10 }}>
            <p style={{ fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 6 }}>Kỹ năng</p>
            {content.skills.map((s, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <p style={{ fontSize: 9, color: '#fff', opacity: 0.9 }}>{s}</p>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: 2 }}>
                  <div style={{ height: '100%', width: '75%', background: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages in sidebar */}
        {(content.languages ?? []).length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10 }}>
            <p style={{ fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 6 }}>Ngôn ngữ</p>
            {content.languages.map((l, i) => (
              <p key={i} style={{ fontSize: 9, opacity: 0.85, marginBottom: 2 }}>{l.name}{l.level ? ` — ${l.level}` : ''}</p>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {p.summary && (
          <div>
            <p style={{ fontWeight: 700, color: colors.accent, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1.5px solid ${colors.accent}`, paddingBottom: 2, marginBottom: 5 }}>Giới thiệu</p>
            <p style={{ color: '#555', lineHeight: 1.55 }}>{p.summary}</p>
          </div>
        )}

        {(content.experiences ?? []).length > 0 && (
          <div>
            <p style={{ fontWeight: 700, color: colors.accent, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1.5px solid ${colors.accent}`, paddingBottom: 2, marginBottom: 5 }}>Kinh nghiệm làm việc</p>
            {content.experiences.map((e, i) => (
              <div key={i} style={{ marginBottom: 8, paddingLeft: 8, borderLeft: `2px solid ${colors.accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: 700, color: '#222' }}>{e.position}</p>
                  <p style={{ color: '#888', fontSize: 9 }}>{e.startDate}{e.current ? ' – Nay' : e.endDate ? ` – ${e.endDate}` : ''}</p>
                </div>
                <p style={{ color: colors.accent, fontSize: 9 }}>{e.company}</p>
                {e.description && <p style={{ color: '#555', lineHeight: 1.4, marginTop: 2 }}>{e.description}</p>}
              </div>
            ))}
          </div>
        )}

        {(content.educations ?? []).length > 0 && (
          <div>
            <p style={{ fontWeight: 700, color: colors.accent, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1.5px solid ${colors.accent}`, paddingBottom: 2, marginBottom: 5 }}>Học vấn</p>
            {content.educations.map((e, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: 700, color: '#222' }}>{e.school}</p>
                  <p style={{ color: '#888', fontSize: 9 }}>{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</p>
                </div>
                <p style={{ color: '#555' }}>{e.degree}{e.major ? ` — ${e.major}` : ''}</p>
              </div>
            ))}
          </div>
        )}

        {(content.projects ?? []).length > 0 && (
          <div>
            <p style={{ fontWeight: 700, color: colors.accent, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1.5px solid ${colors.accent}`, paddingBottom: 2, marginBottom: 5 }}>Dự án</p>
            {content.projects.map((pr, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <p style={{ fontWeight: 700, color: '#222' }}>{pr.name}</p>
                {pr.techStack && <p style={{ color: '#888', fontSize: 9 }}>{pr.techStack}</p>}
                {pr.description && <p style={{ color: '#555', lineHeight: 1.4 }}>{pr.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────
export default function CvPreview({ content, template }: Props) {
  const colors = COLORS[template] ?? COLORS.MODERN;

  if (template === 'PROFESSIONAL') {
    return (
      <div className="bg-white overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
        <ProfessionalLayout content={content} colors={colors as { header: string; accent: string; sidebar: string }} />
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden">
      <StandardLayout content={content} colors={colors} />
    </div>
  );
}
