'use strict';

/**
 * Module dependencies.
 */

const home = require('../app/controllers/home');
const jadetokentest = require('../app/controllers/jadetoken-test');
const jadetokenlive = require('../app/controllers/jadetoken-live');
/**
 * Expose
 */



module.exports = function(app, passport) {
  app.get('/', home.index);

  // Jade Token 
  // Test Routes
  app.get('/test/connect',jadetokentest.connect);
  app.get('/test/createAccount',jadetokentest.createAccount);
  app.get('/test/getEthBalanceOf/:accountAddr',jadetokentest.getEthBalanceOf);
  app.get('/test/getJadeBalanceOf/:accountAddr',jadetokentest.getJadeBalanceOf);

  // Live Routes
  app.get('/live/connect',jadetokenlive.connect);
  app.get('/live/createAccount',jadetokenlive.createAccount);
  app.get('/live/getEthBalanceOf/:accountAddr',jadetokenlive.getEthBalanceOf);
  app.get('/live/getJadeBalanceOf/:accountAddr',jadetokenlive.getJadeBalanceOf);

  
  

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
}
