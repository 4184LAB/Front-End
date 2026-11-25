import "server-only";
import os from "os";

export async function getSystemInfo() {
  const memory = process.memoryUsage();

  return {
    node: process.version,
    platform: `${os.type()} ${os.release()} (${process.arch})`,
    hostname: os.hostname(),
    cpus: os.cpus().length,
    env: process.env.NODE_ENV ?? "unknown",
    processUptime: process.uptime(),
    systemUptime: os.uptime(),
    memory: {
      rss: memory.rss,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      systemFree: os.freemem(),
      systemTotal: os.totalmem(),
    },
    loadAverage: os.loadavg(),
    serverTime: new Date().toISOString(),
  };
}
