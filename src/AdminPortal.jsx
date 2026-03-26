import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';

// ─── Theme tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0d1117',
  surface: '#161b22',
  border: '#30363d',
  accent: '#4cd9ff',
  accentDim: 'rgba(76,217,255,0.12)',
  accentBorder: 'rgba(76,217,255,0.35)',
  text: '#e6edf3',
  muted: '#8b949e',
  danger: '#f85149',
  dangerDim: 'rgba(248,81,73,0.12)',
  success: '#3fb950',
  successDim: 'rgba(63,185,80,0.12)',
  warning: '#d29922',
};

const s = {
  page: { minHeight: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden', width: '100%' },
  card: { backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16, boxSizing: 'border-box', width: '100%', overflow: 'hidden', wordBreak: 'break-word' },
  input: {
    width: '100%', backgroundColor: '#0d1117', border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 14,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  },
  label: { display: 'block', fontSize: 12, color: C.muted, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' },
  btn: (variant = 'primary') => ({
    padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
    fontWeight: 600, transition: 'all 0.2s',
    backgroundColor: variant === 'primary' ? C.accent : variant === 'danger' ? C.danger : variant === 'success' ? C.success : C.surface,
    color: variant === 'primary' ? '#0d1117' : variant === 'ghost' ? C.muted : '#fff',
    border: variant === 'ghost' ? `1px solid ${C.border}` : 'none',
  }),
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: C.accent, marginBottom: 20, paddingBottom: 10, borderBottom: `1px solid ${C.border}` },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 },
  row: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
};

// ─── Reusable components ─────────────────────────────────────────────────────

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      backgroundColor: type === 'error' ? C.danger : C.success,
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.2s ease',
    }}>
      {message}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={s.label}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...s.input, borderColor: focused ? C.accent : C.border }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={s.label}>{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...s.input, resize: 'vertical', lineHeight: 1.6, borderColor: focused ? C.accent : C.border }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function BulletEditor({ bullets, onChange }) {
  const add = () => onChange([...bullets, '']);
  const update = (i, val) => { const b = [...bullets]; b[i] = val; onChange(b); };
  const remove = (i) => onChange(bullets.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const b = [...bullets];
    const j = i + dir;
    if (j < 0 || j >= b.length) return;
    [b[i], b[j]] = [b[j], b[i]];
    onChange(b);
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={s.label}>Bullet Points</label>
      {bullets.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input
            value={b}
            onChange={e => update(i, e.target.value)}
            style={{ ...s.input, flex: 1 }}
            placeholder={`Bullet ${i + 1}`}
          />
          <button onClick={() => move(i, -1)} style={s.btn('ghost')} title="Move up">↑</button>
          <button onClick={() => move(i, 1)} style={s.btn('ghost')} title="Move down">↓</button>
          <button onClick={() => remove(i)} style={s.btn('danger')} title="Remove">✕</button>
        </div>
      ))}
      <button onClick={add} style={{ ...s.btn('ghost'), marginTop: 4 }}>+ Add bullet</button>
    </div>
  );
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUpload({ label, currentUrl, onUpload, bucket = 'logos' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;
    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={s.label}>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {preview && (
          <img src={preview} alt="preview" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 8, backgroundColor: '#fff', padding: 4, border: '1px solid rgba(76,217,255,0.3)' }} />
        )}
        <button type="button" onClick={() => inputRef.current?.click()} style={{ ...s.btn('ghost'), fontSize: 12, padding: '8px 16px' }} disabled={uploading}>
          {uploading ? 'Uploading…' : preview ? '↑ Replace image' : '↑ Upload image'}
        </button>
        {preview && (
          <button type="button" onClick={() => { setPreview(''); onUpload(''); }} style={{ ...s.btn('ghost'), fontSize: 12, padding: '8px 12px', color: C.danger }}>
            Remove
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
      </div>
      {preview && <div style={{ marginTop: 6, fontSize: 11, color: C.muted, wordBreak: 'break-all' }}>{preview}</div>}
    </div>
  );
}


// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('admin_credentials')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    setLoading(false);
    if (err || !data) {
      setError('Invalid username or password.');
    } else {
      onLogin();
    }
  }

  return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <h1 style={{ color: C.accent, fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Admin Portal</h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>Jai Sharma · Portfolio CMS</p>
        </div>
        <div style={s.card}>
          <form onSubmit={handleLogin}>
            <Input label="Username" value={username} onChange={setUsername} placeholder="" />
            <Input label="Password" value={password} onChange={setPassword} placeholder="" type="password" />
            {error && (
              <div style={{ backgroundColor: C.dangerDim, border: `1px solid ${C.danger}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.danger, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button type="submit" style={{ ...s.btn('primary'), width: '100%', padding: '12px', fontSize: 15 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Work Experience Section ──────────────────────────────────────────────────

function WorkExperienceSection({ toast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const { data } = await supabase.from('work_experience').select('*').order('sort_order');
    setItems(data || []);
  }

  function openNew() {
    setForm({ company: '', role: '', location: '', logo_url: '', bullets: [''], sort_order: items.length });
    setEditing('new');
  }

  function openEdit(item) {
    setForm({ ...item, bullets: item.bullets || [''] });
    setEditing(item.id);
  }

  async function save() {
    setLoading(true);
    if (editing === 'new') {
      const { error } = await supabase.from('work_experience').insert([form]);
      if (error) { toast('Error saving: ' + error.message, 'error'); }
      else { toast('Experience added!', 'success'); }
    } else {
      const { error } = await supabase.from('work_experience').update(form).eq('id', editing);
      if (error) { toast('Error updating: ' + error.message, 'error'); }
      else { toast('Experience updated!', 'success'); }
    }
    setLoading(false);
    setEditing(null);
    fetchItems();
  }

  async function remove(id) {
    if (!window.confirm('Delete this experience?')) return;
    await supabase.from('work_experience').delete().eq('id', id);
    toast('Deleted.', 'success');
    fetchItems();
  }

  async function moveItem(i, dir) {
    const updated = [...items];
    const j = i + dir;
    if (j < 0 || j >= updated.length) return;
    [updated[i], updated[j]] = [updated[j], updated[i]];
    updated.forEach((item, idx) => { item.sort_order = idx; });
    setItems(updated);
    await Promise.all(updated.map(item => supabase.from('work_experience').update({ sort_order: item.sort_order }).eq('id', item.id)));
  }

  if (editing !== null) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={s.sectionTitle}>{editing === 'new' ? 'Add Experience' : 'Edit Experience'}</h3>
          <button onClick={() => setEditing(null)} style={s.btn('ghost')}>← Back</button>
        </div>
        <div style={s.card}>
          <Input label="Company" value={form.company || ''} onChange={v => setForm(f => ({ ...f, company: v }))} placeholder="e.g. Unilog Corp" />
          <Input label="Role" value={form.role || ''} onChange={v => setForm(f => ({ ...f, role: v }))} placeholder="e.g. CloudOps Engineer" />
          <Input label="Location" value={form.location || ''} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="e.g. India" />
          <ImageUpload label="Company Logo" currentUrl={form.logo_url || ''} onUpload={v => setForm(f => ({ ...f, logo_url: v }))} />
          <BulletEditor bullets={form.bullets || ['']} onChange={v => setForm(f => ({ ...f, bullets: v }))} />
          <div style={s.row}>
            <button onClick={save} style={s.btn('primary')} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setEditing(null)} style={s.btn('ghost')}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={s.sectionTitle}>Work Experience</h3>
        <button onClick={openNew} style={s.btn('primary')}>+ Add</button>
      </div>
      {items.map((item, i) => (
        <div key={item.id} style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.accent, fontSize: 16 }}>{item.company}</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{item.role} · {item.location}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 6, wordBreak: 'break-all' }}>{item.bullets?.length} bullet{item.bullets?.length !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ ...s.row, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => moveItem(i, -1)} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12 }}>↑</button>
            <button onClick={() => moveItem(i, 1)} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12 }}>↓</button>
            <button onClick={() => openEdit(item)} style={{ ...s.btn('ghost'), padding: '6px 14px', fontSize: 12 }}>Edit</button>
            <button onClick={() => remove(item.id)} style={{ ...s.btn('danger'), padding: '6px 14px', fontSize: 12 }}>Delete</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>No entries yet. Click + Add to create one.</p>}
    </div>
  );
}

// ─── Projects Section ─────────────────────────────────────────────────────────

function ProjectsSection({ toast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const { data } = await supabase.from('projects').select('*').order('sort_order');
    setItems(data || []);
  }

  function openNew() {
    setForm({ title: '', tech_stack: '', live_url: '', github_url: '', bullets: [''], sort_order: items.length });
    setEditing('new');
  }

  function openEdit(item) {
    setForm({ ...item, bullets: item.bullets || [''] });
    setEditing(item.id);
  }

  async function save() {
    setLoading(true);
    if (editing === 'new') {
      const { error } = await supabase.from('projects').insert([form]);
      if (error) { toast('Error: ' + error.message, 'error'); }
      else { toast('Project added!', 'success'); }
    } else {
      const { error } = await supabase.from('projects').update(form).eq('id', editing);
      if (error) { toast('Error: ' + error.message, 'error'); }
      else { toast('Project updated!', 'success'); }
    }
    setLoading(false);
    setEditing(null);
    fetchItems();
  }

  async function remove(id) {
    if (!window.confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    toast('Deleted.', 'success');
    fetchItems();
  }

  async function moveItem(i, dir) {
    const updated = [...items];
    const j = i + dir;
    if (j < 0 || j >= updated.length) return;
    [updated[i], updated[j]] = [updated[j], updated[i]];
    updated.forEach((item, idx) => { item.sort_order = idx; });
    setItems(updated);
    await Promise.all(updated.map(item => supabase.from('projects').update({ sort_order: item.sort_order }).eq('id', item.id)));
  }

  if (editing !== null) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={s.sectionTitle}>{editing === 'new' ? 'Add Project' : 'Edit Project'}</h3>
          <button onClick={() => setEditing(null)} style={s.btn('ghost')}>← Back</button>
        </div>
        <div style={s.card}>
          <Input label="Title" value={form.title || ''} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Manucollection.in" />
          <Input label="Tech Stack" value={form.tech_stack || ''} onChange={v => setForm(f => ({ ...f, tech_stack: v }))} placeholder="React · Docker · Kubernetes" />
          <Input label="Live URL" value={form.live_url || ''} onChange={v => setForm(f => ({ ...f, live_url: v }))} placeholder="https://..." />
          <Input label="GitHub URL" value={form.github_url || ''} onChange={v => setForm(f => ({ ...f, github_url: v }))} placeholder="https://github.com/..." />
          <BulletEditor bullets={form.bullets || ['']} onChange={v => setForm(f => ({ ...f, bullets: v }))} />
          <div style={s.row}>
            <button onClick={save} style={s.btn('primary')} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setEditing(null)} style={s.btn('ghost')}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={s.sectionTitle}>Projects</h3>
        <button onClick={openNew} style={s.btn('primary')}>+ Add</button>
      </div>
      {items.map((item, i) => (
        <div key={item.id} style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.accent, fontSize: 16 }}>{item.title}</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{item.tech_stack}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 6, wordBreak: 'break-all' }}>{item.bullets?.length} bullet{item.bullets?.length !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ ...s.row, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => moveItem(i, -1)} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12 }}>↑</button>
            <button onClick={() => moveItem(i, 1)} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12 }}>↓</button>
            <button onClick={() => openEdit(item)} style={{ ...s.btn('ghost'), padding: '6px 14px', fontSize: 12 }}>Edit</button>
            <button onClick={() => remove(item.id)} style={{ ...s.btn('danger'), padding: '6px 14px', fontSize: 12 }}>Delete</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>No projects yet.</p>}
    </div>
  );
}

// ─── Skills Section ───────────────────────────────────────────────────────────

function SkillsSection({ toast }) {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => { fetchSkills(); }, []);

  async function fetchSkills() {
    const { data } = await supabase.from('skills').select('*').order('sort_order');
    setSkills(data || []);
  }

  async function addSkill() {
    const name = newSkill.trim();
    if (!name) return;
    const { error } = await supabase.from('skills').insert([{ name, sort_order: skills.length }]);
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('Skill added!', 'success');
    setNewSkill('');
    fetchSkills();
  }

  async function removeSkill(id) {
    await supabase.from('skills').delete().eq('id', id);
    toast('Skill removed.', 'success');
    fetchSkills();
  }

  async function moveSkill(i, dir) {
    const updated = [...skills];
    const j = i + dir;
    if (j < 0 || j >= updated.length) return;
    [updated[i], updated[j]] = [updated[j], updated[i]];
    updated.forEach((sk, idx) => { sk.sort_order = idx; });
    setSkills(updated);
    await Promise.all(updated.map(sk => supabase.from('skills').update({ sort_order: sk.sort_order }).eq('id', sk.id)));
  }

  return (
    <div>
      <h3 style={s.sectionTitle}>Technical Skills</h3>
      <div style={s.card}>
        <label style={s.label}>Add new skill</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="e.g. Prometheus"
            style={{ ...s.input, flex: 1 }}
          />
          <button onClick={addSkill} style={s.btn('primary')}>Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {skills.map((sk, i) => (
            <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: C.bg, borderRadius: 8, padding: '8px 12px', border: `1px solid ${C.border}` }}>
              <span style={{ flex: 1, ...s.tag }}>{sk.name}</span>
              <button onClick={() => moveSkill(i, -1)} style={s.btn('ghost')}>↑</button>
              <button onClick={() => moveSkill(i, 1)} style={s.btn('ghost')}>↓</button>
              <button onClick={() => removeSkill(sk.id)} style={s.btn('danger')}>✕</button>
            </div>
          ))}
        </div>
        {skills.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>No skills yet.</p>}
      </div>
    </div>
  );
}

// ─── Certificates Section ─────────────────────────────────────────────────────

function CertificatesSection({ toast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const { data } = await supabase.from('certificates').select('*').order('sort_order');
    setItems(data || []);
  }

  function openNew() {
    setForm({ title: '', link: '', logo_url: '', sort_order: items.length });
    setEditing('new');
  }

  function openEdit(item) {
    setForm({ ...item });
    setEditing(item.id);
  }

  async function save() {
    setLoading(true);
    if (editing === 'new') {
      const { error } = await supabase.from('certificates').insert([form]);
      if (error) { toast('Error: ' + error.message, 'error'); }
      else { toast('Certificate added!', 'success'); }
    } else {
      const { error } = await supabase.from('certificates').update(form).eq('id', editing);
      if (error) { toast('Error: ' + error.message, 'error'); }
      else { toast('Certificate updated!', 'success'); }
    }
    setLoading(false);
    setEditing(null);
    fetchItems();
  }

  async function remove(id) {
    if (!window.confirm('Delete this certificate?')) return;
    await supabase.from('certificates').delete().eq('id', id);
    toast('Deleted.', 'success');
    fetchItems();
  }

  async function moveItem(i, dir) {
    const updated = [...items];
    const j = i + dir;
    if (j < 0 || j >= updated.length) return;
    [updated[i], updated[j]] = [updated[j], updated[i]];
    updated.forEach((item, idx) => { item.sort_order = idx; });
    setItems(updated);
    await Promise.all(updated.map(item => supabase.from('certificates').update({ sort_order: item.sort_order }).eq('id', item.id)));
  }

  if (editing !== null) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={s.sectionTitle}>{editing === 'new' ? 'Add Certificate' : 'Edit Certificate'}</h3>
          <button onClick={() => setEditing(null)} style={s.btn('ghost')}>← Back</button>
        </div>
        <div style={s.card}>
          <Input label="Title" value={form.title || ''} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Google Associate Cloud Engineer" />
          <Input label="Certificate URL" value={form.link || ''} onChange={v => setForm(f => ({ ...f, link: v }))} placeholder="https://..." />
          <ImageUpload label="Certificate Logo" currentUrl={form.logo_url || ''} onUpload={v => setForm(f => ({ ...f, logo_url: v }))} />
          <div style={s.row}>
            <button onClick={save} style={s.btn('primary')} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setEditing(null)} style={s.btn('ghost')}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={s.sectionTitle}>Certifications</h3>
        <button onClick={openNew} style={s.btn('primary')}>+ Add</button>
      </div>
      {items.map((item, i) => (
        <div key={item.id} style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.accent, fontSize: 15 }}>{item.title}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 4, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{item.link}</div>
          </div>
          <div style={{ ...s.row, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => moveItem(i, -1)} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12 }}>↑</button>
            <button onClick={() => moveItem(i, 1)} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12 }}>↓</button>
            <button onClick={() => openEdit(item)} style={{ ...s.btn('ghost'), padding: '6px 14px', fontSize: 12 }}>Edit</button>
            <button onClick={() => remove(item.id)} style={{ ...s.btn('danger'), padding: '6px 14px', fontSize: 12 }}>Delete</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>No certificates yet.</p>}
    </div>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────

const SOURCE_BADGE = {
  linkedin: { label: 'LinkedIn', color: '#0a66c2', bg: 'rgba(10,102,194,0.15)', border: 'rgba(10,102,194,0.4)' },
  topmate:  { label: 'Topmate', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.4)' },
};

function StarPicker({ value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={s.label}>Rating</label>
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 2,
              color: n <= value ? '#f6c90e' : '#30363d',
              transition: 'color 0.15s, transform 0.15s',
              transform: n <= value ? 'scale(1.15)' : 'scale(1)',
            }}
            title={`${n} star${n > 1 ? 's' : ''}`}
          >★</button>
        ))}
        <span style={{ color: C.muted, fontSize: 13, alignSelf: 'center', marginLeft: 4 }}>{value}/5</span>
      </div>
    </div>
  );
}

function SourcePicker({ value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={s.label}>Source Platform</label>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        {Object.entries(SOURCE_BADGE).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              border: `2px solid ${value === key ? cfg.color : C.border}`,
              backgroundColor: value === key ? cfg.bg : 'transparent',
              color: value === key ? cfg.color : C.muted,
              transition: 'all 0.2s',
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TestimonialsSection({ toast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const EMPTY_FORM = {
    name: '', role: '', company: '', avatar: '',
    text: '', source: 'linkedin', profile_url: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    rating: 5, sort_order: 0,
  };

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setItems(data || []);
  }

  function openNew() {
    setForm({ ...EMPTY_FORM, sort_order: items.length });
    setEditing('new');
  }

  function openEdit(item) {
    setForm({ ...item });
    setEditing(item.id);
  }

  async function save() {
    if (!form.name?.trim() || !form.text?.trim()) {
      toast('Name and review text are required.', 'error');
      return;
    }
    setLoading(true);
    if (editing === 'new') {
      const { error } = await supabase.from('testimonials').insert([form]);
      if (error) { toast('Error: ' + error.message, 'error'); }
      else { toast('Testimonial added!', 'success'); }
    } else {
      const { error } = await supabase.from('testimonials').update(form).eq('id', editing);
      if (error) { toast('Error: ' + error.message, 'error'); }
      else { toast('Testimonial updated!', 'success'); }
    }
    setLoading(false);
    setEditing(null);
    fetchItems();
  }

  async function remove(id) {
    if (!window.confirm('Delete this testimonial?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    toast('Deleted.', 'success');
    fetchItems();
  }

  async function moveItem(i, dir) {
    const updated = [...items];
    const j = i + dir;
    if (j < 0 || j >= updated.length) return;
    [updated[i], updated[j]] = [updated[j], updated[i]];
    updated.forEach((item, idx) => { item.sort_order = idx; });
    setItems(updated);
    await Promise.all(updated.map(item =>
      supabase.from('testimonials').update({ sort_order: item.sort_order }).eq('id', item.id)
    ));
  }

  // ── Form view ──
  if (editing !== null) {
    const cfg = SOURCE_BADGE[form.source] || SOURCE_BADGE.linkedin;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={s.sectionTitle}>{editing === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}</h3>
          <button onClick={() => setEditing(null)} style={s.btn('ghost')}>← Back</button>
        </div>

        {/* Live mini-preview */}
        <div style={{ ...s.card, borderColor: cfg.border, background: `linear-gradient(135deg, #0d1117, #0f1f35)`, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace', marginBottom: 10, letterSpacing: '0.06em' }}>PREVIEW</div>
          <div style={{ color: '#4cd9ff', fontSize: 36, lineHeight: 1, marginBottom: 6, opacity: 0.3, fontFamily: 'Georgia, serif' }}>"</div>
          <p style={{ color: '#c9d1d9', fontSize: 14, fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 14px', minHeight: 40 }}>
            {form.text || <span style={{ color: C.muted }}>Review text will appear here…</span>}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: `${cfg.color}22`, border: `2px solid ${cfg.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
              {(form.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{form.name || 'Name'}</div>
              <div style={{ color: C.muted, fontSize: 11, fontFamily: 'monospace' }}>{form.role || 'Role'} · {form.company || 'Company'}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '3px 8px' }}>
              {cfg.label}
            </span>
          </div>
        </div>

        <div style={s.card}>
          {/* Source */}
          <SourcePicker value={form.source || 'linkedin'} onChange={v => setForm(f => ({ ...f, source: v }))} />

          {/* Person */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Full Name *" value={form.name || ''} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. John Doe" />
            <Input label="Date" value={form.date || ''} onChange={v => setForm(f => ({ ...f, date: v }))} placeholder="e.g. Mar 2025" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Role / Title" value={form.role || ''} onChange={v => setForm(f => ({ ...f, role: v }))} placeholder="e.g. Senior Engineer" />
            <Input label="Company" value={form.company || ''} onChange={v => setForm(f => ({ ...f, company: v }))} placeholder="e.g. Acme Corp" />
          </div>
          <Input label="Profile URL" value={form.profile_url || ''} onChange={v => setForm(f => ({ ...f, profile_url: v }))} placeholder="https://linkedin.com/in/... or https://topmate.io/..." />
          <Input label="Avatar URL (optional — leave blank for initials)" value={form.avatar || ''} onChange={v => setForm(f => ({ ...f, avatar: v }))} placeholder="https://..." />

          {/* Review */}
          <Textarea
            label="Review Text *"
            value={form.text || ''}
            onChange={v => setForm(f => ({ ...f, text: v }))}
            placeholder="Paste the testimonial / review here…"
            rows={5}
          />

          {/* Rating */}
          <StarPicker value={form.rating ?? 5} onChange={v => setForm(f => ({ ...f, rating: v }))} />

          <div style={s.row}>
            <button onClick={save} style={s.btn('primary')} disabled={loading}>{loading ? 'Saving…' : 'Save Testimonial'}</button>
            <button onClick={() => setEditing(null)} style={s.btn('ghost')}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={s.sectionTitle}>Testimonials</h3>
        <button onClick={openNew} style={s.btn('primary')}>+ Add</button>
      </div>

      {/* Helper note */}
      <div style={{ backgroundColor: 'rgba(76,217,255,0.06)', border: '1px solid rgba(76,217,255,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
        💡 Copy testimonials from <strong style={{ color: C.accent }}>LinkedIn recommendations</strong> or <strong style={{ color: '#7c3aed' }}>Topmate reviews</strong> and paste them here. Set the source platform and add the profile link so visitors can verify.
      </div>

      {items.map((item, i) => {
        const cfg = SOURCE_BADGE[item.source] || SOURCE_BADGE.linkedin;
        const stars = '★'.repeat(item.rating ?? 5) + '☆'.repeat(5 - (item.rating ?? 5));
        return (
          <div key={item.id} style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Initials avatar */}
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: `${cfg.color}22`, border: `2px solid ${cfg.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                {(item.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{item.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 5, padding: '2px 7px' }}>{cfg.label}</span>
                  <span style={{ color: '#f6c90e', fontSize: 12, letterSpacing: 1 }}>{stars}</span>
                </div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{item.role} · {item.company} · {item.date}</div>
                <p style={{ color: '#8b949e', fontSize: 13, marginTop: 8, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '6px 0 0' }}>
                  "{item.text}"
                </p>
              </div>
            </div>
            <div style={{ ...s.row, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => moveItem(i, -1)} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12 }}>↑</button>
              <button onClick={() => moveItem(i, 1)} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12 }}>↓</button>
              <button onClick={() => openEdit(item)} style={{ ...s.btn('ghost'), padding: '6px 14px', fontSize: 12 }}>Edit</button>
              <button onClick={() => remove(item.id)} style={{ ...s.btn('danger'), padding: '6px 14px', fontSize: 12 }}>Delete</button>
            </div>
          </div>
        );
      })}
      {items.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>No testimonials yet. Click + Add to create one.</p>}
    </div>
  );
}

// ─── Main Admin Portal ────────────────────────────────────────────────────────

const TABS = [
  { key: 'experience',   label: '💼 Experience' },
  { key: 'projects',     label: '🚀 Projects' },
  { key: 'skills',       label: '🛠 Skills' },
  { key: 'certs',        label: '🏆 Certs' },
  { key: 'testimonials', label: '💬 Testimonials' },
];

export default function AdminPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('experience');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  function showToast(msg, type = 'success') {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 3000);
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56, flexWrap: 'wrap', gap: 8, padding: '8px 0' }}>
          <span style={{ color: C.accent, fontWeight: 800, fontSize: 16 }}>⚡ Portfolio CMS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" style={{ color: C.muted, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>← Portfolio</a>
            <button onClick={() => setLoggedIn(false)} style={{ ...s.btn('ghost'), fontSize: 12, padding: '6px 12px' }}>Sign out</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 16px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: 'transparent',
                color: activeTab === tab.key ? C.accent : C.muted,
                borderBottom: activeTab === tab.key ? `2px solid ${C.accent}` : '2px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px', boxSizing: 'border-box' }}>
        {activeTab === 'experience'   && <WorkExperienceSection toast={showToast} />}
        {activeTab === 'projects'     && <ProjectsSection toast={showToast} />}
        {activeTab === 'skills'       && <SkillsSection toast={showToast} />}
        {activeTab === 'certs'        && <CertificatesSection toast={showToast} />}
        {activeTab === 'testimonials' && <TestimonialsSection toast={showToast} />}
      </div>

      <Toast message={toastMsg} type={toastType} />
    </div>
  );
}
