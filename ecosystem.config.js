module.exports = {
  apps: [
    {
      name: "hy-tips",
      script: "./src/index.js",
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      instances: 1,
      exec_mode: "cluster",
    },
  ],
};
