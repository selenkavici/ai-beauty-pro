import type { AnalysisResult, Recommendation } from './types';

export const services = [
  'Saç Modeli Danışmanlığı',
  'Saç Rengi Danışmanlığı',
  'Cilt Tonu Analizi',
  'Komple AI Güzellik Paketi',
];

type PixelMetrics = {
  width: number;
  height: number;
  avgR: number;
  avgG: number;
  avgB: number;
  centerR: number;
  centerG: number;
  centerB: number;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  darkRatio: number;
};

type TonePlanCard = {
  id: string;
  title: string;
  category: 'Saç Rengi' | 'Alternatif Renk' | 'Makyaj' | 'Bakım Önerisi';
  description: string;
  match: number;
};

type TonePlan = {
  primaryColor: TonePlanCard;
  alternativeColor: TonePlanCard;
  makeup: TonePlanCard;
  care: TonePlanCard;
};

type FaceDetectorLike = {
  detect: (source: ImageBitmap | HTMLImageElement) => Promise<unknown[]>;
};

type FaceDetectorConstructor = new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorLike;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const loadImageElement = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Görsel okunamadı.'));
    };
    image.src = url;
  });

const getSaturation = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  return max === 0 ? 0 : (max - min) / max;
};

const isLikelySkinPixel = (r: number, g: number, b: number, luminance: number) => {
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  const yCbCrSkin = cb >= 70 && cb <= 138 && cr >= 122 && cr <= 188 && luminance > 38 && luminance < 245;
  const warmSkin = r > 50 && g > 35 && b > 24 && r >= g * 0.92 && r > b * 1.08 && luminance > 45;
  const lightSkin = luminance > 120 && r > 105 && g > 72 && b > 52 && r >= g * 0.95 && g >= b * 0.76;
  return yCbCrSkin || warmSkin || lightSkin;
};

const tryNativeFaceDetector = async (file: File) => {
  const maybeDetector = (window as Window & { FaceDetector?: FaceDetectorConstructor }).FaceDetector;
  if (!maybeDetector || typeof createImageBitmap !== 'function') return null;

  try {
    const bitmap = await createImageBitmap(file);
    try {
      const detector = new maybeDetector({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(bitmap);
      return faces.length > 0;
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
};

const validateFaceFallback = async (file: File) => {
  const image = await loadImageElement(file);
  const aspect = image.naturalWidth / Math.max(image.naturalHeight, 1);
  if (aspect < 0.48 || aspect > 2.05 || image.naturalWidth < 180 || image.naturalHeight < 180) {
    return false;
  }

  const maxSize = 180;
  const ratio = Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight, 1);
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const centerX = width * 0.5;
  const centerY = height * 0.43;
  const faceRadiusX = width * 0.26;
  const faceRadiusY = height * 0.28;
  const upperRadiusX = width * 0.34;
  const upperRadiusY = height * 0.34;
  let centerSkin = 0;
  let centerPixels = 0;
  let upperSkin = 0;
  let upperPixels = 0;
  let totalSkin = 0;
  let edgeCount = 0;
  let edgeSamples = 0;
  let brightNeutral = 0;
  let lowSaturation = 0;
  let centerEdgeCount = 0;
  let centerEdgeSamples = 0;
  let cornerSkin = 0;
  let cornerPixels = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const saturation = getSaturation(r, g, b);
      const skin = isLikelySkinPixel(r, g, b, luminance);
      const faceX = (x - centerX) / faceRadiusX;
      const faceY = (y - centerY) / faceRadiusY;
      const upperX = (x - centerX) / upperRadiusX;
      const upperY = (y - height * 0.38) / upperRadiusY;

      if (skin) totalSkin += 1;
      if (luminance > 210 && saturation < 0.12) brightNeutral += 1;
      if (saturation < 0.1) lowSaturation += 1;

      if (faceX * faceX + faceY * faceY <= 1) {
        centerPixels += 1;
        if (skin) centerSkin += 1;
      }

      if (upperX * upperX + upperY * upperY <= 1) {
        upperPixels += 1;
        if (skin) upperSkin += 1;
      }

      if (
        (x < width * 0.18 || x > width * 0.82) &&
        (y < height * 0.18 || y > height * 0.82)
      ) {
        cornerPixels += 1;
        if (skin) cornerSkin += 1;
      }

      if (x + 2 < width && y + 2 < height) {
        const rightIndex = (y * width + x + 2) * 4;
        const downIndex = ((y + 2) * width + x) * 4;
        const rightLum = 0.2126 * pixels[rightIndex] + 0.7152 * pixels[rightIndex + 1] + 0.0722 * pixels[rightIndex + 2];
        const downLum = 0.2126 * pixels[downIndex] + 0.7152 * pixels[downIndex + 1] + 0.0722 * pixels[downIndex + 2];
        const hasSharpEdge = Math.abs(luminance - rightLum) > 46 || Math.abs(luminance - downLum) > 46;
        if (hasSharpEdge) edgeCount += 1;
        if (faceX * faceX + faceY * faceY <= 1) {
          centerEdgeSamples += 1;
          if (hasSharpEdge) centerEdgeCount += 1;
        }
        edgeSamples += 1;
      }
    }
  }

  const sampleDivisor = Math.ceil(width / 2) * Math.ceil(height / 2);
  const centerSkinRatio = centerSkin / Math.max(centerPixels, 1);
  const upperSkinRatio = upperSkin / Math.max(upperPixels, 1);
  const totalSkinRatio = totalSkin / sampleDivisor;
  const edgeRatio = edgeCount / Math.max(edgeSamples, 1);
  const centerEdgeRatio = centerEdgeCount / Math.max(centerEdgeSamples, 1);
  const brightNeutralRatio = brightNeutral / sampleDivisor;
  const lowSaturationRatio = lowSaturation / sampleDivisor;
  const cornerSkinRatio = cornerSkin / Math.max(cornerPixels, 1);
  const skinConcentration = centerSkinRatio - cornerSkinRatio;
  const phoneScreenshotRatio = aspect < 0.62 && totalSkinRatio < 0.2;
  const screenshotScore =
    (edgeRatio > 0.2 ? 0.28 : 0) +
    (centerEdgeRatio > 0.22 ? 0.2 : 0) +
    (brightNeutralRatio > 0.26 ? 0.22 : 0) +
    (lowSaturationRatio > 0.52 ? 0.18 : 0) +
    (phoneScreenshotRatio ? 0.28 : 0) +
    (totalSkinRatio < 0.08 ? 0.18 : 0);
  const screenshotLike = screenshotScore > 0.55;
  const textHeavy = edgeRatio > 0.28 && centerEdgeRatio > 0.2 && centerSkinRatio < 0.22;
  const faceScore =
    centerSkinRatio * 0.46 +
    upperSkinRatio * 0.22 +
    totalSkinRatio * 0.16 +
    Math.max(skinConcentration, 0) * 0.18 +
    (aspect > 0.55 && aspect < 1.75 ? 0.12 : 0) -
    screenshotScore * 0.5 -
    (textHeavy ? 0.25 : 0);

  return (
    faceScore >= 0.45 &&
    centerSkinRatio >= 0.2 &&
    upperSkinRatio >= 0.14 &&
    totalSkinRatio >= 0.065 &&
    skinConcentration >= 0.03 &&
    screenshotScore <= 0.55 &&
    !screenshotLike &&
    !textHeavy
  );
};

export const validateImageHasFace = async (file: File) => {
  const nativeResult = await tryNativeFaceDetector(file);
  if (nativeResult !== null) return nativeResult;
  return validateFaceFallback(file);
};

const readImageMetrics = async (file: File): Promise<PixelMetrics> => {
  const image = await loadImageElement(file);
  const maxSize = 120;
  const ratio = Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight, 1);
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('Canvas analiz alanı oluşturulamadı.');
  }

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const centerLeft = width * 0.28;
  const centerRight = width * 0.72;
  const centerTop = height * 0.24;
  const centerBottom = height * 0.76;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalLum = 0;
  let totalLumSquare = 0;
  let totalSat = 0;
  let darkPixels = 0;
  let centerR = 0;
  let centerG = 0;
  let centerB = 0;
  let centerCount = 0;
  const count = width * height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      totalR += r;
      totalG += g;
      totalB += b;
      totalLum += luminance;
      totalLumSquare += luminance * luminance;
      totalSat += getSaturation(r, g, b);
      if (luminance < 72) darkPixels += 1;

      if (x >= centerLeft && x <= centerRight && y >= centerTop && y <= centerBottom) {
        centerR += r;
        centerG += g;
        centerB += b;
        centerCount += 1;
      }
    }
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;
  const brightness = totalLum / count;
  const variance = totalLumSquare / count - brightness * brightness;
  const centerDivisor = Math.max(centerCount, 1);
  const centerAvgR = centerR / centerDivisor;
  const centerAvgG = centerG / centerDivisor;
  const centerAvgB = centerB / centerDivisor;

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    avgR,
    avgG,
    avgB,
    centerR: centerAvgR,
    centerG: centerAvgG,
    centerB: centerAvgB,
    brightness,
    contrast: Math.sqrt(Math.max(variance, 0)),
    saturation: totalSat / count,
    warmth: (avgR + centerAvgR + avgG * 0.45 + centerAvgG * 0.35 - avgB * 1.15 - centerAvgB * 1.05) / 2,
    darkRatio: darkPixels / count,
  };
};

export const createImageAnalysis = async (file: File): Promise<AnalysisResult> => {
  const hasFace = await validateImageHasFace(file);
  if (!hasFace) {
    throw new Error('FACE_NOT_FOUND');
  }
  const metrics = await readImageMetrics(file);
  const seed = hashString(
    `${file.name}-${file.size}-${file.lastModified}-${metrics.width}x${metrics.height}-${Math.round(metrics.avgR)}-${Math.round(metrics.avgG)}-${Math.round(metrics.avgB)}-${Math.round(metrics.centerR)}-${Math.round(metrics.centerG)}-${Math.round(metrics.centerB)}-${Math.round(metrics.contrast * 10)}-${Math.round(metrics.saturation * 1000)}`,
  );
  const faceShapes = ['Oval', 'Yuvarlak', 'Kalp', 'Kare'] as const;
  const aspect = metrics.width / Math.max(metrics.height, 1);
  const shapeIndex = Math.abs(Math.round(aspect * 10) + (seed % 17) + Math.round(metrics.centerR - metrics.centerB)) % faceShapes.length;
  const faceShape = faceShapes[shapeIndex];
  const undertone =
    metrics.centerR > metrics.centerB + 12 && metrics.centerG > metrics.centerB + 4
      ? 'Sıcak'
      : metrics.centerB > metrics.centerR + 8 || Math.abs(metrics.centerR - metrics.centerB) < 7
        ? 'Soğuk'
        : 'Nötr';
  const hairDensity =
    metrics.darkRatio > 0.34 || metrics.contrast > 58
      ? 'Yoğun'
      : metrics.darkRatio < 0.16 && metrics.contrast < 38
        ? 'İnce'
        : 'Normal';
  const styleEnergy =
    metrics.contrast > 58 && metrics.saturation > 0.34
      ? 'Cesur'
      : metrics.contrast < 34 && metrics.saturation < 0.24
        ? 'Doğal'
        : metrics.brightness < 86 || metrics.darkRatio > 0.4
          ? 'Klasik'
          : 'Modern';
  const lightBalance = 1 - Math.abs(metrics.brightness - 138) / 138;
  const clarity = clamp(metrics.contrast / 62, 0, 1);
  const score = clamp(Math.round(84 + lightBalance * 6 + clarity * 5 + metrics.saturation * 4 + (seed % 3)), 84, 97);
  const warmthLabel = metrics.warmth > 28 ? 'sıcak' : metrics.warmth < 8 ? 'soğuk' : 'dengeli';

  return {
    faceShape,
    undertone,
    hairDensity,
    styleEnergy,
    score,
    comment: `Fotoğrafındaki ışık dengesi, merkez bölge tonları ve ${warmthLabel} renk sıcaklığına göre cilt alt tonun ${undertone.toLocaleLowerCase('tr-TR')} görünüyor. Yüz oranların ${faceShape.toLocaleLowerCase('tr-TR')} forma yakın olduğu için ${faceShape === 'Yuvarlak' ? 'yüzü daha uzun gösteren katlı kesimler' : faceShape === 'Kare' ? 'yüz çevresinde yumuşak katlar' : faceShape === 'Kalp' ? 'çene hizasında hacim veren orta boy kesimler' : 'katlı kesimler ve soft wave modeller'} daha uyumlu olabilir.`,
    imageMetrics: {
      width: metrics.width,
      height: metrics.height,
      brightness: Math.round(metrics.brightness),
      contrast: Math.round(metrics.contrast),
      saturation: Math.round(metrics.saturation * 100),
      warmth: Math.round(metrics.warmth),
    },
  };
};

export const buildRecommendations = (analysis: AnalysisResult | null): Recommendation[] => {
  const tone = analysis?.undertone ?? 'Nötr';
  const face = analysis?.faceShape ?? 'Oval';
  const energy = analysis?.styleEnergy ?? 'Modern';
  const tonePlans: Record<AnalysisResult['undertone'], TonePlan> = {
    Sıcak: {
      primaryColor: {
        id: 'caramel-glow',
        title: 'Karamel Işıltı',
        category: 'Saç Rengi',
        description: 'Sıcak alt tonu aydınlatan, yüz çevresinde canlılık veren geçişler.',
        match: 96,
      },
      alternativeColor: {
        id: 'warm-brown',
        title: 'Sıcak Kahve Tonu',
        category: 'Alternatif Renk',
        description: 'Ciltteki sıcak yansımalarla uyumlu, doğal ve parlak kahve tonu.',
        match: 94,
      },
      makeup: {
        id: 'peach-makeup',
        title: 'Şeftali Tonları',
        category: 'Makyaj',
        description: 'Allık ve dudakta sıcak, canlı ama doğal bir bitiş sağlar.',
        match: 92,
      },
      care: {
        id: 'natural-gloss-care',
        title: 'Doğal Parlaklık Bakımı',
        category: 'Bakım Önerisi',
        description: 'Sıcak yansımaları canlı tutmak için nem ve parlaklık odaklı bakım rutini.',
        match: 91,
      },
    },
    Soğuk: {
      primaryColor: {
        id: 'ash-bronde',
        title: 'Küllü Kumral',
        category: 'Saç Rengi',
        description: 'Soğuk alt tonu dengeleyen modern ve risksiz kumral geçiş.',
        match: 95,
      },
      alternativeColor: {
        id: 'cool-brown',
        title: 'Soğuk Kahve',
        category: 'Alternatif Renk',
        description: 'Kızıllık içermeyen, daha net ve sofistike kahve tonu.',
        match: 93,
      },
      makeup: {
        id: 'dusty-rose',
        title: 'Gül Kurusu Makyaj',
        category: 'Makyaj',
        description: 'Dudak ve yanakta soğuk alt tonla uyumlu zarif renk etkisi.',
        match: 92,
      },
      care: {
        id: 'shine-balance-care',
        title: 'Işıltı Dengeleyici Bakım',
        category: 'Bakım Önerisi',
        description: 'Küllü ve soğuk tonların matlaşmasını azaltan parlaklık denge rutini.',
        match: 90,
      },
    },
    Nötr: {
      primaryColor: {
        id: 'natural-brown',
        title: 'Doğal Kahve',
        category: 'Saç Rengi',
        description: 'Nötr alt tona uyum sağlayan dengeli ve premium renk geçişi.',
        match: 96,
      },
      alternativeColor: {
        id: 'beige-bronde',
        title: 'Bej Kumral',
        category: 'Alternatif Renk',
        description: 'Ne çok sıcak ne çok soğuk, risksiz ve modern kumral tonu.',
        match: 94,
      },
      makeup: {
        id: 'soft-glam',
        title: 'Soft Glam Makyaj',
        category: 'Makyaj',
        description: 'Nötr geçişli göz makyajı ve doğal dudak tonlarıyla dengeli etki.',
        match: 93,
      },
      care: {
        id: 'minimal-care-note',
        title: 'Parlaklık ve Nem Bakımı',
        category: 'Bakım Önerisi',
        description: 'Doğal kahve ve bej tonları destekleyen hafif nem ve parlaklık rutini.',
        match: 91,
      },
    },
  };
  const faceRecommendation =
    face === 'Yuvarlak'
      ? {
          id: 'curtain-bangs',
          title: 'Curtain Bangs',
          description: 'Yüzü daha uzun ve dengeli gösteren, iki yana açılan modern perçem formu.',
          match: 96,
          details: 'Perde perçem ve uzun katlar yüzün iki yanına dikey etki vererek yuvarlak formu dengeler.',
          suitableFor: 'Yüzünü daha ince ve uzun göstermek isteyen kullanıcılar.',
        }
      : face === 'Kare'
        ? {
            id: 'soft-face-layers',
            title: 'Yumuşak Yüz Çevresi Katları',
            description: 'Kare yüz hattını daha yumuşak gösteren dalgalı ve katlı model.',
            match: 95,
            details: 'Yüz çevresindeki yumuşak katlar çene hattını sertleştirmeden dengeler ve hareket sağlar.',
            suitableFor: 'Belirgin çene hattını daha yumuşak göstermek isteyen kullanıcılar.',
          }
        : face === 'Kalp'
          ? {
              id: 'medium-volume-cut',
              title: 'Orta Boy Hacimli Kesim',
              description: 'Çene hizasında hacim vererek kalp yüz formunu dengeleyen kesim.',
              match: 94,
              details: 'Orta boy kesim, uçlarda hacim ve curtain bangs ile alın-çene dengesini daha uyumlu gösterir.',
              suitableFor: 'Üst yüz bölgesi daha belirgin olan ve alt bölgede denge arayan kullanıcılar.',
            }
          : {
              id: 'long-layers-soft-wave',
              title: 'Long Layers & Soft Wave',
              description: 'Oval yüz formunda doğal akış sağlayan uzun katlar ve yumuşak dalgalar.',
              match: 96,
              details: 'Oval yüz çoğu modeli taşır; uzun katlar ve soft wave yüz oranlarını bozmadan hareket kazandırır.',
              suitableFor: 'Zarif, esnek ve kolay şekillendirilebilir bir model isteyen kullanıcılar.',
            };
  const tonePlan = tonePlans[tone];
  const createToneCard = (card: TonePlanCard): Recommendation => ({
    ...card,
    details: `${card.title}, ${tone.toLocaleLowerCase('tr-TR')} cilt alt tonuyla uyumlu görünmesi için önerildi. Fotoğrafın renk sıcaklığı ve merkez tonları bu seçeneği destekliyor.`,
    suitableFor: 'Cilt alt tonuyla uyumlu, fotoğraftaki ışık ve renk dengesine göre daha güvenli bir değişim isteyen kullanıcılar.',
    maintenance:
      card.category === 'Saç Rengi' || card.category === 'Alternatif Renk'
        ? 'Orta. Ton koruyucu ürün ve düzenli parlaklık bakımı önerilir.'
        : card.category === 'Bakım Önerisi'
          ? 'Düşük-Orta. Haftalık bakım rutiniyle sürdürülebilir.'
          : 'Düşük. Günlük kullanımda kolay yenilenebilir.',
    cost: card.category === 'Bakım Önerisi' ? 'Düşük-Orta' : card.category === 'Makyaj' ? 'Düşük-Orta' : 'Orta-Yüksek',
  });
  const styleTitle =
    tone === 'Nötr'
      ? 'Minimal Günlük Stil'
      : energy === 'Cesur'
        ? 'Canlı İmza Stil'
        : energy === 'Doğal'
          ? 'Minimal Günlük Stil'
          : energy === 'Klasik'
            ? 'Klasik Zarif Stil'
            : 'Modern Dengeli Stil';

  return [
    {
      id: faceRecommendation.id,
      title: faceRecommendation.title,
      category: 'Saç Modeli',
      description: faceRecommendation.description,
      match: faceRecommendation.match,
      details: faceRecommendation.details,
      suitableFor: faceRecommendation.suitableFor,
      maintenance: 'Orta seviye. 8-10 haftada bir uç toparlama önerilir.',
      cost: 'Orta',
    },
    createToneCard(tonePlan.primaryColor),
    createToneCard(tonePlan.alternativeColor),
    createToneCard(tonePlan.makeup),
    {
      id: 'signature-style',
      title: styleTitle,
      category: 'Stil',
      description: `${energy} stil enerjisini destekleyen, fotoğraf analizine göre dengeli güzellik rutini.`,
      match: energy === 'Klasik' || energy === 'Modern' ? 93 : 89,
      details: 'Kontrast, doygunluk ve ışık dengesi birlikte değerlendirildiğinde bu stil enerjisi günlük kullanıma uyarlanabilir bir görünüm sağlar.',
      suitableFor: 'Kendi stil enerjisini koruyarak daha planlı bir güzellik rutini isteyen kullanıcılar.',
      maintenance: 'Düşük. Ürün seçimi doğru yapıldığında gün içinde kolay yenilenir.',
      cost: 'Orta',
    },
    createToneCard(tonePlan.care),
  ];
};
