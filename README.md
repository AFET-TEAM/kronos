# KRONOS - Zaman Yönetim Sistemi

**Kronos**, modern web teknolojileri kullanarak geliştirilmiş, tam yığın zaman yönetim ve çalışan takibi uygulamasıdır. Kullanıcılar çalışma saatlerini kaydedebilir, raporlar oluşturabilir ve performans metriklerini izleyebilirler.

---

## 📋 İçindekiler

- [Proje Özellikleri](#proje-özellikleri)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [Geliştirme](#geliştirme)
- [Mimarı ve Tasarım Desenleri](#mimarı-ve-tasarım-desenleri)
- [Stil Sistemi](#stil-sistemi)
- [Bileşen Sistemi](#bileşen-sistemi)
- [Servisler ve State Yönetimi](#servisler-ve-state-yönetimi)
- [Performans ve SEO Optimizasyonları](#performans-ve-seo-optimizasyonları)

---

## 🎯 Proje Özellikleri

✅ **Responsive Tasarım** - Tüm cihazlarda uyumlu kullanıcı arayüzü  
✅ **Kullanıcı Doğrulaması** - Güvenli giriş ve oturum yönetimi  
✅ **Zaman Takibi** - Çalışma saatlerini gerçek zamanda izleme  
✅ **Raporlama** - Haftalık ve aylık performans raporları  
✅ **TypeScript Desteği** - Tip güvenliği ve gelişmiş IDE yardımı  
✅ **Accessibility** - WCAG standartlarına uyumlu tasarım  
✅ **SEO Optimized** - Meta etiketleri ve yapılandırılmış veriler

<img width="649" height="713" alt="Kronos Lighthouse" src="https://github.com/user-attachments/assets/6333fb95-c296-4c6a-9395-aa5a3b0d861b" />


---

## 🛠️ Teknoloji Yığını

### Frontend Framework

- **Svelte 4** - Reactive web framework
- **SvelteKit** - Meta framework (routing, SSR, API routes)
- **TypeScript 5** - Statically typed JavaScript

### Stil Yönetimi

- **Tailwind CSS 3.4** - Utility-first CSS framework
- **SCSS/SASS** - Sass Embedded compiler
- **PostCSS** - CSS transformation

### Derleme ve Araçlar

- **Vite 5** - Next-gen frontend build tool
- **Adapter Auto** - Otomatik platform seçimi

### Kütüphaneler

- **clsx** - Conditional className combining

### Geliştirme Araçları

- **Svelte Check** - Svelte bileşenleri için type checking
- **Publint** - Paket kalitesi kontrolü

---

## 📁 Proje Yapısı

```
kronos/
├── src/
│   ├── app.html                          # Ana HTML şablonu
│   ├── app.d.ts                          # Global tip tanımlamaları
│   ├── app.scss                          # Global stiller
│   ├── hooks.server.ts                   # Sunucu tarafı hooks (caching)
│   │
│   ├── lib/
│   │   ├── components/
│   │   │   ├── layout/                   # Layout bileşenleri
│   │   │   │   ├── Footer/               # Sayfa alt bölümü
│   │   │   │   ├── Header/               # Sayfa üst bölümü
│   │   │   │   ├── Modal/                # Modal dialog
│   │   │   │   └── Sidebar/              # Yan menü
│   │   │   │
│   │   │   ├── modules/                  # Sayfalar için bileşenler
│   │   │   │   ├── dailyreportcard/      # Günlük rapor kartı
│   │   │   │   ├── GeneralInfocard/      # Bilgi kartı
│   │   │   │   ├── Homepage/             # Ana sayfa modülü
│   │   │   │   ├── LoginForm/            # Giriş formu
│   │   │   │   └── Profile/              # Profil sayfası
│   │   │   │
│   │   │   └── ui/                       # Tekrar kullanılabilir UI bileşenleri
│   │   │       ├── Button/               # Düğme
│   │   │       ├── Checkbox/             # Onay kutusu
│   │   │       ├── GeneralListItem/      # Liste elemanı
│   │   │       ├── GeneralSelectbox/     # Seçim kutusu
│   │   │       ├── Icon/                 # İkon
│   │   │       ├── Image/                # Optimized resim
│   │   │       ├── Input/                # Metin girişi
│   │   │       ├── Pagination/           # Sayfalandırma
│   │   │       ├── SearchBar/            # Arama çubuğu
│   │   │       └── TextArea/             # Metin alanı
│   │   │
│   │   ├── services/                     # İş mantığı servisleri
│   │   │   ├── api.config.ts             # API yapılandırması
│   │   │   ├── auth.service.ts           # Kimlik doğrulama servisi
│   │   │   └── auth.types.ts             # Kimlik doğrulama tipleri
│   │   │
│   │   ├── store/                        # Global state yönetimi
│   │   │   └── store.ts                  # Svelte stores
│   │   │
│   │   └── styles/                       # Global ve paylaşılan stiller
│   │       ├── _index.scss               # Stil index dosyası
│   │       ├── _mixins.scss              # SCSS mixin'leri
│   │       ├── global.scss               # Global stil kuralları
│   │       └── reset.scss                # CSS reset
│   │
│   └── routes/                           # SvelteKit sayfaları
│       └── +page.svelte                  # Ana rota
│
├── static/                               # Statik kaynaklar
│   ├── _headers                          # Custom headers
│   ├── robots.txt                        # SEO robot yönetimi
│   ├── fonts/                            # Montserrat yazı tipleri
│   ├── icons/                            # SVG ikonları
│   └── images/                           # Optimize edilmiş görseller
│
├── package.json                          # Bağımlılıklar ve scripts
├── svelte.config.js                      # Svelte yapılandırması
├── vite.config.ts                        # Vite yapılandırması
├── tailwind.config.js                    # Tailwind CSS yapılandırması
├── tsconfig.json                         # TypeScript yapılandırması
├── postcss.config.js                     # PostCSS yapılandırması
└── README.md                             # Bu dosya
```

---

## 🚀 Kurulum

### Ön Gereksinimler

- Node.js 18+
- npm 9+ (veya yarn/pnpm)

### Adımlar

```bash
# 1. Depoyu klonlayın
git clone https://github.com/FreeFrontendTeam/kronos.git
cd kronos

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev

# 4. Tarayıcıda açın
# http://localhost:5173
```

---

## 👨‍💻 Geliştirme

### Komutlar

```bash
# Geliştirme sunucusunu başlat (hot reload ile)
npm run dev

# Tarayıcıda aç
npm run dev -- --open

# Type checking ve Svelte validation
npm run check

# Watch modunda checking
npm run check:watch

# Production derlemesi
npm run build

# Production build'i preview et
npm run preview
```

### Geliştirme Akışı

1. **Bileşen Oluşturma**: `src/lib/components` içinde yeni bileşen dosyası oluşturun
2. **Stil Yazma**: SCSS kullanarak, `_mixins.scss` içindeki mixin'leri kullanın
3. **Tip Tanımlaması**: `.types.ts` dosyaları ile prop tiplerini tanımlayın
4. **Servis İntegrasyonu**: `src/lib/services` içinde API çağrılarını yapın

---

## 🏗️ Mimarı ve Tasarım Desenleri

### 1. **Bileşen Tabanlı Mimarı**

Proje, yeniden kullanılabilir Svelte bileşenleri kullanarak modüler yapı sağlar.

```
UI Bileşenleri (Button, Input, etc.)
         ↓
Modül Bileşenleri (LoginForm, Profile, etc.)
         ↓
Layout Bileşenleri (Header, Sidebar, Footer)
         ↓
Sayfa Bileşenleri (Routes)
```

### 2. **Servis Tabanlı Mimarı**

İş mantığı, bileşenlerden ayrı olarak `services/` klasöründe tutulur.

```typescript
// Örnek: Authentication Service
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse>;
export function setAuthToken(token: string): void;
export function isAuthenticated(): boolean;
```

### 3. **Prop Drilling**

`bind:` direktifi ile iki yönlü veri bağlama:

```svelte
<!-- Parent -->
<Child bind:isOpen={showModal} />

<!-- Child -->
<script>
  export let isOpen: boolean = false;
</script>
```

### 4. **Store Yönetimi**

Svelte's reactive stores ile global state yönetimi:

```typescript
// src/lib/store/store.ts
export const initialDate = writable(new Date());
```

### 5. **Type Safety**

TypeScript ile runtime hataları önceden yakalama:

```typescript
// src/lib/services/auth.types.ts
interface LoginCredentials {
  email: string;
  password: string;
}
```

---

## 🎨 Stil Sistemi

### Tailwind CSS Custom Theme

Tailwind yapılandırması `tailwind.config.js` içinde özelleştirilmiş renkler tanımlar:

```javascript
colors: {
  "space-purple": "#2f1275",      // Birincil marka rengi
  "ocean-blue": "#004aad",        // İkincil rengi
  "primary": "#18a0fb",           // Başlıca eylem rengi
  "secondary": "#ffae3b",         // İkincil eylem rengi
  // ... daha fazla
}
```

### SCSS Mixin'leri

Yeniden kullanılabilir stil fonksiyonları:

```scss
// _mixins.scss
@function toRem($val) {
  $remValue: calc($val/16) + rem;
  @return $remValue;
}

// Kullanım
h1 {
  font-size: toRem(32); // 2rem
}
```

### Global Stil Hiyerarşisi

```
reset.scss (CSS reset)
    ↓
global.scss (tipografi, yazı tipleri)
    ↓
_mixins.scss (SCSS fonksiyonları)
    ↓
Bileşen SCSS modülleri
    ↓
Tailwind CSS classes
```

### Font Sistemi

**Montserrat** yazı tipi, 6 ağırlık ile optimize edilmiş:

- 300 (Light)
- 400 (Regular)
- 500 (Medium)
- 600 (SemiBold)
- 700 (Bold)
- 800 (ExtraBold)

---

## 🧩 Bileşen Sistemi

### UI Bileşenleri

#### Button

```svelte
<Button
  text="Gönder"
  variant="primary"
  onClick={() => handleSubmit()}
  className="custom-class"
/>
```

#### Input

```svelte
<Input
  type="email"
  placeholder="Email adresiniz"
  bind:value={email}
/>
```

#### GeneralSelectbox

```svelte
<GeneralSelectbox
  options={[{ label: "Seçenek 1", value: "1" }]}
  bind:value={selected}
/>
```

#### Pagination

```svelte
<Pagination
  totalPages={10}
  bind:currentPage={page}
/>
```

### Modül Bileşenleri

#### LoginForm

Kimlik doğrulama formu ile API entegrasyonu.

#### Homepage

Ana sayfa landing sayfası, slider ve hero section.

#### GeneralInfoCard

İstatistik görüntüleme kartı.

#### DailyReportCard

Günlük rapor verilerini gösteren bileşen.

### Layout Bileşenleri

#### Header

Sayfanın üst navigasyon bölümü.

#### Sidebar

Yan menü ve navigasyon.

#### Modal

Dialog penceresi bileşeni.

#### Footer

Sayfa alt bölümü.

---

## 💾 Servisler ve State Yönetimi

### Authentication Service

```typescript
// src/lib/services/auth.service.ts

// Giriş API çağrısı
login(credentials: LoginCredentials): Promise<LoginResponse>

// Token yönetimi
setAuthToken(token: string): void
getAuthToken(): string | null
removeAuthToken(): void

// Durum kontrolü
isAuthenticated(): boolean
```

### API Yapılandırması

```typescript
// src/lib/services/api.config.ts
const API_URL = process.env.VITE_API_URL;
const API_HEADERS = {
  "Content-Type": "application/json",
};
```

### Global State (Svelte Stores)

```typescript
// src/lib/store/store.ts
export const initialDate = writable(new Date())

// Kullanım
<script>
  import { initialDate } from '$lib/store/store'

  $: selectedDate = $initialDate
</script>
```

---

## ⚡ Performans ve SEO Optimizasyonları

### 1. **Caching Stratejisi** (hooks.server.ts)

```typescript
// Statik kaynaklar (1 yıl)
/_app/immutable/
*.woff2, *.ttf, *.otf
/icons/*.svg
/images/*.(webp|png|jpg)

// HTML dosyaları (1 saat)
*.html, /

// Diğer kaynaklar (varsayılan)
```

### 2. **Font Preloading**

```html
<link
  rel="preload"
  href="/fonts/Montserrat-Regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### 3. **Image Optimization**

```svelte
<Image
  src="/images/login-rocket.webp"
  alt="rocket"
  objectFit="contain"
  priority={true}  <!-- LCP'yi iyileştir -->
/>
```

### 4. **Content Security Policy**

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  ..."
/>
```

### 5. **SEO Meta Tags**

```svelte
<svelte:head>
  <title>Kronos - Zaman Yönetim Sistemi</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
  <meta property="og:image" content="..." />
</svelte:head>
```

### 6. **Web Vitals Optimizasyonları**

| Metrik  | Optimizasyon                     |
| ------- | -------------------------------- |
| **LCP** | Image preload, font preload      |
| **FID** | TypeScript type checking         |
| **CLS** | Fixed heights, preload resources |

---

## 📊 Proje İstatistikleri

| Kategori           | Sayı |
| ------------------ | ---- |
| UI Bileşenleri     | 11   |
| Modül Bileşenleri  | 5    |
| Layout Bileşenleri | 4    |
| Servisler          | 2    |
| Global Stores      | 1    |
| SCSS Dosyaları     | 4    |

---

## 🔐 Güvenlik Özellikleri

✅ **TypeScript Strict Mode** - Tip güvenliği  
✅ **Content Security Policy** - XSS koruması  
✅ **HTTPS Enforcement** - Strict-Transport-Security  
✅ **Authentication Tokens** - Secure token storage  
✅ **CORS Güvenliği** - Cross-origin kontrolleri

---

## 🚀 Deployment

### Environment Değişkenleri

```env
VITE_API_URL=https://api.yourserver.com
VITE_APP_NAME=Kronos
```

### Build Üretimi

```bash
npm run build
# dist/ klasöründe production build oluşturulur
npm run preview
# http://localhost:4173 de preview et
```

---

## 📚 Kaynaklar

- [SvelteKit Documentation](https://kit.svelte.dev)
- [Svelte Documentation](https://svelte.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

---

## 👥 Katkıda Bulunma

Katkıda bulunmak için:

1. Repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'e push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

---

## 📞 İletişim

**Proje:** Kronos - Zaman Yönetim Sistemi  
**Takım:** FreeFrontendTeam  
**Repository:** https://github.com/FreeFrontendTeam/kronos

---

**Güncellenme:** 26 Ekim 2025  
**Versiyon:** 0.0.1
