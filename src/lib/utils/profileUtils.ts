import type { UserProfile } from "$lib/services/user.service.js";

/**
 * Kullanıcının profil bilgilerinin tamamlanıp tamamlanmadığını kontrol eder
 * @param user Kullanıcı profili
 * @returns Eksik bilgiler varsa true, yoksa false
 */
export function isProfileIncomplete(user: {
  firstName?: string;
  lastName?: string;
  department?: string;
}): boolean {
  return (
    !user.firstName?.trim() ||
    !user.lastName?.trim() ||
    !user.department?.trim()
  );
}

