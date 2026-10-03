import { useEffect, useRef, useState, useCallback } from 'react';
import CharacterCanvas from './CharacterCanvas';
import './App.css';

export default function App() {
  const cursorRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const mousePosRef = useRef({ x: -100, y: -100 });

  /* ── Smooth custom cursor (separate from canvas loop) ── */
  useEffect(() => {
    let rafId;
    let cx = -100, cy = -100;

    const onMove = (e) => {
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const animate = () => {
      // Slightly lag behind for a silky feel
      cx += (mousePosRef.current.x - cx) * 0.35;
      cy += (mousePosRef.current.y - cy) * 0.35;
      if (cursorRef.current) {
        cursorRef.current.style.left = cx + 'px';
        cursorRef.current.style.top = cy + 'px';
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  /* ── Hover detection for interactive elements ── */
  useEffect(() => {
    const onOver = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover]')) setHovered(true);
    };
    const onOut = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover]')) setHovered(false);
    };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    <>
      {/* Custom cursor dot */}
      <div
        ref={cursorRef}
        id="custom-cursor"
        className={hovered ? 'hovering' : ''}
      />

      {/* ── HERO SECTION ── */}
      <section className="hero">
        {/* Decorative grain overlay */}
        <div className="hero__grain" aria-hidden="true" />

        {/* Left: text content */}
        <div className="hero__content">
          <p className="hero__eyebrow">
            <span className="eyebrow__line" />
            Creative Developer
          </p>

          <h1 className="hero__title">
            <span className="hero__title-line">Jessica</span>
            <span className="hero__title-line hero__title-line--accent">Xavier</span>
          </h1>

          <p className="hero__subtitle">
            Crafting digital experiences that blur the line between art and technology.
          </p>

          <div className="hero__tags" aria-label="Specialisations">
            {['UI/UX Design', 'React', 'Motion', 'Branding'].map((tag) => (
              <span key={tag} className="hero__tag">{tag}</span>
            ))}
          </div>

          <div className="hero__cta">
            <a href="#work" className="btn btn--primary" data-cursor-hover>
              View Work
            </a>
            <a href="#contact" className="btn btn--ghost" data-cursor-hover>
              Get in Touch
            </a>
          </div>

          {/* Social links */}
          <div className="hero__social">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" data-cursor-hover aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" data-cursor-hover aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" data-cursor-hover aria-label="Dribbble">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4.01-.814l-.004-.002zm-9.69-2.223c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C9.46 13.401 4.094 13.59 3.61 13.rotates7l.003.01c-.12.94-.12 1.9 0 2.84.14.94.46 1.83.905 2.64zM3.75 11.98c.492-.013 4.882-.237 9.517-1.57-.44-.82-.92-1.64-1.44-2.44-4.77 1.42-9.432 1.38-9.65 1.373v.14c0 .88.12 1.73.34 2.54l1.23-.043zm4.68-7.13c.52.77 1.01 1.56 1.45 2.38 3.61-1.35 5.13-3.41 5.31-3.68-1.58-1.02-3.47-1.62-5.5-1.62-.76 0-1.5.09-2.21.26l.95 2.66zm7.27-.74c-.22.3-1.88 2.47-5.64 3.98.26.53.51 1.07.74 1.61.09.22.18.44.26.67 3.39-.43 6.77.26 7.07.33-.03-2.45-.93-4.69-2.43-6.59z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right: animated character */}
        <div className="hero__character-wrap">
          <CharacterCanvas />
        </div>

        {/* Scroll hint */}
        <div className="hero__scroll-hint" aria-hidden="true">
          <span className="scroll-hint__label">Scroll</span>
          <div className="scroll-hint__track">
            <div className="scroll-hint__dot" />
          </div>
        </div>
      </section>
    </>
  );
}
