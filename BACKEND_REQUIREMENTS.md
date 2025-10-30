# KRONOS Backend API Gereksinimleri

**Tarih:** 29 Ekim 2025  
**Proje:** Kronos - Zaman Yönetim Sistemi  
**Frontend Tech Stack:** SvelteKit + TypeScript  
**API Base URL:** `https://backend-api-gateway.vercel.app`

---

## � Hızlı Başlangıç Rehberi

### Backend Ekibi İçin İlk Adımlar

Bu doküman, frontend ekibinin tamamladığı Kronos projesine backend API desteği eklemek için hazırlanmıştır. Frontend şu an **mock data** ile çalışıyor ve backend entegrasyonu için hazır durumda.

#### 📍 Nereden Başlamalı?

**1. Projeyi Anlayın (1 gün)**
- Frontend repo'yu klonlayın ve çalıştırın: `npm install && npm run dev`
- Uygulamayı kullanarak akışları test edin (login, rapor oluşturma, profil)
- Mock servisleri inceleyin: `src/lib/services/` klasöründeki dosyalar
- Bu dokümanı baştan sona okuyun

**2. Firebase Setup (Yarım gün)**
- Firebase Admin SDK kurulumu
- Service Account Key oluşturma ([Firebase Setup](#-firebase-setup-gereksinimleri) bölümüne bakın)
- Test environment'ı hazırlama
- Frontend Firebase config'i alıp test edin

**3. Database Tasarımı (1 gün)**
- [Data Models](#-data-models) bölümündeki tablolarla başlayın
- PostgreSQL veya MongoDB seçin (PostgreSQL önerilir)
- Migration'ları hazırlayın
- İlişkisel yapıyı kurun

**4. Authentication - İlk Çalışan Endpoint (2 gün)**
- Firebase Admin SDK entegrasyonu
- Token verification middleware
- `/api/auth/login` endpoint'ini implement edin
- Frontend ile test edin (frontend sadece API URL'i değiştirecek)

**5. Aşamalı Geliştirme**
- Her endpoint'i implement ettikten sonra frontend ekibiyle test edin
- Postman collection hazırlayın
- Her phase'i tamamladıkça production'a alın

---

### 🗺️ Önerilen Implementation Roadmap

#### **Phase 1: MVP - Temel Fonksiyonellik (2-3 hafta)**

**Hedef:** Kullanıcılar login olup rapor oluşturabilsin

**Sprint 1 (1 hafta):**
- ✅ Firebase Admin SDK setup
- ✅ Database kurulumu ve migration'lar
- ✅ Authentication middleware (token verification)
- ✅ `/api/auth/login` - Login endpoint
- ✅ `/api/users/me` - Get user profile
- **Çıktı:** Kullanıcı login olup profilini görebilir

**Sprint 2 (1 hafta):**
- ✅ `/api/reports` POST - Haftalık rapor oluşturma
- ✅ `/api/reports/:reportId` GET - Rapor detayları
- ✅ `/api/reports` GET - Kullanıcının raporları (liste)
- **Çıktı:** Kullanıcı rapor oluşturup görüntüleyebilir

**Sprint 3 (1 hafta):**
- ✅ `/api/dashboard/stats` - Dashboard istatistikleri
- ✅ Error handling ve validation
- ✅ Testing (unit + integration)
- **Çıktı:** Dashboard çalışıyor, MVP tamamlandı

**Frontend Entegrasyon Noktası:**
Frontend ekibi bu aşamada localStorage'dan API'ye geçiş yapabilir. Aynı data format'ı kullanıldığı için minimal değişiklik gerekir.

---

#### **Phase 2: Essential Features (2 hafta)**

**Sprint 4 (1 hafta):**
- ✅ `/api/users/me/avatar` POST - Avatar upload (Firebase Storage)
- ✅ `/api/users/me` PUT - Profil güncelleme
- ✅ `/api/reports/daily/:date` PUT - Günlük rapor güncelleme
- **Çıktı:** Kullanıcı profilini ve avatarını düzenleyebilir

**Sprint 5 (1 hafta):**
- ✅ `/api/reports/:reportId/pdf` GET - PDF export
- ✅ Pagination ve filtering optimization
- ✅ API documentation (Swagger)
- ✅ Performance optimization
- **Çıktı:** Tüm temel özellikler çalışıyor

---

#### **Phase 3: Advanced Features (3-4 hafta)**

**Sprint 6-7:**
- ✅ Token refresh mechanism
- ✅ User registration endpoint
- ✅ Report edit/delete endpoints
- ✅ Search & filtering (raporlarda arama)

**Sprint 8:**
- ✅ Admin panel API'leri (user management)
- ✅ Role-based permissions (manager, admin)
- ✅ Analytics endpoints (team statistics)

---

### 🎯 Her Sprint İçin Checklist

```
Sprint Başlangıcı:
[ ] Sprint goal'ü netleştir
[ ] Database değişikliklerini planla
[ ] API endpoint'lerini belirle
[ ] Frontend ekibiyle sync call

Geliştirme:
[ ] Endpoint implementation
[ ] Input validation
[ ] Error handling
[ ] Unit tests
[ ] Integration tests

Sprint Sonu:
[ ] Frontend ile entegrasyon testi
[ ] Postman collection güncelle
[ ] API documentation güncelle
[ ] Code review
[ ] Deployment
[ ] Retrospective
```

---

### 🛠️ Teknik Stack Önerileri

**Backend Framework:**
- **Node.js + Express** (Hızlı başlangıç, Firebase Admin SDK kolay entegrasyon)
- **NestJS** (Enterprise-grade, TypeScript, modüler yapı)
- **Python + FastAPI** (Modern, async, otomatik docs)

**Database:**
- **PostgreSQL** ✅ Önerilen (ilişkisel veri, güçlü query, JSONB desteği)
- **MongoDB** (Document-based, hızlı development)
- **Firebase Firestore** (Firebase ekosisteminde kalma, basit setup)

**ORM/ODM:**
- **Prisma** (TypeScript, modern, migration tool)
- **TypeORM** (NestJS ile uyumlu)
- **Sequelize** (Mature, geniş community)

**Testing:**
- **Jest** (Unit + Integration tests)
- **Supertest** (API endpoint testing)
- **Postman/Newman** (API testing automation)

**DevOps:**
- **Docker** (Containerization)
- **GitHub Actions** (CI/CD)
- **Vercel/Railway/Render** (Deployment - Node.js için)
- **AWS/GCP** (Production-grade hosting)

---

### 📦 Gerekli Paketler (Node.js + Express Örneği)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "firebase-admin": "^11.11.0",
    "pg": "^8.11.3",
    "prisma": "^5.5.0",
    "@prisma/client": "^5.5.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.1.0",
    "express-validator": "^7.0.1",
    "dotenv": "^16.3.1",
    "pdfkit": "^0.13.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/node": "^20.8.10",
    "typescript": "^5.2.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.1",
    "eslint": "^8.52.0",
    "prettier": "^3.0.3"
  }
}
```

---

### 🤝 Frontend-Backend Koordinasyon

**Günlük Sync (15 dakika):**
- Bugün hangi endpoint'ler implement ediliyor?
- Frontend'de değişiklik gerekiyor mu?
- Bloker var mı?

**Haftalık API Review (1 saat):**
- Yeni endpoint'leri birlikte test edin
- Response format'ları kontrol edin
- Breaking change varsa planla

**Communication Channels:**
- **Slack:** #kronos-dev (daily updates)
- **GitHub:** PR'larda karşılıklı review
- **Postman:** Shared workspace (API collection)

**API Contract Değişiklikleri:**
- Backend breaking change yapacaksa frontend'e 1 sprint önceden haber ver
- Versioning kullan: `/api/v1/...` (future-proof)
- Deprecation period: Min 2 sprint

---

### 📊 İlk Sprint'te Başarı Kriterleri

1. ✅ Kullanıcı frontend'den login olabiliyor
2. ✅ Firebase token backend'de verify ediliyor
3. ✅ User profili API'den geliyor (localStorage değil)
4. ✅ Error handling çalışıyor (401, 404, 500)
5. ✅ CORS ayarları doğru
6. ✅ Environment variables set
7. ✅ Health check endpoint çalışıyor (`/api/health`)
8. ✅ Postman collection hazır

**İlk sprint sonunda bu 8 madde tamamlanırsa, sonraki sprint'ler çok daha hızlı ilerleyecektir.**

---

### ⚠️ Dikkat Edilmesi Gerekenler

**❌ Yapmayın:**
- Tüm endpoint'leri aynı anda implement etmeye çalışmayın
- Frontend format'ını değiştirmeyin (zaten mock data ile test edilmiş)
- Firebase yerine custom auth yapmaya çalışmayın (zaten frontend Firebase kullanıyor)
- Database migration'ları production'da manuel yapmayın

**✅ Yapın:**
- Her endpoint'i tek tek tamamlayıp frontend ile test edin
- Frontend'in kullandığı data format'ına sadık kalın
- Firebase Admin SDK'yı kullanın (frontend zaten Firebase Auth kullanıyor)
- Migration tool kullanın (Prisma Migrate, Sequelize Migrations)
- Her endpoint için error handling ekleyin
- Input validation yapın (express-validator)
- Rate limiting ekleyin (özellikle login endpoint'inde)

---

### 🔗 Faydalı Linkler

- **Firebase Admin SDK Docs:** https://firebase.google.com/docs/admin/setup
- **Firebase Storage Docs:** https://firebase.google.com/docs/storage/admin/start
- **Prisma Docs:** https://www.prisma.io/docs
- **Express Best Practices:** https://expressjs.com/en/advanced/best-practice-security.html
- **REST API Design:** https://restfulapi.net/

---

## �📋 İçindekiler

1. [Genel Bilgiler](#genel-bilgiler)
2. [Authentication & Authorization](#authentication--authorization)
3. [User Management](#user-management)
4. [Report Management](#report-management)
5. [Dashboard & Statistics](#dashboard--statistics)
6. [File Upload & Storage](#file-upload--storage)
7. [Data Models](#data-models)
8. [API Endpoint Listesi](#api-endpoint-listesi)
9. [Error Handling](#error-handling)
10. [Güvenlik Gereksinimleri](#güvenlik-gereksinimleri)

---

## 🎯 Genel Bilgiler

### Mevcut Durum
- Frontend tamamen mock data ile çalışıyor (localStorage persistence)
- API config dosyası hazır: `src/lib/services/api.config.ts`
- Auth service skeleton mevcut: `src/lib/services/auth.service.ts`
- Report service mock implementation: `src/lib/services/reportService.ts`

### Backend İhtiyaçları
- **RESTful API** veya **GraphQL** (RESTful tercih edilir)
- **Firebase Authentication** - Frontend'de kullanılan Firebase Auth ile entegrasyon
- **Firebase Admin SDK** - Backend'de token verification ve user management
- **JWT Token** - Firebase ID Token kullanımı
- **CORS** desteği (frontend: Vercel/Netlify deployment)
- **Rate Limiting** ve **Request Validation**
- **Database**: PostgreSQL veya MongoDB (Firebase Firestore alternatif)
- **File Storage**: **Firebase Storage** (tercih edilen) veya AWS S3, Cloudinary

### API Headers
```typescript
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer {firebaseIdToken}",  // Firebase ID Token
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true"
}
```

**Not:** Frontend Firebase Authentication kullanıyor. `auth.service.ts`'de login sonrası dönen `token` ve `idToken` Firebase tarafından generate ediliyor.

---

## 🔐 Authentication & Authorization

### Firebase Authentication Entegrasyonu

Frontend **Firebase Authentication** kullanıyor. Backend'de iki seçenek:

**Seçenek 1: Firebase Admin SDK (Önerilen)**
- Backend Firebase Admin SDK kullanır
- Frontend'den gelen Firebase ID Token'ı verify eder
- Custom claims ile role/permission management
- Firebase Auth users ile senkronizasyon

**Seçenek 2: Hybrid (Custom Backend + Firebase)**
- Frontend Firebase Auth ile login yapar
- Backend custom JWT token üretir
- User data kendi database'de tutulur

### 1. Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@atmosware.turkcell.com.tr",
  "password": "password123"
}
```

**Backend Implementation (Firebase Admin SDK):**
```javascript
// Firebase Admin SDK ile token verification
import admin from 'firebase-admin';

// Frontend'den gelen Firebase ID Token'ı verify et
const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
const uid = decodedToken.uid;

// Custom claims ekle (role, permissions)
await admin.auth().setCustomUserClaims(uid, { role: 'user', squad: 'Platform Team' });
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "idToken": "firebase-compatible-token",
  "email": "user@atmosware.turkcell.com.tr",
  "registered": true,
  "user": {
    "id": "user-uuid-123",
    "email": "user@atmosware.turkcell.com.tr",
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "title": "Senior Frontend Developer",
    "squad": "Platform Team",
    "avatarUrl": "https://storage.example.com/avatars/user-123.webp",
    "role": "user"
  }
}
```

**Response (Error - 401):**
```json
{
  "registered": false,
  "message": "Geçersiz kullanıcı adı veya şifre",
  "errors": [
    {
      "field": "password",
      "message": "Şifre yanlış"
    }
  ]
}
```

**Frontend Kullanımı:**
- `auth.service.ts:login()` fonksiyonu bu endpoint'i çağırıyor
- Token `localStorage.setItem("token", token)` ile saklanıyor
- User bilgisi `userStore` Svelte store'una yazılıyor

**Validasyon:**
- Email formatı kontrolü
- Password minimum 6 karakter
- Rate limiting: 5 deneme / 15 dakika

---

### 2. Token Refresh

**Firebase Auth Kullanıyorsanız:**
Firebase SDK otomatik token refresh yapar. Backend'de manuel refresh endpoint'i gerekmez.

**Custom JWT Kullanıyorsanız:**
**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "firebase-refresh-token"
}
```

**Response:**
```json
{
  "token": "new-firebase-id-token",
  "expiresIn": 3600
}
```

**Firebase Admin SDK Implementation:**
```javascript
// Frontend Firebase SDK otomatik refresh yapar
// Backend sadece verify eder
const decodedToken = await admin.auth().verifyIdToken(idToken);
```

---

### 3. Logout
**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Çıkış başarılı"
}
```

**Frontend Kullanımı:**
- `removeAuthToken()` ile localStorage temizleniyor
- `userStore.set({})` ile store sıfırlanıyor

---

## 👤 User Management

### 1. Get Current User Profile
**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user-uuid-123",
  "email": "ahmet.yilmaz@atmosware.turkcell.com.tr",
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "title": "Senior Frontend Developer",
  "squad": "Platform Team",
  "avatarUrl": "https://storage.example.com/avatars/user-123.webp",
  "role": "user",
  "startDate": "2024-01-15",
  "projects": [
    "Kronos - Zaman Yönetim Sistemi",
    "Dashboard Redesign",
    "API Gateway Geliştirme"
  ],
  "trainings": [
    "React Advanced Patterns - 2024",
    "Microservices Architecture - 2023"
  ],
  "awards": [
    "Employee of the Month - Ekim 2024",
    "Best Code Quality Award - 2023"
  ],
  "certifications": [
    "AWS Certified Developer - Associate",
    "Google Cloud Professional"
  ],
  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-10-28T14:30:00Z"
}
```

**Frontend Kullanımı:**
- Page load'da `userStore` populate etmek için
- Profile sayfasında form verilerini doldurmak için

---

### 2. Update User Profile
**Endpoint:** `PUT /api/users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Senior Frontend Developer",
  "squad": "DC-CORPORATE",
  "startDate": "2024-01-15",
  "projects": ["Kronos", "Dashboard"],
  "trainings": ["React Advanced"],
  "awards": ["Employee of the Month"],
  "certifications": ["AWS Certified"]
}
```

**Response:**
```json
{
  "message": "Profil başarıyla güncellendi",
  "user": { /* Updated user object */ }
}
```

**Notlar:**
- `firstName`, `lastName`, `email` **değiştirilemez** (frontend'de disabled)
- `avatarUrl` ayrı endpoint ile güncelleniyor (file upload)

---

### 3. Upload Avatar
**Endpoint:** `POST /api/users/me/avatar`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
avatar: File (image/jpeg, image/png, image/webp)
```

**Response:**
```json
{
  "message": "Avatar başarıyla yüklendi",
  "avatarUrl": "https://storage.example.com/avatars/user-123.webp"
}
```

**Frontend Davranışı:**
- Kullanıcı dosya seçtiğinde frontend'de **otomatik sıkıştırma** yapılıyor
- Canvas API ile 300x300px'e resize
- WebP formatına dönüştürme (quality: 0.75)
- Base64 string şu an localStorage'a yazılıyor
- **Backend entegrasyonu sonrası:** Base64 veya File object olarak upload edilmeli

**File Validasyonu (Backend):**
- Max file size: 5MB
- Allowed formats: `image/jpeg`, `image/png`, `image/webp`
- Resize to: 300x300px (backend'de de resize yapılabilir)
- Generate unique filename (UUID-based)
- Store in CDN/S3 bucket

**Önerilen Flow:**
1. Frontend: Resim seç → Compress → Base64
2. Backend endpoint'e POST `{ "avatar": "data:image/webp;base64,..." }`
3. Backend: Base64 decode → File storage → CDN URL döndür
4. Frontend: `avatarUrl` güncelle → `userStore` ve `tempFormData` update

**Alternative Flow (Multipart Upload):**
1. Frontend: File object'i direkt FormData ile gönder
2. Backend: Multer/Busboy ile file parse → Storage → URL döndür

---

## 📊 Report Management

### 1. Create Weekly Report
**Endpoint:** `POST /api/reports`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Haftalık Rapor",
  "startDate": "21.10.2024",
  "endDate": "25.10.2024",
  "dailyReports": [
    {
      "day": "Pazartesi",
      "date": "21.10.2024",
      "tasks": [
        {
          "taskName": "Login Sayfası Geliştirme",
          "taskNumber": "KRON-123",
          "estimatedHours": 4,
          "description": "Firebase Authentication entegrasyonu tamamlandı."
        }
      ],
      "blockers": "Firebase config dosyası environment variable'lara taşınması gerekiyor.",
      "meetings": "Daily Standup (15dk), Sprint Planning (1 saat)",
      "untrackedWork": "Yeni geliştiricinin onboarding sürecinde yardımcı olundu (1 saat).",
      "isOnLeave": false
    },
    {
      "day": "Salı",
      "date": "22.10.2024",
      "tasks": [],
      "blockers": "",
      "meetings": "",
      "untrackedWork": "",
      "isOnLeave": true
    }
  ]
}
```

**Response:**
```json
{
  "id": "report-uuid-456",
  "title": "Haftalık Rapor",
  "startDate": "21.10.2024",
  "endDate": "25.10.2024",
  "createdAt": "2024-10-28T10:30:00Z",
  "message": "Rapor başarıyla oluşturuldu"
}
```

**Frontend Kullanımı:**
- `NewReportModal` component'inden çağrılıyor
- `createWeeklyReport()` service fonksiyonu
- 7 günlük rapor validation (başlangıç + 6 gün = 7 gün)

**Validasyon (Backend):**
- `startDate` ve `endDate` tarih formatı kontrolü
- `dailyReports` array boş olmamalı
- Her gün için `day` ve `date` required
- `isOnLeave: true` ise `tasks`, `blockers`, `meetings`, `untrackedWork` boş olabilir
- `isOnLeave: false` ise en az 1 task olmalı veya diğer alanlardan biri dolu olmalı

---

### 2. Get User's Reports (List)
**Endpoint:** `GET /api/reports?page=1&limit=10&sort=desc`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Pagination page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): `asc` | `desc` (default: desc - newest first)

**Response:**
```json
{
  "reports": [
    {
      "id": "report-uuid-1",
      "title": "Haftalık Rapor",
      "startDate": "21.10.2024",
      "endDate": "25.10.2024",
      "createdAt": "2024-10-28T10:30:00Z",
      "taskCount": 12,
      "summary": [
        "API entegrasyonu tamamlandı",
        "UI tasarımı güncellendi",
        "Test senaryoları yazıldı"
      ]
    },
    {
      "id": "report-uuid-2",
      "title": "Haftalık Rapor",
      "startDate": "14.10.2024",
      "endDate": "18.10.2024",
      "createdAt": "2024-10-21T09:00:00Z",
      "taskCount": 8,
      "summary": [
        "Database migration",
        "Authentication sistemi",
        "Dashboard tasarımı"
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalReports": 42,
    "hasMore": true
  }
}
```

**Frontend Kullanımı:**
- Dashboard sayfasında "Son Raporlar" bölümü
- Archive sayfasında (şu an yok, gelecekte eklenecek)

---

### 3. Get Report Details
**Endpoint:** `GET /api/reports/:reportId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "report-uuid-1",
  "title": "Haftalık Rapor",
  "startDate": "21.10.2024",
  "endDate": "25.10.2024",
  "createdAt": "2024-10-28T10:30:00Z",
  "user": {
    "id": "user-uuid-123",
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet.yilmaz@atmosware.turkcell.com.tr",
    "avatarUrl": "https://storage.example.com/avatars/user-123.webp",
    "title": "Senior Frontend Developer",
    "squad": "Platform Team",
    "role": "user"
  },
  "dailyReports": [
    {
      "day": "Pazartesi",
      "date": "21.10.2024",
      "tasks": [
        {
          "taskName": "Login Sayfası Geliştirme",
          "taskNumber": "KRON-123",
          "estimatedHours": 4,
          "description": "Firebase Authentication entegrasyonu tamamlandı."
        }
      ],
      "blockers": "Firebase config dosyası environment variable'lara taşınması gerekiyor.",
      "meetings": "Daily Standup (15dk), Sprint Planning (1 saat)",
      "untrackedWork": "Yeni geliştiricinin onboarding sürecinde yardımcı olundu (1 saat).",
      "isOnLeave": false
    },
    {
      "day": "Salı",
      "date": "22.10.2024",
      "tasks": [],
      "blockers": "",
      "meetings": "",
      "untrackedWork": "",
      "isOnLeave": true
    }
  ]
}
```

**Frontend Kullanımı:**
- Archive detail page: `/archive/[reportId]`
- Report preview modal

---

### 4. Export Report as PDF
**Endpoint:** `GET /api/reports/:reportId/pdf`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
- Content-Type: `application/pdf`
- Binary PDF file download

**Frontend Kullanımı:**
- Archive detail page "📥 PDF İndir" butonu
- `downloadReportPdf(reportId)` service fonksiyonu

**Backend Implementation:**
- PDF generation library (puppeteer, pdfkit, jsPDF)
- Template-based rendering (HTML → PDF)
- Include user info, report dates, daily reports with tasks
- Proper styling for professional report look

---

### 5. Update Daily Report (Single Day)
**Endpoint:** `PUT /api/reports/daily/:date`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "day": "Pazartesi",
  "date": "28.10.2024",
  "tasks": [
    {
      "taskName": "API Integration",
      "taskNumber": "KRON-150",
      "estimatedHours": 5,
      "description": "Backend API entegrasyonu yapıldı"
    }
  ],
  "blockers": "",
  "meetings": "Daily Standup (15dk)",
  "untrackedWork": "",
  "isOnLeave": false
}
```

**Response:**
```json
{
  "message": "Günlük rapor başarıyla güncellendi",
  "report": { /* Updated daily report object */ }
}
```

**Frontend Kullanımı:**
- `DailyReportModal` component'inden çağrılıyor
- `saveDailyReport()` store fonksiyonu
- Dashboard'daki WeeklyDayCard'dan tek gün raporu girişi

**Notlar:**
- Bu endpoint **haftalık rapora dahil edilmemiş** günlük raporları saklamak için
- Haftalık rapor oluşturulduğunda bu veriler kullanılıyor
- İzinli gün (`isOnLeave: true`) olduğunda diğer alanlar temizleniyor (frontend validation)

---

## 📈 Dashboard & Statistics

### 1. Get Dashboard Stats
**Endpoint:** `GET /api/dashboard/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "reportsSent": 42,
  "tasksCompleted": 156,
  "avgCompletionRate": 87.5,
  "weeklySummary": [
    {
      "day": "Pazartesi",
      "date": "2025-10-27",
      "hasReport": true,
      "taskCount": 5
    },
    {
      "day": "Salı",
      "date": "2025-10-28",
      "hasReport": true,
      "taskCount": 4
    },
    {
      "day": "Çarşamba",
      "date": "2025-10-29",
      "hasReport": false,
      "taskCount": 0
    }
  ],
  "recentReports": [
    {
      "id": "report-uuid-1",
      "title": "Haftalık Rapor",
      "date": "2025-10-28",
      "startDate": "21.10.2024",
      "endDate": "25.10.2024",
      "tasks": [
        "API entegrasyonu tamamlandı",
        "UI tasarımı güncellendi",
        "Test senaryoları yazıldı"
      ]
    }
  ]
}
```

**Frontend Kullanımı:**
- Dashboard ana sayfası
- `getDashboardStats()` service fonksiyonu
- StatCard component'leri için veri kaynağı

**Calculation Logic:**
- `reportsSent`: Kullanıcının oluşturduğu toplam haftalık rapor sayısı
- `tasksCompleted`: Tüm raporlardaki tamamlanan task sayısı
- `avgCompletionRate`: Ortalama tamamlama yüzdesi (task estimations vs actuals)
- `weeklySummary`: Son 5 iş günü (Pazartesi-Cuma) rapor durumları
- `recentReports`: Son 3 rapor (newest first)

---

## 📁 File Upload & Storage

### Avatar Upload Details

**Storage Options:**

**1. Firebase Storage (Önerilen - Proje Zaten Firebase Kullanıyor)**
   - Firebase Console'dan setup kolay
   - Firebase Admin SDK ile backend entegrasyonu
   - Automatic CDN (Google Cloud CDN)
   - Security rules ile access control
   - Signed URLs ile secure access
   - Storage triggers (Cloud Functions)
   
   **장점:**
   - Firebase Auth ile kolay entegrasyon
   - Kullanıcı UID'ye göre path structure: `avatars/{uid}/profile.webp`
   - Otomatik authentication (Firebase token kullanarak)
   - Free tier: 5 GB storage, 1 GB/day download

2. **AWS S3**
   - Public bucket for avatars
   - CloudFront CDN distribution
   - Lifecycle policies for old files

3. **Cloudinary**
   - Automatic image optimization
   - CDN included
   - Transform API for resizing

**File Naming Convention (Firebase Storage):**
```
avatars/{firebaseUid}/profile.webp
```

**Example:**
```
avatars/xR7fK3mP9QYh2nL8cZ5d/profile.webp
```

**Firebase Storage Security Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{fileName} {
      // Sadece kendi avatar'ını upload edebilir
      allow write: if request.auth != null && request.auth.uid == userId;
      // Herkes okuyabilir (public avatars)
      allow read: if true;
      // File size limit: 5MB
      allow write: if request.resource.size < 5 * 1024 * 1024;
      // Allowed types
      allow write: if request.resource.contentType.matches('image/.*');
    }
  }
}
```

**Backend Implementation (Firebase Admin SDK):**
```javascript
import admin from 'firebase-admin';

const bucket = admin.storage().bucket();
const filePath = `avatars/${userId}/profile.webp`;
const file = bucket.file(filePath);

// Base64'ten upload
const buffer = Buffer.from(base64Data, 'base64');
await file.save(buffer, {
  metadata: {
    contentType: 'image/webp',
  },
  public: true, // Public URL için
});

// Public URL al
const [url] = await file.getSignedUrl({
  action: 'read',
  expires: '03-01-2500', // Long-term URL
});

// Veya public ise:
const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
```

**Security:**
- Files should be validated server-side (MIME type, size)
- Firebase Storage rules ile access control
- Generate unique file names (user UID kullan)
- Set proper CORS headers (Firebase Console'dan)

---

## 📐 Data Models

### User Model
```typescript
interface User {
  id: string;                    // UUID (veya Firebase UID kullan)
  firebaseUid: string;           // Firebase Auth User UID (Unique, indexed)
  email: string;                 // Unique, indexed
  firstName: string;
  lastName: string;
  password?: string;             // Firebase Auth kullanıyorsa gerekmez
  title: string;                 // Job title
  squad: string;                 // Team/Squad name
  avatarUrl: string | null;      // CDN URL
  startDate: string | null;      // ISO date string
  projects: string[];            // Array of project names
  trainings: string[];           // Array of training names
  awards: string[];              // Array of award titles
  certifications: string[];      // Array of certification names
  role: "user" | "admin";        // User role (future: manager, etc.)
  isActive: boolean;             // Account status
  createdAt: Date;               // Timestamp
  updatedAt: Date;               // Timestamp
}
```

### Report Model
```typescript
interface Report {
  id: string;                    // UUID
  userId: string;                // Foreign key to User
  title: string;                 // "Haftalık Rapor"
  startDate: string;             // Format: "DD.MM.YYYY"
  endDate: string;               // Format: "DD.MM.YYYY"
  dailyReports: DailyReport[];   // Embedded documents or separate table
  createdAt: Date;
  updatedAt: Date;
}
```

### Daily Report Model
```typescript
interface DailyReport {
  id?: string;                   // Optional if embedded
  reportId?: string;             // Foreign key if separate table
  day: string;                   // "Pazartesi", "Salı", etc.
  date: string;                  // Format: "DD.MM.YYYY"
  tasks: Task[];                 // Array of tasks
  blockers: string;              // Text field
  meetings: string;              // Text field
  untrackedWork: string;         // Text field
  isOnLeave: boolean;            // İzinli gün flag
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Task Model
```typescript
interface Task {
  id?: string;                   // Optional if embedded
  dailyReportId?: string;        // Foreign key if separate table
  taskName: string;
  taskNumber: string;            // Jira/ticket number
  estimatedHours: number;
  description: string;
}
```

### Database Relationships
```
User (1) ----< (N) Report
Report (1) ----< (N) DailyReport
DailyReport (1) ----< (N) Task
```

**Indexing Strategy:**
- `User.email` → Unique index
- `Report.userId` → Index for user reports query
- `Report.createdAt` → Index for sorting
- `DailyReport.date` → Index for daily report lookups

---

## 🔗 API Endpoint Listesi

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/refresh` | Refresh JWT token | ✅ |
| POST | `/api/auth/logout` | User logout | ✅ |
| POST | `/api/auth/register` | New user registration (future) | ❌ |

### User Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Get current user profile | ✅ |
| PUT | `/api/users/me` | Update user profile | ✅ |
| POST | `/api/users/me/avatar` | Upload avatar image | ✅ |
| DELETE | `/api/users/me/avatar` | Delete avatar image | ✅ |

### Report Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reports` | Create weekly report | ✅ |
| GET | `/api/reports` | Get user's reports (list) | ✅ |
| GET | `/api/reports/:reportId` | Get report details | ✅ |
| GET | `/api/reports/:reportId/pdf` | Download report as PDF | ✅ |
| PUT | `/api/reports/:reportId` | Update report (future) | ✅ |
| DELETE | `/api/reports/:reportId` | Delete report (future) | ✅ |

### Daily Reports
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/api/reports/daily/:date` | Save/Update daily report | ✅ |
| GET | `/api/reports/daily/:date` | Get daily report | ✅ |
| GET | `/api/reports/daily` | Get daily reports in range | ✅ |

### Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | ✅ |

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "error": true,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "reason": "Validation error reason"
  },
  "timestamp": "2024-10-29T10:30:00Z"
}
```

### HTTP Status Codes
| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (email exists) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server maintenance |

### Error Codes
```typescript
enum ErrorCodes {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  REPORT_NOT_FOUND = "REPORT_NOT_FOUND",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
```

### Frontend Error Handling
```typescript
// auth.service.ts
try {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(credentials),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Giriş başarısız");
  }
  
  return data;
} catch (error) {
  console.error("Login error:", error);
  throw error;
}
```

**Toast Notification System:**
- Frontend'de `toastStore` kullanılıyor
- Error mesajları user-friendly Türkçe olmalı
- Success mesajları için `success: true` flag

---

## 🔒 Güvenlik Gereksinimleri

### 1. Authentication

**Firebase Authentication Kullanımı:**
- Firebase ID Token verification (Firebase Admin SDK)
- Token expiration: Firebase default (1 saat, otomatik refresh)
- Password management Firebase tarafından yapılıyor
- Firebase Auth security rules:
  - Email verification
  - Password strength (Firebase settings)
  - Multi-factor authentication (optional)
  
**Backend Middleware:**
```javascript
// Token verification middleware
const verifyFirebaseToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // { uid, email, ... }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Custom JWT Kullanıyorsanız:**
- Token expiration: 1 saat (refresh token 7 gün)
- Password hashing: bcrypt (salt rounds: 10)
- Password policy:
  - Min 8 karakter
  - En az 1 büyük harf, 1 küçük harf, 1 rakam

### 2. Authorization
- Route-level middleware (protect endpoints)
- User can only access their own data
- **Role-based access control:**
  - `user` (default): Kendi raporlarını oluşturabilir/görüntüleyebilir
  - `manager`: Takım raporlarını görüntüleyebilir (future)
  - `admin`: Tüm kullanıcıları ve raporları yönetebilir (future)
- Admin role için future endpoint'ler (user management, etc.)

**Role Kontrolü:**
```javascript
// Middleware example
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRole: allowedRoles 
      });
    }
    
    next();
  };
};

// Usage
app.get('/api/admin/users', verifyToken, requireRole(['admin']), getUsers);
```

### 3. Input Validation
- All inputs sanitized and validated
- SQL/NoSQL injection prevention
- XSS protection
- CSRF tokens (if using cookies)

### 4. Rate Limiting
```
Login: 5 attempts / 15 minutes
API calls: 100 requests / minute
File uploads: 10 uploads / hour
```

### 5. CORS Configuration
```javascript
{
  origin: [
    "http://localhost:5173",      // Development
    "https://kronos.vercel.app",  // Production
    "https://kronos-staging.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}
```

### 6. Security Headers
```
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### 7. Data Privacy
- GDPR compliance
- User data encryption at rest
- Secure file storage (S3 with encryption)
- Audit logs for sensitive operations

---

## � Firebase Setup Gereksinimleri

### Backend Firebase Admin SDK Setup

**1. Firebase Project Configuration:**
```bash
npm install firebase-admin
```

**2. Service Account Key:**
- Firebase Console → Project Settings → Service Accounts
- "Generate New Private Key" butonu
- JSON dosyasını güvenli yere kaydet (`.gitignore`'a ekle)

**3. Environment Variables:**
```env
FIREBASE_PROJECT_ID=kronos-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@kronos-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_STORAGE_BUCKET=kronos-project.appspot.com
```

**4. Backend Initialization:**
```javascript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

export const auth = admin.auth();
export const storage = admin.storage();
export const firestore = admin.firestore(); // Optional
```

**5. Frontend Firebase Config (Referans):**
Frontend'de zaten kullanılan Firebase config:
```javascript
// Frontend tarafında (referans için)
const firebaseConfig = {
  apiKey: "...",
  authDomain: "kronos-project.firebaseapp.com",
  projectId: "kronos-project-id",
  storageBucket: "kronos-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## �📦 Ek Gereksinimler

### 1. Logging
- Request/Response logging
- Error tracking (Sentry, LogRocket)
- Performance monitoring (New Relic, DataDog)

### 2. Testing
- Unit tests (Jest, Mocha)
- Integration tests (Supertest)
- E2E tests (Cypress, Playwright)
- API documentation (Swagger/OpenAPI)

### 3. Documentation
- Swagger UI for API documentation
- Postman collection
- README with setup instructions

### 4. Deployment
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Environment variables (`.env` files)
- Docker containerization (optional)
- Health check endpoint: `GET /api/health`

### 5. Monitoring
- Uptime monitoring (UptimeRobot, Pingdom)
- Performance metrics
- Database connection pooling
- Redis caching (optional, for sessions/rate limiting)

---

## 🚀 Öncelik Sırası

### Phase 1: MVP (Minimum Viable Product)
1. ✅ Authentication (login, logout)
2. ✅ User profile (get, update)
3. ✅ Create weekly report
4. ✅ Get report details
5. ✅ Dashboard stats

### Phase 2: Essential Features
6. ✅ Avatar upload
7. ✅ Daily report update (single day)
8. ✅ Report list with pagination
9. ✅ PDF export

### Phase 3: Advanced Features
10. ⏳ Token refresh mechanism
11. ⏳ User registration
12. ⏳ Report editing/deletion
13. ⏳ Search & filtering
14. ⏳ Admin panel (user management)

---

## 📞 İletişim & Koordinasyon

### Frontend Team
- **Tech Lead:** [İsim]
- **Developers:** [İsimler]
- **Repository:** https://github.com/FreeFrontendTeam/kronos

### Backend Team
- **Tech Lead:** [İsim]
- **Developers:** [İsimler]
- **Repository:** [Backend repo URL]

### Communication Channels
- **Slack:** #kronos-dev
- **Daily Standup:** 10:00 (Teams)
- **API Review Meetings:** Perşembe 14:00

### API Contract
- OpenAPI spec'i backend team tarafından sağlanacak
- Frontend mock data'yı backend response format'ına göre güncelleyecek
- Breaking changes önceden bildirilecek (1 sprint öncesi)

---

## 📝 Notlar

1. **Tarih Formatı:** Frontend `DD.MM.YYYY` formatını kullanıyor. Backend ISO 8601 (`YYYY-MM-DD`) kullanabilir, fakat response'larda frontend formatına çevirmeli veya frontend parse etmeli.

2. **localStorage Persistence:** Şu an tüm veriler localStorage'da. Backend entegrasyonu sonrası kademeli geçiş yapılacak (hybrid mode: localStorage fallback + API sync).

3. **Real-time Updates:** WebSocket/SSE gereksinimi şu an yok. Future feature: Dashboard real-time statistics.

4. **File Upload:** Avatar upload için Base64 veya Multipart/Form-data kullanılabilir. Base64 tercih edilirse backend'de decode + file storage yapılmalı.

5. **PDF Generation:** Backend'de generate edilecek. Frontend'de sadece download link.

6. **Pagination:** Frontend'de şu an pagination UI yok fakat `Pagination` component hazır. Backend pagination desteklemeli.

7. **Search:** Gelecekte rapor/task search özelliği eklenecek. Backend full-text search hazırlığı yapmalı (Elasticsearch, PostgreSQL full-text).

8. **Internationalization (i18n):** Şu an sadece Türkçe. Future: English support. Backend error messages Türkçe döndürmeli.

---

**Son Güncelleme:** 29 Ekim 2025  
**Doküman Versiyonu:** 1.0  
**Hazırlayan:** Frontend Team - Kronos Project
