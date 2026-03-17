import React, { useRef, useState, useEffect } from 'react';
import RunnerGame from './RunnerGame';
import { supabase } from './lib/supabase';

const linkStyle = {
  color: '#4cd9ff',
  textDecoration: 'underline',
  cursor: 'pointer',
  transition: 'color 0.3s ease',
};

function useScrollFadeIn() {
  const domRef = useRef();
  const [isVisible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);
  return [domRef, isVisible];
}

function FadeInSection({ id, title, children }) {
  const [ref, visible] = useScrollFadeIn();
  return (
    <section id={id} ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      marginBottom: 60,
    }}>
      <h2 style={{
        borderBottom: '2px solid #4cd9ff', paddingBottom: 6, marginBottom: 20,
        fontSize: '1.8rem', fontWeight: '700', color: '#49c4ff',
        textShadow: '0 0 6px rgba(76, 217, 255, 0.7)',
      }}>{title}</h2>
      {children}
    </section>
  );
}

function useIsMobile(breakpoint = 800) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}

// Mobile Sidebar Nav
function MobileSidebarNav() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'Summary',      icon: '👤', id: 'summary' },
    { label: 'Experience',   icon: '💼', id: 'work-experience' },
    { label: 'Education',    icon: '🎓', id: 'education' },
    { label: 'Skills',       icon: '🛠', id: 'skills' },
    { label: 'Projects',     icon: '🚀', id: 'projects' },
    { label: 'Certificates', icon: '🏆', id: 'certificates' },
    { label: 'Admin',        icon: '⚙️', id: 'admin', href: '/admin' },
  ];

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  }

  return (
    <>
      {/* Fixed top header bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 56,
        backgroundColor: '#1c2333',
        borderBottom: '1px solid rgba(76,217,255,0.15)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/my-image.jpg" alt="Jai" style={{
            width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
            border: '2px solid #4cd9ff', flexShrink: 0,
          }} />
          <div>
            <div style={{ color: '#e6edf3', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>
              Jai Sharma
            </div>
            <div style={{ color: '#4cd9ff', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
              DEVOPS · CLOUDOPS · SRE
            </div>
          </div>
        </div>

        {/* Hamburger — opens dropdown from top */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: 8, borderRadius: 6,
          }}
          aria-label="Toggle navigation"
        >
          <span style={{
            display: 'block', width: 22, height: 2.5,
            backgroundColor: '#e6a817', borderRadius: 2,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: open ? 'translateY(7.5px) rotate(45deg)' : 'none',
          }} />
          <span style={{
            display: 'block', width: 22, height: 2.5,
            backgroundColor: '#e6a817', borderRadius: 2,
            transition: 'opacity 0.3s ease',
            opacity: open ? 0 : 1,
          }} />
          <span style={{
            display: 'block', width: 22, height: 2.5,
            backgroundColor: '#e6a817', borderRadius: 2,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: open ? 'translateY(-7.5px) rotate(-45deg)' : 'none',
          }} />
        </button>
      </div>

      {/* Spacer */}
      <div style={{ height: 56 }} />

      {/* Dropdown nav — slides from top, frosted glass, page scrollable behind */}
      <div style={{
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        zIndex: 999,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(13, 17, 23, 0.75)',
        borderBottom: open ? '1px solid rgba(76,217,255,0.2)' : 'none',
        maxHeight: open ? '420px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease',
      }}>
        {navItems.map((item, i) => (
          <button
            key={item.id}
            onClick={() => item.href ? (window.location.href = item.href) : scrollTo(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '15px 20px',
              background: 'none',
              border: 'none',
              borderBottom: i < navItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              cursor: 'pointer',
              color: item.id === 'admin' ? '#4cd9ff' : '#e6edf3',
              fontSize: 15,
              fontWeight: item.id === 'admin' ? 700 : 500,
              textAlign: 'left',
              fontFamily: "'Segoe UI', sans-serif",
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(76,217,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'admin' && (
              <span style={{
                marginLeft: 'auto', fontSize: 11,
                backgroundColor: 'rgba(76,217,255,0.15)',
                color: '#4cd9ff', borderRadius: 4,
                padding: '2px 8px', fontWeight: 700,
                letterSpacing: '0.04em',
              }}>CMS</span>
            )}
          </button>
        ))}
        <div style={{ padding: '10px 20px 14px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          run.danklofan.com
        </div>
      </div>
    </>
  );
}


function ProjectLinks({ liveUrl, githubUrl }) {
  const liveBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    borderRadius: 999, background: 'linear-gradient(135deg, rgba(76,217,255,0.25), rgba(0,123,255,0.45))',
    color: '#0b1726', fontWeight: 600, fontSize: 14, textDecoration: 'none',
    boxShadow: '0 0 10px rgba(76,217,255,0.6)', transition: 'transform 0.15s ease, box-shadow 0.2s ease',
  };
  const ghBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    borderRadius: 999, backgroundColor: '#121b2c', border: '1px solid rgba(76,217,255,0.7)',
    color: '#4cd9ff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
    boxShadow: '0 0 8px rgba(76,217,255,0.5)', transition: 'background-color 0.2s ease, transform 0.15s ease',
  };
  const githubIcon = (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style={{ display: 'block' }}>
      <path d="M8 0.25a7.75 7.75 0 0 0-2.45 15.1c.39.07.53-.17.53-.37v-1.3c-2.17.47-2.63-1.04-2.63-1.04-.35-.9-.86-1.14-.86-1.14-.7-.48.05-.47.05-.47.77.05 1.18.8 1.18.8.69 1.18 1.82.84 2.26.64.07-.5.27-.84.5-1.03-1.73-.2-3.55-.87-3.55-3.9 0-.86.31-1.57.82-2.13-.08-.2-.36-1.02.08-2.12 0 0 .68-.22 2.23.81a7.58 7.58 0 0 1 4.06 0c1.55-1.03 2.23-.81 2.23-.81.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.13 0 3.04-1.82 3.7-3.56 3.9.28.24.53.73.53 1.48v2.19c0 .21.14.45.54.37A7.75 7.75 0 0 0 8 .25z" />
    </svg>
  );
  return (
    <p style={{ display: 'flex', gap: 12, margin: '8px 0 14px 0', flexWrap: 'wrap' }}>
      {liveUrl && (
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" style={liveBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 18px rgba(76,217,255,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(76,217,255,0.6)'; }}
        >
          <span style={{ fontSize: 16 }}>▶</span><span>Live Demo</span>
        </a>
      )}
      {githubUrl && (
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={ghBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#4cd9ff'; e.currentTarget.style.color = '#06101f'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#121b2c'; e.currentTarget.style.color = '#4cd9ff'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {githubIcon}<span>GitHub</span>
        </a>
      )}
    </p>
  );
}

function Skeleton() {
  return (
    <div style={{ backgroundColor: '#1f2e44', borderRadius: 14, padding: 24, marginBottom: 24, opacity: 0.5 }}>
      <div style={{ backgroundColor: '#2a3f5f', borderRadius: 6, height: 20, width: '40%', marginBottom: 12 }} />
      <div style={{ backgroundColor: '#2a3f5f', borderRadius: 6, height: 14, width: '70%', marginBottom: 8 }} />
      <div style={{ backgroundColor: '#2a3f5f', borderRadius: 6, height: 14, width: '55%' }} />
    </div>
  );
}

function WorkExperience() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('work_experience').select('*').order('sort_order')
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);
  if (loading) return <><Skeleton /><Skeleton /></>;
  return (
    <>
      {items.map(item => (
        <div key={item.id} style={{
          backgroundColor: '#1f2e44', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,123,255,0.4)',
          padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', gap: 24, transition: 'background 0.3s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}
        >
          {item.logo_url && (
            <img src={item.logo_url} alt={`${item.company} Logo`} style={{
              width: 64, height: 64, objectFit: 'contain', borderRadius: 10,
              boxShadow: '0 0 16px rgba(76,217,255,0.7)', flexShrink: 0, transition: 'transform 0.3s ease', cursor: 'pointer',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          )}
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ margin: 0, color: '#61dfff', fontWeight: 800, fontSize: '1.5rem', marginBottom: 10, textShadow: '0 0 6px rgba(76,217,255,0.7)' }}>
              {item.company}
            </h3>
            <p style={{ margin: 0, color: '#b0cef9', fontSize: 16, lineHeight: 1.55 }}>
              {item.role}<br />{item.location}
            </p>
            <ul style={{ marginTop: 18, paddingLeft: 22, color: '#9abff2', fontSize: 15, lineHeight: 1.8 }}>
              {(item.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </div>
      ))}
    </>
  );
}

function Projects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('projects').select('*').order('sort_order')
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);
  if (loading) return <><Skeleton /><Skeleton /></>;
  return (
    <div style={{
      backgroundColor: '#1f2e44', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,123,255,0.4)',
      padding: 24, marginBottom: 32, transition: 'background 0.3s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}
    >
      {items.map((item, idx) => (
        <div key={item.id} style={{
          marginBottom: idx < items.length - 1 ? 28 : 0,
          paddingBottom: idx < items.length - 1 ? 28 : 0,
          borderBottom: idx < items.length - 1 ? '1px solid rgba(76,217,255,0.12)' : 'none',
        }}>
          <h3 style={{ color: '#61dfff', fontWeight: 700, fontSize: '1.4rem', marginBottom: 4, textShadow: '0 0 10px rgba(76,217,255,0.7)' }}>
            {item.title}
          </h3>
          {item.tech_stack && <p style={{ color: '#9abff2', fontSize: 13, margin: '0 0 8px 0' }}>{item.tech_stack}</p>}
          <ProjectLinks liveUrl={item.live_url} githubUrl={item.github_url} />
          <ul style={{ paddingLeft: 22, color: '#9abff2', lineHeight: 1.8 }}>
            {(item.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('skills').select('*').order('sort_order')
      .then(({ data }) => { setSkills(data || []); setLoading(false); });
  }, []);
  if (loading) return <div style={{ color: '#4cd9ff', opacity: 0.5 }}>Loading skills…</div>;
  return (
    <div>
      {skills.map(skill => (
        <span key={skill.id} style={{
          display: 'inline-block', backgroundColor: '#223344', color: '#4cd9ff',
          padding: '8px 14px', margin: '6px 8px 6px 0', borderRadius: 20,
          fontWeight: 600, cursor: 'default', userSelect: 'none',
          boxShadow: '0 0 6px rgba(76,217,255,0.3)',
          transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#4cd9ff'; e.currentTarget.style.color = '#121212'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(76,217,255,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#223344'; e.currentTarget.style.color = '#4cd9ff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 6px rgba(76,217,255,0.3)'; }}
        >
          {skill.name}
        </span>
      ))}
    </div>
  );
}

function Certificates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('certificates').select('*').order('sort_order')
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);
  if (loading) return <Skeleton />;
  return (
    <div style={{
      backgroundColor: '#1f2e44', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,123,255,0.4)',
      padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 24,
    }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}
    >
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {item.logo_url && (
            <img src={item.logo_url} alt={item.title} style={{
              width: 48, height: 48, objectFit: 'contain', borderRadius: 8,
              backgroundColor: '#fff', boxShadow: '0 0 10px rgba(76,217,255,0.4)',
              padding: 4, cursor: 'pointer', transition: 'transform 0.3s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          )}
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, fontSize: 18 }}>
            {item.title}
          </a>
        </div>
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const isMobile = useIsMobile(800);

  return (
    <div style={{
      backgroundColor: '#121212', color: '#4cd9ff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      minHeight: '150vh', padding: 20,
    }}>
      {/* Mobile sidebar — only on mobile */}
      {isMobile && <MobileSidebarNav />}

      {/* Runner game — only on desktop */}
      {!isMobile && (
        <section style={{ maxWidth: 1200, margin: '0 auto 20px auto' }}>
          <RunnerGame />
        </section>
      )}

      <section style={{
        maxWidth: 900, margin: '20px auto 40px auto', display: 'flex',
        alignItems: 'center', gap: 20, padding: '0 10px', flexWrap: 'wrap',
      }}>
        <img src="/my-image.jpg" alt="Profile" style={{
          width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
          boxShadow: '0 0 12px #4cd9ff', flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 150 }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: '#4cd9ff', margin: 0 }}>
            Let's connect! Find me on{' '}
            <a href="https://www.linkedin.com/in/jaisharma2512/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <img src="/icons/linkedin.svg" alt="LinkedIn" style={{ width: 16, height: 16 }} /><span>LinkedIn</span>
              </span>
            </a>{' '},{' '}
            <a href="https://github.com/Jaisharma2512" target="_blank" rel="noopener noreferrer" style={linkStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <img src="/icons/github.svg" alt="GitHub" style={{ width: 16, height: 16 }} /><span>GitHub</span>
              </span>
            </a>{' '},{' '}
            <a href="https://www.fiverr.com/sellers/jaisharma2512/edit" target="_blank" rel="noopener noreferrer" style={linkStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <img src="/icons/fiverr.svg" alt="Fiverr" style={{ width: 16, height: 16 }} /><span>Fiverr</span>
              </span>
            </a>{' '}
            or reach out for collaborations, mentorship, or tech discussions. Always eager to meet fellow cloud and DevOps enthusiasts!
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 900, margin: '0 auto' }}>
        <FadeInSection id="summary" title="Summary">
          <div style={{
            background: 'linear-gradient(135deg, rgba(76,217,255,0.08), rgba(0,0,0,0.4))',
            borderRadius: 14, padding: 20, boxShadow: '0 0 18px rgba(0,0,0,0.6)',
            border: '1px solid rgba(76,217,255,0.35)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(circle at top left, rgba(76,217,255,0.35), transparent 55%)',
              opacity: 0.8,
            }} />
            <p style={{ position: 'relative', margin: 0, fontSize: 16, lineHeight: 1.7, color: '#e4f4ff' }}>
              <span style={{ fontWeight: 700, color: '#61dfff' }}>Experienced DevOps / CloudOps Engineer</span>{' '}
              with a track record of delivering <span style={{ fontWeight: 600 }}>efficient infrastructure automation</span> and{' '}
              <span style={{ fontWeight: 600 }}>scalable CI/CD solutions</span>. Skilled in cloud technologies and committed to driving innovation in{' '}
              <span style={{ fontWeight: 600 }}>secure and reliable system design</span>.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection id="work-experience" title="Professional Experience">
          <WorkExperience />
        </FadeInSection>

        <FadeInSection id="education" title="Education">
          <div style={{
            backgroundColor: '#1f2e44', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,123,255,0.4)',
            padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', gap: 24, transition: 'background 0.3s ease',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}
          >
            <img src="/graphic-era-logo.jpg" alt="Graphic Era Logo" style={{
              width: 64, height: 64, objectFit: 'contain', borderRadius: 10,
              boxShadow: '0 0 14px rgba(76,217,255,0.7)', flexShrink: 0, transition: 'transform 0.3s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div style={{ flex: 1, minWidth: 280, color: '#b0cef9' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, marginBottom: 6, color: '#61dfff', textShadow: '0 0 10px rgba(76,217,255,0.7)' }}>
                Graphic Era Deemed to be University
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>
                Bachelor of Technology in Computer Science Engineering<br />
                <span style={{ fontWeight: 600, color: '#e4f4ff' }}>Graduated July 2023</span>
              </p>
              <p style={{ color: '#9abff2', marginTop: 10 }}>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                  backgroundColor: 'rgba(76,217,255,0.12)', color: '#61dfff', fontSize: 13, fontWeight: 600,
                }}>
                  Recipient of IEEE Certificate of Appreciation
                </span>
              </p>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection id="skills" title="Technical Skills">
          <Skills />
        </FadeInSection>

        <FadeInSection id="projects" title="Projects">
          <Projects />
        </FadeInSection>

        <FadeInSection id="certificates" title="Certifications">
          <Certificates />
        </FadeInSection>
      </main>
    </div>
  );
}
