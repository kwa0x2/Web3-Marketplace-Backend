const durationDays = parseInt(process.env.SESSION_DURATION_DAYS || '7', 10);

export const SESSION_CONFIG = {
  cookieName: process.env.SESSION_COOKIE_NAME || 'session_id',

  durationDays,

  cookie: {
    httpOnly: process.env.SESSION_COOKIE_HTTP_ONLY === 'true',
    secure: process.env.SESSION_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: (process.env.SESSION_COOKIE_SAME_SITE || 'lax') as 'strict' | 'lax' | 'none',
  },
};

export const getCurrentTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const getSessionDurationSeconds = (): number => {
  return SESSION_CONFIG.durationDays * 24 * 60 * 60;
};

export const calculateExpirationTime = (fromTime: number): number => {
  return fromTime + getSessionDurationSeconds();
};

export const getCookieMaxAge = (): number => {
  return SESSION_CONFIG.durationDays * 24 * 60 * 60 * 1000;
};
