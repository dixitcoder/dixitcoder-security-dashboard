import NetworkSpeed from 'network-speed';

export const runBandwidthTest = async (host) => {
  const networkSpeed = new NetworkSpeed();

  try {
    const downloadSpeed = await networkSpeed.checkDownloadSpeed();
    const uploadSpeed = await networkSpeed.checkUploadSpeed();

    return {
      download: downloadSpeed.mbps + ' Mbps',
      upload: uploadSpeed.mbps + ' Mbps',
      ping: 'N/A',
      isp: 'Local Network',
      server: host,
      host: host
    };
  } catch (err) {
    throw new Error(err.message);
  }
};
