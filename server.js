import 'dotenv/config'
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createConnection } from './utils/database.js';

//register __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// import express router
import indexRouter from './routes/index.js';

const app = express();

// set view engine pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// configure express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

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
server.listen(process.env.PORT || 3000);
server.on('listening', () => {
  console.log(`scratch-map listening on port: ${server.address().port}`);

  console.log('PORT: ', process.env.PORT)
  console.log('DBLOCATION: ', process.env.DBLOCATION)
  console.log('ENABLE_SHARE: ', process.env.ENABLE_SHARE)
});
