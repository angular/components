export interface Browser {
  browserName: string;
  browserVersion?: string;
  platformName?: string;
  platformVersion?: string;
  deviceName?: string;
}

export function getUniqueId(browser: Browser): string {
  let result = '';
  Object.keys(browser).sort().forEach((k) => result += `${k}=${browser[k as keyof Browser]}`);
  return result;
}
