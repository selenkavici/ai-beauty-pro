import { Bot, Camera, MessageCircle, Palette, ScanFace, Sparkles } from 'lucide-react';
import type { SectionId } from '../types';

type HeroProps = {
  onNavigate: (id: SectionId) => void;
};

const demoItems = [
  { icon: ScanFace, label: 'Yüz Analizi', value: 'Oval form' },
  { icon: Camera, label: 'Saç Modeli Önerisi', value: 'Katlı kesim' },
  { icon: Palette, label: 'Cilt Tonu Uyumu', value: 'Nötr alt ton' },
  { icon: Bot, label: 'AI Chat Asistanı', value: 'Aktif danışman' },
];

export function Hero({ onNavigate }: HeroProps) {
  return (
    <section id="home" className="section-pad overflow-hidden pt-12">
      <div className="container-app grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm font-bold text-rose-700 shadow-sm">
            <Sparkles size={16} aria-hidden="true" />
            AI Destekli Kişisel Güzellik Öneri Sistemi
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            AI ile Sana En Uygun Güzellik Stilini Keşfet
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Fotoğrafını yükle, yüz hatlarını analiz edelim ve sana özel saç modeli, saç rengi ve
            güzellik önerileri sunalım.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate('analysis')}
              aria-label="AI analiz bölümüne git"
              className="rounded-full premium-gradient px-7 py-4 font-bold text-white shadow-premium transition hover:scale-[1.02]"
            >
              Analize Başla
            </button>
            <button
              type="button"
              onClick={() => onNavigate('how')}
              aria-label="Nasıl çalışır bölümüne git"
              className="rounded-full border border-rose-200 bg-white px-7 py-4 font-bold text-rose-700 shadow-sm transition hover:bg-rose-50"
            >
              Nasıl Çalışır?
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="glass-panel animate-float rounded-3xl p-5 sm:p-7">
            <div className="rounded-2xl bg-gradient-to-br from-rose-100 via-white to-violet-100 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase text-rose-700">Canlı Demo Paneli</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">Beauty AI Studio</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Hazır
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {demoItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/80 bg-white/78 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <Icon className="mb-4 text-rose-600" size={24} aria-hidden="true" />
                      <p className="text-sm font-bold text-slate-950">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span>Demo analiz doğruluk skoru</span>
                  <span className="font-bold text-rose-200">%92</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-rose-300 to-violet-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
