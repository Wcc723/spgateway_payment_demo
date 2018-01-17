var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/checkout', function (req, res, next) {
  res.render('checkout', { title: 'Express' });
});

router.get('/success', function (req, res, next) {
  res.render('success', { title: 'Express' });
});

router.get('/fail', function (req, res, next) {
  res.render('fail', { title: 'Express' });
});

module.exports = router;
