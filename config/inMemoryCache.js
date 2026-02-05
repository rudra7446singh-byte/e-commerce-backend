const cache = new Map();

export const setCache = (key, value, ttl = 120000) => {
  const expiresAt = Date.now() + ttl;

  cache.set(key, {
    value,
    expiresAt,
  });
};

export const getCache = (key) => {
  const cached = cache.get(key);

  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    cache.delete(key); // expire
    return null;
  }

  return cached.value;
};

export const clearCache = () => {
  cache.clear();
};
