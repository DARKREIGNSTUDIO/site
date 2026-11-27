import { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { CONTACT_INFO, buildResumeText } from '../data/portfolio';

export function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    soundEngine.playUiTick('click');
    try {
      await navigator.clipboard.writeText(CONTACT_INFO.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = CONTACT_INFO.email;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (ok) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownloadResume = () => {
    soundEngine.playUiTick('click');
    const content = buildResumeText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Armin-Unity-Developer-Resume.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="end" id="end">
        <div className="k" style={{ textAlign: 'center' }}>
          NEXT TAPE
        </div>
        <h2>بیا با هم یه چیز خفن بسازیم</h2>
        <p style={{ color: 'var(--mu)', marginBottom: '22px' }}>
          آماده یادگیری سریع، ورود به تیم و ساخت سیستم‌های بازی.
        </p>
        <div>
          <a className="btn bdi-ltr" href={`mailto:${CONTACT_INFO.email}`}>
            {CONTACT_INFO.email}
          </a>
          <button type="button" className="btn g" onClick={handleCopy}>
            {copied ? 'ایمیل کپی شد' : 'کپی ایمیل'}
          </button>
          <button type="button" className="btn g" onClick={handleDownloadResume}>
            دانلود رزومه
          </button>
        </div>
      </section>

      <footer className="site-footer">
        © ARMIN · UNITY / C# · {new Date().getFullYear()}
      </footer>
    </>
  );
}
