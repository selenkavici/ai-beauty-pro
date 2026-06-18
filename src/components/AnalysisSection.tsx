import { ImageUp, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createImageAnalysis, validateImageHasFace } from '../data';
import type { AnalysisResult, SectionId } from '../types';

type AnalysisSectionProps = {
  result: AnalysisResult | null;
  setResult: (result: AnalysisResult | null) => void;
  onNavigate: (id: SectionId) => void;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export function AnalysisSection({ result, setResult, onNavigate, notify }: AnalysisSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const validationRunRef = useRef(0);
  const faceErrorMessage = 'Lütfen yüzünüzün net göründüğü bir fotoğraf yükleyiniz.';

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (selected: File | undefined) => {
    validationRunRef.current += 1;
    setError('');
    setFaceStatus('idle');
    if (!selected) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(selected.type)) {
      setError('Lütfen yalnızca JPG, JPEG, PNG veya WEBP formatında fotoğraf yükleyin.');
      notify('Dosya formatı desteklenmiyor.', 'error');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('Fotoğraf boyutu en fazla 10 MB olabilir.');
      notify('Fotoğraf boyutu 10 MB sınırını aşıyor.', 'error');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    const nextPreview = URL.createObjectURL(selected);
    setFile(selected);
    setPreview(nextPreview);
    setResult(null);
    setFaceStatus('checking');
    notify('Fotoğraf başarıyla yüklendi.', 'success');
    const runId = validationRunRef.current;
    validateImageHasFace(selected)
      .then((hasFace) => {
        if (runId !== validationRunRef.current) return;
        setFaceStatus(hasFace ? 'valid' : 'invalid');
        if (!hasFace) {
          setResult(null);
          setError(faceErrorMessage);
          notify(faceErrorMessage, 'error');
        }
      })
      .catch(() => {
        if (runId !== validationRunRef.current) return;
        setFaceStatus('invalid');
        setResult(null);
        setError(faceErrorMessage);
        notify(faceErrorMessage, 'error');
      });
  };

  const startAnalysis = async () => {
    if (!file) {
      setError('Analizi başlatmak için önce bir fotoğraf yüklemelisin.');
      notify('Önce fotoğraf yüklemelisin.', 'error');
      return;
    }
    if (faceStatus === 'invalid') {
      setResult(null);
      setError(faceErrorMessage);
      notify(faceErrorMessage, 'error');
      return;
    }
    setError('');
    try {
      if (faceStatus !== 'valid') {
        const hasFace = await validateImageHasFace(file);
        if (!hasFace) {
          setFaceStatus('invalid');
          setResult(null);
          setError(faceErrorMessage);
          notify(faceErrorMessage, 'error');
          return;
        }
        setFaceStatus('valid');
      }
      setLoading(true);
      const [analysisResult] = await Promise.all([
        createImageAnalysis(file),
        new Promise((resolve) => window.setTimeout(resolve, 1300)),
      ]);
      setResult(analysisResult);
      setLoading(false);
      notify('Görsel tabanlı demo analiz tamamlandı.', 'success');
    } catch (caughtError) {
      setLoading(false);
      setResult(null);
      if (caughtError instanceof Error && caughtError.message === 'FACE_NOT_FOUND') {
        setFaceStatus('invalid');
        setError(faceErrorMessage);
        notify(faceErrorMessage, 'error');
        return;
      }
      setError('Fotoğraf analiz edilirken bir sorun oluştu. Lütfen farklı bir görsel deneyin.');
      notify('Fotoğraf analiz edilemedi.', 'error');
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
    setError('');
    setResult(null);
    setLoading(false);
    setFaceStatus('idle');
    validationRunRef.current += 1;
    if (inputRef.current) inputRef.current.value = '';
    notify('Yeni analiz için alan temizlendi.', 'info');
  };

  return (
    <section id="analysis" className="section-pad bg-white/70">
      <div className="container-app">
        <div className="mb-8 max-w-3xl">
          <p className="font-bold uppercase text-rose-700">AI Analiz</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Fotoğrafını yükle, demo analiz sonucunu gör</h2>
          <p className="mt-3 leading-7 text-slate-700">
            Bu bölüm final projesi için dış API anahtarı gerektirmeden tarayıcıda görsel tabanlı demo analiz üretir.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-premium">
            <label
              htmlFor="photo-upload"
              className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-6 text-center transition hover:border-rose-400 hover:bg-rose-50"
            >
              {preview ? (
                <img src={preview} alt="Yüklenen fotoğraf önizlemesi" className="max-h-72 w-full rounded-xl object-contain" />
              ) : (
                <>
                  <ImageUp className="text-rose-600" size={42} aria-hidden="true" />
                  <span className="mt-4 text-lg font-black text-slate-950">Fotoğraf Yükle</span>
                  <span className="mt-2 text-sm leading-6 text-slate-600">JPG, JPEG, PNG, WEBP. Maksimum 10 MB.</span>
                </>
              )}
            </label>
            <input
              id="photo-upload"
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            {error && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
            {faceStatus === 'checking' && (
              <p className="mt-3 rounded-xl bg-violet-50 p-3 text-sm font-semibold text-violet-700">
                Fotoğraf yüz uygunluğu kontrol ediliyor...
              </p>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startAnalysis}
                disabled={loading}
                aria-label="Fotoğraf analizini başlat"
                className="inline-flex items-center justify-center gap-2 rounded-full premium-gradient px-6 py-3 font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
                Analizi Başlat
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Yeni analiz için formu sıfırla"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3 font-bold text-rose-700 transition hover:bg-rose-50"
              >
                <RefreshCw size={18} aria-hidden="true" />
                Yeni Analiz Yap
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-slate-950 p-6 text-white shadow-premium">
            {loading && (
              <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <Loader2 className="mb-4 animate-spin text-rose-300" size={46} aria-hidden="true" />
                <p className="text-xl font-black">AI yüz analizi hazırlanıyor</p>
                <p className="mt-2 text-slate-300">Yüz oranları, ton uyumu ve stil enerjisi değerlendiriliyor.</p>
              </div>
            )}
            {!loading && !result && (
              <div className="flex min-h-80 flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xl font-black">
                  {faceStatus === 'invalid' ? 'Analiz yapılamadı' : 'Analiz sonucu burada görünecek'}
                </p>
                <p className="mt-3 leading-7 text-slate-300">
                  {faceStatus === 'invalid'
                    ? 'Yüzünüzün net göründüğü bir selfie yükleyiniz.'
                    : 'Fotoğraf yüklendikten sonra analiz butonu aktif akışı başlatır. Sonuçlar sayfa yenilenmeden gösterilir.'}
                </p>
              </div>
            )}
            {!loading && result && (
              <div>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase text-rose-200">AI Analiz Sonucu</p>
                    <h3 className="mt-1 text-2xl font-black">Kişisel analiz tamamlandı</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-300">Görsel tabanlı demo analiz</p>
                  </div>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-rose-700">%{result.score}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Yüz şekli', result.faceShape],
                    ['Cilt alt tonu', result.undertone],
                    ['Saç yoğunluğu', result.hairDensity],
                    ['Stil enerjisi', result.styleEnergy],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <p className="text-sm text-slate-300">{label}</p>
                      <p className="mt-1 text-xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 rounded-2xl bg-white/8 p-4 leading-7 text-slate-100">{result.comment}</p>
                <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-semibold text-slate-300 sm:grid-cols-3">
                  <span>Parlaklık: {result.imageMetrics.brightness}</span>
                  <span>Kontrast: {result.imageMetrics.contrast}</span>
                  <span>Doygunluk: %{result.imageMetrics.saturation}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('recommendations')}
                  aria-label="Kişiselleştirilmiş öneriler bölümüne git"
                  className="mt-5 w-full rounded-full bg-white px-6 py-3 font-black text-rose-700 transition hover:bg-rose-50"
                >
                  Önerileri Gör
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
