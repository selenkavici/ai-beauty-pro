import { useCallback, useEffect, useState } from 'react';
import { AnalysisSection } from './components/AnalysisSection';
import { AppointmentSection } from './components/AppointmentSection';
import { ChatSection } from './components/ChatSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Navbar } from './components/Navbar';
import { ProblemSolution } from './components/ProblemSolution';
import { RecommendationsSection } from './components/RecommendationsSection';
import { Toast } from './components/Toast';
import type { AnalysisResult, SectionId, ToastMessage } from './types';

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const navigate = useCallback((id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const notify = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  return (
    <>
      <Navbar onNavigate={navigate} />
      <main>
        <Hero onNavigate={navigate} />
        <ProblemSolution />
        <HowItWorks />
        <AnalysisSection
          result={analysis}
          setResult={setAnalysis}
          onNavigate={navigate}
          notify={notify}
        />
        <RecommendationsSection
          analysis={analysis}
          onNavigate={navigate}
          onSelectRecommendation={setSelectedRecommendation}
        />
        <ChatSection analysis={analysis} />
        <AppointmentSection
          selectedRecommendation={selectedRecommendation}
          setSelectedRecommendation={setSelectedRecommendation}
          notify={notify}
        />
        <ContactSection notify={notify} />
      </main>
      <Footer onNavigate={navigate} />
      <Toast toasts={toasts} />
    </>
  );
}

export default App;
