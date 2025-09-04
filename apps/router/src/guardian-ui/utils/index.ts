export const bftHonest = (totalGuardians: number): number => {
  return totalGuardians - bftFaulty(totalGuardians);
};

export const bftFaulty = (totalGuardians: number): number => {
  return Math.floor((totalGuardians - 1) / 3);
};

export const generateSimpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).slice(0, 6); // Convert to hex and take the first 6 characters
};

export const generatePassword = () => {
  const getRandomInt = (max: number) => {
    const randomBuffer = new Uint8Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return Math.floor((randomBuffer[0] / 255) * max);
  };

  const passwordLength = 30;
  const charSet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789';

  let adminPassword = '';
  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = getRandomInt(charSet.length);
    adminPassword += charSet.charAt(randomIndex);
  }

  return adminPassword;
};

export const normalizeUrl = (url: string): string => {
  try {
    // Check if the URL is in Docker-style format (e.g., fedimintd_2:18184)
    const dockerStyleRegex = /^[\w-]+:\d+$/;
    if (dockerStyleRegex.test(url)) {
      return url; // Return as-is for Docker-style URLs
    }

    // Parse the URL
    const parsedUrl = new URL(url);

    // Normalize the protocol (e.g., 'ws:' to 'ws://')
    const protocol = parsedUrl.protocol.endsWith(':')
      ? parsedUrl.protocol
      : `${parsedUrl.protocol}:`;

    // Extract only the port for IP addresses, localhost, or Docker-style hostnames
    const isLocalOrIpOrDockerStyle = (hostname: string) =>
      ['localhost', '127.0.0.1'].includes(hostname) ||
      /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^[\w-]+$/.test(hostname);

    const host = isLocalOrIpOrDockerStyle(parsedUrl.hostname)
      ? `:${parsedUrl.port}`
      : parsedUrl.host;

    // Combine parts
    let normalizedUrl = `${protocol}//${host}`;

    // Remove trailing slash if present
    if (normalizedUrl.endsWith('/')) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    return normalizedUrl;
  } catch (error) {
    // If URL parsing fails, return the original string
    console.error(`Failed to normalize URL: ${url}`, error);
    console.warn(`Returning original URL: ${url}`);
    return url;
  }
};

export function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export const validateImageUrl = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = url;
  });
};
