import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-[8%] py-24 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p
          className="font-['Space_Grotesk'] text-[clamp(5rem,18vw,11rem)] font-black leading-none bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent"
          style={{ textShadow: '0 0 60px rgba(0,212,255,0.15)' }}
        >
          404
        </p>
        <h1 className="font-['Space_Grotesk'] text-xl md:text-2xl font-black tracking-widest uppercase mt-4 mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-[420px] mx-auto mb-8 leading-relaxed">
          The page you are looking for does not exist, or it may have moved.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="font-['Inter'] text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded no-underline bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] transition-all hover:-translate-y-1 hover:shadow-[0_10px_36px_rgba(0,212,255,0.4)]"
          >
            Back Home
          </Link>
          <Link
            to="/projects"
            className="font-['Inter'] text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded no-underline border-2 border-[var(--accent-cyan)] text-[var(--accent-cyan)] transition-all hover:bg-[var(--accent-glow)] hover:-translate-y-1"
          >
            View Projects
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
