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
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            I am Akash Munna Prasad, a 4th-year B.Tech student in Electronics and Communication Engineering (ECE)
            with a strong passion for VLSI Design and semiconductor technology. My technical expertise includes
            Digital Electronics, CMOS VLSI Design, RTL-to-GDSII Design Flow, Verilog HDL, FPGA Design, and Digital
            Circuit Design. I am committed to building efficient digital systems and continuously expanding my
            knowledge in modern chip design methodologies.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            To strengthen my practical skills, I successfully completed a 2-month research-based internship at
            NIT Delhi, where I gained hands-on experience in VLSI design and digital hardware development. I also
            completed a 2-month online VLSI internship through Internshala, powered by IITM Pravartak, focusing on
            Verilog, FPGA implementation, and digital system design. Additionally, I completed a 1-month Embedded
            Systems internship at ESTC Ramnagar (MSME), where I worked on embedded hardware and
            microcontroller-based applications.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            Along with these internships, I have earned NPTEL certifications in CMOS Digital VLSI Design and
            Digital Design with Verilog, which have strengthened my understanding of semiconductor devices, CMOS
            circuits, HDL-based design, and digital system implementation.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-7">
            I am passionate about pursuing a career in the semiconductor industry and aspire to contribute to the
            design and development of high-performance, low-power integrated circuits as a VLSI Design Engineer.
            I enjoy learning new technologies, solving engineering challenges, and continuously improving my
            technical expertise through practical projects, research, and industry-oriented training.
          </p>
          <div className="flex flex-wrap gap-3 mb-7">
            {['Digital Electronics', 'CMOS VLSI', 'RTL / Verilog', 'FPGA'].map((b) => (
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
