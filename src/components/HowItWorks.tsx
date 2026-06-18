import { CalendarCheck, ImageUp, MessageCircle, ScanFace } from 'lucide-react';

const steps = [
  {
    icon: ImageUp,
    title: 'Fotoğraf Yükle',
    text: 'JPG, PNG veya WEBP formatında fotoğrafını güvenli demo alana ekle.',
  },
  {
    icon: ScanFace,
    title: 'AI Yüz Analizi',
    text: 'Yüz şekli, cilt alt tonu, saç yoğunluğu ve stil enerjisi mock analizle üretilir.',
  },
  {
    icon: CalendarCheck,
    title: 'Kişisel Önerileri Gör',
    text: 'Saç modeli, saç rengi, makyaj ve stil önerilerini uyum puanlarıyla incele.',
  },
  {
    icon: MessageCircle,
    title: 'Chat veya Randevu ile Devam Et',
    text: 'AI chat ile soru sor veya seçtiğin öneriyle randevu oluştur.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section-pad">
      <div className="container-app">
        <div className="max-w-2xl">
          <p className="font-bold uppercase text-rose-700">Nasıl Çalışır?</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">4 adımda kişisel güzellik planı</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="group rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-premium"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 transition group-hover:bg-rose-600 group-hover:text-white">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-black text-violet-600">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-950">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-700">{step.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
