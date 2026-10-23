import { useEffect, useState, type FormEvent } from 'react';

type Lead = {
  id: string;
  createdAt: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  source: string;
  city: string | null;
  area: string | null;
  objectType: string | null;
  heatingSystem: string | null;
  realizationTiming: string | null;
  name: string;
  phone: string;
  comment: string | null;
};

const statusLabels: Record<Lead['status'], string> = { NEW: 'Нова', CONTACTED: 'Опрацьовується', CLOSED: 'Закрита' };

export default function AdminPage() {
  const [csrfToken, setCsrfToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);

  const loadLeads = async (token: string) => {
    const response = await fetch('/api/v1/admin/leads', { headers: { 'X-CSRF-Token': token }, credentials: 'same-origin' });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Не вдалося завантажити заявки.');
    setLeads(result.leads);
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const csrfResponse = await fetch('/api/v1/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
        const csrf = await csrfResponse.json();
        if (!csrfResponse.ok) throw new Error(csrf.error || 'Не вдалося відкрити адміністративний розділ.');
        if (!active) return;
        setCsrfToken(csrf.token);
        const me = await fetch('/api/v1/auth/me', { headers: { 'X-CSRF-Token': csrf.token }, credentials: 'same-origin', cache: 'no-store' });
        if (me.ok) {
          setAuthenticated(true);
          await loadLeads(csrf.token);
        } else if (me.status !== 401) {
          const result = await me.json().catch(() => ({}));
          throw new Error(result.error || 'Не вдалося перевірити сесію.');
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Помилка з’єднання з сервером.');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Не вдалося увійти.');
      setCsrfToken(result.csrfToken);
      setAuthenticated(true);
      await loadLeads(result.csrfToken);
    } catch (reason) { setAuthenticated(false); setError(reason instanceof Error ? reason.message : 'Не вдалося увійти.'); }
    finally { setBusy(false); }
  };

  const logout = async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/v1/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, credentials: 'same-origin' });
      if (!response.ok) throw new Error('Не вдалося завершити сесію.');
      setAuthenticated(false); setLeads([]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Не вдалося завершити сесію.'); }
    finally { setBusy(false); }
  };

  return <main className="detail-page admin-page">
    <div className="container admin-content">
      <p className="eyebrow"><span className="eyebrow-line" />АДМІНІСТРАТОР</p>
      {loading ? <p role="status">Перевіряємо сесію…</p> : authenticated ? <>
        <div className="admin-heading"><div><h1>Заявки</h1><p>Останні 100 звернень</p></div><button className="button button-outline" onClick={() => void logout()} disabled={busy}>Вийти</button></div>
        {error && <p className="form-message" role="alert">{error}</p>}
        {leads.length === 0 ? <p>Заявок поки немає.</p> : <div className="admin-leads">{leads.map(lead => <article className="admin-lead" key={lead.id}>
          <div className="admin-lead-heading"><time dateTime={lead.createdAt}>{new Date(lead.createdAt).toLocaleString('uk-UA')}</time><span className={`admin-status status-${lead.status.toLowerCase()}`}>{statusLabels[lead.status]}</span></div>
          <h2>{lead.name}</h2><p><a href={`tel:${lead.phone}`}>{lead.phone}</a></p>
          <p>{[lead.city, lead.area, lead.objectType, lead.heatingSystem, lead.realizationTiming].filter(Boolean).join(' · ') || 'Контактне звернення'}</p>
          {lead.comment && <p>{lead.comment}</p>}
        </article>)}</div>}
      </> : <>
        <h1>Вхід адміністратора</h1>
        <form className="admin-login" onSubmit={event => { void login(event); }}>
          <label className="field-label" htmlFor="admin-username">Логін</label><input id="admin-username" name="username" autoComplete="username" required maxLength={80} />
          <label className="field-label" htmlFor="admin-password">Пароль</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200} />
          <button className="button button-dark" type="submit" disabled={busy}>{busy ? 'Перевіряємо…' : 'Увійти'}</button>
          {error && <p className="form-message" role="alert">{error}</p>}
        </form>
      </>}
    </div>
  </main>;
}
