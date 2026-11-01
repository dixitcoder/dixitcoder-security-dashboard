// routes/base.js
import os from 'os';
import axios from 'axios';
import { exec } from 'child_process';
import si from 'systeminformation';
import fs from "fs";
import crypto from "crypto";
import net from 'net';

// ---------------- Base64 Utility Functions ----------------
export function encodeBase64(text) {
  return Buffer.from(text, 'utf-8').toString('base64');
}

export function decodeBase64(encoded) {
  try {
    return Buffer.from(encoded, 'base64').toString('utf-8');
  } catch (e) {
    throw new Error('Invalid Base64 string');
  }
}

// ---------------- JSON Utility Functions ----------------
export function isValidJson(jsonStr) {
  try {
    JSON.parse(jsonStr);
    return true;
  } catch {
    return false;
  }
}

export function beautifyJson(jsonStr) {
  return JSON.stringify(JSON.parse(jsonStr), null, 2);
}

export function minifyJson(jsonStr) {
  return JSON.stringify(JSON.parse(jsonStr));
}

// ---------------- Regex Tester ----------------
export function testRegex(pattern, flags, testString) {
  try {
    const regexFlags = flags || '';
    const regex = new RegExp(pattern, regexFlags.includes('g') ? regexFlags : `${regexFlags}g`);
    const matches = [...testString.matchAll(regex)];
    return {
      success: true,
      matches: matches.map((m) => ({
        match: m[0],
        index: m.index,
        groups: m.groups || null,
      })),
      total: matches.length,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---------------- GeoIP Lookup ----------------
export const geoIPLookup = async (ip) => {
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}`);
    if (res.data.status !== 'success') throw new Error(res.data.message || 'Failed to fetch GeoIP');
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ---------------- Network Interfaces ----------------
export const getNetworkInterfaces = () => {
  const nets = os.networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal) {
        results.push({
          iface: name,
          mac: net.mac,
          ip4: net.family === 'IPv4' ? net.address : '',
          ip6: net.family === 'IPv6' ? net.address : '',
          cidr: net.cidr,
        });
      }
    }
  }
  return results;
};

// ---------------- Packet Sniffer (Simulated - pcap removed) ----------------
export const sniffPackets = (iface = 'eth0', packetCount = 10) => {
  return new Promise((resolve) => {
    // Simulated packet data since pcap is not available
    const packets = [];
    const protocols = ['TCP', 'UDP', 'ICMP', 'ARP'];
    const srcIPs = ['192.168.1.10', '192.168.1.20', '10.0.0.5', '172.16.0.1'];
    const dstIPs = ['8.8.8.8', '1.1.1.1', '208.67.222.222', '8.8.4.4'];

    for (let i = 0; i < packetCount; i++) {
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const srcIP = srcIPs[Math.floor(Math.random() * srcIPs.length)];
      const dstIP = dstIPs[Math.floor(Math.random() * dstIPs.length)];
      const srcPort = Math.floor(Math.random() * 65535);
      const dstPort = protocol === 'TCP' || protocol === 'UDP' ? Math.floor(Math.random() * 65535) : null;
      const length = Math.floor(Math.random() * 1500) + 64;

      packets.push({
        protocol,
        src: srcIP,
        dst: dstIP,
        srcPort,
        dstPort,
        length,
        timestamp: new Date().toISOString(),
        info: `${srcIP}:${srcPort || ''} -> ${dstIP}:${dstPort || ''} ${protocol} len=${length}`
      });
    }

    resolve({
      interface: iface,
      packetCount,
      packets,
      message: "Simulated packet capture (pcap not available)"
    });
  });
};

// ---------------- ARP Table ----------------
export const getARPTable = () => {
  return new Promise((resolve, reject) => {
    // Linux: use "arp -n", Windows: use "arp -a"
    exec('arp -n', (err, stdout, stderr) => {
      if (err) {
        // Try fallback command
        exec('ip neigh', (err2, stdout2, stderr2) => {
          if (err2) return reject(err);

          const lines = stdout2.split('\n').filter(line => line.trim());
          const table = lines.map(line => {
            const parts = line.trim().split(/\s+/);
            return {
              ip: parts[0] || 'Unknown',
              mac: parts[4] || 'Unknown',
              interface: parts[2] || 'Unknown',
              state: parts[5] || 'Unknown'
            };
          }).filter(entry => entry.ip !== 'Unknown');
          resolve(table);
        });
        return;
      }

      const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('Address'));
      const table = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          ip: parts[0] || 'Unknown',
          mac: parts[2] || 'Unknown',
          interface: parts[3] || parts[1] || 'Unknown',
        };
      }).filter(entry => entry.ip !== 'Unknown');
      resolve(table);
    });
  });
};

// ---------------- Processes List ----------------
export const getProcesses = async () => {
  try {
    const data = await si.processes();
    return data;
  } catch (err) {
    throw new Error('Error fetching processes: ' + err.message);
  }
};

// ---------------- File Integrity Check ----------------
export const checkFileIntegrity = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject({ error: `Cannot read file: ${err.message}` });
      }

      const hash = crypto.createHash("sha256").update(data).digest("hex");
      resolve({
        path: filePath,
        size: data.length,
        hash,
      });
    });
  });
};

// ---------------- Port Check ----------------
export const checkPort = (host, port, timeout = 3000) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = 'closed';
    let startTime = Date.now();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      status = 'open';
      socket.destroy();
      resolve({
        host,
        port,
        status,
        time: Date.now() - startTime,
        service: getServiceByPort(port)
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        host,
        port,
        status: 'filtered',
        time: Date.now() - startTime
      });
    });

    socket.on('error', () => {
      socket.destroy();
      resolve({
        host,
        port,
        status: 'closed',
        time: Date.now() - startTime
      });
    });

    socket.connect(port, host);
  });
};

// Helper function to guess service by port
function getServiceByPort(port) {
  const commonPorts = {
    20: 'FTP-data', 21: 'FTP', 22: 'SSH', 23: 'Telnet',
    25: 'SMTP', 53: 'DNS', 80: 'HTTP', 110: 'POP3',
    111: 'RPC', 135: 'RPC', 139: 'NetBIOS', 143: 'IMAP',
    443: 'HTTPS', 445: 'SMB', 993: 'IMAPS', 995: 'POP3S',
    1723: 'PPTP', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
    5900: 'VNC', 6379: 'Redis', 8080: 'HTTP-Alt', 27017: 'MongoDB'
  };
  return commonPorts[port] || 'unknown';
}

// ---------------- Port Scan ----------------
export const scanPorts = async (host, ports, concurrency = 10) => {
  const results = [];
  const chunks = [];

  // Split ports into chunks for concurrency
  for (let i = 0; i < ports.length; i += concurrency) {
    chunks.push(ports.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(port => checkPort(host, port));
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  return {
    host,
    scanTime: new Date().toISOString(),
    totalPorts: ports.length,
    openPorts: results.filter(r => r.status === 'open'),
    results
  };
};
