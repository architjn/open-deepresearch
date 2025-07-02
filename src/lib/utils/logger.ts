const isDebugEnabled = process.env.ENABLE_DEBUG_LOGGING === "true";

const createLogger = (prefix: string) => {
  return {
    debug: (...args: unknown[]) => {
      if (isDebugEnabled) {
        console.debug(`[DEBUG] ${prefix}`, ...args);
      }
    },
    info: (...args: unknown[]) => {
      console.info(`[INFO] ${prefix}`, ...args);
    },
    warn: (...args: unknown[]) => {
      console.warn(`[WARN] ${prefix}`, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(`[ERROR] ${prefix}`, ...args);
    },
  };
};

export default createLogger;
