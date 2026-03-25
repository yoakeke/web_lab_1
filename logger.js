const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'requests.log');

const logger = (req, res, next) => {
  const start = new Date();

  res.on('finish', () => {
    const logEntry = `${start.toISOString()} | ${req.method} ${req.url} | Status: ${res.statusCode}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) console.error('Ошибка записи лога:', err);
    });
  });

  next();
};

module.exports = logger;