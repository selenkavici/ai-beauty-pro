import { Bot, Send, UserRound } from 'lucide-react';
import { FormEvent, KeyboardEvent, useState } from 'react';
import type { AnalysisResult } from '../types';

type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'ai',
    text: 'Merhaba! Saç modeli, saç rengi veya cilt tonu önerileri hakkında bana soru sorabilirsin.',
  },
];

type ChatSectionProps = {
  analysis: AnalysisResult | null;
};

const includesAny = (message: string, keywords: string[]) => keywords.some((keyword) => message.includes(keyword));

const analysisPrefix = (analysis: AnalysisResult | null) => {
  if (!analysis) {
    return 'Daha net öneri verebilmem için önce AI Analiz bölümünden fotoğraf analizi yapmanı öneririm. ';
  }

  return `Analiz sonucunda yüz şeklin ${analysis.faceShape.toLocaleLowerCase('tr-TR')}, cilt alt tonun ${analysis.undertone.toLocaleLowerCase('tr-TR')}, saç yoğunluğun ${analysis.hairDensity.toLocaleLowerCase('tr-TR')} ve stil enerjin ${analysis.styleEnergy.toLocaleLowerCase('tr-TR')} görünüyor. `;
};

const hairColorAdvice = (analysis: AnalysisResult) => {
  if (analysis.undertone === 'Sıcak') {
    return 'Bu yüzden karamel ışıltı, sıcak kahve, bal köpüğü ve doğal kumral tonları sana daha uyumlu olabilir.';
  }
  if (analysis.undertone === 'Soğuk') {
    return 'Bu yüzden küllü kumral, soğuk kahve, yumuşak bej geçişler ve kızıllık içermeyen kahve tonları sana daha uyumlu olabilir.';
  }
  return 'Bu yüzden doğal kahve, bej kumral, soft çikolata kahve ve dengeli nude geçişler sana daha uyumlu olabilir.';
};

const faceColorNote = (analysis: AnalysisResult) => {
  if (analysis.faceShape === 'Kare') {
    return ' Yüz çevresinde çok keskin koyu blok renkler yerine yumuşak geçişli balyajlar yüz hattını daha dengeli gösterir.';
  }
  if (analysis.faceShape === 'Yuvarlak') {
    return ' Yüz çevresinde dikey etki veren ışıltılar yüz formunu daha uzun gösterebilir.';
  }
  if (analysis.faceShape === 'Kalp') {
    return ' Çene hizasına yakın daha yumuşak ton geçişleri yüz dengesini destekler.';
  }
  return ' Oval yüz formunda renk geçişleri daha esnek taşınabilir; doğal ve yumuşak geçişler güvenli bir seçim olur.';
};

const createReply = (message: string, analysis: AnalysisResult | null) => {
  const lower = message.toLocaleLowerCase('tr-TR');
  const hasSkinOrMakeupKeyword = includesAny(lower, [
    'cilt',
    'cilt tonu',
    'alt ton',
    'makyaj',
    'fondöten',
    'fondoten',
    'allık',
    'allik',
    'ruj',
  ]);
  const hasHairModelKeyword = includesAny(lower, [
    'saç modeli',
    'sac modeli',
    'kesim',
    'model',
    'yuvarlak yüz',
    'oval yüz',
    'kare yüz',
    'katlı',
    'katli',
    'perçem',
    'percem',
    'curtain bangs',
    'kısa saç',
    'kisa sac',
    'uzun saç',
    'uzun sac',
  ]);
  const hasHairColorKeyword = includesAny(lower, [
    'saç rengi',
    'sac rengi',
    'renk',
    'boya',
    'boyat',
    'kumral',
    'kahve',
    'karamel',
    'sarı',
    'sari',
    'bakır',
    'bakir',
    'siyah',
  ]);
  const hasFitKeywordForHairColor =
    includesAny(lower, ['yakışır', 'yakisir']) && !hasSkinOrMakeupKeyword && !hasHairModelKeyword;

  if (hasHairColorKeyword || hasFitKeywordForHairColor) {
    if (analysis) {
      return `${analysisPrefix(analysis)}${hairColorAdvice(analysis)}${faceColorNote(analysis)} Daha doğal bir görünüm için çikolata kahve; daha canlı bir değişim için kontrollü balyaj tercih edebilirsin. Çok keskin siyah tonlar yüz hatlarını daha sert gösterebilir.`;
    }

    return `${analysisPrefix(analysis)}Yine de genel olarak doğal kahve, karamel ışıltı ve sıcak kumral tonları çoğu cilt alt tonuyla uyumlu görünür. Daha doğal bir görünüm için çikolata kahve; daha canlı bir değişim için karamel balyaj tercih edebilirsin. Çok keskin siyah tonlar yüz hatlarını daha sert gösterebilir.`;
  }

  if (hasHairModelKeyword) {
    return `${analysisPrefix(analysis)}Saç modeli için yüz formunu dengeleyen katlı kesimler, curtain bangs veya doğal hacimli bob seçeneklerini değerlendirebilirsin. Yuvarlak yüzlerde yüzü uzatan katlar, oval yüzlerde dengeli uzun kesimler, kare yüzlerde ise daha yumuşak geçişli modeller iyi sonuç verir.`;
  }

  if (hasSkinOrMakeupKeyword) {
    return `${analysisPrefix(analysis)}Cilt ve makyaj önerisinde alt ton belirleyici olur. Sıcak alt tonlarda şeftali allık, sıcak nude ruj ve altın yansımalar; soğuk alt tonlarda pembe allık, gül kurusu ruj ve nötr fondötenler daha dengeli görünür.`;
  }

  if (includesAny(lower, ['randevu', 'kuaför', 'kuafor', 'danışmanlık', 'danismanlik', 'görüşme', 'gorusme', 'paket'])) {
    return 'Randevu almak için randevu bölümündeki formu doldurabilirsin. İstersen öneri kartlarından birini seçerek randevu alanına otomatik aktarabilir veya Komple AI Güzellik Paketi ile danışmanlık oluşturabilirsin.';
  }

  return `${analysisPrefix(analysis)}Güzellik kararlarında yüz şekli, cilt alt tonu, günlük bakım süresi ve kişisel stil birlikte değerlendirilmelidir. İstersen saç rengi, saç modeli, cilt tonu veya randevu konularından biriyle başlayabiliriz.`;
};

export function ChatSection({ analysis }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const sendMessage = (text = input) => {
    const clean = text.trim();
    if (!clean || typing) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: clean };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'ai', text: createReply(clean, analysis) }]);
      setTyping(false);
    }, 700);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  const examples = [
    'Bana hangi saç rengi yakışır?',
    'Yuvarlak yüze hangi saç modeli olur?',
    'Cilt tonuma göre makyaj öner',
    'Randevu almak istiyorum',
  ];

  return (
    <section id="chat" className="section-pad bg-white/70">
      <div className="container-app">
        <div className="mb-8 max-w-3xl">
          <p className="font-bold uppercase text-rose-700">AI Chat</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Güzellik asistanına sor</h2>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-premium sm:p-6">
          <div className="h-[430px] overflow-y-auto rounded-2xl bg-slate-50 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'ai' && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                      <Bot size={18} aria-hidden="true" />
                    </span>
                  )}
                  <p className={`max-w-[82%] rounded-2xl px-4 py-3 leading-7 ${message.role === 'user' ? 'bg-rose-600 text-white' : 'bg-white text-slate-800 shadow-sm'}`}>
                    {message.text}
                  </p>
                  {message.role === 'user' && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                      <UserRound size={18} aria-hidden="true" />
                    </span>
                  )}
                </div>
              ))}
              {typing && <p className="text-sm font-semibold text-violet-700">AI asistan yanıt hazırlıyor...</p>}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => sendMessage(example)}
                aria-label={`Örnek soruyu gönder: ${example}`}
                className="rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-100"
              >
                Örnek soru: {example}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="chat-input" className="sr-only">
              Chat mesajı
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-12 flex-1 rounded-full border border-rose-100 px-5 text-slate-900 shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Chat mesajını gönder"
              className="inline-flex items-center justify-center gap-2 rounded-full premium-gradient px-6 py-3 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} aria-hidden="true" />
              Gönder
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
