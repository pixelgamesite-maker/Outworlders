import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Config ────────────────────────────────────────────────────────
const FOLLOW_URL = 'https://x.com/outworld3rs?s=21';
const TWEET_URL  = 'https://x.com/outworld3rs/status/2064054171070828567';
const EYES_URL   = '/Eyes.png';

const QUOTES = [
  "An Outworlder is not someone who left the world, but someone the world could no longer fully contain.",
  "We do not become Outworlders in departure, but in recognition — the moment we see ourselves without illusion.",
  "The Outworlder is what remains when identity stops asking to be understood and starts asking to be witnessed.",
  "You were never pulled into another world. You simply noticed the seams of this one.",
  "Not all transformation is movement. Some of it is the collapse of who you thought you were.",
  "The Outworlder does not lose humanity — they outgrow the version of it that was borrowed.",
  "There is no portal. Only perception breaking under the weight of truth.",
  "Every Outworlder begins the same way: a human who looked too long at themselves in silence.",
  "The world did not reject them. It simply stopped agreeing with their form.",
  "Outworlders are what people become when reality stops negotiating.",
];

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#∆◊◈▓░▒█▀▄';

function useGlitchText(target: string, isActive: boolean) {
  const [display, setDisplay] = useState('');
  const frameRef = useRef<number>(0);
  const iterRef  = useRef(0);

  useEffect(() => {
    if (!isActive) { setDisplay(''); return; }
    iterRef.current = 0;
    const totalFrames = target.length * 2;

    const animate = () => {
      iterRef.current++;
      const progress = iterRef.current / totalFrames;
      setDisplay(
        target.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (i / target.length < progress) return char;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join('')
      );
      if (iterRef.current < totalFrames + 8) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, isActive]);

  return display;
}

function QuoteCycler() {
  const [idx, setIdx]       = useState(0);
  const [active, setActive] = useState(true);
  const glitched = useGlitchText(QUOTES[idx], active);

  useEffect(() => {
    const cycle = setInterval(() => {
      setActive(false);
      setTimeout(() => { setIdx(prev => (prev + 1) % QUOTES.length); setActive(true); }, 400);
    }, 5500);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
          style={{ fontFamily: "'Courier Prime', 'Courier New', monospace", fontSize: 'clamp(0.85rem, 2.2vw, 1.05rem)', color: '#c8ff00', lineHeight: 1.85, letterSpacing: '0.03em', textAlign: 'center', maxWidth: 680, padding: '0 1.5rem', textShadow: '0 0 18px rgba(200,255,0,0.35)', wordBreak: 'break-word' }}>
          {glitched}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

const ScanLines = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)', mixBlendMode: 'overlay' }} />
);

const CRTFlicker = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Share+Tech+Mono&display=swap');
      @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.92} 94%{opacity:1} 97%{opacity:0.97} 98%{opacity:1} }
      @keyframes ticker-scroll { 0%{transform:translateX(100vw)} 100%{transform:translateX(-100%)} }
      @keyframes eyes-pulse { 0%,100%{filter:drop-shadow(0 0 8px rgba(200,255,0,0.4))} 50%{filter:drop-shadow(0 0 22px rgba(200,255,0,0.85))} }
      @keyframes closed-pulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
      .crt-wrap { animation: flicker 8s infinite; }
      .ticker-inner { display: inline-block; white-space: nowrap; animation: ticker-scroll 40s linear infinite; }
      .eyes-img { animation: eyes-pulse 3s ease-in-out infinite; }
      .closed-badge { animation: closed-pulse 3s ease-in-out infinite; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #050505; }
      ::selection { background: #c8ff00; color: #000; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: #050505; }
      ::-webkit-scrollbar-thumb { background: rgba(200,255,0,0.3); }
      @keyframes vline { 0%,100%{height:0;opacity:0} 10%,90%{opacity:1} 50%{height:100%;opacity:0.6} }
      .vline { animation: vline 8s ease-in-out infinite; }
    `}</style>
  </>
);

function Ticker() {
  const items = ['SIGNAL CLOSED', '∆', 'ALLOWLIST SEALED', '◊', 'TRANSMISSION ENDED', '∆', 'WATCH @OUTWORLD3RS', '◊', 'SIGNAL CLOSED', '∆'];
  return (
    <div style={{ width: '100%', overflow: 'hidden', borderBottom: '1px solid rgba(200,255,0,0.2)', height: 32, display: 'flex', alignItems: 'center', background: 'rgba(200,255,0,0.04)' }}>
      <div className="ticker-inner" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem', color: 'rgba(200,255,0,0.5)', letterSpacing: '0.22em' }}>
        {[...items, ...items].map((t, i) => <span key={i} style={{ marginRight: '3rem' }}>{t}</span>)}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="crt-wrap" style={{ minHeight: '100vh', background: '#050505', color: '#c8ff00', fontFamily: "'Share Tech Mono', monospace", position: 'relative', overflow: 'hidden' }}>
      <CRTFlicker />
      <ScanLines />

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[15, 35, 65, 85].map((left, i) => (
          <div key={i} className="vline" style={{ position: 'absolute', left: `${left}%`, top: 0, width: 1, background: 'rgba(200,255,0,0.04)', animationDelay: `${i * 2.1}s` }} />
        ))}
      </div>

      <Ticker />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 32px)', padding: '3rem 1.5rem' }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} style={{ marginBottom: '1.5rem' }}>
          <img src={EYES_URL} alt="" className="eyes-img"
            style={{ width: 'clamp(80px, 20vw, 140px)', display: 'block', filter: 'drop-shadow(0 0 12px rgba(200,255,0,0.5)) brightness(0) saturate(100%) invert(85%) sepia(60%) saturate(400%) hue-rotate(30deg)' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.58rem', letterSpacing: '0.38em', color: 'rgba(200,255,0,0.35)', marginBottom: '1.25rem', fontFamily: "'Share Tech Mono', monospace" }}>
            ∆ &nbsp; SIGNAL TRANSMISSION &nbsp; ◊
          </div>
          <h1 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 'clamp(2.8rem, 10vw, 6.5rem)', color: '#c8ff00', letterSpacing: '0.12em', textShadow: '0 0 40px rgba(200,255,0,0.3)', lineHeight: 1, whiteSpace: 'nowrap' }}>
            OUTWORLDERS
          </h1>
        </motion.div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          style={{ width: '100%', maxWidth: 480, height: 1, background: 'rgba(200,255,0,0.2)', margin: '2.5rem 0', transformOrigin: 'left' }} />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} style={{ width: '100%' }}>
          <QuoteCycler />
        </motion.div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.9 }}
          style={{ width: '100%', maxWidth: 480, height: 1, background: 'rgba(200,255,0,0.2)', margin: '2.5rem 0', transformOrigin: 'right' }} />

        {/* ── Closed State CTA ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

          {/* Closed badge */}
          <div className="closed-badge" style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            border: '1px solid rgba(200,255,0,0.25)',
            background: 'rgba(200,255,0,0.04)',
            padding: '0.45rem 1.1rem',
            marginBottom: '0.25rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8ff00', boxShadow: '0 0 8px rgba(200,255,0,0.8)', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.24em', color: 'rgba(200,255,0,0.7)', textTransform: 'uppercase' }}>
              Signal Channel Sealed
            </span>
          </div>

          {/* Disabled button */}
          <button disabled
            style={{
              background: 'transparent',
              border: '1px solid rgba(200,255,0,0.2)',
              color: 'rgba(200,255,0,0.2)',
              fontFamily: "'Share Tech Mono', monospace",
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              padding: '1rem 3rem',
              cursor: 'not-allowed',
              boxShadow: 'none',
              transition: 'none',
            }}>
            ALLOWLIST CLOSED ◈
          </button>

          <p style={{ fontSize: '0.58rem', color: 'rgba(200,255,0,0.3)', letterSpacing: '0.18em', marginTop: '0.25rem', fontFamily: "'Share Tech Mono', monospace", textAlign: 'center' }}>
            REGISTRATION ENDED · WATCH @OUTWORLD3RS FOR UPDATES
          </p>
        </motion.div>

        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', fontSize: '0.52rem', color: 'rgba(200,255,0,0.18)', letterSpacing: '0.14em', fontFamily: "'Share Tech Mono', monospace" }}>
          OUTWORLD3RS · {new Date().getFullYear()} · ◈
        </div>
        <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', fontSize: '0.52rem', color: 'rgba(200,255,0,0.18)', letterSpacing: '0.14em', fontFamily: "'Share Tech Mono', monospace" }}>
          X: @OUTWORLD3RS
        </div>
      </div>
    </div>
  );
}
