# AI Beauty Pro

AI Beauty Pro, önceden eğitilmiş MediaPipe Face Landmarker modelini kullanarak fotoğrafları tamamen tarayıcıda inceleyen React + TypeScript final projesidir.

## Gerçek AI modeli

Proje `@mediapipe/tasks-vision` paketini ve Google'ın pretrained Face Landmarker model asset'ini kullanır. Hash, dosya adı, dosya boyutu, rastgele skor veya yüz varmış gibi davranan renk fallback'i kullanılmaz. Aynı görsel, dosya adı değişse de aynı piksel ve landmark verileriyle değerlendirilir.

## MediaPipe Face Landmarker

Model yüz tespiti ve yüz landmark noktalarını üretir. Uygulama önce GPU delegate'i dener, desteklenmeyen tarayıcılarda CPU'ya geçer. Model örneği bellekte saklanır ve her analizde yeniden oluşturulmaz.

Model yalnızca landmark tespiti yapar. Yüz şekli; yüz yüksekliği, elmacık kemiği, alın ve çene genişliği ile çene daralma oranlarından tahmini olarak sınıflandırılır. Bu sınıflandırma eğitilmiş veya doğrulanmış ayrı bir yüz şekli modeli değildir.

## Tarayıcı içi görüntü işleme

Cilt alt tonu bütün fotoğraftan değil, landmarklarla belirlenen sol yanak, sağ yanak ve alın bölgelerinden örneklenir. Aşırı karanlık, parlak ve doygun pikseller filtrelenir; ışık normalize edildikten sonra LAB renk uzayında sıcak, soğuk veya nötr tahmini üretilir.

## Gizlilik

Fotoğraf herhangi bir uygulama sunucusuna veya analiz API'sine gönderilmez ve kaydedilmez. Model/WASM dosyaları ilk kullanımda Google Storage ve jsDelivr üzerinden tarayıcıya indirilir; fotoğraf verisi bu isteklere dahil edilmez.

## Modelin sınırlamaları

- MediaPipe saç yoğunluğunu, stil enerjisini veya güzellik uyumluluk yüzdesini ölçmez; uygulama bu alanları üretmez.
- Yüz şekli geometrik oranlardan, cilt alt tonu ise seçili bölgelerin renklerinden tahmin edilir.
- Poz, mimik, kamera lensi, makyaj, beyaz dengesi ve ışık sonuçları etkileyebilir.
- Sonuçlar bilimsel, tıbbi veya profesyonel değerlendirme değildir.

## Teknolojiler

- React 19, TypeScript, Vite, Tailwind CSS
- `@mediapipe/tasks-vision`
- HTML Canvas API
- localStorage tabanlı yerel randevu saklama

## Kurulum ve build

```bash
npm install
npm run dev
npm run build
```

## Kontrol listesi

- Yüz olmayan görsel `Yüz bulunamadı` hatası verir.
- Tek yüzlü selfie analiz edilir; birden fazla yüz reddedilir.
- Aynı görsel farklı dosya adıyla aynı sonucu verir.
- Fotoğraf harici bir sunucuya yüklenmez.
- GPU kullanılamadığında CPU fallback denenir; model yükleme hatası anlaşılır biçimde gösterilir.
- Randevu ve iletişim akışları verilerin yalnızca tarayıcıda kaldığını açıkça belirtir.
