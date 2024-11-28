import 'dotenv/config';
import './utils/globals.js'
import express from 'express';
import http from 'http';
import path from 'path';
import { createConnection } from './utils/database.js';

// import express router
import indexRouter from './routes/index.js';

const app = express();

// set view engine pug
app.set('views', path.join(global.__rootDir, 'views'));
app.set('view engine', 'pug');

// configure express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(global.__rootDir, 'public')));

// use express router
app.use('/', indexRouter);

// error handling
app.use((req, res, next) => {
  res.render('error', { status: '404', message: 'Not Found' });
});
app.use((err, req, res, next) => {
  console.error(err.message);

  let status = err.status || 500
  res.status(status)
    .render('error', {
      status,
      message: 'Server Error'
    }
  );
});

// server startup
await createConnection();
var server = http.createServer(app);
server.listen(global.PORT, global.ADDRESS);

// http keep-alive
//   helps avoid an abrupt shutdown on SIGINT
server.on('connection', function (socket) {
  socket.setTimeout(5 * 1000);
});

// shutdown on SIGTERM
process.on('SIGTERM', () => {
  if (global.LOG_LEVEL == 'DEBUG') console.debug("Received SIGTERM: Shutting down");
  server.close(() => {
    if (global.LOG_LEVEL == 'DEBUG') console.info("Shut down");
  });
});

// shutdown on SIGINT
process.on('SIGINT', () => {
  if (global.LOG_LEVEL == 'DEBUG') console.info("Received SIGINT: Shutting down");
  process.exit(0);
});

server.on('listening', () => {
  if (global.LOG_LEVEL == 'DEBUG') {
    console.debug("scratch-map server properties: ", server.address());
  } else {
    console.info(`scratch-map listening: ${server.address().address}:${server.address().port}`);
  }
});
