// Fast client-side logger that only logs in development
const getIsDev = () => {
  try {
    return import.meta.env?.DEV || import.meta.env?.MODE === 'development';
  } catch {
    return false;
  }
};

const isDev = getIsDev();

// Use requestIdleCallback for async logging when available, fallback to setTimeout
const asyncLog = (fn) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn, { timeout: 100 });
  } else {
    setTimeout(fn, 0);
  }
};

export const logger = {
  log: (...args) => {
    if (isDev) {
      asyncLog(() => console.log(...args));
    }
  },
  error: (...args) => {
    // Always log errors, but asynchronously
    asyncLog(() => console.error(...args));
  },
  warn: (...args) => {
    if (isDev) {
      asyncLog(() => console.warn(...args));
    }
  },
  info: (...args) => {
    if (isDev) {
      asyncLog(() => console.info(...args));
    }
  },
};

