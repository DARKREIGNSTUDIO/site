import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface NavbarProps {
  onNavigate: (targetId: string) => void;
}

const LINKS = [
  { href: '#about', label: 'درباره من' },
  { href: '#skills', label: 'مهارت‌ها' },
  { href: '#projects', label: 'پروژه‌ها' },
  { href: '#end', label: 'ارتباط' },
];

export function Navbar({ onNavigate }: NavbarProps) {
  const [muted, setMuted] = useState(soundEngine.isMuted());

  useEffect(() => {
    return soundEngine.subscribe(() => {
      setMuted(soundEngine.isMuted());
    });
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    const id = href.replace('#', '');
    if (!document.getElementById(id)) {
      return;
    }
    e.preventDefault();
    soundEngine.playUiTick('click');
    onNavigate(id);
  };

  const handleToggleAudio = () => {
    const nextMuted = soundEngine.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playUiTick('click');
    }
  };

  return (
    <nav className="top-nav" aria-label="ناوبری اصلی">
      <a
        className="lg"
        href="#home"
        onClick={(e) => handleClick(e, '#home')}
      >
        <i>●</i> ARMIN.DEV
      </a>
      <div className="nav-right">
        <div className="l">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={() => soundEngine.playUiTick('hover')}
              onClick={(e) => handleClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <button
          type="button"
          className={`audio-btn${muted ? ' muted' : ''}`}
          onClick={handleToggleAudio}
          aria-pressed={!muted}
          aria-label={muted ? 'روشن کردن صدا و موسیقی' : 'بی‌صدا کردن افکت‌ها و موسیقی'}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{muted ? 'MUTED' : 'AUDIO'}</span>
        </button>
      </div>
    </nav>
  );
}
