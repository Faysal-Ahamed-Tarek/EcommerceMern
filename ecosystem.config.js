module.exports = {
  apps: [
    {
      name: "drskinc-backend",
      cwd: "./backend",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      node_args: "--max-old-space-size=512",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // Restart policy
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 3000,
      // Log rotation (requires pm2-logrotate module)
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "drskinc-frontend",
      cwd: "./frontend",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      node_args: "--max-old-space-size=1024",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 3000,
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
