import { Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import type { SectionId } from '../types';

const links: { label: string; id: SectionId }[] = [
  { label: 'Ana Sayfa', id: 'home' },
  { label: 'Nasıl Çalışır?', id: 'how' },
  { label: 'AI Analiz', id: 'analysis' },
  { label: 'Öneriler', id: 'recommendations' },
  { label: 'Chat', id: 'chat' },
  { label: 'Randevu', id: 'appointment' },
  { label: 'İletişim', id: 'contact' },
];

type NavbarProps = {
  onNavigate: (id: SectionId) => void;
};

export function Navbar({ onNavigate }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const navigate = (id: SectionId) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/82 backdrop-blur-xl">
      <nav className="container-app flex h-16 items-center justify-between" aria-label="Ana navigasyon">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-left"
          aria-label="AI Beauty Pro ana sayfaya git"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl premium-gradient text-white shadow-lg">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-black text-slate-950">AI Beauty Pro</span>
            <span className="block text-xs font-medium text-rose-700">Beauty Intelligence</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => navigate(link.id)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
            >
              {link.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="rounded-xl border border-rose-100 p-2 text-slate-700 lg:hidden"
          aria-label={open ? 'Mobil menüyü kapat' : 'Mobil menüyü aç'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-rose-100 bg-white lg:hidden">
          <div className="container-app grid gap-2 py-3">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => navigate(link.id)}
                className="rounded-xl px-4 py-3 text-left font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
