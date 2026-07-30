import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import profileImg from '../../assets/profile.png';

const roles = [
  'VLSI Design Engineer',
  'ECE B.Tech Student',
  'RTL Designer',
  'Web Developer',
  'Circuit Enthusiast',
];

export default function Hero() {
  const textRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const charIndexRef = useRef(0);
  const deletingRef = useRef(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;

    function type() {
      const current = roles[indexRef.current];
      if (!deletingRef.current) {
        el.textContent = current.slice(0, charIndexRef.current + 1);
        charIndexRef.current++;
        if (charIndexRef.current === current.length) {
          deletingRef.current = true;
          timer = setTimeout(type, 1800);
          return;
        }
        timer = setTimeout(type, 80);
      } else {
        el.textContent = current.slice(0, charIndexRef.current - 1);
        charIndexRef.current--;
        if (charIndexRef.current === 0) {
          deletingRef.current = false;
          indexRef.current = (indexRef.current + 1) % roles.length;
          timer = setTimeout(type, 500);
          return;
        }
        timer = setTimeout(type, 45);
      }
    }

    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-between px-[8%] py-[120px] gap-16 overflow-hidden max-w-[1400px] mx-auto flex-col-reverse lg:flex-row">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 max-w-[600px] text-center lg:text-left"
      >
        <p className="font-['Inter'] text-sm font-light tracking-widest uppercase text-[var(--text-secondary)] mb-1">I'm</p>
        <h1 className="font-['Space_Grotesk'] text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-tight mb-5 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent whitespace-nowrap">
          Akash Munna Prasad
        </h1>
        <p className="text-base text-[var(--text-secondary)] tracking-wider mb-1">I am passionate</p>
        <span
          ref={textRef}
          className="block font-['Space_Grotesk'] text-[clamp(1.3rem,3vw,2rem)] font-bold text-[var(--accent-cyan)] min-h-[2.5rem] mb-8"
          style={{ textShadow: '0 0 24px var(--accent-cyan)' }}
        />
        <div className="flex gap-5 flex-wrap justify-center lg:justify-start">
          <button className="font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 px-8 rounded border-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,212,255,0.4)]">
            Download CV
          </button>
          <Link
            to="/projects"
            className="font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 px-8 rounded border-2 border-[var(--accent-cyan)] text-[var(--accent-cyan)] no-underline cursor-pointer transition-all hover:bg-[var(--accent-glow)] hover:-translate-y-1"
          >
            View Projects
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-4 flex-wrap justify-center lg:justify-start mt-8"
        >
          {[
            { icon: 'fab fa-github', href: 'https://github.com/AkashMunnaPrasad', label: 'GitHub' },
            { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/in/akash-munna-prasad-14014533a/', label: 'LinkedIn' },
            { icon: 'fas fa-envelope', href: 'mailto:deskamp33@gmail.com', label: 'Email' },
          ].map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.15, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.2, y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
              className="group relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-[var(--border)] text-[var(--text-secondary)] no-underline text-lg transition-colors duration-300 hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-glow)]"
            >
              <i className={s.icon} />
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[0.6rem] font-semibold tracking-widest uppercase text-[var(--accent-cyan)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {s.label}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 max-w-[480px] flex justify-center items-center"
      >
        <div className="relative w-[480px] h-[480px] flex items-center justify-center max-sm:w-[320px] max-sm:h-[320px]">
          <div className="absolute w-[460px] h-[460px] max-sm:w-[300px] max-sm:h-[300px] rounded-full border-[1.5px] border-dashed border-[rgba(0,212,255,0.22)] animate-spin" style={{ animationDuration: '40s' }} />
          <div className="absolute w-[400px] h-[400px] max-sm:w-[260px] max-sm:h-[260px] rounded-full border border-solid border-[rgba(123,47,255,0.18)] animate-spin" style={{ animationDuration: '28s', animationDirection: 'reverse' }} />
          <div className="relative w-[340px] h-[340px] max-sm:w-[220px] max-sm:h-[220px] z-10">
            <div className="w-full h-full rounded-[22px] overflow-hidden">
              <img src={profileImg} alt="Akash Munna Prasad" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[rgba(0,212,255,0.4)] rounded-full px-8 py-2.5 text-[0.8rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] flex items-center gap-3 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md whitespace-nowrap max-sm:bottom-[46px]">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse" />
            Available for opportunities
          </div>
        </div>
      </motion.div>
    </section>
  );
}
