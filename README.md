# Aura Canvas - AI Image Editor

Next.js + Cloudflare Workers ile deploy edilen AI-powered image editor.

## 🚀 Hızlı Başlangıç

### 1. Dependencies Yükle
```bash
npm install
```

### 2. Environment Variables
`.env.local` dosyası oluştur:
```
GEMINI_API_KEY=your_api_key_here
```

### 3. Development
```bash
npm run dev
```

### 4. Deploy to Cloudflare

**API Worker'ı deploy et:**
```bash
npm run deploy:api
```

**Frontend'i deploy et:**
```bash
npm run deploy
```

**Hepsini birden:**
```bash
npm run deploy:all
```

Bu komutlar:
- API Worker'ı deploy eder (`.workers.dev` URL'i verir)
- Next.js build yapar
- Frontend'i Cloudflare Pages'e deploy eder (`.pages.dev` URL'i verir)

## 📝 Deploy Sonrası

### API Worker
1. Cloudflare Dashboard → **Workers & Pages** → **Workers**
2. `aura-canvas-api` worker'ını bul
3. **Settings** → **Variables** → `GEMINI_API_KEY` ekle
4. **Custom domains** → **Add custom domain** (opsiyonel)

### Frontend
1. Cloudflare Dashboard → **Workers & Pages** → **Pages**
2. `aura-canvas` projesini bul
3. **Custom domains** → **Add custom domain**
4. Domain'ini ekle

**Önemli:** API Worker URL'ini `components/ImageEditor.tsx` dosyasında güncelle!

## 🔧 DNS Ayarları (GoDaddy)

**Seçenek A:** DNS'i Cloudflare'e taşı (Önerilen)
- Cloudflare Dashboard → **Websites** → **Add a Site**
- Nameserver'ları GoDaddy'de güncelle

**Seçenek B:** Sadece CNAME ekle
- GoDaddy DNS → CNAME kaydı:
  - Name: `@` veya `www`
  - Value: `aura-canvas.workers.dev` (deploy sonrası verilen URL)

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **Cloudflare Workers** - Edge deployment
- **Google Gemini API** - AI image generation
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
