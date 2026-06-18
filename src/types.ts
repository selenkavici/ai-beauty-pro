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
  hairDensity: 'İnce' | 'Normal' | 'Yoğun';
  styleEnergy: 'Doğal' | 'Modern' | 'Cesur' | 'Klasik';
  score: number;
  comment: string;
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
  match: number;
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
