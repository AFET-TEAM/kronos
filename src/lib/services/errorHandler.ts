/**
 * Frontend Error Handler Service
 * 
 * Backend'den gelen hata mesajlarını merkezi olarak yönetir.
 * Tüm API çağrılarında kullanılacak standart hata işleme mantığı.
 */

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: any[];
  timestamp?: string;
  path?: string;
  stack?: string;
}

/**
 * API response'unu parse eder ve hata varsa fırlatır
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  // Response başarılıysa direkt JSON'u döndür
  if (response.ok) {
    return await response.json();
  }

  // 401 Unauthorized - Oturum süresi dolmuş
  if (response.status === 401) {
    await handleUnauthorized();
  }

  // Hata durumunda backend'den gelen mesajı al
  let errorData: ApiError | null = null;
  
  try {
    errorData = await response.json();
  } catch (e) {
    // JSON parse edilemezse, HTTP status'e göre mesaj oluştur
    throw new ApiErrorResponse(
      getDefaultErrorMessage(response.status),
      undefined,
      response.status
    );
  }

  // Backend'den gelen hata mesajını kullan
  throw new ApiErrorResponse(
    errorData?.message || getDefaultErrorMessage(response.status),
    errorData?.code,
    response.status,
    errorData?.errors
  );
}

/**
 * Custom API Error Class
 */
export class ApiErrorResponse extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: any[];

  constructor(message: string, code?: string, statusCode: number = 500, details?: any[]) {
    super(message);
    this.name = 'ApiErrorResponse';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * HTTP status koduna göre varsayılan hata mesajı
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Eksik veya hatalı veri girdiniz. Lütfen bilgilerinizi kontrol edin.';
    case 401:
      return 'Oturum süreniz dolmuş veya geçersiz. Lütfen tekrar giriş yapın.';
    case 403:
      return 'Bu işlem için yetkiniz bulunmuyor.';
    case 404:
      return 'Aradığınız kaynak bulunamadı.';
    case 408:
      return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
    case 409:
      return 'Bu kaynak zaten mevcut.';
    case 422:
      return 'Gönderilen veri işlenemedi. Lütfen kontrol edip tekrar deneyin.';
    case 429:
      return 'Çok fazla istek gönderildi. Lütfen bir süre bekleyip tekrar deneyin.';
    case 500:
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    case 502:
      return 'Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.';
    case 503:
      return 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    case 504:
      return 'Ağ geçidi zaman aşımına uğradı. Lütfen tekrar deneyin.';
    default:
      return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
  }
}

/**
 * 401 hatası kontrolü (oturum süresi dolmuş)
 */
export function isUnauthorizedError(error: any): boolean {
  return error instanceof ApiErrorResponse && error.statusCode === 401;
}

/**
 * Hata mesajını kullanıcıya gösterilecek formatta döndürür
 */
export function getErrorMessage(error: any): string {
  if (error instanceof ApiErrorResponse) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
}

/**
 * Validasyon hatalarını düzenli formatta döndürür
 */
export function getValidationErrors(error: any): string[] {
  if (error instanceof ApiErrorResponse && error.details) {
    return error.details.map(d => {
      if (typeof d === 'string') return d;
      if (d?.message) return d.message;
      return JSON.stringify(d);
    });
  }
  return [];
}

/**
 * 401 hatası (oturum süresi dolmuş) için logout ve redirect
 */
async function handleUnauthorized(): Promise<void> {
  // Sadece browser'da çalıştır
  if (typeof window === 'undefined') return;

  // Zaten login sayfasındaysak tekrar redirect yapma
  if (window.location.pathname === '/login') return;

  console.warn('🔒 Oturum süresi doldu. Çıkış yapılıyor...');

  // Token ve kullanıcı bilgilerini temizle
  localStorage.removeItem('token');
  localStorage.removeItem('userProfile');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Login sayfasına yönlendir
  window.location.href = '/login?session=expired';
}
