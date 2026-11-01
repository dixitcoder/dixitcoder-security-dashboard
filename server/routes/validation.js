import net from 'net';

const hostnamePattern = /^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)(?:\.(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?))*\.?$/i;

export function isValidHost(host) {
  return typeof host === 'string'
    && host === host.trim()
    && (net.isIP(host) !== 0 || hostnamePattern.test(host));
}

export function isValidPort(port) {
  const value = Number(port);
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}

export function formatHostForUrl(host) {
  return net.isIP(host) === 6 ? `[${host}]` : host;
}
