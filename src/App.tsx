import { useCallback, useEffect, useState } from 'react';
import { soundEngine, type SectionAudioId } from './audio/soundEngine';
import { AboutSection } from './components/AboutSection';
import { BackgroundEffects } from './components/BackgroundEffects';
import { ContactSection } from './components/ContactSection';
import { EngineTelemetryBar } from './components/EngineTelemetryBar';
import { HeroSection } from './components/HeroSection';
import { HorrorTransitionCorridor } from './components/HorrorTransitionCorridor';
import { LightboxModal, type LightboxSelection } from './components/LightboxModal';
import { Navbar } from './components/Navbar';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';

const SECTION_IDS: SectionAudioId[] = [
  'home',
  'about',
  'skills',
  'corridor',
  'projects',
  'end',
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [trackingTick, setTrackingTick] = useState(0);
  const [lightbox, setLightbox] = useState<LightboxSelection | null>(null);

  const handleReady = useCallback(() => {
    setReady(true);
  }, []);

  // Unlock Web Audio + heavy dark ambient soundtrack cleanly on first gesture
  useEffect(() => {
    const unlockOnce = () => {
      const wasUnlocked = soundEngine.isUnlocked();
      void soundEngine.unlock().then((ok) => {
        if (ok && !wasUnlocked) {
          soundEngine.playLoadingSequence();
        }
      });
    };

    window.addEventListener('pointerdown', unlockOnce, { once: true, passive: true });
    window.addEventListener('keydown', unlockOnce, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
  }, []);

  // Play distinct heavy-reverb SFX motif as user enters each section
  useEffect(() => {
    if (!ready) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as SectionAudioId;
            if (SECTION_IDS.includes(id)) {
              soundEngine.playSectionAmbience(id);
            }
          }
        }
      },
      { threshold: 0.35 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ready]);

  const handleNavigate = useCallback((targetId: string) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    setTrackingTick((prev) => prev + 1);
    window.setTimeout(() => {
      el.scrollIntoView();
    }, 220);
  }, []);

  return (
    <div className={ready ? 'go' : ''}>
      <BackgroundEffects trackingTick={trackingTick} onReady={handleReady} />
      <Navbar onNavigate={handleNavigate} />

      <main>
        <HeroSection onNavigate={handleNavigate} />
        <EngineTelemetryBar />
        <AboutSection />
        <SkillsSection />
        <HorrorTransitionCorridor />
        <ProjectsSection
          onOpenLightbox={(project, index) => setLightbox({ project, index })}
        />
        <ContactSection />
      </main>

      <LightboxModal
        selection={lightbox}
        onClose={() => setLightbox(null)}
        onChangeIndex={(index) =>
          setLightbox((prev) => (prev ? { ...prev, index } : null))
        }
      />
    </div>
  );
}
