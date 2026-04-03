import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isLight = stored === 'light';
    setLight(isLight);
    document.documentElement.classList.toggle('light', isLight);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle('light', next);
    localStorage.setItem('theme', next ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="text-xs px-2 py-1 border rounded font-mono transition-colors cursor-pointer border-neutral-700 text-neutral-400 hover:text-green-400 hover:border-green-400/50"
      title={light ? 'Switch to dark' : 'Switch to light'}
    >
      {light ? '[ dark ]' : '[ light ]'}
    </button>
  );
}
