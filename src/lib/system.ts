import "server-only";
import { promises as fs } from "fs";
import os from "os";
import { DB_PATH } from "./db";

export async function getSystemInfo() {
  const memory = process.memoryUsage();
  const dbSize = await fs
    .stat(DB_PATH)
    .then((s) => s.size)
    .catch(() => 0);

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
    dbPath: DB_PATH,
    dbSize,
    serverTime: new Date().toISOString(),
  };
}
