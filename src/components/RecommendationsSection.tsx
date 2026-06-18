import { CalendarDays, Eye, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { buildRecommendations } from '../data';
import type { AnalysisResult, Recommendation, SectionId } from '../types';
import { Modal } from './Modal';

type RecommendationsSectionProps = {
  analysis: AnalysisResult | null;
  onNavigate: (id: SectionId) => void;
  onSelectRecommendation: (title: string) => void;
};

export function RecommendationsSection({ analysis, onNavigate, onSelectRecommendation }: RecommendationsSectionProps) {
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const recommendations = buildRecommendations(analysis);

  const book = (recommendation: Recommendation) => {
    onSelectRecommendation(recommendation.title);
    setSelected(null);
    onNavigate('appointment');
  };

  return (
    <section id="recommendations" className="section-pad">
      <div className="container-app">
        <div className="mb-8 max-w-3xl">
          <p className="font-bold uppercase text-rose-700">Kişiselleştirilmiş Öneriler</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Analize göre güzellik planı</h2>
        </div>

        {!analysis ? (
          <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-premium">
            <LockKeyhole className="mx-auto text-rose-600" size={38} aria-hidden="true" />
            <p className="mt-4 text-xl font-black text-slate-950">Önerileri görmek için önce fotoğraf analizi yapmalısın.</p>
            <button
              type="button"
              onClick={() => onNavigate('analysis')}
              className="mt-5 rounded-full premium-gradient px-6 py-3 font-bold text-white shadow-lg"
              aria-label="AI analiz bölümüne git"
            >
              Analize Git
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => (
              <article key={item.id} className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-premium">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">{item.category}</span>
                    <h3 className="mt-4 text-xl font-black text-slate-950">{item.title}</h3>
                  </div>
                  <span className="rounded-full bg-rose-100 px-3 py-2 text-sm font-black text-rose-700">%{item.match}</span>
                </div>
                <p className="mt-3 min-h-20 leading-7 text-slate-700">{item.description}</p>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  aria-label={`${item.title} detaylarını gör`}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-3 font-bold text-rose-700 transition hover:bg-rose-50"
                >
                  <Eye size={18} aria-hidden="true" />
                  Detayları Gör
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal title={selected?.title ?? 'Öneri detayı'} isOpen={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4">
            <p className="leading-7 text-slate-700">{selected.details}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-sm font-bold text-rose-700">Kimlere uygun?</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selected.suitableFor}</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-4">
                <p className="text-sm font-bold text-violet-700">Bakım zorluğu</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selected.maintenance}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">Maliyet seviyesi</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selected.cost}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => book(selected)}
                aria-label={`${selected.title} önerisi için randevu al`}
                className="inline-flex items-center justify-center gap-2 rounded-full premium-gradient px-6 py-3 font-bold text-white shadow-lg"
              >
                <CalendarDays size={18} aria-hidden="true" />
                Randevu Al
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Öneri detay modalını kapat"
                className="rounded-full border border-rose-200 bg-white px-6 py-3 font-bold text-rose-700 hover:bg-rose-50"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
