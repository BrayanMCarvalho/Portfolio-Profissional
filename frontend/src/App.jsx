import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowRight, Code2, Github, Linkedin, Mail, MessageCircle, Menu, X, MapPin, Languages, GraduationCap, BriefcaseBusiness, Send, CheckCircle2 } from 'lucide-react';

const words = {
  pt: { nav: ['Sobre mim', 'Projetos', 'Experiências', 'Contato'], talk: 'Vamos conversar', label: 'PORTFÓLIO / DESENVOLVIMENTO', intro: 'Olá, eu sou', projects: 'Explorar projetos', scroll: 'Conheça meu trabalho', about: 'Um pouco sobre mim.', aboutLead: 'Aprender. Construir. Evoluir.', toolkit: 'TECNOLOGIAS DESTE PORTFÓLIO', projectTitle: 'Da ideia à prática.', projectLead: 'Minha evolução em projetos, do mais antigo ao mais recente.', repo: 'Ver no GitHub', missingRepo: 'Repositório em breve', preview: 'Imagem do projeto a complementar', careerTitle: 'Cada passo conta.', careerLead: 'Aprendizados e experiências ao longo do caminho.', empty: 'Uma trajetória em construção', emptyText: 'Experiências profissionais, projetos acadêmicos e participações em eventos serão adicionados aqui.', contactTitle: 'Vamos criar algo\ninteressante?', contactLead: 'Tem uma ideia, uma oportunidade ou quer trocar uma experiência? Deixe sua mensagem.', name: 'Seu nome', email: 'Seu e-mail', message: 'Sua mensagem', placeholder: 'Me conte um pouco sobre sua ideia…', send: 'Enviar mensagem', sending: 'Enviando…', success: 'Mensagem enviada! Obrigado pelo contato.', unavailable: 'O formulário estará disponível assim que o e-mail de contato for configurado.', error: 'Não foi possível enviar. Tente novamente em alguns instantes.', limit: 'Muitas mensagens neste momento. Aguarde um minuto e tente novamente.', invalid: 'Confira os campos: nome e e-mail válidos, mensagem entre 10 e 5.000 caracteres.', privacy: 'Seus dados serão usados apenas para responder ao contato.', footer: 'Feito com React, Spring Boot e atenção aos detalhes.', draft: 'Versão inicial · conteúdo pessoal em preparação', loading: 'Carregando portfólio…', loadError: 'Não foi possível carregar o portfólio.', retry: 'Tentar novamente', noLinks: 'Canais de contato a complementar.', current: 'Atual', top: 'Voltar ao início' },
  en: { nav: ['About', 'Projects', 'Experience', 'Contact'], talk: 'Let’s talk', label: 'PORTFOLIO / DEVELOPMENT', intro: 'Hi, I’m', projects: 'Explore projects', scroll: 'Discover my work', about: 'A little about me.', aboutLead: 'Learn. Build. Grow.', toolkit: 'THIS PORTFOLIO’S TECHNOLOGIES', projectTitle: 'From idea to reality.', projectLead: 'My progress through projects, from oldest to newest.', repo: 'View on GitHub', missingRepo: 'Repository coming soon', preview: 'Project image to be added', careerTitle: 'Every step matters.', careerLead: 'Learning and experiences along the way.', empty: 'A journey in the making', emptyText: 'Professional experiences, academic projects, and events will be added here.', contactTitle: 'Let’s build something\ninteresting.', contactLead: 'Have an idea, an opportunity, or a story to share? Leave a message.', name: 'Your name', email: 'Your email', message: 'Your message', placeholder: 'Tell me a little about your idea…', send: 'Send message', sending: 'Sending…', success: 'Message sent! Thanks for reaching out.', unavailable: 'The form will be available once the contact email is configured.', error: 'Unable to send. Please try again in a moment.', limit: 'Too many messages right now. Wait a minute and try again.', invalid: 'Check your name and email, and enter a message between 10 and 5,000 characters.', privacy: 'Your information will only be used to reply to your message.', footer: 'Made with React, Spring Boot, and attention to detail.', draft: 'Initial version · personal content in preparation', loading: 'Loading portfolio…', loadError: 'Unable to load the portfolio.', retry: 'Try again', noLinks: 'Contact channels to be added.', current: 'Present', top: 'Back to top' }
};
const sections = ['sobre', 'projetos', 'experiencias', 'contato'];
const localized = (value, lang) => typeof value === 'string' ? value : value?.[lang] || value?.pt || '';
const external = (value) => /^https:\/\//i.test(value || '') ? value : undefined;

function SocialLinks({ links, lang }) {
  const items = [
    ['GitHub', Github, external(links.github)], ['LinkedIn', Linkedin, external(links.linkedin)],
    ['E-mail', Mail, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(links.email) ? `mailto:${links.email}` : undefined],
    ['WhatsApp', MessageCircle, /^\d{10,15}$/.test(links.whatsapp) ? `https://wa.me/${links.whatsapp}` : undefined]
  ].filter(([, , href]) => href);
  return items.length ? <div className="socials">{items.map(([name, Icon, href]) => <a key={name} href={href} aria-label={name} title={name} target="_blank" rel="noopener noreferrer"><Icon size={20} /></a>)}</div> : <p className="muted small">{words[lang].noLinks}</p>;
}

function ContactForm({ lang }) {
  const t = words[lang];
  const [available, setAvailable] = useState(null);
  const [status, setStatus] = useState('idle');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/contact/status', { signal: controller.signal }).then(r => r.ok ? r.json() : Promise.reject()).then(data => setAvailable(data.available)).catch(e => { if (e?.name !== 'AbortError') setAvailable(false); });
    return () => controller.abort();
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (status === 'sending' || !available) return;
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    payload.name = payload.name.trim(); payload.email = payload.email.trim(); payload.message = payload.message.trim();
    if (!payload.name || payload.message.length < 10) { setStatus('invalid'); return; }
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
      if (!response.ok) { setStatus(response.status === 429 ? 'limit' : response.status === 400 ? 'invalid' : response.status === 503 ? 'unavailable' : 'error'); return; }
      setStatus('success'); form.reset();
    } catch { setStatus('error'); }
  }
  return <form onSubmit={submit} className="contact-form">
    <div className="form-row"><label>{t.name}<input name="name" autoComplete="name" required maxLength={100} placeholder={lang === 'pt' ? 'Como posso te chamar?' : 'What should I call you?'} /></label><label>{t.email}<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="voce@exemplo.com" /></label></div>
    <label>{t.message}<textarea name="message" required minLength={10} maxLength={5000} rows={5} placeholder={t.placeholder} /></label>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></label></div>
    {available === false && <p className="form-notice">{t.unavailable}</p>}
    <button className="button primary" disabled={!available || status === 'sending'} type="submit">{status === 'sending' ? t.sending : t.send}<Send size={17} /></button>
    <p className="small muted">{t.privacy}</p>
    <div role="status" aria-live="polite" className={`form-status ${status === 'success' ? 'success' : ''}`}>{!['idle', 'sending'].includes(status) && <>{status === 'success' && <CheckCircle2 size={18} />}{t[status]}</>}</div>
  </form>;
}

export default function App() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'pt'; } catch { return 'pt'; } });
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState('sobre');
  const t = words[lang];
  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    try { localStorage.setItem('portfolio-language', lang); } catch { /* Optional preference storage. */ }
  }, [lang]);
  useEffect(() => {
    const controller = new AbortController(); setError(false);
    fetch('/api/portfolio', { signal: controller.signal }).then(r => r.ok ? r.json() : Promise.reject()).then(setData).catch(e => { if (e?.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    if (!data) return;
    document.title = `${data.name} | ${localized(data.role, lang)}`;
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }); }, { rootMargin: '-15% 0px -55% 0px' });
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [data, lang]);
  if (!data) return <main className="loading"><Code2 size={40} /><h1>{error ? t.loadError : t.loading}</h1>{error && <button className="button primary" onClick={() => setRevision(v => v + 1)}>{t.retry}</button>}</main>;
  const projects = [...data.projects].sort((a, b) => a.date.localeCompare(b.date));
  const formatDate = value => new Date(`${value}T12:00:00`).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', year: 'numeric' });
  return <>
    <a className="skip" href="#sobre">{lang === 'pt' ? 'Pular para o conteúdo' : 'Skip to content'}</a>
    <header><div className="container header-inner"><a className="brand" href="#inicio" aria-label={t.top}><span className="brand-icon"><Code2 size={24} /></span><span>brayan<span className="accent">.</span>dev</span></a>
      <nav aria-label={lang === 'pt' ? 'Navegação principal' : 'Main navigation'} className={menu ? 'open' : ''}>{sections.map((id, i) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setMenu(false)}>{t.nav[i]}</a>)}</nav>
      <div className="header-actions"><div className="languages" aria-label="Language / Idioma"><button onClick={() => setLang('pt')} aria-pressed={lang === 'pt'}>PT</button><span>/</span><button onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button></div><a className="header-contact" href="#contato">{t.talk}<ArrowUpRight size={16} /></a><button className="menu-button" aria-label={menu ? 'Fechar menu / Close menu' : 'Abrir menu / Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></div>
    </div></header>
    <main id="inicio">
      <section className="hero container" id="sobre"><div className="hero-copy"><p className="eyebrow"><span className="dot" />{t.label}</p><p className="hello">{t.intro} <strong>{data.name}.</strong></p><h1>{localized(data.headline, lang).split('\n').map((line, i) => <span key={line} className={i ? 'accent' : ''}>{line}</span>)}</h1><p className="hero-description">{localized(data.role, lang)}<br />{localized(data.summary || data.about, lang)}</p><div className="hero-actions"><a className="button primary" href="#projetos">{t.projects}<ArrowUpRight size={20} /></a><a className="text-link" href="#contato">{t.talk}<ArrowRight size={18} /></a></div>{data.draft && <p className="draft">{t.draft}</p>}</div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span><div className="code-window"><div className="window-bar"><i/><i/><i/><span>hello_world.java</span></div><div className="code-body"><span className="code-comment">// always a work in progress</span><p><span className="code-purple">class</span> <span className="accent">Developer</span> {'{'}</p><p className="indent">curiosity = <span className="code-orange">true</span>;</p><p className="indent">ideas.<span className="accent">build</span>();</p><p className="indent">skills.<span className="accent">grow</span>();</p><p>{'}'}</p><span className="terminal">❯ <span className="cursor"/></span></div></div><div className="floating-tag"><span className="dot"/> learn · build · repeat</div><span className="art-caption">CREATIVE MIND. DEVELOPER SOUL.</span></div>
        <a className="scroll-link" href="#perfil"><ArrowDown size={16}/>{t.scroll}<span>01 — 04</span></a>
      </section>
      <section className="about-band" id="perfil"><div className="container about-grid"><div><p className="eyebrow">01 / {t.nav[0]}</p><h2>{t.about}</h2></div><div><h3>{t.aboutLead}</h3><p className="muted">{localized(data.about, lang)}</p><div className="profile-facts"><span><GraduationCap size={18}/>{localized(data.education, lang)}</span><span><MapPin size={18}/>{localized(data.location, lang)}</span>{data.languages && <span><Languages size={18}/>{localized(data.languages, lang)}</span>}</div><p className="eyebrow toolkit">{t.toolkit}</p><div className="chips">{data.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div></div></section>
      <section className="container section" id="projetos"><div className="section-heading"><div><p className="eyebrow">02 / {t.nav[1]}</p><h2>{t.projectTitle}</h2><p className="muted">{t.projectLead}</p></div><span className="section-count">{String(projects.length).padStart(2, '0')} / {t.nav[1]}</span></div><div className="timeline">{projects.map((project, index) => <article className="project" key={project.id}><div className="project-date"><span className="timeline-dot"/><time dateTime={project.date}>{formatDate(project.date)}</time><span className="project-number">{String(index + 1).padStart(2, '0')}</span></div><div className="project-body"><div className="project-preview">{project.image ? <img src={project.image} alt={localized(project.imageAlt, lang)} loading="lazy" onError={e => { e.currentTarget.hidden = true; e.currentTarget.nextElementSibling.hidden = false; }}/>: null}<div className="preview-empty" hidden={!!project.image}><Code2 size={48}/><span>{t.preview}</span></div></div><div className="project-copy"><p className="eyebrow">WEB DEVELOPMENT</p><h3>{project.name}</h3><p className="muted">{localized(project.description, lang)}</p><div className="chips">{project.technologies.map(tech => <span key={tech}>{tech}</span>)}</div>{external(project.repository) ? <a className="text-link" href={project.repository} target="_blank" rel="noopener noreferrer"><Github size={18}/>{t.repo}<ArrowUpRight size={17}/></a> : <span className="muted">{t.missingRepo}</span>}</div></div></article>)}</div></section>
      <section className="container section experience-section" id="experiencias"><p className="eyebrow">03 / {t.nav[2]}</p><h2>{t.careerTitle}</h2><p className="muted">{t.careerLead}</p>{data.experiences.length ? <div className="experiences">{data.experiences.map(item => <article key={item.id}><BriefcaseBusiness size={24}/><div><p className="eyebrow">{formatDate(item.start)} — {item.end ? formatDate(item.end) : t.current}</p><h3>{localized(item.role, lang)}</h3><p>{item.company}</p><p className="muted">{localized(item.description, lang)}</p></div></article>)}</div> : <div className="empty-experience"><span className="experience-icon"><BriefcaseBusiness size={26}/></span><div><h3>{t.empty}</h3><p className="muted">{t.emptyText}</p></div><ArrowUpRight className="empty-arrow" size={28}/></div>}</section>
      <section className="contact-band" id="contato"><div className="container contact-grid"><div><p className="eyebrow">04 / {t.nav[3]}</p><h2>{t.contactTitle}</h2><p className="muted">{t.contactLead}</p><SocialLinks links={data.links} lang={lang}/></div><ContactForm lang={lang}/></div></section>
    </main><footer className="container"><a className="brand" href="#inicio"><Code2 size={22}/><span>brayan<span className="accent">.</span>dev</span></a><p>© {new Date().getFullYear()} · {t.footer}</p><a className="back-top" href="#inicio" aria-label={t.top}><ArrowUpRight size={20}/></a></footer>
  </>;
}
