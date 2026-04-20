// backend/src/middleware/customLogger.ts
import { Request, Response, NextFunction } from 'express';

const customLogger = (req: any, res: Response, next: NextFunction) => {
  const start = Date.now();

  // We use the 'finish' event to log after the response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // ANSI Color Codes
    const colors = {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m'
    };

    // 1. Method Color
    let methodColor = colors.reset;
    if (method === 'GET') methodColor = colors.green;
    if (method === 'POST') methodColor = colors.blue;
    if (method === 'PATCH' || method === 'PUT') methodColor = colors.yellow;
    if (method === 'DELETE') methodColor = colors.red;

    // 2. Status Color
    let statusColor = colors.green; // 2xx
    if (statusCode >= 400) statusColor = colors.yellow; // 4xx
    if (statusCode >= 500) statusColor = colors.red; // 5xx

    // 3. Time Color
    let timeColor = colors.green; // Fast
    if (duration > 500) timeColor = colors.yellow; // Medium
    if (duration > 1500) timeColor = colors.red; // Slow

    // 4. Role Badge
    let roleBadge = `${colors.gray}[ GUEST ]${colors.reset}`;
    if (req.user) {
      const role = req.user.role?.toUpperCase() || 'USER';
      const roleColor = role === 'SUPERADMIN' ? colors.magenta : colors.cyan;
      roleBadge = `${colors.bold}${roleColor}[ ${role} ]${colors.reset}`;
    }

    // Format the log line
    const logLine = [
       roleBadge.padEnd(20),
       `${colors.bold}${methodColor}${method.padEnd(7)}${colors.reset}`,
       `${originalUrl.split('?')[0].padEnd(35)}`,
       `${statusColor}${statusCode}${colors.reset}`,
       `${timeColor}${duration.toString().padStart(4)}ms${colors.reset}`
    ].join(' ');

    console.log(logLine);
  });

  process.nextTick(next);
};

export default customLogger;
