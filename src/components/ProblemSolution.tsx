import { AlertTriangle, CheckCircle2, Target, WandSparkles } from 'lucide-react';

export function ProblemSolution() {
  return (
    <section id="problem" className="section-pad bg-white/68">
      <div className="container-app">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-premium">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle size={24} aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-black text-slate-950">Problem</h2>
            <p className="mt-4 leading-8 text-slate-700">
              Kullanıcılar saç modeli, saç rengi veya fiziksel değişim yapmadan önce kararsız kalır.
              Yanlış seçimler maddi ve manevi kayıplara yol açabilir. Genel öneriler kişiselleştirilmediği
              için çoğu zaman yeterli olmaz.
            </p>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-premium">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <WandSparkles size={24} aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-black text-slate-950">Çözüm</h2>
            <p className="mt-4 leading-8 text-slate-700">
              AI Beauty Pro, kullanıcının fotoğrafından yüz şekli, cilt tonu ve stil tercihlerini
              analiz ediyormuş gibi çalışan demo AI akışıyla kişiye özel öneriler sunar.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Hedef Kitle', 'Kararsız kullanıcılar, güzelliğine önem verenler ve kuaför öncesi fikir arayanlar.', Target],
            ['Neden Biz?', 'Kişiselleştirilmiş öneri, fotoğraf tabanlı simülasyon hissi, chat ve randevu desteği.', CheckCircle2],
            ['Teknoloji Süreci', 'UI/UX tasarım, AI analiz mantığı, frontend geliştirme, test ve final sunumu.', WandSparkles],
          ].map(([title, text, Icon]) => (
            <div key={String(title)} className="rounded-2xl border border-rose-100 bg-white/85 p-5 shadow-sm">
              <Icon className="text-rose-600" size={24} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-black text-slate-950">{String(title)}</h3>
              <p className="mt-2 leading-7 text-slate-700">{String(text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
