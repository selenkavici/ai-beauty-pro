import { CalendarCheck, Loader2, Trash2 } from 'lucide-react';
import { FormEvent, type ReactNode, useEffect, useState } from 'react';
import { services } from '../data';
import type { Appointment } from '../types';
import { Modal } from './Modal';

type AppointmentSectionProps = {
  selectedRecommendation: string;
  setSelectedRecommendation: (value: string) => void;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
};

type AppointmentForm = Omit<Appointment, 'id' | 'createdAt'>;
type FormErrors = Partial<Record<keyof AppointmentForm, string>>;

const storageKey = 'ai-beauty-pro-appointments';
const appointmentTimes = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
];

const loadAppointments = (): Appointment[] => {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Appointment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
};

const emptyForm = (selectedRecommendation = ''): AppointmentForm => ({
  name: '',
  phone: '',
  email: '',
  service: '',
  date: '',
  time: '',
  notes: '',
  selectedRecommendation,
});

const isPastDate = (date: string) => {
  if (!date) return false;
  const selected = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
};

const isToday = (date: string) => {
  if (!date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return date === today;
};

const isPastTimeToday = (date: string, time: string) => {
  if (!isToday(date) || !time) return false;
  const [hours, minutes] = time.split(':').map(Number);
  const selected = new Date();
  selected.setHours(hours, minutes, 0, 0);
  return selected <= new Date();
};

export function AppointmentSection({ selectedRecommendation, setSelectedRecommendation, notify }: AppointmentSectionProps) {
  const [form, setForm] = useState<AppointmentForm>(emptyForm(selectedRecommendation));
  const [errors, setErrors] = useState<FormErrors>({});
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Appointment | null>(null);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    setForm((current) => ({ ...current, selectedRecommendation }));
  }, [selectedRecommendation]);

  useEffect(() => {
    if (form.date && form.time && isPastTimeToday(form.date, form.time)) {
      setForm((current) => ({ ...current, time: '' }));
    }
  }, [form.date, form.time]);

  const update = (field: keyof AppointmentForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Ad soyad boş olamaz.';
    if (!form.phone.trim()) nextErrors.phone = 'Telefon boş olamaz.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Geçerli bir e-posta adresi girin.';
    if (!form.service) nextErrors.service = 'Hizmet türü seçilmelidir.';
    if (!form.date) nextErrors.date = 'Tarih seçilmelidir.';
    if (isPastDate(form.date)) nextErrors.date = 'Geçmiş tarih seçilemez.';
    if (!form.time) nextErrors.time = 'Saat seçilmelidir.';
    if (form.time && !appointmentTimes.includes(form.time)) nextErrors.time = 'Lütfen iş saatleri içinden bir saat seçin.';
    if (form.date && form.time && isPastTimeToday(form.date, form.time)) {
      nextErrors.time = 'Bugün için geçmiş saat seçilemez.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      notify('Randevu formundaki alanları kontrol edin.', 'error');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const appointment: Appointment = {
        ...form,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setAppointments((current) => [appointment, ...current]);
      setSuccess(appointment);
      setLoading(false);
      notify('Randevu başarıyla oluşturuldu.', 'success');
    }, 700);
  };

  const clearAfterSuccess = () => {
    setSuccess(null);
    setSelectedRecommendation('');
    setForm(emptyForm(''));
    setErrors({});
  };

  const removeAppointment = (id: string) => {
    setAppointments((current) => current.filter((appointment) => appointment.id !== id));
    notify('Randevu silindi.', 'info');
  };

  return (
    <section id="appointment" className="section-pad">
      <div className="container-app">
        <div className="mb-8 max-w-3xl">
          <p className="font-bold uppercase text-rose-700">Randevu</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Danışmanlık randevusu oluştur</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={submit} className="rounded-2xl border border-rose-100 bg-white p-6 shadow-premium" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ad Soyad" error={errors.name}>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" />
              </Field>
              <Field label="Telefon" error={errors.phone}>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" inputMode="tel" />
              </Field>
              <Field label="E-posta" error={errors.email}>
                <input value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" inputMode="email" />
              </Field>
              <Field label="Hizmet türü" error={errors.service}>
                <select value={form.service} onChange={(e) => update('service', e.target.value)} className="input-field">
                  <option value="">Hizmet seçin</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tarih" error={errors.date}>
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => update('date', e.target.value)}
                  className="input-field"
                />
              </Field>
              <Field label="Saat" error={errors.time}>
                <select value={form.time} onChange={(e) => update('time', e.target.value)} className="input-field">
                  <option value="">Saat seçin</option>
                  {appointmentTimes.map((time) => {
                    const disabled = Boolean(form.date && isPastTimeToday(form.date, time));
                    return (
                      <option key={time} value={time} disabled={disabled}>
                        {time}
                      </option>
                    );
                  })}
                </select>
              </Field>
              <Field label="Seçilen öneri">
                <input
                  value={form.selectedRecommendation}
                  onChange={(e) => {
                    update('selectedRecommendation', e.target.value);
                    setSelectedRecommendation(e.target.value);
                  }}
                  className="input-field"
                />
              </Field>
              <Field label="Notlar">
                <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input-field min-h-28 resize-y" />
              </Field>
            </div>
            <button
              type="submit"
              disabled={loading}
              aria-label="Randevu formunu gönder"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full premium-gradient px-6 py-3 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <CalendarCheck size={18} aria-hidden="true" />}
              Randevu Oluştur
            </button>
          </form>

          <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-premium">
            <h3 className="text-2xl font-black text-slate-950">Son Oluşturulan Randevular</h3>
            <div className="mt-5 space-y-3">
              {appointments.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-slate-700">Henüz randevu oluşturulmadı.</p>}
              {appointments.map((appointment) => (
                <article key={appointment.id} className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-slate-950">{appointment.name}</h4>
                      <p className="mt-1 text-sm text-slate-700">{appointment.service}</p>
                      <p className="mt-1 text-sm font-bold text-rose-700">
                        {appointment.date} - {appointment.time}
                      </p>
                      {appointment.selectedRecommendation && (
                        <p className="mt-1 text-sm text-slate-700">Öneri: {appointment.selectedRecommendation}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAppointment(appointment.id)}
                      aria-label={`${appointment.name} randevusunu sil`}
                      className="rounded-full bg-white p-2 text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal title="Randevu başarıyla oluşturuldu" isOpen={Boolean(success)} onClose={clearAfterSuccess}>
        {success && (
          <div className="space-y-3 text-slate-700">
            <p>
              <strong>Ad Soyad:</strong> {success.name}
            </p>
            <p>
              <strong>Hizmet:</strong> {success.service}
            </p>
            <p>
              <strong>Tarih:</strong> {success.date}
            </p>
            <p>
              <strong>Saat:</strong> {success.time}
            </p>
            <p>
              <strong>Seçilen öneri:</strong> {success.selectedRecommendation || 'Belirtilmedi'}
            </p>
            <button
              type="button"
              onClick={clearAfterSuccess}
              aria-label="Randevu başarı modalını kapat ve formu temizle"
              className="mt-3 rounded-full premium-gradient px-6 py-3 font-bold text-white"
            >
              Tamam
            </button>
          </div>
        )}
      </Modal>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-bold text-slate-800">
      {label}
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-2 block text-sm font-semibold text-rose-700">{error}</span>}
    </label>
  );
}
