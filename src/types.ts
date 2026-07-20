export type SectionId =
  | 'home'
  | 'problem'
  | 'how'
  | 'analysis'
  | 'recommendations'
  | 'chat'
  | 'appointment'
  | 'contact';

export type AnalysisResult = {
  faceShape: 'Oval' | 'Yuvarlak' | 'Kalp' | 'Kare';
  undertone: 'Sıcak' | 'Soğuk' | 'Nötr';
  lightingQuality: 'İyi' | 'Çok karanlık' | 'Çok parlak';
  faceDetected: true;
  comment: string;
  faceMeasurements: {
    faceHeight: number;
    cheekboneWidth: number;
    foreheadWidth: number;
    jawWidth: number;
    jawTaperRatio: number;
    heightWidthRatio: number;
  };
  imageMetrics: {
    width: number;
    height: number;
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
  };
};

export type Recommendation = {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string;
  suitableFor: string;
  maintenance: string;
  cost: string;
};

export type Appointment = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  selectedRecommendation: string;
  createdAt: string;
};

export type ToastMessage = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};
