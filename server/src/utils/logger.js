// Fast async logger that doesn't block the event loop
const logBuffer = [];
let isFlushing = false;

const flushLogs = () => {
  if (isFlushing || logBuffer.length === 0) return;
  
  isFlushing = true;
  // Use setImmediate to flush asynchronously without blocking
  setImmediate(() => {
    const logs = logBuffer.splice(0, logBuffer.length);
    logs.forEach(({ method, args }) => {
      console[method](...args);
    });
    isFlushing = false;
    if (logBuffer.length > 0) {
      flushLogs();
    }
  });
};

const asyncLog = (method, ...args) => {
  logBuffer.push({ method, args });
  if (logBuffer.length === 1) {
    flushLogs();
  }
};

// Fast logger that batches writes asynchronously
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      asyncLog('log', ...args);
    }
  },
  error: (...args) => {
    asyncLog('error', ...args);
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      asyncLog('warn', ...args);
    }
  },
  info: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      asyncLog('info', ...args);
    }
  },
};

