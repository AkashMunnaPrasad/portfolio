import { motion } from 'framer-motion';

interface PageHeroProps {
  title: string;
  subtitle: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="relative min-h-[340px] flex items-center justify-center overflow-hidden pt-[140px] pb-20 px-[5%]">
      <div className="absolute inset-0 z-0" style={{
        background: `radial-gradient(ellipse at 30% 50%, rgba(123,47,255,0.14) 0%, transparent 60%),
                     radial-gradient(ellipse at 70% 40%, rgba(0,212,255,0.12) 0%, transparent 55%),
                     var(--bg-primary)`
      }} />
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--accent-cyan)] opacity-10 animate-spin" style={{ animationDuration: '50s' }} />
        <div className="absolute w-[340px] h-[340px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--accent-violet)] opacity-10 animate-spin" style={{ animationDuration: '35s', animationDirection: 'reverse' }} />
      </div>
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-['Space_Grotesk'] text-[clamp(2.6rem,7vw,5rem)] font-black tracking-[0.1em] uppercase leading-tight mb-4"
        >
          {title.split(' ').map((w, i) =>
            w === title.split(' ').pop() ? <span key={i} className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">{w}</span> : w + ' '
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-base text-[var(--text-secondary)] tracking-widest uppercase font-medium"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
