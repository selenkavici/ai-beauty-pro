# AI Beauty Intelligence Platform

AI Beauty Pro, kullanıcıların saç modeli, saç rengi, cilt tonu ve güzellik kararlarında daha doğru seçim yapmasına yardımcı olan React + TypeScript tabanlı bir final projesidir.

## Kullanılan Teknolojiler

- React
- TypeScript
- Vite
- Tailwind CSS
- lucide-react
- localStorage tabanlı mock veri saklama

## Kurulum

```bash
npm install
```

## Çalıştırma

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Özellikler

- Sticky navbar ve mobil hamburger menü
- Smooth scroll ile çalışan tek sayfa uygulama
- Fotoğraf yükleme, format ve 10 MB boyut kontrolü
- Fotoğraf önizleme ve demo AI analiz loading akışı
- Yüz şekli, cilt alt tonu, saç yoğunluğu, stil enerjisi ve demo skor üretimi
- Analiz sonucuna göre kişiselleştirilmiş öneriler
- Detay modalı ve öneriden randevu formuna otomatik geçiş
- Keyword tabanlı çalışan demo AI chat
- Enter ile chat mesaj gönderme ve örnek soru butonları
- Validasyonlu randevu formu
- Randevu başarı modalı, localStorage kaydı ve randevu silme
- Validasyonlu iletişim formu
- Tıklanabilir LinkedIn ve GitHub footer linkleri
- Mobil, tablet ve masaüstü responsive tasarım

## Test Checklist

- npm install
- npm run dev
- npm run build
- TypeScript hatası kontrolü
- Console error kontrolü
- Navbar linkleri ve mobil menü
- Hero butonları
- Fotoğraf yükleme, yanlış dosya tipi ve büyük dosya uyarıları
- Fotoğraf yokken analiz uyarısı
- Analiz sonucu, yeni analiz ve önerilere git butonları
- Öneri detay modalı, kapatma ve randevuya geçiş
- Chat gönderme, Enter gönderimi, boş mesaj engeli ve örnek sorular
- Randevu validasyonları, geçmiş tarih engeli, başarı modalı, localStorage ve silme
- İletişim formu validasyonu ve başarı mesajı
- Footer dış linkleri
- Responsive kontroller
- Boş buton, 404 ve tamamlanmamış alan kontrolü

## Demo Notu

AI analiz bölümü final projesi için mock/demo analiz mantığıyla çalışmaktadır.
