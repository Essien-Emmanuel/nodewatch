#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');
const debounce = require('lodash.debounce');
const chokidar = require('chokidar');
const program = require('caporal');
const colors = require('colors');
const path = require('path')

const watchFileStartMsg = colors.green('>>>> Nodewatch starting process...'); 
const watchFileRestartMsg = colors.green('>>>> Nodewatch Restarting process again'); 

const watchFile = (filename) => {
  let $process;

  const start = debounce(() => {
    if ($process) {
      $process.kill()
    };
    console.log(watchFileStartMsg);
    $process = spawn('node', [filename], { stdio: 'inherit' });
  }, 100);

  const absoluteFilePath = path.resolve(filename);
  console.log('abs path of filename ', absoluteFilePath, 'of ', filename);
  
  chokidar.watch(process.cwd(), { persistent: true })
    .on('add', (filePath) => {
      console.log('filepath ', filePath)
      if (path.resolve(filePath) === absoluteFilePath) start(filename);
    })
    .on('change', (filePath) => {
      if (path.resolve(filePath) === absoluteFilePath) start(filename);
    })
    .on('unlink', (filePath) => {
      if (path.resolve(filePath) === absoluteFilePath) start(filename);
    });
}

const watchFileOnRS = (filename) => {
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (data) => {
    if (data.trim() === 'rs') {
      console.log(watchFileRestartMsg);
      watchFile(filename);
    }
  })
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

    watchFile($filename);
    watchFileOnRS($filename);
  });

program.parse(process.argv)