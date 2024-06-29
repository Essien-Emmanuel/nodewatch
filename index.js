#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');
const debounce = require('lodash.debounce');
const chokidar = require('chokidar');
const program = require('caporal');


const watchFile = (filename) => {
  const start = debounce(() => {
    spawn('node', [filename], { stdio: 'inherit' })
  }, 100)
  
  chokidar.watch(process.cwd())
  .on('add', start)
    .on('change', start)
    .on('unlink', start);
}

program
  .version('0.0.1')
  .argument('[filename]', 'Name of the file to execute!')
  .action( async (args) => {
    const { filename } = args;
    const $filename = filename || 'index.js';

    try {
      await fs.promises.access($filename)
    } catch (error) {
      throw new Error(`Could not find the file ${$filename}`);
    }

    watchFile($filename)
  });

program.parse(process.argv)