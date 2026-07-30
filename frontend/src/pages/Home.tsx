import { useState } from 'react';
import Hero from '../components/sections/Hero';
import BackgroundSlider from '../components/sections/BackgroundSlider';

const presets: Record<number, string> = {
  1: 'https://images.pexels.com/photos/2182863/pexels-photo-2182863.jpeg?auto=compress&cs=tinysrgb&w=1920',
  2: 'https://images.pexels.com/photos/36169774/pexels-photo-36169774.jpeg?auto=compress&cs=tinysrgb&w=1920',
  3: 'https://images.pexels.com/photos/6842695/pexels-photo-6842695.jpeg?auto=compress&cs=tinysrgb&w=1920',
  4: 'https://images.pexels.com/photos/1432668/pexels-photo-1432668.jpeg?auto=compress&cs=tinysrgb&w=1920',
  5: 'https://images.pexels.com/photos/6755144/pexels-photo-6755144.jpeg?auto=compress&cs=tinysrgb&w=1920',
  6: 'https://images.pexels.com/photos/1432794/pexels-photo-1432794.jpeg?auto=compress&cs=tinysrgb&w=1920',
  7: 'https://images.pexels.com/photos/50711/board-electronics-computer-data-processing-50711.jpeg?auto=compress&cs=tinysrgb&w=1920',
  8: 'https://images.pexels.com/photos/163170/board-printed-circuit-board-computer-electronics-163170.jpeg?auto=compress&cs=tinysrgb&w=1920',
};

export default function Home() {
  const [activeBg, setActiveBg] = useState(1);

  return (
    <div className="relative min-h-screen transition-all duration-700">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${presets[activeBg]})` }}
      />
      <div className="absolute inset-0 bg-[rgba(6,11,20,0.82)] transition-all duration-700" />
      <div className="relative z-10">
        <Hero />
      </div>
      <BackgroundSlider active={activeBg} onChange={setActiveBg} />
    </div>
  );
}
