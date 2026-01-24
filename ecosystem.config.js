module.exports = {
  apps: [
    {
      name: 'dod-rooms',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
