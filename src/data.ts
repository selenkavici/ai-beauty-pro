import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { detectFaceLandmarks, FaceAnalysisError, type FaceAnalysisStage } from './lib/faceLandmarker';
import type { AnalysisResult, Recommendation } from './types';

export const services = ['Saç Modeli Danışmanlığı', 'Saç Rengi Danışmanlığı', 'Cilt Tonu Analizi', 'Komple AI Güzellik Paketi'];

const loadImageElement = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new FaceAnalysisError('IMAGE_ANALYSIS_FAILED')); };
    image.src = url;
  });

const distance = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);
const roundRatio = (value: number) => Math.round(value * 1000) / 1000;

const calculateFaceShape = (points: NormalizedLandmark[]) => {
  const faceHeight = distance(points[10], points[152]);
  const cheekboneWidth = distance(points[234], points[454]);
  const foreheadWidth = distance(points[103], points[332]);
  const jawWidth = distance(points[172], points[397]);
  const jawTaperRatio = jawWidth / cheekboneWidth;
  const heightWidthRatio = faceHeight / cheekboneWidth;

  // Face Landmarker yalnızca noktaları verir. Bu tahmini sınıf; yüz yüksekliği, alın,
  // elmacık ve çene genişlikleri ile çenenin daralma oranından geometrik olarak türetilir.
  let faceShape: AnalysisResult['faceShape'];
  if (foreheadWidth > jawWidth * 1.12 && jawTaperRatio < 0.82) faceShape = 'Kalp';
  else if (heightWidthRatio < 1.32 && jawTaperRatio > 0.88) faceShape = 'Kare';
  else if (heightWidthRatio < 1.38) faceShape = 'Yuvarlak';
  else faceShape = 'Oval';

  return {
    faceShape,
    measurements: {
      faceHeight: roundRatio(faceHeight), cheekboneWidth: roundRatio(cheekboneWidth),
      foreheadWidth: roundRatio(foreheadWidth), jawWidth: roundRatio(jawWidth),
      jawTaperRatio: roundRatio(jawTaperRatio), heightWidthRatio: roundRatio(heightWidthRatio),
    },
  };
};

type Rgb = { r: number; g: number; b: number };
const saturation = ({ r, g, b }: Rgb) => {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  return max === 0 ? 0 : (max - min) / max;
};
const luminance = ({ r, g, b }: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const rgbToLab = ({ r, g, b }: Rgb) => {
  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const lr = linear(r), lg = linear(g), lb = linear(b);
  const x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
  const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  const z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;
  const f = (v: number) => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116;
  return { l: 116 * f(y) - 16, a: 500 * (f(x) - f(y)), b: 200 * (f(y) - f(z)) };
};

const sampleSkinRegions = (image: HTMLImageElement, points: NormalizedLandmark[]) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new FaceAnalysisError('IMAGE_ANALYSIS_FAILED');
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const faceWidthPx = distance(points[234], points[454]) * canvas.width;
  const radius = Math.max(3, Math.round(faceWidthPx * 0.055));
  // 117/346 yanakların göz ve dudaktan uzak dış bölgesi, 151 ise saç çizgisi ile kaşlar
  // arasındaki alın bölgesidir. Küçük örnekleme yarıçapı saç, göz, dudak ve arka planı dışarıda tutar.
  const centers = [points[117], points[346], points[151]];
  const samples: Rgb[] = [];
  let rawLumTotal = 0, rawCount = 0;
  for (const center of centers) {
    const cx = Math.round(center.x * canvas.width), cy = Math.round(center.y * canvas.height);
    for (let y = cy - radius; y <= cy + radius; y += 2) for (let x = cx - radius; x <= cx + radius; x += 2) {
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height || Math.hypot(x - cx, y - cy) > radius) continue;
      const index = (y * canvas.width + x) * 4;
      const rgb = { r: pixels[index], g: pixels[index + 1], b: pixels[index + 2] };
      const lum = luminance(rgb); rawLumTotal += lum; rawCount += 1;
      if (lum > 45 && lum < 235 && saturation(rgb) < 0.62) samples.push(rgb);
    }
  }
  const brightness = rawLumTotal / Math.max(rawCount, 1);
  if (brightness < 55) throw new FaceAnalysisError('IMAGE_TOO_DARK');
  if (brightness > 225) throw new FaceAnalysisError('IMAGE_TOO_BRIGHT');
  if (samples.length < 20) throw new FaceAnalysisError('IMAGE_ANALYSIS_FAILED');

  const avg = samples.reduce((sum, rgb) => ({ r: sum.r + rgb.r, g: sum.g + rgb.g, b: sum.b + rgb.b }), { r: 0, g: 0, b: 0 });
  avg.r /= samples.length; avg.g /= samples.length; avg.b /= samples.length;
  // Luminansı sabit bir orta tona ölçeklemek ışık şiddetini azaltır; LAB b* ekseni
  // sarı-mavi sıcaklığını, a* ekseni pembe-yeşil dengesini değerlendirmeyi sağlar.
  const scale = 145 / Math.max(luminance(avg), 1);
  const normalized = { r: Math.min(255, avg.r * scale), g: Math.min(255, avg.g * scale), b: Math.min(255, avg.b * scale) };
  const lab = rgbToLab(normalized);
  const undertone: AnalysisResult['undertone'] = lab.b > 17 && lab.b > lab.a * 0.72 ? 'Sıcak' : lab.b < 11 || lab.a > lab.b * 1.15 ? 'Soğuk' : 'Nötr';
  return { undertone, brightness: Math.round(brightness), saturation: Math.round(saturation(avg) * 100), warmth: Math.round(lab.b), contrast: 0 };
};

export const createImageAnalysis = async (file: File, onStage?: (stage: FaceAnalysisStage) => void): Promise<AnalysisResult> => {
  const image = await loadImageElement(file);
  const detection = await detectFaceLandmarks(image, onStage);
  onStage?.('landmark-analysis');
  const geometry = calculateFaceShape(detection.faceLandmarks[0]);
  onStage?.('skin-analysis');
  const skin = sampleSkinRegions(image, detection.faceLandmarks[0]);
  onStage?.('recommendations');
  return {
    faceShape: geometry.faceShape, undertone: skin.undertone, lightingQuality: 'İyi', faceDetected: true,
    comment: `Landmark oranların yüz formunun ${geometry.faceShape.toLocaleLowerCase('tr-TR')} sınıfına yakın olduğunu gösteriyor. Yanak ve alın örneklerine göre tahmini alt tonun ${skin.undertone.toLocaleLowerCase('tr-TR')}. Her iki sonuç da poz, kamera ve ışık koşullarından etkilenebilir; kesin veya tıbbi bir değerlendirme değildir.`,
    faceMeasurements: geometry.measurements,
    imageMetrics: { width: image.naturalWidth, height: image.naturalHeight, ...skin },
  };
};

export const buildRecommendations = (analysis: AnalysisResult | null): Recommendation[] => {
  if (!analysis) return [];
  const shape = {
    Oval: ['Uzun Katlar ve Soft Wave', 'Oval yüz oranlarında doğal akışı koruyan esnek katlar.'],
    Yuvarlak: ['Curtain Bangs ve Uzun Katlar', 'Yüzü optik olarak uzatan dikey ve yumuşak geçişler.'],
    Kare: ['Yumuşak Yüz Çevresi Katları', 'Belirgin çene hattını yumuşatan hareketli katlar.'],
    Kalp: ['Çene Hizasında Hacim', 'Alın ve çene genişliği arasındaki dengeyi destekleyen orta boy kesim.'],
  }[analysis.faceShape];
  const tone = {
    Sıcak: ['Karamel ve Sıcak Kahve', 'Tahmini sıcak alt tonu tamamlayan altın ve karamel yansımalar.'],
    Soğuk: ['Küllü Kumral ve Soğuk Kahve', 'Tahmini soğuk alt tonla uyumlu, kızıllığı düşük geçişler.'],
    Nötr: ['Doğal Kahve ve Bej Kumral', 'Tahmini nötr alt tonla dengeli görünen yumuşak tonlar.'],
  }[analysis.undertone];
  const make = (id: string, title: string, category: string, description: string): Recommendation => ({
    id, title, category, description,
    details: `${description} Bu öneri MediaPipe landmark geometrisi ve tahmini cilt alt tonuna dayanır; profesyonel danışmanlık yerine geçmez.`,
    suitableFor: `${analysis.faceShape} yüz oranı ve ${analysis.undertone.toLocaleLowerCase('tr-TR')} alt ton tahminiyle uyum arayan kullanıcılar.`,
    maintenance: 'Kişisel saç/cilt yapısına göre değişir.', cost: 'Uygulamaya göre değişir.',
  });
  return [
    make('face-shape-cut', shape[0], 'Saç Modeli', shape[1]),
    make('undertone-color', tone[0], 'Saç Rengi', tone[1]),
    make('undertone-makeup', analysis.undertone === 'Sıcak' ? 'Şeftali ve Altın Tonları' : analysis.undertone === 'Soğuk' ? 'Gül Kurusu ve Pembe Tonları' : 'Dengeli Nude Tonlar', 'Makyaj', 'Alt ton tahminini destekleyen dengeli renk seçenekleri.'),
  ];
};
