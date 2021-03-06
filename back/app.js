const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const config = require('../config/config.js');

const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const server = require('http').createServer(app);
const cors = require('cors')

const io = require('socket.io')(server);
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');

// const { verifyAuth } = require('./auth.js');

const port = config.port;

// server stats
const memStat = require('mem-stat');
const df = require('node-df');
const osutils = require('os-utils');
const cmd = require('node-cmd');

server.listen(port);
console.log(`Server Run / Mode ${env} / Port ${port} 🎄`);

app.use(express.static('front'));
app.use(bodyParser.json());
app.use(cors());
// app.use(verifyAuth);

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function (req, res, next) {
  res.sendfile(`${__dirname}/front/index.html`);
  app.use(express.static(`${__dirname}/front`));
});

app.get('/disks', function (req, res) {
  df(function (err, table) {
    if (err) {
      console.error(err.stack);
      return;
    }
    res.json(table);
  });
});

app.get('/memory', function (req, res) {
  const allStats = memStat.allStats();
  res.json(allStats);
});

app.get('/cpu', function (req, res) {
  osutils.cpuUsage(function (v) {
    res.json(v);
  });
});

app.get('/cpus', function (req, res) {
  cmd.get(
    "grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'",
    function (err, data, stderr) {
      res.json(data);
    }
  );
});

io.on('connection', function (socket) {
  // do somethink on connection ?
});
