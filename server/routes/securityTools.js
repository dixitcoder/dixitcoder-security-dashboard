import express from "express";
import http from "node:http";
import https from "node:https";
import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import axios from "axios";
import { isValidHost } from "./validation.js";

const router = express.Router();

function hasPublicAddress(address) {
  if (net.isIPv4(address)) {
    const octets = address.split(".").map(Number);
    const [first, second] = octets;
    return first !== 0
      && first !== 10
      && first !== 127
      && !(first === 100 && second >= 64 && second <= 127)
      && !(first === 169 && second === 254)
      && !(first === 172 && second >= 16 && second <= 31)
      && !(first === 192 && second === 0)
      && !(first === 192 && second === 2)
      && !(first === 192 && second === 168)
      && !(first === 192 && second === 88 && octets[2] === 99)
      && !(first === 198 && (second === 18 || second === 19 || second === 51))
      && !(first === 203 && second === 0 && octets[2] === 113)
      && first < 224;
  }

  if (!net.isIPv6(address)) return false;
  const normalized = address.toLowerCase();
  return normalized.startsWith("2")
    || normalized.startsWith("3")
    ? !normalized.startsWith("2001:db8:")
      && !normalized.startsWith("2001:2:")
    : false;
}

async function resolvePublicHost(host) {
  if (net.isIP(host)) {
    if (!hasPublicAddress(host)) throw new Error("Private or reserved addresses are not allowed.");
    return [{ address: host, family: net.isIPv4(host) ? 4 : 6 }];
  }

  const addresses = await dns.lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !hasPublicAddress(address))) {
    throw new Error("The host must resolve only to public addresses.");
  }
  return addresses;
}

function createPinnedLookup(addresses) {
  return (_hostname, options, callback) => {
    if (options?.all) callback(null, addresses);
    else callback(null, addresses[0].address, addresses[0].family);
  };
}

async function requestPublicSite(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid website URL.");
  }

  if (
    !["http:", "https:"].includes(url.protocol)
    || url.username
    || url.password
    || !isValidHost(url.hostname)
  ) {
    throw new Error("Use a valid public HTTP or HTTPS website URL.");
  }

  const addresses = await resolvePublicHost(url.hostname);
  const lookup = createPinnedLookup(addresses);
  const agent = url.protocol === "https:"
    ? new https.Agent({ lookup })
    : new http.Agent({ lookup });

  try {
    let response = await axios.request({
      url: url.href,
      method: "HEAD",
      timeout: 10000,
      maxRedirects: 0,
      proxy: false,
      responseType: "stream",
      validateStatus: () => true,
      httpAgent: url.protocol === "http:" ? agent : undefined,
      httpsAgent: url.protocol === "https:" ? agent : undefined,
    });
    if (response.status === 405 || response.status === 501) {
      response.data.destroy();
      response = await axios.request({
        url: url.href,
        method: "GET",
        timeout: 10000,
        maxRedirects: 0,
        maxContentLength: 1024,
        proxy: false,
        responseType: "stream",
        validateStatus: () => true,
        httpAgent: url.protocol === "http:" ? agent : undefined,
        httpsAgent: url.protocol === "https:" ? agent : undefined,
      });
    }
    response.data.destroy();
    return response;
  } finally {
    agent.destroy();
  }
}

router.post("/dns-records", async (req, res) => {
  const host = typeof req.body?.host === "string" ? req.body.host.trim().replace(/\.$/, "") : "";
  if (!isValidHost(host) || net.isIP(host)) {
    return res.status(400).json({ error: "Enter a valid DNS hostname." });
  }

  const recordTypes = {
    A: () => dns.resolve4(host),
    MX: () => dns.resolveMx(host),
    TXT: () => dns.resolveTxt(host),
    NS: () => dns.resolveNs(host),
  };

  try {
    const results = await Promise.all(Object.entries(recordTypes).map(async ([type, resolve]) => {
      try {
        return [type, await resolve()];
      } catch (error) {
        if (["ENODATA", "ENOTFOUND", "ESERVFAIL"].includes(error.code)) return [type, []];
        throw error;
      }
    }));
    res.json({ host, records: Object.fromEntries(results) });
  } catch (error) {
    console.error("DNS records lookup failed:", error.message);
    res.status(502).json({ error: "DNS lookup failed. Check the hostname and try again." });
  }
});

router.post("/headers", async (req, res) => {
  try {
    const response = await requestPublicSite(req.body?.url);
    res.json({
      url: req.body.url,
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    const status = error.message.includes("valid public") || error.message.includes("Private or reserved")
      || error.message.includes("resolve only") ? 400 : 502;
    res.status(status).json({ error: error.message || "Website header check failed." });
  }
});

router.post("/uptime", async (req, res) => {
  const startedAt = Date.now();
  try {
    const response = await requestPublicSite(req.body?.url);
    res.json({
      url: req.body.url,
      up: response.status >= 200 && response.status < 500,
      status: response.status,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const status = error.message.includes("valid public") || error.message.includes("Private or reserved")
      || error.message.includes("resolve only") ? 400 : 502;
    res.status(status).json({ error: error.message || "Website uptime check failed." });
  }
});

router.post("/ssl-expiry", async (req, res) => {
  const host = typeof req.body?.host === "string"
    ? req.body.host.trim().replace(/^https?:\/\//i, "").split(/[/:?#]/)[0]
    : "";
  if (!isValidHost(host)) {
    return res.status(400).json({ error: "Enter a valid public hostname." });
  }

  try {
    const addresses = await resolvePublicHost(host);
    const certificate = await new Promise((resolve, reject) => {
      const socket = tls.connect({
        host,
        port: 443,
        servername: net.isIP(host) ? undefined : host,
        rejectUnauthorized: false,
        lookup: createPinnedLookup(addresses),
        timeout: 10000,
      }, () => {
        const peerCertificate = socket.getPeerCertificate();
        if (!peerCertificate || !peerCertificate.valid_to) {
          socket.destroy();
          reject(new Error("The server did not provide a readable TLS certificate."));
          return;
        }
        const daysRemaining = Math.floor((Date.parse(peerCertificate.valid_to) - Date.now()) / 86_400_000);
        resolve({
          host,
          valid: socket.authorized && daysRemaining >= 0,
          validTo: peerCertificate.valid_to,
          daysRemaining,
          issuer: peerCertificate.issuer?.CN || "Unknown",
          checkedAt: new Date().toISOString(),
        });
        socket.end();
      });
      socket.on("timeout", () => socket.destroy(new Error("TLS check timed out.")));
      socket.on("error", reject);
    });
    res.json(certificate);
  } catch (error) {
    const status = error.message.includes("Private or reserved")
      || error.message.includes("resolve only") ? 400 : 502;
    res.status(status).json({ error: error.message || "SSL expiry check failed." });
  }
});

export default router;
