import { motion } from 'framer-motion';
import profileImg from '../assets/profile.png';

const timeline = [
  {
    year: '2023 - Present',
    title: 'B.Tech in Electronics & Communication',
    place: 'Meerut Institute of Technology',
    desc: 'Focused on VLSI design, digital circuits, and embedded systems. Working on RTL design projects using Verilog and FPGA platforms.',
    tags: ['VLSI', 'Verilog', 'FPGA', 'Digital Circuits'],
  },
  {
    year: '2022 - 2023',
    title: 'Web Development Journey',
    place: 'Self-Learning & Projects',
    desc: 'Built full-stack web applications using React, Node.js, and modern CSS. Developed multiple portfolio and utility projects.',
    tags: ['React', 'Node.js', 'TypeScript', 'Tailwind'],
  },
  {
    year: '2021',
    title: 'Higher Secondary (XII)',
    place: 'CBSE Board',
    desc: 'Completed higher secondary education with a focus on Science and Mathematics.',
    tags: ['Science', 'Mathematics'],
  },
];

const interests = [
  { icon: 'fas fa-microchip', title: 'VLSI Design', desc: 'RTL design, synthesis, and timing analysis for digital circuits.' },
  { icon: 'fas fa-code', title: 'Web Development', desc: 'Building modern, performant web applications with React and Node.js.' },
  { icon: 'fas fa-wave-square', title: 'Signal Processing', desc: 'DSP algorithms, FFT analysis, and filter design using Python.' },
  { icon: 'fas fa-network-wired', title: 'IoT', desc: 'Embedded systems, sensor integration, and real-time data processing.' },
  { icon: 'fas fa-brain', title: 'Machine Learning', desc: 'Applying ML to hardware design and signal analysis problems.' },
  { icon: 'fas fa-cogs', title: 'Embedded Systems', desc: 'Microcontroller programming and hardware-software co-design.' },
];

export default function About() {
  return (
    <>
      <section className="relative min-h-[340px] flex items-center justify-center overflow-hidden pt-[140px] pb-20 px-[5%]">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--accent-cyan)] opacity-10 animate-spin" style={{ animationDuration: '50s' }} />
        </div>
        <div className="relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="font-['Space_Grotesk'] text-[clamp(2.6rem,7vw,5rem)] font-black tracking-[0.1em] uppercase">
            ABOUT <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">ME</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-sm text-[var(--text-secondary)] tracking-widest uppercase mt-4 font-medium">
            ECE Engineer · VLSI Aspirant
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-[8%] bg-[var(--bg-primary)]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="relative w-[360px] mx-auto">
            <img src={profileImg} alt="Akash Munna Prasad" className="w-full object-cover rounded-[var(--radius-xl)]" />
            <div className="absolute bottom-[-22px] left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] px-5 py-3 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10 backdrop-blur-md whitespace-nowrap">
              <i className="fas fa-microchip text-[var(--accent-cyan)] text-xl" />
              <div>
                <p className="font-['Space_Grotesk'] text-xs font-bold text-[var(--text-primary)] tracking-wider">VLSI Enthusiast</p>
                <p className="text-[0.7rem] text-[var(--text-muted)]">RTL · Verilog · FPGA</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="font-['Space_Grotesk'] text-[clamp(1.6rem,3.5vw,2.4rem)] font-black tracking-wider uppercase leading-tight mb-6">
              Electronics & Communication <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">Engineer</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
              I am Akash Munna Prasad, a 4th-year B.Tech student in Electronics and Communication Engineering (ECE) with a strong passion for VLSI Design and semiconductor technology. My technical expertise includes Digital Electronics, CMOS VLSI Design, RTL-to-GDSII Design Flow, Verilog HDL, FPGA Design, and Digital Circuit Design. I am committed to building efficient digital systems and continuously expanding my knowledge in modern chip design methodologies.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
              To strengthen my practical skills, I successfully completed a 2-month research-based internship at NIT Delhi, where I gained hands-on experience in VLSI design and digital hardware development. I also completed a 2-month online VLSI internship through Internshala, powered by IITM Pravartak, focusing on Verilog, FPGA implementation, and digital system design. Additionally, I completed a 1-month Embedded Systems internship at ESTC Ramnagar (MSME), where I worked on embedded hardware and microcontroller-based applications.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
              Along with these internships, I have earned NPTEL certifications in CMOS Digital VLSI Design and Digital Design with Verilog, which have strengthened my understanding of semiconductor devices, CMOS circuits, HDL-based design, and digital system implementation.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
              I am passionate about pursuing a career in the semiconductor industry and aspire to contribute to the design and development of high-performance, low-power integrated circuits as a VLSI Design Engineer. I enjoy learning new technologies, solving engineering challenges, and continuously improving my technical expertise through practical projects, research, and industry-oriented training.
            </p>
            <div className="flex flex-wrap gap-3 my-6">
              {['B.Tech ECE', 'CMOS VLSI', 'RTL / Verilog', 'FPGA'].map((b) => (
                <span key={b} className="px-4 py-1.5 rounded-full border border-[var(--border)] text-xs font-medium tracking-wider uppercase text-[var(--accent-cyan)] bg-[var(--accent-glow)]">
                  {b}
                </span>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap items-center">
              <a href="/resume" className="font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 px-8 rounded bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[#060b14] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_10px_36px_rgba(0,212,255,0.4)]">
                View Resume
              </a>
              <a href="/contact" className="font-['Inter'] text-sm font-semibold tracking-widest uppercase py-3.5 px-8 rounded border-2 border-[var(--accent-cyan)] text-[var(--accent-cyan)] no-underline transition-all hover:bg-[var(--accent-glow)] hover:-translate-y-1">
                Contact Me
              </a>
              <a href="https://github.com/AkashMunnaPrasad" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[var(--border)] text-[var(--text-secondary)] no-underline text-lg transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-glow)] hover:-translate-y-1">
                <i className="fab fa-github" />
              </a>
              <a href="mailto:deskamp33@gmail.com" className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[var(--border)] text-[var(--text-secondary)] no-underline text-lg transition-all hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-glow)] hover:-translate-y-1">
                <i className="fas fa-envelope" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-[8%] bg-[var(--bg-primary)]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: 'fas fa-project-diagram', label: 'Projects Completed', val: '12+' },
            { icon: 'fas fa-code', label: 'Technologies Used', val: '10+' },
            { icon: 'fas fa-trophy', label: 'Certifications', val: '5+' },
          ].map((f) => (
            <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] py-7 px-6 text-center transition-all hover:border-[var(--border-hover)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-glow)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              <p className="text-2xl text-[var(--accent-cyan)] mb-3" style={{ textShadow: '0 0 16px var(--accent-cyan)' }}>
                <i className={f.icon} />
              </p>
              <p className="text-[0.7rem] tracking-widest uppercase text-[var(--text-muted)] mb-1.5">{f.label}</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{f.val}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-[8%] bg-[var(--bg-secondary)]">
        <div className="text-center mb-14">
          <h2 className="font-['Space_Grotesk'] text-[clamp(1.8rem,4vw,2.8rem)] font-black tracking-wider uppercase">
            MY <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">JOURNEY</span>
          </h2>
        </div>
        <div className="max-w-[860px] mx-auto pl-10 relative">
          <div className="absolute top-0 bottom-0 left-[18px] w-0.5 bg-gradient-to-b from-[var(--accent-cyan)] via-[var(--accent-violet)] to-transparent" />
          {timeline.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative mb-10 pl-8 group">
              <div className="absolute left-[-2.5rem] top-0 w-[38px] h-[38px] rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent-cyan)] flex items-center justify-center text-[var(--accent-cyan)] z-[2] shadow-[0_0_16px_rgba(0,212,255,0.25)] transition-all group-hover:bg-[rgba(0,212,255,0.15)] group-hover:shadow-[0_0_28px_rgba(0,212,255,0.45)]">
                <i className="fas fa-graduation-cap text-sm" />
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 transition-all group-hover:border-[var(--border-hover)] group-hover:translate-x-1 group-hover:shadow-[var(--shadow-glow)]">
                <span className="font-['Space_Grotesk'] text-[0.72rem] font-bold tracking-widest text-[var(--accent-cyan)] uppercase bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] rounded-full px-3 py-0.5 inline-block mb-3">
                  {item.year}
                </span>
                <h3 className="font-['Space_Grotesk'] text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] mt-2 mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--accent-violet)] flex items-center gap-1.5 mb-3 font-medium">
                  <i className="fas fa-map-marker-alt text-xs" /> {item.place}
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[0.66rem] font-bold px-2.5 py-0.5 bg-[rgba(0,212,255,0.1)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.25)] rounded-full tracking-wider uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-[8%] bg-[var(--bg-primary)]">
        <div className="text-center mb-14">
          <h2 className="font-['Space_Grotesk'] text-[clamp(1.8rem,4vw,2.8rem)] font-black tracking-wider uppercase">
            MY <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">INTERESTS</span>
          </h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interests.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] py-8 px-7 text-center transition-all hover:border-[var(--border-hover)] hover:-translate-y-2 hover:shadow-[var(--shadow-glow)] relative overflow-hidden group">
              <p className="text-3xl text-[var(--accent-cyan)] mb-4" style={{ textShadow: '0 0 20px var(--accent-cyan)' }}>
                <i className={item.icon} />
              </p>
              <h4 className="font-['Space_Grotesk'] text-sm font-extrabold tracking-wider uppercase text-[var(--text-primary)] mb-3">{item.title}</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
