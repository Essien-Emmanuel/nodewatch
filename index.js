#!/usr/bin/env node

/**
 * A commandline tool to watch and run file
 */

const fs = require('fs');
const { spawn } = require('child_process');
const debounce = require('lodash.debounce');
const chokidar = require('chokidar');
const program = require('caporal');
const colors = require('colors');
const path = require('path')

const toolVersion = '0.0.1';

const watchFileStartMsg = (filename) => {
  console.log(colors.yellow(`nodewatch >>>> ${toolVersion}`))
  console.log(colors.yellow("nodewatch >>>> to restart at any time, enter 'rs'"))
  console.log(colors.yellow("nodewatch >>>> watching paths(s): *.*"));
  console.log(colors.green(`nodewatch >>>> starting 'node ${filename}`));
}

const watchFileRestartMsg = (filename) => {
  console.log(colors.green(`starting 'node ${filename}`))
}; 

/**
 * 
 * [nodemon] 3.1.0
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/server.js`

 */

const watchFile = (filename) => {
  let $process;
  
  const start = debounce(() => {
    
    if ($process) {
      $process.kill()
    };
    watchFileStartMsg(filename);
    $process = spawn('node', [filename], { stdio: 'inherit' });
  }, 100);

  const absoluteFilePath = path.resolve(filename);
  
  chokidar.watch(absoluteFilePath)
  .on('add',  start)
  .on('change', start)
  .on('unlink', start);
}

const watchFileOnRS = (filename) => {
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (data) => {
    if (data.trim() === 'rs') {
      watchFileRestartMsg(filename);
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