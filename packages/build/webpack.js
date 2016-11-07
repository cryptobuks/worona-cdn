import rimraf from 'rimraf';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child-process-promise';

export default async (config) => {
  const { name, type, services } = config;
  const envs = ['dev', 'prod'];
  if (services.length === 0) throw new Error('No entry found. Please check the src folder.');
  rimraf.sync(path.resolve('dist', name));
  const files = {};
  for (let i = 0; i < services.length; i += 1) {
    for (let j = 0; j < envs.length; j += 1) {
      const service = services[i];
      const env = envs[j];
      await spawn('./node_modules/.bin/webpack', ['--config', 'webpack.config.js', '--progress',
        '--name', name,
        '--type', type,
        '--service', service,
        '--env', env,
      ], { stdio: 'inherit' });
      files[service] = files[service] || {};
      files[service][env] = require(`../dist/${name}/${service}/${env}/files.json`);
      rimraf.sync(`dist/${name}/${service}/${env}/files.json`);
    }
  }
  fs.writeFileSync(`dist/${name}/worona.json`, JSON.stringify({ ...config, cdn: files }, null, 2));
};