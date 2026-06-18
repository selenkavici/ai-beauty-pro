import { MailCheck, Send } from 'lucide-react';
import { FormEvent, type ReactNode, useState } from 'react';

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ContactSectionProps = {
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
};

const emptyContact: ContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export function ContactSection({ notify }: ContactSectionProps) {
  const [form, setForm] = useState<ContactForm>(emptyContact);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [sent, setSent] = useState(false);

  const update = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSent(false);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<ContactForm> = {};
    if (!form.name.trim()) nextErrors.name = 'Ad soyad boş olamaz.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Geçerli bir e-posta adresi girin.';
    if (!form.subject.trim()) nextErrors.subject = 'Konu boş olamaz.';
    if (!form.message.trim()) nextErrors.message = 'Mesaj boş olamaz.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      notify('İletişim formundaki alanları kontrol edin.', 'error');
      return;
    }
    setSent(true);
    setForm(emptyContact);
    notify('Mesajınız başarıyla alındı.', 'success');
  };

  return (
    <section id="contact" className="section-pad bg-white/70">
      <div className="container-app grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-bold uppercase text-rose-700">İletişim</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Proje ve danışmanlık için bize ulaş</h2>
          <p className="mt-4 leading-8 text-slate-700">
            Formu doldurduğunda gerçek mail gönderimi yapılmaz; final projesi için başarılı gönderim deneyimi gösterilir.
          </p>
          {sent && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">
              <MailCheck size={22} aria-hidden="true" />
              Mesajınız başarıyla alındı.
            </div>
          )}
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-rose-100 bg-white p-6 shadow-premium" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactField label="Ad Soyad" error={errors.name}>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" />
            </ContactField>
            <ContactField label="E-posta" error={errors.email}>
              <input value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" inputMode="email" />
            </ContactField>
            <ContactField label="Konu" error={errors.subject}>
              <input value={form.subject} onChange={(e) => update('subject', e.target.value)} className="input-field" />
            </ContactField>
            <ContactField label="Mesaj" error={errors.message}>
              <textarea value={form.message} onChange={(e) => update('message', e.target.value)} className="input-field min-h-32 resize-y" />
            </ContactField>
          </div>
          <button
            type="submit"
            aria-label="İletişim mesajını gönder"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full premium-gradient px-6 py-3 font-bold text-white shadow-lg"
          >
            <Send size={18} aria-hidden="true" />
            Gönder
          </button>
        </form>
      </div>
    </section>
  );
}

function ContactField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-bold text-slate-800 sm:col-span-1">
      {label}
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-2 block text-sm font-semibold text-rose-700">{error}</span>}
    </label>
  );
}
