import express from 'express';
import os from 'os';
import si from 'systeminformation';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    const os = await si.osInfo();
    const cpuUsage = await si.currentLoad();
    const network = await si.networkInterfaces();
    const disk = await si.fsSize();
    const uptime = si.time();
    const users = await si.users();
    const battery = await si.battery();
    const gpu = await si.graphics();

    res.json({
      cpu,
      mem,
      os,
      cpuUsage: cpuUsage.currentLoad.toFixed(1),
      network,
      disk,
      uptime,
      users,
      battery,
      gpu
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching system info", details: err.message });
  }
});

export default router;
