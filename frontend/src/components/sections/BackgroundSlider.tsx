import { motion, AnimatePresence } from 'framer-motion';

const backgrounds = [
  {
    id: 1,
    name: 'Circuit Board',
    url: 'https://images.pexels.com/photos/2182863/pexels-photo-2182863.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumb: 'https://images.pexels.com/photos/2182863/pexels-photo-2182863.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
  },
  {
    id: 2,
    name: 'Micro Chips',
    url: 'https://images.pexels.com/photos/36169774/pexels-photo-36169774.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumb: 'https://images.pexels.com/photos/36169774/pexels-photo-36169774.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
  },
  {
    id: 3,
    name: 'PCB Close-Up',
    url: 'https://images.pexels.com/photos/6842695/pexels-photo-6842695.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumb: 'https://images.pexels.com/photos/6842695/pexels-photo-6842695.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
  },
  {
    id: 4,
    name: 'Components',
    url: 'https://images.pexels.com/photos/1432668/pexels-photo-1432668.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumb: 'https://images.pexels.com/photos/1432668/pexels-photo-1432668.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
  },
  {
    id: 5,
    name: 'Motherboard',
    url: 'https://images.pexels.com/photos/6755144/pexels-photo-6755144.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumb: 'https://images.pexels.com/photos/6755144/pexels-photo-6755144.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
  },
  {
    id: 6,
    name: 'Tech Board',
    url: 'https://images.pexels.com/photos/1432794/pexels-photo-1432794.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumb: 'https://images.pexels.com/photos/1432794/pexels-photo-1432794.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
  },
  {
    id: 7,
    name: 'Electronics',
    url: 'https://images.pexels.com/photos/50711/board-electronics-computer-data-processing-50711.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumb: 'https://images.pexels.com/photos/50711/board-electronics-computer-data-processing-50711.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
  },
  {
    id: 8,
    name: 'PCB Detail',
    url: 'https://images.pexels.com/photos/163170/board-printed-circuit-board-computer-electronics-163170.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumb: 'https://images.pexels.com/photos/163170/board-printed-circuit-board-computer-electronics-163170.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
  },
];

interface BackgroundSliderProps {
  active: number;
  onChange: (id: number) => void;
}

export default function BackgroundSlider({ active, onChange }: BackgroundSliderProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[rgba(6,11,20,0.75)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {backgrounds.map((bg, i) => (
          <motion.button
            key={bg.id}
            onClick={() => onChange(bg.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + i * 0.08, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.25, y: -4 }}
            whileTap={{ scale: 0.9 }}
            className="relative group cursor-pointer"
          >
            <div
              className="w-9 h-9 rounded-full border-2 overflow-hidden transition-all duration-300"
              style={{
                borderColor: active === bg.id ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                boxShadow: active === bg.id ? '0 0 12px var(--accent-cyan), 0 0 30px rgba(0,212,255,0.3)' : 'none',
              }}
            >
              <img
                src={bg.thumb}
                alt={bg.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <AnimatePresence>
              {active === bg.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -inset-1 rounded-full border border-[var(--accent-cyan)]"
                  style={{
                    animation: 'pulse-border 2s infinite',
                  }}
                />
              )}
            </AnimatePresence>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[0.5rem] font-semibold tracking-widest uppercase whitespace-nowrap text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {bg.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
