# Archive API - Backend Implementation Guide

## 📋 Özet

Archive sayfası için backend API implementasyon rehberi. Frontend'de `/archive` route'unda çalışan bu sayfa, kullanıcıların geçmiş haftalık raporlarını görüntülemesini sağlıyor.

## 🎯 İhtiyaç Duyulan Endpoint'ler

### 1. Get Archived Reports (Pagination)
```
GET /api/archive/reports
```

**Query Parameters:**
- `page` (number, optional, default: 1) - Sayfa numarası
- `limit` (number, optional, default: 10) - Sayfa başına kayıt
- `sort` (string, optional, default: "desc") - Sıralama ("asc" | "desc")
- `search` (string, optional) - Arama query'si

**Authorization:**
```
Bearer {firebaseIdToken}
```

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
      "totalHours": 35,
      "status": "recent"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalReports": 42,
    "itemsPerPage": 10,
    "hasMore": true
  }
}
```

### 2. Get Archive Statistics
```
GET /api/archive/stats
```

**Authorization:**
```
Bearer {firebaseIdToken}
```

**Response:**
```json
{
  "totalReports": 42,
  "totalTasks": 385,
  "totalHours": 1248,
  "avgTasksPerReport": 9.2,
  "avgHoursPerReport": 29.7
}
```

### 3. Get Report Details (Mevcut endpoint kullanılacak)
```
GET /api/reports/:reportId
```

Detaylar için `BACKEND_REQUIREMENTS.md` dosyasına bakın.

## 🔌 Frontend Entegrasyon Noktaları

### 1. Archive Service
```typescript
// src/lib/services/archiveService.ts

export async function getArchivedReports(params: ArchiveParams) {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    sort: params.sort,
    ...(params.search && { search: params.search })
  });

  const response = await fetch(
    `${API_URL}/api/archive/reports?${queryParams}`,
    {
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  return await response.json();
}
```

### 2. Archive Page
```typescript
// src/routes/archive/+page.svelte

async function loadArchiveData() {
  const [reportsData, statsData] = await Promise.all([
    getArchivedReports({
      page: currentPage,
      limit: itemsPerPage,
      sort: "desc",
      search: searchValue,
    }),
    getArchiveStats(),
  ]);

  allReports = reportsData.reports;
  stats = statsData;
}
```

## 🛠️ Backend Implementation (Node.js + Express Örnek)

### Database Query (PostgreSQL)
```javascript
async function getArchivedReports(userId, { page, limit, sort, search }) {
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT 
      r.id,
      r.title,
      r.start_date as "startDate",
      r.end_date as "endDate",
      r.created_at as "createdAt",
      COUNT(DISTINCT t.id) as "taskCount",
      COALESCE(SUM(t.estimated_hours), 0) as "totalHours"
    FROM reports r
    LEFT JOIN daily_reports dr ON dr.report_id = r.id
    LEFT JOIN tasks t ON t.daily_report_id = dr.id
    WHERE r.user_id = $1
  `;
  
  const params = [userId];
  
  if (search) {
    query += ` AND (
      r.title ILIKE $${params.length + 1} OR
      r.start_date ILIKE $${params.length + 1} OR
      r.end_date ILIKE $${params.length + 1}
    )`;
    params.push(`%${search}%`);
  }
  
  query += `
    GROUP BY r.id, r.title, r.start_date, r.end_date, r.created_at
    ORDER BY r.created_at ${sort === 'desc' ? 'DESC' : 'ASC'}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;
  
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  
  // Total count için ayrı query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM reports
    WHERE user_id = $1
    ${search ? `AND (title ILIKE $2 OR start_date ILIKE $2 OR end_date ILIKE $2)` : ''}
  `;
  
  const countResult = await db.query(
    countQuery, 
    search ? [userId, `%${search}%`] : [userId]
  );
  
  const totalReports = parseInt(countResult.rows[0].total);
  
  // Status hesapla (son 2 hafta = recent)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const reports = result.rows.map(r => ({
    ...r,
    taskCount: parseInt(r.taskCount),
    totalHours: parseInt(r.totalHours),
    status: new Date(r.createdAt) > twoWeeksAgo ? 'recent' : 'archived'
  }));
  
  return {
    reports,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalReports / limit),
      totalReports,
      itemsPerPage: limit,
      hasMore: page < Math.ceil(totalReports / limit)
    }
  };
}
```

### Express Route
```javascript
const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');

router.get('/archive/reports', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase UID
    const {
      page = 1,
      limit = 10,
      sort = 'desc',
      search = ''
    } = req.query;
    
    const data = await getArchivedReports(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      search
    });
    
    res.json(data);
  } catch (error) {
    console.error('Archive reports error:', error);
    res.status(500).json({
      error: true,
      message: 'Arşiv raporları yüklenirken hata oluştu'
    });
  }
});

router.get('/archive/stats', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const query = `
      SELECT 
        COUNT(DISTINCT r.id) as "totalReports",
        COUNT(DISTINCT t.id) as "totalTasks",
        COALESCE(SUM(t.estimated_hours), 0) as "totalHours"
      FROM reports r
      LEFT JOIN daily_reports dr ON dr.report_id = r.id
      LEFT JOIN tasks t ON t.daily_report_id = dr.id
      WHERE r.user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    const stats = result.rows[0];
    
    const totalReports = parseInt(stats.totalReports);
    const totalTasks = parseInt(stats.totalTasks);
    const totalHours = parseInt(stats.totalHours);
    
    res.json({
      totalReports,
      totalTasks,
      totalHours,
      avgTasksPerReport: totalReports > 0 ? totalTasks / totalReports : 0,
      avgHoursPerReport: totalReports > 0 ? totalHours / totalReports : 0
    });
  } catch (error) {
    console.error('Archive stats error:', error);
    res.status(500).json({
      error: true,
      message: 'Arşiv istatistikleri yüklenirken hata oluştu'
    });
  }
});

module.exports = router;
```

## 📊 Database Schema

### Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  start_date VARCHAR(20) NOT NULL, -- Format: DD.MM.YYYY
  end_date VARCHAR(20) NOT NULL,   -- Format: DD.MM.YYYY
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);
CREATE INDEX idx_reports_dates ON reports(start_date, end_date);
```

### Daily Reports Table
```sql
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  date VARCHAR(20) NOT NULL,
  blockers TEXT,
  meetings TEXT,
  untracked_work TEXT,
  is_on_leave BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_reports_report ON daily_reports(report_id);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  task_name VARCHAR(255) NOT NULL,
  task_number VARCHAR(50) NOT NULL,
  estimated_hours INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_daily_report ON tasks(daily_report_id);
```

## 🔒 Security & Validation

### Input Validation
```javascript
const { body, query, validationResult } = require('express-validator');

router.get('/archive/reports',
  verifyFirebaseToken,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('sort').optional().isIn(['asc', 'desc']),
    query('search').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: true,
        errors: errors.array() 
      });
    }
    // ... route handler
  }
);
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const archiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.'
});

app.use('/api/archive', archiveLimiter);
```

## ⚡ Performance Optimization

### 1. Database Indexing
```sql
-- Composite index for user_id + created_at
CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);

-- Index for search
CREATE INDEX idx_reports_title_gin ON reports USING gin(to_tsvector('turkish', title));
```

### 2. Caching (Redis)
```javascript
const redis = require('redis');
const client = redis.createClient();

async function getArchivedReportsWithCache(userId, params) {
  const cacheKey = `archive:${userId}:${JSON.stringify(params)}`;
  
  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from DB
  const data = await getArchivedReports(userId, params);
  
  // Cache for 5 minutes
  await client.setEx(cacheKey, 300, JSON.stringify(data));
  
  return data;
}
```

### 3. Database Connection Pooling
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🧪 Testing

### Unit Test Example (Jest)
```javascript
describe('Archive API', () => {
  test('GET /api/archive/reports - returns paginated reports', async () => {
    const response = await request(app)
      .get('/api/archive/reports?page=1&limit=10')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('reports');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.reports)).toBe(true);
  });
  
  test('GET /api/archive/stats - returns correct stats', async () => {
    const response = await request(app)
      .get('/api/archive/stats')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.totalReports).toBeGreaterThanOrEqual(0);
    expect(response.body.totalTasks).toBeGreaterThanOrEqual(0);
  });
});
```

## 📝 Frontend'den Backend'e Geçiş

### Adım 1: archiveService.ts Güncelleme
```typescript
// Mock implementasyonu comment out et
// Gerçek API çağrısını uncomment et

export async function getArchivedReports(params: ArchiveParams) {
  // TODO comment'ini kaldır
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    sort: params.sort,
    ...(params.search && { search: params.search })
  });

  const response = await fetch(
    `${API_URL}/api/archive/reports?${queryParams}`,
    {
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Arşiv raporları yüklenemedi");
  }

  return await response.json();
}
```

### Adım 2: API URL Güncelleme
```typescript
// src/lib/services/api.config.ts
export const API_URL = "https://your-backend-api.com"; // Production URL
```

### Adım 3: Test
```bash
# Frontend'i çalıştır
npm run dev

# Archive sayfasına git
http://localhost:5173/archive

# Developer Console'da network tab'ı kontrol et
# API çağrıları başarılı mı?
```

## 🚀 Deployment Checklist

- [ ] Database migrations çalıştırıldı
- [ ] Environment variables set edildi
- [ ] Firebase Admin SDK configured
- [ ] Database indexes oluşturuldu
- [ ] Rate limiting active
- [ ] CORS configuration doğru
- [ ] SSL/TLS enabled
- [ ] Error logging active (Sentry, etc.)
- [ ] API documentation güncel (Swagger)
- [ ] Health check endpoint çalışıyor
- [ ] Frontend API URL güncellendi

## 📞 İletişim

**Sorularınız için:**
- Frontend Team Lead: [İsim]
- Backend Team Lead: [İsim]
- Slack Channel: #kronos-dev

**Dökümanlar:**
- Main Docs: `/BACKEND_REQUIREMENTS.md`
- API Contract: `/docs/api-contract.md` (oluşturulacak)
- Postman Collection: [Link] (paylaşılacak)
