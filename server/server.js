import express from 'express';
import cors from 'cors';
import net from 'net';
import dgram from 'dgram';
import tls from 'tls';
import axios from 'axios';
import ping from 'ping';
import os from 'os';
import si from "systeminformation";
import path from "path";

import https from 'https';
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Utils imports
import { generateHash } from "./routes/base-hash.js";
import { testRegex } from "./routes/base.js";
import { geoIPLookup } from "./routes/base.js";
import { sniffPackets, getNetworkInterfaces } from './routes/base.js';
import { getARPTable } from './routes/base.js';
import { getProcesses } from './routes/base.js';
import { checkFileIntegrity } from "./routes/base.js";
import { checkPort } from './routes/base.js';
import { runBandwidthTest } from './routes/network.js';
import { isValidHost, isValidPort } from './routes/validation.js';

// Router imports
import webScanRoute from "./routes/webScan.js";
import networkMapperRoute from "./routes/networkMapper.js";
import systemRouter from './routes/routes.js';
import whoisRoutes from "./routes/whoisRoutes.js";
import sslRoutes from "./routes/ssl.js";
import firewallRoutes from "./routes/firewall.js";
import dnsLeakRoutes from "./routes/dns-leak.js";
import msfRoutes from "./routes/android-generate.js";
import jsonRoutes from "./routes/jsonRoutes.js";
import tracerouteRoute from "./routes/traceroute.js";
import ImagesOsint from "./routes/osint-images.js";
import infooozeRouter from "./routes/infoooze.js";
import testing from './routes/callApi.js';
import securityToolsRoutes from "./routes/securityTools.js";
import authRoutes, { requireAuthenticatedSession } from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dixitcoder-api' });
});
app.use('/api/auth', authRoutes);
app.use(requireAuthenticatedSession);

// Serve static files
app.use("/downloads", express.static("/tmp"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------
// TCP Ping
// -----------------------------
const tcpPing = (host, port = 80, timeout = 2000) => {
  return new Promise(resolve => {
    const socket = new net.Socket();
    let alive = false;
    const start = Date.now();
    socket.setTimeout(timeout);

    socket.on('connect', () => { alive = true; socket.destroy(); });
    socket.on('timeout', () => socket.destroy());
    socket.on('error', () => socket.destroy());
    socket.on('close', () => resolve({ host, alive, time: Date.now() - start }));

    socket.connect(port, host);
  });
};

app.post('/ping-sweep', async (req, res) => {
  const { hosts, options = {} } = req.body;
  if (!Array.isArray(hosts) || hosts.length === 0 || hosts.length > 64) {
    return res.status(400).json({ error: 'Provide between 1 and 64 hosts' });
  }
  if (!options.icmp && !options.tcp) {
    return res.status(400).json({ error: 'Enable ICMP or TCP probing' });
  }

  if (hosts.some((host) => !isValidHost(host))) {
    return res.status(400).json({ error: 'One or more hosts are invalid' });
  }

  try {
    const results = await Promise.all(hosts.map(async (host) => {
      const probes = [];
      if (options.icmp) {
        const result = await ping.promise.probe(host, { timeout: 2, min_reply: 1 });
        probes.push({
          protocol: 'ICMP',
          alive: result.alive,
          time: Number.parseFloat(result.time) || null,
        });
      }
      if (options.tcp) {
        const result = await tcpPing(host, 80, 2000);
        probes.push({
          protocol: 'TCP/80',
          alive: result.alive,
          time: result.alive ? result.time : null,
        });
      }

      const response = probes.find((probe) => probe.alive);
      return {
        host,
        status: response ? 'alive' : 'dead',
        time: response?.time ?? null,
        protocol: probes.map((probe) => probe.protocol).join(', '),
        os: options.os ? 'Not available' : null,
      };
    }));
    return res.json({ results });
  } catch (err) {
    console.error('Ping sweep failed:', err);
    return res.status(503).json({ error: 'Ping probe failed', details: err.message });
  }
});

// -----------------------------
// Grab TCP Banner
// -----------------------------
const grabBanner = (host, port) =>
  new Promise(resolve => {
    const socket = new net.Socket();
    let banner = '';
    socket.setTimeout(2000);

    socket.on('connect', () => { socket.write('HEAD / HTTP/1.0\r\n\r\n'); });
    socket.on('data', data => { banner = data.toString().split('\n')[0]; socket.destroy(); });
    socket.on('timeout', () => resolve(banner || null));
    socket.on('error', () => resolve(null));
    socket.on('close', () => resolve(banner || null));

    socket.connect(port, host);
  });

const DEFAULT_TIMEOUT = 3000;
const CONCURRENCY = 50;

// Simple concurrency queue
function promisePool(items, worker, concurrency = CONCURRENCY) {
  return new Promise((resolve) => {
    const results = [];
    let idx = 0;
    let active = 0;
    let finished = 0;
    const total = items.length;

    const next = () => {
      if (finished === total) return resolve(results);
      while (active < concurrency && idx < total) {
        const i = idx++;
        active++;
        Promise.resolve(worker(items[i], i))
          .then((res) => {
            results[i] = res;
          })
          .catch((err) => {
            results[i] = { error: String(err) };
          })
          .finally(() => {
            active--;
            finished++;
            next();
          });
      }
    };
    next();
  });
}

// TCP scan helper
function scanTcp(host, port, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = 'closed';
    let banner = null;
    let start = Date.now();

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      status = 'open';
      socket.write('HEAD / HTTP/1.0\r\n\r\n');
    });
    socket.once('data', (data) => {
      const txt = data.toString();
      banner = txt.split(/\r?\n/)[0].trim();
      socket.destroy();
    });
    socket.once('timeout', () => {
      socket.destroy();
    });
    socket.once('error', () => {
      socket.destroy();
    });
    socket.once('close', () => {
      const time = Date.now() - start;
      resolve({ port, protocol: 'tcp', status, banner, time });
    });

    socket.connect(port, host);
  });
}

// UDP scan helper
function scanUdp(host, port, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve) => {
    const client = dgram.createSocket('udp4');
    const msg = Buffer.from('ping');
    const start = Date.now();
    let settled = false;
    let timeoutId;

    const finish = (status) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      try {
        client.close();
      } catch (err) {
        if (err.code !== 'ERR_SOCKET_DGRAM_NOT_RUNNING') throw err;
      }
      resolve({ port, protocol: 'udp', status, time: Date.now() - start });
    };

    client.send(msg, port, host, (err) => {
      if (err) {
        return finish('closed');
      }
    });

    client.once('message', () => finish('open'));
    client.once('error', () => finish('closed'));

    timeoutId = setTimeout(() => finish('unknown'), timeout);
  });
}

// Grab SSL basic info
function grabSsl(host, port = 443, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve) => {
    const sock = tls.connect(
      { host, port, servername: host, rejectUnauthorized: false, timeout },
      () => {
        try {
          const proto = sock.getProtocol();
          const cert = sock.getPeerCertificate && sock.getPeerCertificate();
          const cn = cert && cert.subject && cert.subject.CN;
          const validTo = cert && cert.valid_to;
          sock.end();
          resolve({ ssl: `TLS ${proto || 'unknown'}`, certCN: cn || null, certValidTo: validTo || null });
        } catch {
          sock.destroy();
          resolve({ ssl: null });
        }
      }
    );
    sock.on('error', () => resolve({ ssl: null }));
    sock.on('timeout', () => {
      try { sock.destroy(); } catch { }
      resolve({ ssl: null });
    });
  });
}

// Grab web info
async function grabWeb(host, port) {
  try {
    const protocol = port === 443 ? 'https' : 'http';
    const url = `${protocol}://${host}:${port}`;
    const res = await axios.get(url, { timeout: 3000, validateStatus: () => true });
    return {
      httpStatus: res.status,
      serverHeader: res.headers.server || null,
      title: (typeof res.data === 'string') ? (res.data.match(/<title>([^<]+)<\/title>/i) || [])[1] : null
    };
  } catch {
    return null;
  }
}

// Parse ports string
function parsePortsString(str) {
  if (!str) return [];
  const out = new Set();
  str.split(',').forEach(part => {
    const p = part.trim();
    if (!p) return;
    if (p.includes('-')) {
      const [a, b] = p.split('-').map(Number);
      if (Number.isFinite(a) && Number.isFinite(b) && a <= b) {
        for (let i = a; i <= b; i++) out.add(i);
      }
    } else {
      const n = Number(p);
      if (Number.isFinite(n)) out.add(n);
    }
  });
  return Array.from(out).sort((a, b) => a - b);
}

// Advanced Scan Endpoint
app.post('/advanced-scan', async (req, res) => {
  const { host, ports, portsStr, options = {} } = req.body;
  if (!isValidHost(host)) return res.status(400).json({ error: 'A valid host is required' });

  const portList = Array.isArray(ports) ? ports : parsePortsString(portsStr || '');
  if (
    portList.length === 0
    || portList.length > 128
    || portList.some((port) => !isValidPort(port))
  ) {
    return res.status(400).json({ error: 'Provide between 1 and 128 valid ports' });
  }

  const opts = {
    tcp: options.tcp !== false,
    udp: !!options.udp,
    banner: !!options.banner,
    ssl: !!options.ssl,
    web: !!options.web
  };

  const totalTasks = portList.length * ((opts.tcp ? 1 : 0) + (opts.udp ? 1 : 0));
  let doneTasks = 0;

  const tasks = [];
  for (const port of portList) {
    if (opts.tcp) {
      tasks.push(async () => {
        const r = await scanTcp(host, port);
        if (opts.banner && r.status === 'open') {
          try { r.banner = await grabBanner(host, port); } catch { }
        }
        if (opts.ssl && (port === 443 || port === 8443)) {
          try {
            const s = await grabSsl(host, port);
            r.ssl = s.ssl;
            r.certCN = s.certCN;
            r.certValidTo = s.certValidTo;
          } catch { r.ssl = null; }
        }
        if (opts.web && (port === 80 || port === 443 || port === 8080 || port === 8000)) {
          try {
            r.web = await grabWeb(host, port);
          } catch { r.web = null; }
        }
        doneTasks++;
        return r;
      });
    }
    if (opts.udp) {
      tasks.push(async () => {
        const r = await scanUdp(host, port);
        doneTasks++;
        return r;
      });
    }
  }

  try {
    const results = await promisePool(tasks, (task) => task(), CONCURRENCY);
    return res.json({ results });
  } catch (err) {
    console.error('scan error', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Scan History
let scanHistory = [];

// Vulnerability Scanner Endpoint
app.post('/vuln-scanner', async (req, res) => {
  const { host, ports, options = {} } = req.body;
  if (!isValidHost(host)) return res.status(400).json({ error: 'A valid host is required' });

  const requestedPorts = Array.isArray(ports) && ports.length
    ? [...new Set(ports.map(Number))]
    : [options.http ? 80 : null, options.https ? 443 : null].filter(Boolean);
  if (
    requestedPorts.length === 0
    || requestedPorts.length > 32
    || requestedPorts.some((port) => !isValidPort(port))
  ) {
    return res.status(400).json({ error: 'Provide between 1 and 32 valid ports' });
  }

  const results = [];

  const scanPort = async (port, protocol) => {
    let status = 'closed';
    let server = null;
    let ssl = null;

    try {
      const url = `${protocol}://${host}:${port}`;
      const agent = protocol === 'https' ? new https.Agent({ rejectUnauthorized: false }) : undefined;
      const response = await axios.get(url, { timeout: 3000, httpsAgent: agent });
      status = 'open';
      if (options.headers) server = response.headers.server || '-';
      if (options.ssl && protocol === 'https') {
        ssl = `TLS ${response.request?.res?.socket?.getProtocol?.() || 'unknown'}`;
      }
    } catch {
      status = 'closed';
    }

    results.push({ port, protocol, status, server, ssl });
  };

  try {
    await Promise.all(requestedPorts.map((port) => {
      const protocol = port === 443 && options.https ? 'https' : options.http ? 'http' : 'https';
      return scanPort(port, protocol);
    }));

    scanHistory.push({
      id: Date.now(),
      host,
      type: 'Vulnerability',
      date: new Date(),
      ports: requestedPorts,
      results
    });

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scan failed' });
  }
});

// Scan History Endpoint
app.get('/scan-history', (req, res) => {
  res.json({ history: scanHistory });
});

// Router Info
app.get('/router-info', async (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = null;

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIp = iface.address;
          break;
        }
      }
      if (localIp) break;
    }

    const router = {
      ip: localIp || 'N/A',
      hostname: os.hostname(),
      subnet: '255.255.255.0',
      gateway: '192.168.1.1',
      dns: ['8.8.8.8', '8.8.4.4']
    };

    res.json(router);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch router info' });
  }
});

// CPU Monitor
app.get("/cpu-monitor", async (req, res) => {
  try {
    const cpu = await si.cpu();
    const load = await si.currentLoad();
    const temp = await si.cpuTemperature();

    res.json({
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      speed: cpu.speed,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      load: load.currentLoad.toFixed(1),
      loadCores: load.cpus.map(c => c.load.toFixed(1)),
      temperature: temp.main || null
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching CPU monitor", details: err.message });
  }
});

// Network Stats
app.get("/network-stats", async (req, res) => {
  try {
    const stats = await si.networkStats();
    const iface = await si.networkInterfaces();
    res.json({
      ...stats[0],
      ...iface.find((i) => i.iface === stats[0].iface)
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching network stats", details: err.message });
  }
});

// Debug Tools
app.get("/api/debug-tools", async (req, res) => {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    const os = await si.osInfo();
    const disk = await si.fsSize();
    const network = await si.networkInterfaces();
    const processes = await si.processes();

    res.json({
      cpu,
      mem,
      os,
      disk,
      network,
      processes,
    });
  } catch (err) {
    console.error("Error fetching debug tools:", err);
    res.status(500).json({
      error: "Failed to fetch debug tools",
      details: err.message,
    });
  }
});

// Base64 Utils
const base64Utils = {
  encodeBase64: (text) => Buffer.from(text, "utf-8").toString("base64"),
  decodeBase64: (encoded) => Buffer.from(encoded, "base64").toString("utf-8"),
};

app.post("/api/base64/encode", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  try {
    const encoded = base64Utils.encodeBase64(text);
    res.json({ result: encoded });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/base64/decode", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  try {
    const decoded = base64Utils.decodeBase64(text);
    res.json({ result: decoded });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hash Generator
app.post("/api/hash", (req, res) => {
  const { text, algorithm } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  try {
    const hash = generateHash(text, algorithm || "md5");
    res.json({ hash });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Regex Tester
app.post("/api/regex", (req, res) => {
  const { pattern, flags, testString } = req.body;
  if (typeof pattern !== 'string' || typeof testString !== 'string') {
    return res.status(400).json({ error: "Pattern and test string are required!" });
  }
  const result = testRegex(pattern, flags || "", testString);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
});

// GeoIP Lookup
app.post("/api/geoip", async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP address is required" });
  try {
    const data = await geoIPLookup(ip);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching GeoIP info", details: err.message });
  }
});

// Packet Sniffer
app.get('/api/packet-sniffer', async (req, res) => {
  const iface = typeof req.query.iface === 'string' ? req.query.iface : 'eth0';
  const requestedCount = Number.parseInt(req.query.count, 10);
  const count = Number.isNaN(requestedCount) ? 10 : requestedCount;
  if (count < 1 || count > 200) {
    return res.status(400).json({ success: false, error: 'Count must be between 1 and 200' });
  }

  try {
    const packets = await sniffPackets(iface, count);
    res.json({ success: true, iface, count, packets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/network-interfaces', (req, res) => {
  const interfaces = getNetworkInterfaces();
  res.json({ success: true, interfaces });
});

// Bandwidth Test
app.post('/api/bandwidth-test', async (req, res) => {
  const { host } = req.body;
  if (!host) return res.status(400).json({ error: 'Host/IP is required' });

  try {
    const result = await runBandwidthTest(host);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error running bandwidth test', details: err.message });
  }
});

// ARP Table
app.get('/api/arp-table', async (req, res) => {
  try {
    const table = await getARPTable();
    res.json(table);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching ARP table', details: err.message });
  }
});

// Process List
app.get('/api/process-list', async (req, res) => {
  try {
    const processes = await getProcesses();
    res.json(processes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch processes', details: err.message });
  }
});

// File Integrity Check
app.post("/api/file-check", async (req, res) => {
  const { path } = req.body;
  if (!path) return res.status(400).json({ error: "File path is required" });
  try {
    const result = await checkFileIntegrity(path);
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Port Forwarding Checker
app.post('/api/port-forwarding', async (req, res) => {
  try {
    const { host, port } = req.body;
    if (!isValidHost(host) || !isValidPort(port)) {
      return res.status(400).json({ error: 'A valid host and port are required' });
    }
    const result = await checkPort(host, Number(port));
    res.json({ host, port: Number(port), ...result, open: result.status === 'open' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check port', details: err.message });
  }
});

// Register all routes
app.use("/", webScanRoute);
app.use("/network-mapper", networkMapperRoute);
app.use('/system-info', systemRouter);
app.use("/api/whois", whoisRoutes);
app.use("/api/ssl-checker", sslRoutes);
app.use("/api/security-tools", securityToolsRoutes);
app.use("/api/firewall-test", firewallRoutes);
app.use("/api/dns-leak", dnsLeakRoutes);
app.use("/api", msfRoutes);
app.use("/api/json", jsonRoutes);
app.use("/api/traceroute", tracerouteRoute);
app.use("/api/image-osint", ImagesOsint);
app.use("/api/infoooze", infooozeRouter);
app.use("/call/api", testing);

app.use((error, _req, res, _next) => {
  console.error('Unhandled API request error:', error);
  res.status(500).json({ error: 'The server could not complete the request.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Advanced Network Scanner API running on http://localhost:${PORT}`);
  console.log('Packet capture permissions depend on the host operating system.');
});
