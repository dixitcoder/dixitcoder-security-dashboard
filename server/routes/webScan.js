import express from "express";
import axios from "axios";
import tls from "tls";
import https from "https";
import { formatHostForUrl, isValidHost, isValidPort } from "./validation.js";

const router = express.Router();

// helper: fetch SSL cert info
function getSslInfo(host, port = 443) {
  return new Promise((resolve) => {
    const socket = tls.connect(port, host, { servername: host }, () => {
      const cert = socket.getPeerCertificate();
      if (!cert || Object.keys(cert).length === 0) {
        socket.end();
        return resolve(null);
      }

      resolve({
        protocol: socket.getProtocol(),
        cn: cert.subject?.CN,
        issuer: cert.issuer?.CN,
        valid_from: cert.valid_from,
        valid_to: cert.valid_to,
        expired: new Date(cert.valid_to) < new Date(),
      });

      socket.end();
    });

    socket.on("error", () => resolve(null));
  });
}

router.post("/web-scan", async (req, res) => {
  const { host, port = 80, path = "/", options = {} } = req.body || {};

  if (!isValidHost(host) || !isValidPort(port)) {
    return res.status(400).json({ error: "A valid host and port are required" });
  }
  if (
    typeof path !== "string"
    || path.length > 2048
    || !options
    || typeof options !== "object"
    || Array.isArray(options)
  ) {
    return res.status(400).json({ error: "A valid path and options object are required" });
  }

  const scheme = port == 443 ? "https" : "http";
  const urlHost = formatHostForUrl(host);
  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const targetUrl = `${scheme}://${urlHost}:${port}${urlPath}`;

  let result = {
    status: null,
    headers: {},
    server: null,
    contentType: null,
    size: null,
    robots: null,
    ssl: null,
    bodySnippet: null,
    finalUrl: targetUrl,
  };

  try {
    // HTTP(S) request
    const response = await axios.get(targetUrl, {
      maxRedirects: options.followRedirects ? 5 : 0,
      timeout: 10000,
      validateStatus: () => true,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // allow self-signed
    });

    result.status = response.status;
    result.headers = options.grabHeaders ? response.headers : {};
    result.server = response.headers["server"] || null;
    result.contentType = response.headers["content-type"] || null;
    result.size = response.headers["content-length"]
      ? parseInt(response.headers["content-length"])
      : response.data?.length || null;
    result.finalUrl = response.request?.res?.responseUrl || targetUrl;

    if (typeof response.data === "string") {
      result.bodySnippet = response.data.substring(0, 2000);
    }
  } catch (err) {
    console.error("Web scan request error:", err.message);
    result.error = err.message;
  }

  // robots.txt
  if (options.fetchRobots) {
    try {
      const robotsUrl = `${scheme}://${urlHost}:${port}/robots.txt`;
      const robotsResp = await axios.get(robotsUrl, { timeout: 5000 });
      if (typeof robotsResp.data === "string") {
        result.robots = robotsResp.data.substring(0, 2000);
      }
    } catch {
      result.robots = null;
    }
  }

  // SSL info
  if (options.sslInfo && port == 443) {
    try {
      result.ssl = await getSslInfo(host, port);
    } catch {
      result.ssl = null;
    }
  }

  res.json(result);
});




export default router;
