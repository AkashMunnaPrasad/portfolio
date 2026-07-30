const supabase = require('./src/config/db');

async function seed() {
  console.log('Seeding database...\n');

  // ── Skills ──
  const skills = [
    { name: 'React', category: 'frontend', percent: 85, level: 'Advanced', icon: 'fab fa-react', sort_order: 1 },
    { name: 'TypeScript', category: 'frontend', percent: 80, level: 'Advanced', icon: 'fab fa-js', sort_order: 2 },
    { name: 'Tailwind CSS', category: 'frontend', percent: 88, level: 'Advanced', icon: 'fab fa-css3-alt', sort_order: 3 },
    { name: 'Node.js', category: 'backend', percent: 78, level: 'Intermediate', icon: 'fab fa-node-js', sort_order: 4 },
    { name: 'Express', category: 'backend', percent: 75, level: 'Intermediate', icon: 'fas fa-server', sort_order: 5 },
    { name: 'PostgreSQL', category: 'backend', percent: 70, level: 'Intermediate', icon: 'fas fa-database', sort_order: 6 },
    { name: 'Git', category: 'tools', percent: 82, level: 'Advanced', icon: 'fab fa-git-alt', sort_order: 7 },
    { name: 'Verilog', category: 'vlsi', percent: 72, level: 'Intermediate', icon: 'fas fa-microchip', sort_order: 8 },
    { name: 'MATLAB', category: 'tools', percent: 65, level: 'Intermediate', icon: 'fas fa-chart-line', sort_order: 9 },
    { name: 'Python', category: 'tools', percent: 68, level: 'Intermediate', icon: 'fab fa-python', sort_order: 10 },
    { name: 'Supabase', category: 'backend', percent: 72, level: 'Intermediate', icon: 'fas fa-cloud', sort_order: 11 },
    { name: 'Docker', category: 'tools', percent: 55, level: 'Beginner', icon: 'fab fa-docker', sort_order: 12 },
  ];
  const { error: err1 } = await supabase.from('skills').insert(skills);
  if (err1) console.error('Skills error:', err1.message); else console.log(`✓ ${skills.length} skills inserted`);

  // ── Projects ──
  const projects = [
    {
      title: 'RISC-V Processor Design',
      slug: 'risc-v-processor-design',
      category: 'vlsi',
      description: 'Designed a 5-stage pipelined RISC-V processor in Verilog with hazard detection and forwarding units. Implemented on FPGA for verification.',
      content: `## Overview\n\nDesigned a 5-stage pipelined RISC-V processor from scratch using Verilog. The processor implements the RV32I base integer instruction set and includes hazard detection, forwarding units, and a branch predictor.\n\n## Key Features\n\n- **5-Stage Pipeline**: Fetch, Decode, Execute, Memory, Writeback\n- **Hazard Detection**: Data and control hazard resolution\n- **Forwarding Units**: Bypass logic to reduce stalls\n- **Branch Prediction**: Static always-not-taken predictor\n- **FPGA Verified**: Synthesized and tested on Xilinx FPGA\n\n## Architecture\n\nThe processor follows a classic RISC-V microarchitecture with separate instruction and data memories. The pipeline stages are separated by registers, and control signals are generated in the decode stage.\n\n### Pipeline Stages\n\n1. **IF (Instruction Fetch)**: Fetches instruction from memory using PC\n2. **ID (Instruction Decode)**: Decodes instruction and reads register file\n3. **EX (Execute)**: Performs ALU operations or address calculation\n4. **MEM (Memory Access)**: Reads/writes data memory\n5. **WB (Writeback)**: Writes result back to register file\n\n## Results\n\nSuccessfully verified on FPGA running at 50MHz with all RV32I instructions working correctly. The design passes all testbench cases including hazard scenarios.`,
      tags: ['Verilog', 'RISC-V', 'FPGA', 'Pipeline'],
      live_url: '', repo_url: 'https://github.com/',
      featured: true, published: true,
    },
    {
      title: 'Portfolio Website',
      slug: 'portfolio-website',
      category: 'web',
      description: 'Full-stack portfolio with React, TypeScript, Tailwind, Node.js, and Supabase. Features blog, admin panel, and visitor analytics.',
      content: `## Overview\n\nA modern full-stack portfolio website built with React, TypeScript, and Tailwind CSS on the frontend, with Node.js/Express backend and Supabase for database and storage.\n\n## Features\n\n- **Responsive Design**: Works on all devices with dark/light theme\n- **Blog System**: Full CRUD with markdown content\n- **Admin Panel**: Manage projects, skills, blog, and analytics\n- **Visitor Analytics**: Track page views and visitor demographics\n- **Contact Form**: With email notifications\n\n## Tech Stack\n\n| Layer | Technology |\n|-------|-----------|\n| Frontend | React 19, TypeScript, Tailwind CSS 4, Framer Motion |\n| Backend | Node.js, Express 5 |\n| Database | Supabase (PostgreSQL) |\n| Storage | Supabase Storage |\n| Auth | JWT with bcrypt |\n\n## Architecture\n\nThe application follows a client-server architecture with the React frontend communicating with the Express API via REST endpoints.`,
      tags: ['React', 'TypeScript', 'Node.js', 'Supabase'],
      live_url: 'http://localhost:5173', repo_url: 'https://github.com/',
      featured: true, published: true,
    },
    {
      title: 'IoT Weather Station',
      slug: 'iot-weather-station',
      category: 'iot',
      description: 'ESP32-based weather station with DHT22 sensor, real-time data logging to cloud, and dashboard visualization.',
      content: `## Overview\n\nAn IoT-based weather monitoring system built around the ESP32 microcontroller. The system collects temperature and humidity data using a DHT22 sensor and transmits it to the cloud for real-time visualization.\n\n## Hardware\n\n- **ESP32**: WiFi-enabled microcontroller\n- **DHT22**: Digital temperature and humidity sensor\n- **OLED Display**: Local display (optional)\n- **Power**: USB-C powered with battery backup option\n\n## Software\n\n- **Firmware**: Arduino/C++ with ESP-IDF framework\n- **Cloud**: Supabase for data storage\n- **Dashboard**: Real-time charts with auto-refresh\n\n## Features\n\n- Real-time temperature and humidity monitoring\n- Historical data with date range filtering\n- Email alerts for threshold breaches\n- Low power mode for battery operation\n- Over-the-air (OTA) firmware updates`,
      tags: ['ESP32', 'IoT', 'Sensor', 'Dashboard'],
      live_url: '', repo_url: 'https://github.com/',
      featured: false, published: true,
    },
    {
      title: 'Signal Processing Toolkit',
      slug: 'signal-processing-toolkit',
      category: 'python',
      description: 'Python toolkit for DSP algorithms including FFT analysis, filter design, and signal visualization using NumPy and Matplotlib.',
      content: `## Overview\n\nA comprehensive Python toolkit for digital signal processing tasks. The library provides implementations of common DSP algorithms with a focus on educational clarity and practical usability.\n\n## Modules\n\n### FFT Analysis\n- Fast Fourier Transform implementation\n- Spectrogram generation\n- Frequency domain filtering\n\n### Filter Design\n- FIR and IIR filter design\n- Butterworth, Chebyshev, and Elliptic filters\n- Filter visualization (magnitude/phase response)\n\n### Signal Visualization\n- Time-domain plots\n- Frequency-domain plots\n- Spectrograms and waterfall plots\n\n## Usage Examples\n\n\`\`\`python\nfrom dsp_toolkit import FFT, FilterDesign\nimport numpy as np\n\n# Generate a test signal\nfs = 1000\nt = np.linspace(0, 1, fs)\nsignal = np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 120 * t)\n\n# Compute FFT\nfft = FFT.compute(signal, fs)\nfft.plot()\n\n# Design a low-pass filter\nlp_filter = FilterDesign.lowpass(cutoff=100, fs=fs, order=4)\nfiltered = lp_filter.apply(signal)\n\`\`\`\n\n## Dependencies\n- NumPy\n- SciPy\n- Matplotlib`,
      tags: ['Python', 'DSP', 'FFT', 'NumPy'],
      live_url: '', repo_url: 'https://github.com/',
      featured: false, published: true,
    },
  ];
  const { error: err2 } = await supabase.from('projects').insert(projects);
  if (err2) console.error('Projects error:', err2.message); else console.log(`✓ ${projects.length} projects inserted`);

  // ── Blog Posts ──
  const posts = [
    {
      title: 'Getting Started with RISC-V',
      slug: 'getting-started-with-risc-v',
      content: `RISC-V is an open standard instruction set architecture (ISA) that has gained significant traction in both academia and industry.\n\nUnlike proprietary ISAs like x86 and ARM, RISC-V is completely open and free to use, making it ideal for education, research, and custom processor design.\n\n## Why RISC-V?\n- Open and free\n- Modular design\n- Growing ecosystem\n- Industry adoption\n\nIn this post, we'll explore the basics of RISC-V architecture and how to get started with your first RISC-V core design in Verilog.`,
      excerpt: 'An introduction to RISC-V architecture and how to design your first core in Verilog.',
      tags: ['RISC-V', 'Verilog', 'VLSI', 'Architecture'],
      published: true, views: 42,
    },
    {
      title: 'Building a Full-Stack Portfolio with React & Supabase',
      slug: 'building-fullstack-portfolio',
      content: `In this tutorial, I'll walk through building a modern full-stack portfolio application.\n\n## Tech Stack\n- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion\n- **Backend**: Node.js, Express\n- **Database**: Supabase (PostgreSQL)\n\n## Key Features\n1. Responsive design with dark/light mode\n2. Blog with markdown content\n3. Admin dashboard for content management\n4. Visitor analytics\n5. Contact form with email notifications\n\nThe combination of React's component model with Supabase's real-time capabilities makes for a powerful and scalable portfolio platform.`,
      excerpt: 'A step-by-step guide to creating a modern portfolio with React, TypeScript, and Supabase.',
      tags: ['React', 'Supabase', 'TypeScript', 'Tutorial'],
      published: true, views: 28,
    },
    {
      title: 'Understanding FPGA Architecture',
      slug: 'understanding-fpga-architecture',
      content: `Field Programmable Gate Arrays (FPGAs) are semiconductor devices that can be configured after manufacturing.\n\n## FPGA Architecture Basics\n- **Logic Blocks**: Configurable logic cells\n- **Routing**: Programmable interconnects\n- **I/O Blocks**: Interface with external devices\n\n## Design Flow\n1. RTL Design (Verilog/VHDL)\n2. Synthesis\n3. Place & Route\n4. Bitstream Generation\n5. FPGA Programming\n\nFPGAs offer a unique balance between software flexibility and hardware performance, making them ideal for prototyping ASICs and accelerating specific workloads.`,
      excerpt: 'A beginner-friendly overview of FPGA architecture and the digital design flow.',
      tags: ['FPGA', 'VLSI', 'Verilog', 'Hardware'],
      published: true, views: 35,
    },
  ];
  const { error: err3 } = await supabase.from('blog_posts').insert(posts);
  if (err3) console.error('Blog error:', err3.message); else console.log(`✓ ${posts.length} blog posts inserted`);

  // ── Experience ──
  const experiences = [
    {
      title: 'VLSI Design Intern',
      organization: 'Semiconductor Lab',
      location: 'Meerut, India',
      start_date: '2025-06-01', end_date: null,
      current: true,
      description: 'Working on RTL design and verification of digital circuits using Verilog. Implementing testbenches and running simulation workflows.',
      tags: ['Verilog', 'VLSI', 'Simulation'],
      sort_order: 1,
    },
    {
      title: 'Freelance Web Developer',
      organization: 'Self-Employed',
      location: 'Remote',
      start_date: '2024-01-01', end_date: null,
      current: true,
      description: 'Building full-stack web applications for clients using React, Node.js, and modern CSS frameworks. Managing deployments and database design.',
      tags: ['React', 'Node.js', 'PostgreSQL'],
      sort_order: 2,
    },
  ];
  const { error: err4 } = await supabase.from('experiences').insert(experiences);
  if (err4) console.error('Experience error:', err4.message); else console.log(`✓ ${experiences.length} experiences inserted`);

  // ── Education ──
  const education = [
    {
      degree: 'B.Tech in Electronics & Communication',
      institution: 'Meerut Institute of Technology',
      location: 'Meerut, India',
      start_date: '2023-08-01', end_date: null,
      current: true,
      description: 'Focused on VLSI design, digital circuits, and embedded systems. Working on RTL design projects using Verilog and FPGA platforms.',
      sort_order: 1,
    },
    {
      degree: 'Higher Secondary (XII)',
      institution: 'CBSE Board',
      location: 'India',
      start_date: '2021-04-01', end_date: '2022-06-01',
      current: false,
      description: 'Completed higher secondary education with a focus on Science and Mathematics.',
      sort_order: 2,
    },
  ];
  const { error: err5 } = await supabase.from('education').insert(education);
  if (err5) console.error('Education error:', err5.message); else console.log(`✓ ${education.length} education entries inserted`);

  // ── Site Settings ──
  const settings = [
    { key: 'site_name', value: 'Akash Munna Prasad' },
    { key: 'site_description', value: 'VLSI Design Engineer & Web Developer' },
    { key: 'github_url', value: 'https://github.com/AkashMunnaPrasad' },
    { key: 'linkedin_url', value: 'https://www.linkedin.com/in/akash-munna-prasad-14014533a/' },
    { key: 'resume_url', value: '' },
  ];
  for (const s of settings) {
    await supabase.from('site_settings').upsert(s, { onConflict: 'key' });
  }
  console.log(`✓ ${settings.length} settings upserted`);

  console.log('\n✅ Seeding complete!');
}

seed().catch(console.error);
