import { CheckCircle2, Circle, ImageUp, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createImageAnalysis } from '../data';
import { FaceAnalysisError, type FaceAnalysisStage } from '../lib/faceLandmarker';
import type { AnalysisResult, SectionId } from '../types';

type Props = { result: AnalysisResult | null; setResult: (result: AnalysisResult | null) => void; onNavigate: (id: SectionId) => void; notify: (message: string, type?: 'success' | 'error' | 'info') => void };
const stages: Array<[FaceAnalysisStage, string]> = [
  ['model-loading', 'AI modeli yükleniyor'], ['face-detection', 'Yüz algılanıyor'],
  ['landmark-analysis', 'Landmark noktaları analiz ediliyor'], ['skin-analysis', 'Cilt tonu bölgeleri değerlendiriliyor'],
  ['recommendations', 'Öneriler hazırlanıyor'],
];
const errors: Record<string, string> = {
  FACE_NOT_FOUND: 'Yüz bulunamadı', MULTIPLE_FACES: 'Birden fazla yüz algılandı',
  IMAGE_TOO_DARK: 'Fotoğraf çok karanlık', IMAGE_TOO_BRIGHT: 'Fotoğraf çok parlak',
  MODEL_LOAD_FAILED: 'Model yüklenemedi', IMAGE_ANALYSIS_FAILED: 'Görsel analiz edilemedi',
};

export function AnalysisSection({ result, setResult, onNavigate, notify }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<FaceAnalysisStage | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const handleFile = (selected?: File) => {
    setError(''); setResult(null); setStage(null);
    if (!selected) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(selected.type)) {
      setError('Lütfen yalnızca JPG, JPEG, PNG veya WEBP formatında fotoğraf yükleyin.');
      notify('Dosya formatı desteklenmiyor.', 'error'); return;
    }
    if (selected.size > 10 * 1024 * 1024) { setError('Fotoğraf boyutu en fazla 10 MB olabilir.'); notify('Fotoğraf boyutu 10 MB sınırını aşıyor.', 'error'); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected); setPreview(URL.createObjectURL(selected));
  };

  const startAnalysis = async () => {
    if (!file) { setError('Analizi başlatmak için önce bir fotoğraf yüklemelisin.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const next = await createImageAnalysis(file, setStage);
      setResult(next); notify('MediaPipe yüz landmark analizi tamamlandı.', 'success');
    } catch (caught) {
      const code = caught instanceof FaceAnalysisError ? caught.code : 'IMAGE_ANALYSIS_FAILED';
      const message = errors[code]; setError(message); notify(message, 'error');
    } finally { setLoading(false); }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(''); setError(''); setResult(null); setLoading(false); setStage(null);
    if (inputRef.current) inputRef.current.value = '';
  };
  const activeIndex = stage ? stages.findIndex(([key]) => key === stage) : -1;

  return <section id="analysis" className="section-pad bg-white/70"><div className="container-app">
    <div className="mb-8 max-w-3xl">
      <p className="font-bold uppercase text-rose-700">MediaPipe Analizi</p>
      <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Fotoğrafını yükle, landmark analizini gör</h2>
      <p className="mt-3 leading-7 text-slate-700">Önceden eğitilmiş Google MediaPipe Face Landmarker yüz noktalarını algılar. Yüz şekli ve cilt alt tonu bu noktalardan türetilen tahmini sonuçlardır.</p>
      <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Fotoğrafınız MediaPipe modeliyle yalnızca tarayıcınızda analiz edilir. Herhangi bir sunucuya yüklenmez veya kaydedilmez.</p>
    </div>
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-premium">
        <label htmlFor="photo-upload" className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-6 text-center">
          {preview ? <img src={preview} alt="Yüklenen fotoğraf önizlemesi" className="max-h-72 w-full rounded-xl object-contain" /> : <><ImageUp className="text-rose-600" size={42}/><span className="mt-4 text-lg font-black">Fotoğraf Yükle</span><span className="mt-2 text-sm text-slate-600">JPG, JPEG, PNG, WEBP. Maksimum 10 MB.</span></>}
        </label>
        <input id="photo-upload" ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])}/>
        {error && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={startAnalysis} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full premium-gradient px-6 py-3 font-bold text-white shadow-lg disabled:opacity-70">{loading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}Analizi Başlat</button>
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-6 py-3 font-bold text-rose-700"><RefreshCw size={18}/>Yeni Analiz Yap</button>
        </div>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-slate-950 p-6 text-white shadow-premium">
        {loading && <div className="min-h-80 py-5"><Loader2 className="mx-auto mb-5 animate-spin text-rose-300" size={42}/><div className="space-y-3">{stages.map(([key,label], i) => <div key={key} className={`flex items-center gap-3 rounded-xl p-3 ${i === activeIndex ? 'bg-white/10 text-white' : 'text-slate-400'}`}>{i < activeIndex ? <CheckCircle2 className="text-emerald-300"/> : <Circle/>}<span className="font-semibold">{label}</span></div>)}</div></div>}
        {!loading && !result && <div className="flex min-h-80 flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.05] p-6"><p className="text-xl font-black">Analiz sonucu burada görünecek</p><p className="mt-3 leading-7 text-slate-300">İlk kullanımda model dosyası birkaç saniyede yüklenebilir. Tek kişinin önden, net ve dengeli ışıkta görüldüğü bir fotoğraf seç.</p></div>}
        {!loading && result && <div><p className="text-sm font-bold uppercase text-rose-200">MediaPipe Analiz Sonucu</p><h3 className="mt-1 text-2xl font-black">Yüz başarıyla algılandı</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{[['Yüz şekli (tahmini)',result.faceShape],['Cilt alt tonu (tahmini)',result.undertone],['Görüntü ışık kalitesi',result.lightingQuality],['Model algılaması','Yüz algılandı']].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"><p className="text-sm text-slate-300">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>)}</div>
          <p className="mt-5 rounded-2xl bg-white/[0.08] p-4 leading-7">{result.comment}</p>
          <p className="mt-3 text-xs leading-5 text-slate-300">Cilt alt tonu tahmini ışık koşulları, kamera beyaz dengesi ve makyajdan etkilenebilir.</p>
          <button type="button" onClick={() => onNavigate('recommendations')} className="mt-5 w-full rounded-full bg-white px-6 py-3 font-black text-rose-700">Önerileri Gör</button></div>}
      </div>
    </div>
  </div></section>;
}
