// require('dotenv').config()
global.newrelic = require('newrelic');
global.TMNG = {}
global.TMNG.logger = require('./utils/logger')

// ===== MODULES ===============================================================
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import favicon from 'serve-favicon';
import logger from 'morgan';
import path from 'path';

// ===== MESSENGER =============================================================
import ThreadSetup from './messenger-api-helpers/thread-setup';

// ===== ROUTES ================================================================
import events from './routes/events';
import feedback from './routes/feedback';
import index from './routes/index';
import users from './routes/users';
import webhooks from './routes/webhooks';
import terms from './routes/terms';

const app = express();

/* =============================================
   =           Basic Configuration             =
   ============================================= */

/* ----------  Views  ---------- */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* ----------  Static Assets  ---------- */

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

/* ----------  Parsers  ---------- */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

 /* ----------  Loggers &c  ---------- */

app.use(logger('dev'));

/* =============================================
   =                   Routes                  =
   ============================================= */

/* ----------  Primary / Happy Path  ---------- */

app.use('/', index);
app.use('/users', users);
app.use('/events', events);
app.use('/feedback', feedback);
app.use('/webhook', webhooks);
app.use('/terms', terms);

/* ----------  Errors  ---------- */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/* ----------  Messenger setup  ---------- */

ThreadSetup.setDomainWhitelisting();
ThreadSetup.setPersistentMenu();
ThreadSetup.setGetStarted();

/* =============================================
   =                 Port Setup                =
   ============================================= */

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app; // eslint-disable-line
