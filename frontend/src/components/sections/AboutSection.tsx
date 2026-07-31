import { motion } from 'framer-motion';
import profileImg from '../../assets/profile.png';

export default function AboutSection() {
  return (
    <section className="py-[120px] px-[8%] bg-[var(--bg-secondary)]">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-[320px] mx-auto"
        >
          <div className="w-full h-[380px] rounded-[var(--radius-xl)] border-2 border-[rgba(0,212,255,0.3)] overflow-hidden relative z-[2] bg-[var(--bg-card)]">
            <img src={profileImg} alt="Akash Munna Prasad" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-[-8px] rounded-[var(--radius-xl)] bg-gradient-to-br from-[rgba(0,212,255,0.15)] to-[rgba(123,47,255,0.15)] blur-lg z-0" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="font-['Space_Grotesk'] text-[clamp(2rem,4vw,3rem)] font-black tracking-widest uppercase mb-1">
            ABOUT <span className="text-[var(--accent-cyan)]">ME</span>
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--accent-violet)] mb-5">ECE Engineer · VLSI Aspirant</p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-7">
            I am a B.Tech student in Electronics & Communication Engineering with a strong passion for VLSI design
            and semiconductor technologies. I am deeply interested in RTL design, digital circuits, and chip architecture.
            Alongside my core ECE focus, I have built practical skills in web development — crafting performant,
            visually polished interfaces. My goal is to contribute to India's growing semiconductor ecosystem as a
            VLSI engineer.
          </p>
          <div className="flex flex-wrap gap-3 mb-7">
            {['B.Tech ECE', 'VLSI Design', 'RTL / Verilog', 'Web Dev'].map((b) => (
              <span key={b} className="px-4 py-1.5 rounded-full border border-[var(--border)] text-xs font-medium tracking-wider uppercase text-[var(--accent-cyan)] bg-[var(--accent-glow)] transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_14px_rgba(0,212,255,0.2)]">
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
