import React, { useRef, useState, useEffect } from 'react';
import RunnerGame from './RunnerGame';

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
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return [domRef, isVisible];
}

function FadeInSection({ id, title, content }) {
  const [ref, visible] = useScrollFadeIn();

  const sectionTitleStyle = {
    borderBottom: '2px solid #4cd9ff',
    paddingBottom: 6,
    marginBottom: 20,
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#49c4ff',
    textShadow: '0 0 6px rgba(76, 217, 255, 0.7)',
  };

  const paragraphStyle = {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6,
    fontSize: 16,
    marginBottom: 24,
  };

  return (
    <section
      id={id}
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        marginBottom: 60,
      }}
    >
      <h2 style={sectionTitleStyle}>{title}</h2>
      {typeof content === 'string' ? (
        <p style={paragraphStyle}>{content}</p>
      ) : (
        content
      )}
    </section>
  );
}

// detect mobile viewport
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

const sections = [
  {
    id: 'summary',
    title: 'Summary',
    content: (
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(76,217,255,0.08), rgba(0,0,0,0.4))',
          borderRadius: 14,
          padding: 20,
          boxShadow: '0 0 18px rgba(0,0,0,0.6)',
          border: '1px solid rgba(76,217,255,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at top left, rgba(76,217,255,0.35), transparent 55%)',
            opacity: 0.8,
          }}
        />
        <p
          style={{
            position: 'relative',
            margin: 0,
            fontSize: 16,
            lineHeight: 1.7,
            color: '#e4f4ff',
          }}
        >
          <span style={{ fontWeight: 700, color: '#61dfff' }}>
            Experienced DevOps Engineer
          </span>{' '}
          with a track record of delivering{' '}
          <span style={{ fontWeight: 600 }}>efficient infrastructure automation</span> and{' '}
          <span style={{ fontWeight: 600 }}>scalable CI/CD solutions</span>. Skilled in cloud
          technologies and committed to driving innovation in{' '}
          <span style={{ fontWeight: 600 }}>secure and reliable system design</span>.
        </p>
      </div>
    ),
  },
  {
    id: 'work-experience',
    title: 'Professional Experience',
    content: (
      <div
        style={{
          backgroundColor: '#1f2e44',
          borderRadius: 14,
          boxShadow: '0 8px 20px rgba(0,123,255,0.4)',
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 24,
          transition: 'background 0.3s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}
      >
        <img
          src="/zscaler-logo.png"
          alt="Zscaler Logo"
          style={{
            width: 64,
            height: 64,
            objectFit: 'contain',
            borderRadius: 10,
            boxShadow: '0 0 16px rgba(76, 217, 255, 0.7)',
            flexShrink: 0,
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div style={{ flex: 1, minWidth: 280 }}>
          <h3
            style={{
              margin: 0,
              color: '#61dfff',
              fontWeight: 800,
              fontSize: '1.5rem',
              marginBottom: 10,
              textShadow: '0 0 6px rgba(76, 217, 255, 0.7)',
            }}
          >
            Zscaler
          </h3>
          <p style={{ margin: 0, color: '#b0cef9', fontSize: 16, lineHeight: 1.55 }}>
            DevOps Engineer
            <br />
            Chandigarh, India
          </p>
          <ul
            style={{
              marginTop: 18,
              paddingLeft: 22,
              color: '#9abff2',
              fontSize: 15,
              lineHeight: 1.8,
            }}
          >
            <li>
              <span style={{ fontWeight: 600, color: '#e6f5ff' }}>Led deployment</span> of Google
              Cloud Platform lab environments using{' '}
              <span style={{ fontWeight: 600 }}>Kubernetes and Terraform</span> focused on{' '}
              <span style={{ fontStyle: 'italic' }}>Source IP Anchoring</span> and{' '}
              <span style={{ fontStyle: 'italic' }}>Browser Isolation</span> in{' '}
              <span style={{ fontWeight: 600 }}>Zero Trust Security</span> contexts.
            </li>
            <li>
              Enhanced deployment reliability by integrating validation scripts, successfully
              reducing manual errors.
            </li>
            <li>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0 6px',
                  marginRight: 4,
                  borderRadius: 10,
                  backgroundColor: 'rgba(76,217,255,0.15)',
                  color: '#61dfff',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                +97% accuracy
              </span>
              Automated provisioning workflows with Terraform and CI/CD pipelines, elevating
              deployment accuracy by 97%.
            </li>
            <li>Contributed to disaster recovery solutions using containerized architectures.</li>
            <li>Provided key support in troubleshooting and training for cloud security operations.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'education',
    title: 'Education',
    content: (
      <div
        style={{
          backgroundColor: '#1f2e44',
          borderRadius: 14,
          boxShadow: '0 8px 20px rgba(0,123,255,0.4)',
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 24,
          transition: 'background 0.3s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}
      >
        <img
          src="/graphic-era-logo.jpg"
          alt="Graphic Era Logo"
          style={{
            width: 64,
            height: 64,
            objectFit: 'contain',
            borderRadius: 10,
            boxShadow: '0 0 14px rgba(76, 217, 255, 0.7)',
            flexShrink: 0,
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div style={{ flex: 1, minWidth: 280, color: '#b0cef9' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1.4rem',
              fontWeight: 700,
              marginBottom: 6,
              color: '#61dfff',
              textShadow: '0 0 10px rgba(76, 217, 255, 0.7)',
            }}
          >
            Graphic Era Deemed to be University
          </h3>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            Bachelor of Technology in Computer Science Engineering
            <br />
            <span style={{ fontWeight: 600, color: '#e4f4ff' }}>Graduated July 2023</span>
          </p>
          <p style={{ color: '#9abff2', marginTop: 10 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 999,
                backgroundColor: 'rgba(76,217,255,0.12)',
                color: '#61dfff',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Recipient of IEEE Certificate of Appreciation
            </span>
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'skills',
    title: 'Technical Skills',
    content: (
      <div>
        {[
          'Google Cloud Platform',
          'Amazon Web Services',
          'Terraform',
          'Jenkins',
          'GitHub Actions',
          'Kubernetes',
          'Docker',
          'Ansible',
          'Argo CD',
          'Git',
          'GitHub',
          'Bash',
          'Python',
          'PowerShell',
          'Prometheus',
          'NGINX',
          'Linux',
          'Windows Server',
          'MySQL',
          'CI/CD',
          'Helm',
          'Cloud Networking',
          'Zero Trust Security',
          'GitOps',
          'Elasticsearch',
          'Kibana',
          'Fluent Bit',
        ].map(skill => (
          <span
            key={skill}
            style={{
              display: 'inline-block',
              backgroundColor: '#223344',
              color: '#4cd9ff',
              padding: '8px 14px',
              margin: '6px 8px 6px 0',
              borderRadius: 20,
              fontWeight: '600',
              cursor: 'default',
              userSelect: 'none',
              boxShadow: '0 0 6px rgba(76, 217, 255, 0.3)',
              transition:
                'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#4cd9ff';
              e.currentTarget.style.color = '#121212';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(76, 217, 255, 0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#223344';
              e.currentTarget.style.color = '#4cd9ff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 6px rgba(76, 217, 255, 0.3)';
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: 'projects',
    title: 'Projects',
    content: (
      <div
        style={{
          backgroundColor: '#1f2e44',
          borderRadius: 14,
          boxShadow: '0 8px 20px rgba(0,123,255,0.4)',
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          transition: 'background 0.3s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}
      >
        {/* Security Playground */}
        <div>
          <h3
            style={{
              color: '#61dfff',
              fontWeight: 700,
              fontSize: '1.4rem',
              marginBottom: 10,
              textShadow: '0 0 10px rgba(76, 217, 255, 0.7)',
            }}
          >
            Security Playground
          </h3>

          <p style={{ display: 'flex', gap: 12, margin: '8px 0 14px 0', flexWrap: 'wrap' }}>
            <a
              href="https://sc.danklofan.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                background:
                  'linear-gradient(135deg, rgba(76,217,255,0.25), rgba(0,123,255,0.45))',
                color: '#0b1726',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 0 10px rgba(76,217,255,0.6)',
                transform: 'translateY(0)',
                transition:
                  'background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 18px rgba(76,217,255,0.8)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 0 10px rgba(76,217,255,0.6)';
              }}
            >
              <span style={{ fontSize: 16 }}>▶</span>
              <span>Live Demo</span>
            </a>

            <a
              href="https://github.com/Jaisharma2512/security-playground"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                backgroundColor: '#121b2c',
                border: '1px solid rgba(76,217,255,0.7)',
                color: '#4cd9ff',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 0 8px rgba(76,217,255,0.5)',
                transform: 'translateY(0)',
                transition:
                  'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#4cd9ff';
                e.currentTarget.style.color = '#06101f';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 16px rgba(76,217,255,0.9)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#121b2c';
                e.currentTarget.style.color = '#4cd9ff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 0 8px rgba(76,217,255,0.5)';
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                style={{ display: 'block' }}
              >
                <path d="M8 0.25a7.75 7.75 0 0 0-2.45 15.1c.39.07.53-.17.53-.37v-1.3c-2.17.47-2.63-1.04-2.63-1.04-.35-.9-.86-1.14-.86-1.14-.7-.48.05-.47.05-.47.77.05 1.18.8 1.18.8.69 1.18 1.82.84 2.26.64.07-.5.27-.84.5-1.03-1.73-.2-3.55-.87-3.55-3.9 0-.86.31-1.57.82-2.13-.08-.2-.36-1.02.08-2.12 0 0 .68-.22 2.23.81a7.58 7.58 0 0 1 4.06 0c1.55-1.03 2.23-.81 2.23-.81.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.13 0 3.04-1.82 3.7-3.56 3.9.28.24.53.73.53 1.48v2.19c0 .21.14.45.54.37A7.75 7.75 0 0 0 8 .25z" />
              </svg>
              <span>GitHub</span>
            </a>
          </p>

          <ul style={{ paddingLeft: 22, color: '#9abff2', lineHeight: 1.8 }}>
            <li>
              Developed a containerized web server simulating security vulnerabilities to
              facilitate hands-on learning in Dockerized environments.
            </li>
            <li>
              Orchestrated deployment on GKE with Jenkins pipelines and configured NGINX
              reverse proxies for realistic sandbox testing of security issues.
            </li>
          </ul>
        </div>

        {/* Small Boy */}
        <div>
          <h3
            style={{
              color: '#61dfff',
              fontWeight: 700,
              fontSize: '1.4rem',
              marginBottom: 10,
              textShadow: '0 0 10px rgba(76, 217, 255, 0.7)',
            }}
          >
            Small Boy
          </h3>

          <p style={{ display: 'flex', gap: 12, margin: '8px 0 14px 0', flexWrap: 'wrap' }}>
            <a
              href="https://smallboy.danklofan.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                background:
                  'linear-gradient(135deg, rgba(76,217,255,0.25), rgba(0,123,255,0.45))',
                color: '#0b1726',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 0 10px rgba(76,217,255,0.6)',
                transform: 'translateY(0)',
                transition:
                  'background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 18px rgba(76,217,255,0.8)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 0 10px rgba(76,217,255,0.6)';
              }}
            >
              <span style={{ fontSize: 16 }}>▶</span>
              <span>Live Demo</span>
            </a>

            <a
              href="https://github.com/Jaisharma2512/Smallboy/tree/k8s-resources"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                backgroundColor: '#121b2c',
                border: '1px solid rgba(76,217,255,0.7)',
                color: '#4cd9ff',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 0 8px rgba(76,217,255,0.5)',
                transform: 'translateY(0)',
                transition:
                  'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#4cd9ff';
                e.currentTarget.style.color = '#06101f';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 16px rgba(76,217,255,0.9)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#121b2c';
                e.currentTarget.style.color = '#4cd9ff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 0 8px rgba(76,217,255,0.5)';
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                style={{ display: 'block' }}
              >
                <path d="M8 0.25a7.75 7.75 0 0 0-2.45 15.1c.39.07.53-.17.53-.37v-1.3c-2.17.47-2.63-1.04-2.63-1.04-.35-.9-.86-1.14-.86-1.14-.7-.48.05-.47.05-.47.77.05 1.18.8 1.18.8.69 1.18 1.82.84 2.26.64.07-.5.27-.84.5-1.03-1.73-.2-3.55-.87-3.55-3.9 0-.86.31-1.57.82-2.13-.08-.2-.36-1.02.08-2.12 0 0 .68-.22 2.23.81a7.58 7.58 0 0 1 4.06 0c1.55-1.03 2.23-.81 2.23-.81.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.13 0 3.04-1.82 3.7-3.56 3.9.28.24.53.73.53 1.48v2.19c0 .21.14.45.54.37A7.75 7.75 0 0 0 8 .25z" />
              </svg>
              <span>GitHub</span>
            </a>
          </p>

          <ul style={{ paddingLeft: 22, color: '#9abff2', lineHeight: 1.8 }}>
            <li>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0 6px',
                  marginRight: 4,
                  borderRadius: 10,
                  backgroundColor: 'rgba(76,217,255,0.15)',
                  color: '#61dfff',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                +80% efficiency
              </span>
              Automated GKE provisioning using Terraform for a URL shortener application, boosting
              infrastructure deployment efficiency by 80%.
            </li>
            <li>
              Architected CI/CD pipelines leveraging Jenkins and GitHub Actions, using Helm charts
              and ArgoCD for seamless containerized deployments with zero downtime.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'certificates',
    title: 'Certifications',
    content: (
      <div
        style={{
          backgroundColor: '#1f2e44',
          borderRadius: 14,
          boxShadow: '0 8px 20px rgba(0,123,255,0.4)',
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="/googlecloud.png"
            alt="Google Cloud Logo"
            style={{
              width: 48,
              height: 48,
              objectFit: 'contain',
              borderRadius: 8,
              backgroundColor: '#fff',
              boxShadow: '0 0 10px rgba(76, 217, 255, 0.4)',
              padding: 4,
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          <a
            href="https://www.credly.com/badges/cc43f249-f710-4c80-b8f1-2aee8011d07f/public_url"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, fontSize: 18 }}
          >
            Google Associate Cloud Engineer
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="/ieee-logo.png"
            alt="IEEE Logo"
            style={{
              width: 48,
              height: 48,
              objectFit: 'contain',
              borderRadius: 8,
              backgroundColor: '#fff',
              boxShadow: '0 0 10px rgba(76, 217, 255, 0.4)',
              padding: 4,
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          <a
            href="https://drive.google.com/file/d/1C24ksyNmTdIhgfdjhaLbmhy0RD326OR-/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, fontSize: 18 }}
          >
            IEEE Certificate of Appreciation
          </a>
        </div>
      </div>
    ),
  },
];

export default function PortfolioPage() {
  const isMobile = useIsMobile(800);

  return (
    <div
      style={{
        backgroundColor: '#121212',
        color: '#4cd9ff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        minHeight: '150vh',
        padding: 20,
      }}
    >
      {!isMobile && (
        <section style={{ maxWidth: 1200, margin: '0 auto 20px auto' }}>
          <RunnerGame />
        </section>
      )}

      <section
        style={{
          maxWidth: 900,
          margin: '20px auto 40px auto',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '0 10px',
          flexWrap: 'wrap',
        }}
      >
        <img
          src="/my-image.jpg"
          alt="Profile"
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 0 12px #4cd9ff',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 150 }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: '#4cd9ff', margin: 0 }}>
            Let's connect! Find me on{' '}
            <a
              href="https://www.linkedin.com/in/jaisharma2512/"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <img
                  src="/icons/linkedin.svg"
                  alt="LinkedIn"
                  style={{ width: 16, height: 16 }}
                />
                <span>LinkedIn</span>
              </span>
            </a>{' '}
            ,{' '}
            <a
              href="https://github.com/Jaisharma2512/Smallboy"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <img
                  src="/icons/github.svg"
                  alt="GitHub"
                  style={{ width: 16, height: 16 }}
                />
                <span>GitHub</span>
              </span>
            </a>{' '}
            ,{' '}
            <a
              href="https://www.fiverr.com/sellers/jaisharma2512/edit"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <img
                  src="/icons/fiverr.svg"
                  alt="Fiverr"
                  style={{ width: 16, height: 16 }}
                />
                <span>Fiverr</span>
              </span>
            </a>{' '}
            or reach out for collaborations, mentorship, or tech discussions. Always eager to meet
            fellow cloud and DevOps enthusiasts!
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 900, margin: '0 auto' }}>
        {sections.map(({ id, title, content }) => (
          <FadeInSection key={id} id={id} title={title} content={content} />
        ))}
      </main>
    </div>
  );
}
