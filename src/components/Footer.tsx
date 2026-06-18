import { Github, Linkedin, Sparkles } from 'lucide-react';
import type { SectionId } from '../types';

type FooterProps = {
  onNavigate: (id: SectionId) => void;
};

const quickLinks: { label: string; id: SectionId }[] = [
  { label: 'Ana Sayfa', id: 'home' },
  { label: 'Nasıl Çalışır?', id: 'how' },
  { label: 'AI Analiz', id: 'analysis' },
  { label: 'Öneriler', id: 'recommendations' },
  { label: 'Chat', id: 'chat' },
  { label: 'Randevu', id: 'appointment' },
  { label: 'İletişim', id: 'contact' },
];

const features = [
  'Fotoğraf Yükleme',
  'Görsel Tabanlı Demo Analiz',
  'Kişisel Öneriler',
  'AI Chat Asistanı',
  'Randevu Sistemi',
];

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-950 py-12 text-white">
      <div className="container-app">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl premium-gradient text-white shadow-lg">
                <Sparkles size={21} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xl font-black">AI Beauty Pro</p>
                <p className="text-sm font-semibold text-rose-200">AI Destekli Kişisel Güzellik Öneri Sistemi</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm leading-7 text-slate-300">
              Fotoğraf analizi, kişiselleştirilmiş öneriler, AI chat ve randevu akışıyla güzellik
              kararlarını daha bilinçli hale getiren final projesi.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase text-rose-200">Hızlı Menü</h3>
            <div className="mt-4 grid gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onNavigate(link.id)}
                  className="w-fit text-left text-sm font-semibold text-slate-300 transition hover:text-rose-200"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase text-rose-200">Özellikler</h3>
            <ul className="mt-4 grid gap-2 text-sm font-semibold text-slate-300">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase text-rose-200">Bağlantılar</h3>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href="https://www.linkedin.com/in/selenkavici"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold text-slate-100 transition hover:bg-white/10"
              >
                <Linkedin size={18} aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href="https://github.com/selenkavici"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold text-slate-100 transition hover:bg-white/10"
              >
                <Github size={18} aria-hidden="true" />
                GitHub
              </a>
            </div>
            <div className="mt-5 space-y-2 text-sm font-semibold text-slate-300">
              <p>Öğrenci: Selen Kavici</p>
              <p>Numara: 24010501052</p>
              <p>Ders: Programlamada Yeni Eğilimler</p>
            </div>
          </div>
        </div>

        <div className="mt-9 border-t border-white/10 pt-6">
          <p className="text-sm font-semibold text-slate-400">
            © 2026 AI Beauty Pro. Final projesi kapsamında geliştirilmiştir.
          </p>
        </div>
      </div>
    </footer>
  );
}
