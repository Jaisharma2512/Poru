import React, { useRef, useState, useEffect, useCallback } from 'react';
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
      {title && <h2 style={{
        borderBottom: '2px solid #4cd9ff', paddingBottom: 6, marginBottom: 20,
        fontSize: '1.8rem', fontWeight: '700', color: '#49c4ff',
        textShadow: '0 0 6px rgba(76, 217, 255, 0.7)',
      }}>{title}</h2>}
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

// ── 1. TERMINAL EASTER EGG ────────────────────────────────────────────────────
const TERMINAL_COMMANDS = {
  help: `Available commands:
  whoami       — about Jai Sharma
  skills       — list core skills
  experience   — work history
  projects     — list projects
  uptime       — system status
  clear        — clear terminal
  exit         — close terminal`,
  whoami: `jai_sharma — DevOps / CloudOps / SRE Engineer
  Location  : Himalayas, India
  Currently : Unilog Corp · CloudOps Engineer
  Prev      : Zscaler · DevOps Engineer
  Cert      : Google Associate Cloud Engineer`,
  skills: `SKILL                  LEVEL
  ─────────────────────────────────
  Kubernetes             ████████░░  Expert
  Terraform              ████████░░  Expert
  Docker                 █████████░  Expert
  GitHub Actions         ████████░░  Expert
  GCP / AWS              ███████░░░  Advanced
  Prometheus / Grafana   ██████░░░░  Advanced
  Elasticsearch          ██████░░░░  Advanced`,
  experience: `[2024 → now]  Unilog Corp       CloudOps Engineer
  [2023 → 2024] Zscaler           DevOps Engineer
  [2019 → 2023] Graphic Era Univ  B.Tech CSE`,
  projects: `PROJECT              STACK                      STATUS
  ──────────────────────────────────────────────────
  Manucollection.in    React·Docker·K8s·GHA       ● Live
  Security Playground  Docker·GKE·Jenkins·NGINX   ● Live
  Small Boy            Terraform·K8s·ArgoCD        ● Live`,
  uptime: () => {
    const start = new Date('2023-08-01');
    const days = Math.floor((new Date() - start) / 86400000);
    return `system      : run.danklofan.com
  uptime      : ${days} days since first deploy
  status      : ● all systems operational
  last deploy : mar-18-v4
  containers  : 2 running`;
  },
  clear: '__clear__',
  exit: '__exit__',
};

function TerminalEasterEgg({ onClose }) {
  const [lines, setLines] = useState([
    { type: 'system', text: 'jai@danklofan:~$ — Portfolio Terminal v1.0' },
    { type: 'system', text: 'Type "help" to see available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  function runCommand(cmd) {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === 'clear') { setLines([{ type: 'system', text: 'Terminal cleared.' }]); return; }
    if (trimmed === 'exit') { onClose(); return; }

    const newLines = [...lines, { type: 'input', text: `jai@danklofan:~$ ${cmd}` }];
    const handler = TERMINAL_COMMANDS[trimmed];
    if (handler) {
      const output = typeof handler === 'function' ? handler() : handler;
      output.split('\n').forEach(l => newLines.push({ type: 'output', text: l }));
    } else if (trimmed !== '') {
      newLines.push({ type: 'error', text: `bash: ${trimmed}: command not found. Try "help".` });
    }
    setLines(newLines);
    if (cmd.trim()) { setHistory(h => [cmd, ...h]); setHistIdx(-1); }
  }

  function handleKey(e) {
    if (e.key === 'Enter') { runCommand(input); setInput(''); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const i = Math.min(histIdx + 1, history.length - 1); setHistIdx(i); setInput(history[i] || ''); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const i = Math.max(histIdx - 1, -1); setHistIdx(i); setInput(i === -1 ? '' : history[i]); }
    else if (e.key === 'Escape') { onClose(); }
  }

  const colors = { system: '#4cd9ff', input: '#e6edf3', output: '#8b949e', error: '#f85149' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', maxWidth: 680, backgroundColor: '#0d1117',
        border: '1px solid rgba(76,217,255,0.3)', borderRadius: 12,
        boxShadow: '0 0 40px rgba(76,217,255,0.15)', overflow: 'hidden', fontFamily: 'monospace',
      }}>
        <div style={{
          backgroundColor: '#161b22', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid rgba(76,217,255,0.15)',
        }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f85149', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e6a817', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3fb950', display: 'inline-block' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#8b949e' }}>jai@danklofan — bash</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 16, padding: 0 }}>✕</button>
        </div>
        <div style={{ padding: 16, height: 340, overflowY: 'auto', fontSize: 13, lineHeight: 1.75 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ color: colors[l.type] || '#e6edf3', whiteSpace: 'pre' }}>{l.text}</div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          borderTop: '1px solid rgba(76,217,255,0.1)', backgroundColor: '#0d1117',
        }}>
          <span style={{ color: '#4cd9ff', fontSize: 13, whiteSpace: 'nowrap' }}>jai@danklofan:~$</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e6edf3', fontSize: 13, fontFamily: 'monospace', caretColor: '#4cd9ff' }}
            autoComplete="off" spellCheck={false} />
        </div>
      </div>
    </div>
  );
}

// ── 2. UPTIME / STATUS WIDGET ─────────────────────────────────────────────────
const SITES = [
  { name: 'Portfolio', url: 'https://run.danklofan.com', display: 'run.danklofan.com' },
  { name: 'Manu Collection', url: 'https://manucollection.in', display: 'manucollection.in' },
  { name: 'Security Playground', url: 'https://sc.danklofan.com', display: 'sc.danklofan.com' },
  { name: 'Small Boy', url: 'https://smallboy.danklofan.com', display: 'smallboy.danklofan.com' },
];

function UptimeWidget() {
  const [statuses, setStatuses] = useState(SITES.map(s => ({ ...s, status: 'checking', latency: null })));

  const check = useCallback(async () => {
    setStatuses(SITES.map(s => ({ ...s, status: 'checking', latency: null })));
    const results = await Promise.all(SITES.map(async site => {
      const t0 = performance.now();
      try {
        await fetch(site.url, { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
        return { ...site, status: 'up', latency: Math.round(performance.now() - t0) };
      } catch {
        return { ...site, status: 'down', latency: null };
      }
    }));
    setStatuses(results);
  }, []);

  useEffect(() => { check(); }, [check]);

  const sc = s => s === 'up' ? '#3fb950' : s === 'down' ? '#f85149' : '#e6a817';
  const sl = s => s === 'up' ? 'UP' : s === 'down' ? 'DOWN' : '...';
  const allUp = statuses.every(s => s.status === 'up');
  const anyDown = statuses.some(s => s.status === 'down');

  return (
    <div style={{ backgroundColor: '#0d1117', border: '1px solid rgba(76,217,255,0.2)', borderRadius: 14, padding: 20, fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(76,217,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: anyDown ? '#f85149' : '#3fb950', display: 'inline-block', boxShadow: `0 0 8px ${anyDown ? '#f85149' : '#3fb950'}` }} />
          <span style={{ color: '#e6edf3', fontSize: 13, fontWeight: 700 }}>{anyDown ? 'DEGRADED' : allUp ? 'ALL SYSTEMS OPERATIONAL' : 'CHECKING...'}</span>
        </div>
        <button onClick={check} style={{ background: 'none', border: '1px solid rgba(76,217,255,0.3)', borderRadius: 6, color: '#4cd9ff', fontSize: 11, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace' }}>↻ refresh</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {statuses.map(site => (
          <div key={site.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#161b22', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sc(site.status), display: 'inline-block', flexShrink: 0 }} />
              <div>
                <div style={{ color: '#e6edf3', fontSize: 13 }}>{site.name}</div>
                <div style={{ color: '#8b949e', fontSize: 11 }}>{site.display}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {site.latency && <span style={{ color: '#8b949e', fontSize: 11 }}>{site.latency}ms</span>}
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: `${sc(site.status)}22`, color: sc(site.status) }}>{sl(site.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. KUBECTL PODS ───────────────────────────────────────────────────────────
function KubectlPods({ skills }) {
  const [tick, setTick] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 500);
  const ages = useRef({});

  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 3000); return () => clearInterval(id); }, []);
  useEffect(() => {
    const fn = () => setIsMobileView(window.innerWidth <= 500);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  skills.forEach((s, i) => { if (!ages.current[s.id || i]) ages.current[s.id || i] = Math.floor(Math.random() * 300) + 1; });

  function fakeAge(key) {
    const d = ages.current[key] || 1;
    return d < 60 ? `${d}s` : d < 3600 ? `${Math.floor(d / 60)}m` : `${Math.floor(d / 3600)}h`;
  }

  // Mobile: 2 columns (name + status). Desktop: full 5 columns.
  const cols = isMobileView ? '1fr 70px' : '2fr 80px 60px 60px 60px';

  return (
    <div style={{ backgroundColor: '#0d1117', borderRadius: 14, border: '1px solid rgba(76,217,255,0.2)', overflow: 'hidden', fontFamily: 'monospace', fontSize: 12 }}>
      <div style={{ backgroundColor: '#161b22', padding: '10px 16px', borderBottom: '1px solid rgba(76,217,255,0.15)', color: '#4cd9ff', fontSize: 12 }}>
        $ kubectl get pods -n skills
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '8px 16px', color: '#8b949e', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 8 }}>
        <span>NAME</span>
        <span>STATUS</span>
        {!isMobileView && <><span>READY</span><span>RESTARTS</span><span>AGE</span></>}
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {skills.map((skill, i) => {
          const key = skill.id || i;
          const shortName = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const suffix = String(i).padStart(2, '0');
          const podName = isMobileView ? shortName : `${shortName}-${suffix}`;
          const state = ((key.toString().charCodeAt(0) + tick) % 15 === 0) ? 'Pending' : 'Running';
          const stateColor = state === 'Running' ? '#3fb950' : '#e6a817';
          return (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: cols, padding: '9px 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'default', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(76,217,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: isMobileView ? 12 : 12 }}>{podName}</span>
              <span style={{ color: stateColor, fontWeight: 700, fontSize: 11 }}>{state}</span>
              {!isMobileView && <>
                <span style={{ color: '#8b949e' }}>1/1</span>
                <span style={{ color: '#8b949e' }}>{i % 3 === 0 ? 1 : 0}</span>
                <span style={{ color: '#8b949e' }}>{fakeAge(key)}</span>
              </>}
            </div>
          );
        })}
      </div>
      <div style={{ padding: '8px 16px', color: '#8b949e', fontSize: 11, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {skills.length} pods · namespace: skills · cluster: danklofan-prod
      </div>
    </div>
  );
}

// ── 4. GRAFANA INFRA STATS ────────────────────────────────────────────────────
function InfraStats() {
  const [stats, setStats] = useState({ cpu: 23, mem: 61, disk: 44, rpm: 142, p99: 48, uptime: 99.97, deploys: 340, pods: 12 });
  useEffect(() => {
    const id = setInterval(() => setStats(s => ({
      ...s,
      cpu: Math.max(5, Math.min(95, s.cpu + (Math.random() - 0.5) * 8)),
      mem: Math.max(30, Math.min(90, s.mem + (Math.random() - 0.5) * 4)),
      rpm: Math.max(80, Math.min(300, s.rpm + Math.floor((Math.random() - 0.5) * 20))),
      p99: Math.max(20, Math.min(200, s.p99 + Math.floor((Math.random() - 0.5) * 10))),
    })), 2000);
    return () => clearInterval(id);
  }, []);

  function Bar({ value, color }) {
    return (
      <div style={{ backgroundColor: '#1c2333', borderRadius: 4, height: 6, width: '100%', overflow: 'hidden', marginTop: 8 }}>
        <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, backgroundColor: color, borderRadius: 4, transition: 'width 1s ease' }} />
      </div>
    );
  }

  function Card({ label, value, unit, color, bar }) {
    return (
      <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(76,217,255,0.1)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ color: '#8b949e', fontSize: 11, fontFamily: 'monospace', marginBottom: 6, letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: 'monospace' }}>
          {typeof value === 'number' ? (value % 1 ? value.toFixed(2) : Math.round(value)) : value}
          <span style={{ fontSize: 12, color: '#8b949e', fontWeight: 400, marginLeft: 4 }}>{unit}</span>
        </div>
        {bar && <Bar value={value} color={color} />}
      </div>
    );
  }

  const cpuColor = stats.cpu > 80 ? '#f85149' : stats.cpu > 60 ? '#e6a817' : '#3fb950';
  const memColor = stats.mem > 80 ? '#f85149' : stats.mem > 60 ? '#e6a817' : '#4cd9ff';

  return (
    <div style={{ backgroundColor: '#0d1117', borderRadius: 14, border: '1px solid rgba(76,217,255,0.2)', overflow: 'hidden' }}>
      <div style={{ backgroundColor: '#161b22', padding: '10px 16px', borderBottom: '1px solid rgba(76,217,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#4cd9ff', fontFamily: 'monospace', fontSize: 12 }}>◈ danklofan-prod — infrastructure overview</span>
        <span style={{ color: '#3fb950', fontSize: 11, fontFamily: 'monospace' }}>● LIVE</span>
      </div>
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <Card label="CPU USAGE" value={Math.round(stats.cpu)} unit="%" color={cpuColor} bar />
        <Card label="MEMORY" value={Math.round(stats.mem)} unit="%" color={memColor} bar />
        <Card label="DISK" value={stats.disk} unit="%" color="#a78bfa" bar />
        <Card label="REQ / MIN" value={Math.round(stats.rpm)} unit="rpm" color="#4cd9ff" />
        <Card label="P99 LATENCY" value={Math.round(stats.p99)} unit="ms" color="#e6a817" />
        <Card label="UPTIME SLA" value={stats.uptime} unit="%" color="#3fb950" />
        <Card label="DEPLOYS / MO" value={stats.deploys} unit="" color="#4cd9ff" />
        <Card label="PODS RUNNING" value={stats.pods} unit="" color="#3fb950" />
      </div>
    </div>
  );
}

// ── 5. DEPLOYMENT BADGE ───────────────────────────────────────────────────────
function DeploymentBadge() {
  const deploys = [
    { repo: 'danklofan/pf-game', tag: 'mar-18-v4', status: 'success', time: '2h ago', branch: 'main' },
    { repo: 'danklofan/mc-mar11', tag: 'mar11-noon', status: 'success', time: '6d ago', branch: 'main' },
  ];
  const sc = s => s === 'success' ? '#3fb950' : '#f85149';
  const si = s => s === 'success' ? '✓' : '✗';

  return (
    <div style={{ backgroundColor: '#0d1117', borderRadius: 14, border: '1px solid rgba(76,217,255,0.2)', overflow: 'hidden', fontFamily: 'monospace' }}>
      <div style={{ backgroundColor: '#161b22', padding: '10px 16px', borderBottom: '1px solid rgba(76,217,255,0.1)', color: '#4cd9ff', fontSize: 12 }}>
        ⬡ deployment registry — docker hub
      </div>
      {deploys.map((d, i) => (
        <div key={i} style={{ padding: '14px 16px', borderBottom: i < deploys.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ color: '#e6edf3', fontSize: 13, marginBottom: 6 }}>{d.repo}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: 'rgba(76,217,255,0.1)', color: '#4cd9ff', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>:{d.tag}</span>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#8b949e', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>⎇ {d.branch}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#8b949e', fontSize: 11 }}>{d.time}</span>
            <span style={{ backgroundColor: `${sc(d.status)}22`, color: sc(d.status), borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
              {si(d.status)} {d.status.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MOBILE SIDEBAR NAV ────────────────────────────────────────────────────────
function MobileSidebarNav() {
  const [open, setOpen] = useState(false);
  const navItems = [
    { label: 'Summary',      icon: '👤', id: 'summary' },
    { label: 'Experience',   icon: '💼', id: 'work-experience' },
    { label: 'Education',    icon: '🎓', id: 'education' },
    { label: 'Skills',       icon: '🛠', id: 'skills' },
    { label: 'Projects',     icon: '🚀', id: 'projects' },
    { label: 'Certificates', icon: '🏆', id: 'certificates' },
    { label: 'Status',       icon: '📡', id: 'uptime' },
    { label: 'Admin',        icon: '⚙️', id: 'admin', href: '/admin' },
  ];
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  }
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 56, backgroundColor: '#1c2333', borderBottom: '1px solid rgba(76,217,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/my-image.jpg" alt="Jai" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #4cd9ff', flexShrink: 0 }} />
          <div>
            <div style={{ color: '#e6edf3', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>Jai Sharma</div>
            <div style={{ color: '#4cd9ff', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>DEVOPS · CLOUDOPS · SRE</div>
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 8, borderRadius: 6 }} aria-label="Toggle navigation">
          <span style={{ display: 'block', width: 22, height: 2.5, backgroundColor: '#e6a817', borderRadius: 2, transition: 'transform 0.3s ease', transform: open ? 'translateY(7.5px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 2.5, backgroundColor: '#e6a817', borderRadius: 2, transition: 'opacity 0.3s ease', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 2.5, backgroundColor: '#e6a817', borderRadius: 2, transition: 'transform 0.3s ease', transform: open ? 'translateY(-7.5px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>
      <div style={{ height: 56 }} />
      <div style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 999, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', backgroundColor: 'rgba(13,17,23,0.75)', borderBottom: open ? '1px solid rgba(76,217,255,0.2)' : 'none', maxHeight: open ? '480px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
        {navItems.map((item, i) => (
          <button key={item.id} onClick={() => item.href ? (window.location.href = item.href) : scrollTo(item.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '15px 20px', background: 'none', border: 'none', borderBottom: i < navItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', cursor: 'pointer', color: item.id === 'admin' ? '#4cd9ff' : '#e6edf3', fontSize: 15, fontWeight: item.id === 'admin' ? 700 : 500, textAlign: 'left', fontFamily: "'Segoe UI', sans-serif", transition: 'background 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(76,217,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'admin' && <span style={{ marginLeft: 'auto', fontSize: 11, backgroundColor: 'rgba(76,217,255,0.15)', color: '#4cd9ff', borderRadius: 4, padding: '2px 8px', fontWeight: 700 }}>CMS</span>}
          </button>
        ))}
        <div style={{ padding: '10px 20px 14px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>run.danklofan.com</div>
      </div>
    </>
  );
}

function ProjectLinks({ liveUrl, githubUrl }) {
  const liveBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: 'linear-gradient(135deg, rgba(76,217,255,0.25), rgba(0,123,255,0.45))', color: '#0b1726', fontWeight: 600, fontSize: 14, textDecoration: 'none', boxShadow: '0 0 10px rgba(76,217,255,0.6)', transition: 'transform 0.15s ease, box-shadow 0.2s ease' };
  const ghBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, backgroundColor: '#121b2c', border: '1px solid rgba(76,217,255,0.7)', color: '#4cd9ff', fontWeight: 600, fontSize: 14, textDecoration: 'none', boxShadow: '0 0 8px rgba(76,217,255,0.5)', transition: 'background-color 0.2s ease, transform 0.15s ease' };
  const githubIcon = (<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style={{ display: 'block' }}><path d="M8 0.25a7.75 7.75 0 0 0-2.45 15.1c.39.07.53-.17.53-.37v-1.3c-2.17.47-2.63-1.04-2.63-1.04-.35-.9-.86-1.14-.86-1.14-.7-.48.05-.47.05-.47.77.05 1.18.8 1.18.8.69 1.18 1.82.84 2.26.64.07-.5.27-.84.5-1.03-1.73-.2-3.55-.87-3.55-3.9 0-.86.31-1.57.82-2.13-.08-.2-.36-1.02.08-2.12 0 0 .68-.22 2.23.81a7.58 7.58 0 0 1 4.06 0c1.55-1.03 2.23-.81 2.23-.81.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.13 0 3.04-1.82 3.7-3.56 3.9.28.24.53.73.53 1.48v2.19c0 .21.14.45.54.37A7.75 7.75 0 0 0 8 .25z" /></svg>);
  return (
    <p style={{ display: 'flex', gap: 12, margin: '8px 0 14px 0', flexWrap: 'wrap' }}>
      {liveUrl && (<a href={liveUrl} target="_blank" rel="noopener noreferrer" style={liveBtnStyle} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 18px rgba(76,217,255,0.8)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(76,217,255,0.6)'; }}><span style={{ fontSize: 16 }}>▶</span><span>Live Demo</span></a>)}
      {githubUrl && (<a href={githubUrl} target="_blank" rel="noopener noreferrer" style={ghBtnStyle} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#4cd9ff'; e.currentTarget.style.color = '#06101f'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#121b2c'; e.currentTarget.style.color = '#4cd9ff'; e.currentTarget.style.transform = 'translateY(0)'; }}>{githubIcon}<span>GitHub</span></a>)}
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
  useEffect(() => { supabase.from('work_experience').select('*').order('sort_order').then(({ data }) => { setItems(data || []); setLoading(false); }); }, []);
  if (loading) return <><Skeleton /><Skeleton /></>;
  return (
    <>
      {items.map(item => (
        <div key={item.id} style={{ backgroundColor: '#1f2e44', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,123,255,0.4)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, transition: 'background 0.3s ease' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}>
          {item.logo_url && (<img src={item.logo_url} alt={`${item.company} Logo`} style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 10, boxShadow: '0 0 16px rgba(76,217,255,0.7)', flexShrink: 0, transition: 'transform 0.3s ease', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />)}
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ margin: 0, color: '#61dfff', fontWeight: 800, fontSize: '1.5rem', marginBottom: 10, textShadow: '0 0 6px rgba(76,217,255,0.7)' }}>{item.company}</h3>
            <p style={{ margin: 0, color: '#b0cef9', fontSize: 16, lineHeight: 1.55 }}>{item.role}<br />{item.location}</p>
            <ul style={{ marginTop: 18, paddingLeft: 22, color: '#9abff2', fontSize: 15, lineHeight: 1.8 }}>{(item.bullets || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
          </div>
        </div>
      ))}
    </>
  );
}

function Projects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('projects').select('*').order('sort_order').then(({ data }) => { setItems(data || []); setLoading(false); }); }, []);
  if (loading) return <><Skeleton /><Skeleton /></>;
  return (
    <div style={{ backgroundColor: '#1f2e44', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,123,255,0.4)', padding: 24, marginBottom: 32, transition: 'background 0.3s ease' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}>
      {items.map((item, idx) => (
        <div key={item.id} style={{ marginBottom: idx < items.length - 1 ? 28 : 0, paddingBottom: idx < items.length - 1 ? 28 : 0, borderBottom: idx < items.length - 1 ? '1px solid rgba(76,217,255,0.12)' : 'none' }}>
          <h3 style={{ color: '#61dfff', fontWeight: 700, fontSize: '1.4rem', marginBottom: 4, textShadow: '0 0 10px rgba(76,217,255,0.7)' }}>{item.title}</h3>
          {item.tech_stack && <p style={{ color: '#9abff2', fontSize: 13, margin: '0 0 8px 0' }}>{item.tech_stack}</p>}
          <ProjectLinks liveUrl={item.live_url} githubUrl={item.github_url} />
          <ul style={{ paddingLeft: 22, color: '#9abff2', lineHeight: 1.8 }}>{(item.bullets || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('skills').select('*').order('sort_order').then(({ data }) => { setSkills(data || []); setLoading(false); }); }, []);
  if (loading) return <div style={{ color: '#4cd9ff', opacity: 0.5, fontFamily: 'monospace' }}>Loading pods…</div>;
  return <KubectlPods skills={skills} />;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

// ── HERO SECTION ─────────────────────────────────────────────────────────────
function HeroSection() {
  const roles = ['DevOps Engineer', 'CloudOps Engineer', 'SRE', 'Infrastructure Architect', 'CI/CD Specialist'];
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const current = roles[roleIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => { setDisplayed(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 80);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => { setDisplayed(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 40);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setRoleIdx(r => (r + 1) % roles.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, roleIdx]);

  const stats = [
    { value: '2+', label: 'Years Experience' },
    { value: '3', label: 'Companies' },
    { value: '3+', label: 'Live Projects' },
    { value: '99.97%', label: 'Uptime SLA' },
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d1117 0%, #0f1f35 50%, #0d1117 100%)',
      borderRadius: 20, padding: '40px 32px', marginBottom: 8,
      border: '1px solid rgba(76,217,255,0.2)',
      boxShadow: '0 0 60px rgba(76,217,255,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background grid effect */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(76,217,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 28 }}>
        {/* Photo */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'conic-gradient(from 0deg, #4cd9ff, #0070f3, #4cd9ff)', padding: 2 }}>
            <img src="/my-image.jpg" alt="Jai Sharma" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0d1117' }} />
          </div>
          <span style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#3fb950', border: '2px solid #0d1117', boxShadow: '0 0 8px #3fb950' }} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(76,217,255,0.6)', marginBottom: 6, letterSpacing: '0.1em' }}>
            jai@danklofan:~$
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 800, color: '#e6edf3', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Jai Sharma
          </h1>
          <div style={{ marginTop: 8, height: 28, display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{ color: '#4cd9ff', fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 600, fontFamily: 'monospace' }}>
              {displayed}
            </span>
            <span style={{ display: 'inline-block', width: 2, height: 20, backgroundColor: '#4cd9ff', marginLeft: 2, animation: 'blink 1s step-end infinite' }} />
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Himalayas, India', 'Unilog Corp', 'GCP Certified'].map(tag => (
              <span key={tag} style={{ fontSize: 11, fontFamily: 'monospace', color: '#8b949e', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px' }}>{tag}</span>
            ))}
          </div>
          {/* Social links */}
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jaisharma2512/', icon: '/icons/linkedin.svg' },
              { label: 'GitHub', href: 'https://github.com/Jaisharma2512', icon: '/icons/github.svg' },
              { label: 'Fiverr', href: 'https://www.fiverr.com/sellers/jaisharma2512/edit', icon: '/icons/fiverr.svg' },
            ].map(link => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8,
                backgroundColor: 'rgba(76,217,255,0.08)',
                border: '1px solid rgba(76,217,255,0.2)',
                color: '#4cd9ff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(76,217,255,0.18)'; e.currentTarget.style.borderColor = '#4cd9ff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(76,217,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(76,217,255,0.2)'; }}
              >
                <img src={link.icon} alt={link.label} style={{ width: 14, height: 14 }} />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            backgroundColor: 'rgba(13,17,23,0.7)', borderRadius: 10,
            border: '1px solid rgba(76,217,255,0.12)', padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4cd9ff', fontFamily: 'monospace' }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4, letterSpacing: '0.04em' }}>{stat.label}</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ── LUXURY CERTIFICATES ───────────────────────────────────────────────────────
function Certificates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('certificates').select('*').order('sort_order')
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);
  if (loading) return <Skeleton />;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
      {items.map(item => (
        <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#0d1117',
            border: '1px solid rgba(76,217,255,0.2)',
            borderRadius: 16, padding: '24px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: '0 0 0 rgba(76,217,255,0)',
            textAlign: 'center',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4cd9ff'; e.currentTarget.style.boxShadow = '0 0 28px rgba(76,217,255,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(76,217,255,0.2)'; e.currentTarget.style.boxShadow = '0 0 0 rgba(76,217,255,0)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {item.logo_url && (
              <div style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, boxShadow: '0 0 20px rgba(76,217,255,0.25)' }}>
                <img src={item.logo_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <div>
              <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: 15, lineHeight: 1.4, marginBottom: 10 }}>{item.title}</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: 'rgba(76,217,255,0.1)', border: '1px solid rgba(76,217,255,0.3)',
                borderRadius: 8, padding: '6px 14px',
                color: '#4cd9ff', fontSize: 12, fontWeight: 600,
              }}>
                View Certificate →
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const isMobile = useIsMobile(800);
  const [showTerminal, setShowTerminal] = useState(false);

  // Keyboard shortcut: backtick
  useEffect(() => {
    function handleKey(e) {
      if (e.key === '`' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        setShowTerminal(t => !t);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div style={{ backgroundColor: '#121212', color: '#4cd9ff', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight: '150vh', padding: 20, paddingBottom: 80 }}>
      {showTerminal && <TerminalEasterEgg onClose={() => setShowTerminal(false)} />}
      {isMobile && <MobileSidebarNav />}
      {!isMobile && (<section style={{ maxWidth: 1200, margin: '0 auto 20px auto' }}><RunnerGame /></section>)}

      <main style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── HERO SECTION ── */}
        <FadeInSection id="summary" title="">
          <HeroSection />
        </FadeInSection>

        <FadeInSection id="work-experience" title="Professional Experience"><WorkExperience /></FadeInSection>
        <FadeInSection id="skills" title="Technical Skills"><Skills /></FadeInSection>
        <FadeInSection id="projects" title="Projects"><Projects /></FadeInSection>
        <FadeInSection id="infra" title="Infrastructure Overview"><InfraStats /></FadeInSection>
        <FadeInSection id="uptime" title="Service Status"><UptimeWidget /></FadeInSection>
        <FadeInSection id="deployments" title="Deployments"><DeploymentBadge /></FadeInSection>
        <FadeInSection id="education" title="Education">
          <div style={{ backgroundColor: '#1f2e44', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,123,255,0.4)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, transition: 'background 0.3s ease' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#29508d')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1f2e44')}>
            <img src="/graphic-era-logo.jpg" alt="Graphic Era Logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 10, boxShadow: '0 0 14px rgba(76,217,255,0.7)', flexShrink: 0, transition: 'transform 0.3s ease' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
            <div style={{ flex: 1, minWidth: 280, color: '#b0cef9' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, marginBottom: 6, color: '#61dfff', textShadow: '0 0 10px rgba(76,217,255,0.7)' }}>Graphic Era Deemed to be University</h3>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>Bachelor of Technology in Computer Science Engineering<br /><span style={{ fontWeight: 600, color: '#e4f4ff' }}>Graduated July 2023</span></p>
              <p style={{ color: '#9abff2', marginTop: 10 }}><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, backgroundColor: 'rgba(76,217,255,0.12)', color: '#61dfff', fontSize: 13, fontWeight: 600 }}>Recipient of IEEE Certificate of Appreciation</span></p>
            </div>
          </div>
        </FadeInSection>
        <FadeInSection id="certificates" title="Certifications"><Certificates /></FadeInSection>
      </main>

      {/* Floating terminal button — always visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setShowTerminal(t => !t)}
          style={{
            position: 'fixed', bottom: 24, right: 20, zIndex: 1001,
            width: 52, height: 52, borderRadius: '50%',
            backgroundColor: '#0d1117',
            border: '1.5px solid rgba(76,217,255,0.5)',
            boxShadow: '0 0 18px rgba(76,217,255,0.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace', fontSize: 18, color: '#4cd9ff',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(76,217,255,0.6)'; e.currentTarget.style.borderColor = '#4cd9ff'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(76,217,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(76,217,255,0.5)'; }}
          aria-label="Open terminal"
          title="Open terminal"
        >
          {'>_'}
        </button>
      )}
    </div>
  );
}
