/** Definition of a test browser. */
export interface Browser {
  browserName: string;
  browserVersion?: string;
  platformName?: string;
  platformVersion?: string;
  deviceName?: string;
}

/**
 * Gets a unique id for the specified browser. This id can be shared
 * across the background service and launcher using IPC.
 */
export function getUniqueId(browser: Browser): string {
  let result = '';
  Object.keys(browser).sort()
    .forEach((key) => result += `${key}=${browser[key as keyof Browser]}`);
  return result;
}
