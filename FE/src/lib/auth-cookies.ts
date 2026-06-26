const AUTH_ROLE_COOKIE = 'auth_role';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setAuthRoleCookie(role: string) {
  document.cookie = `${AUTH_ROLE_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthRoleCookie() {
  document.cookie = `${AUTH_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export { AUTH_ROLE_COOKIE };
