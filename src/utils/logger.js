import chalk from 'chalk';

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;

const logger = {
  debug(...args) {
    if (currentLevel <= LEVELS.debug) {
      console.log(chalk.gray('[DEBUG]'), ...args);
    }
  },

  info(...args) {
    if (currentLevel <= LEVELS.info) {
      console.log(chalk.cyan('[INFO ]'), ...args);
    }
  },

  warn(...args) {
    if (currentLevel <= LEVELS.warn) {
      console.warn(chalk.yellow('[WARN ]'), ...args);
    }
  },

  error(...args) {
    if (currentLevel <= LEVELS.error) {
      console.error(chalk.red('[ERROR]'), ...args);
    }
  },
};

export default logger;
