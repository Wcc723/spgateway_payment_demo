var express = require('express');
var sha256 = require('sha256');
var router = express.Router();

const orders = {};
const spgateway = {
  HashKey: process.env.HASHKEY,
  HashIV: process.env.HASHIV,
  MerchantID: process.env.MERCHANTID,
}

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/checkout/:id', (req, res, next) => {
  const id = req.param('id');
  const data = orders[id];
  let parameter = `Amt=${data.Amt}&MerchantID=${spgateway.MerchantID}&MerchantOrderNo=${data.timestamp}&TimeStamp=${data.timestamp}&Version=1.2`;
  parameter = `HashKey=${spgateway.HashKey}&${parameter}&HashIV=${spgateway.HashIV}`;
  const sha = sha256(parameter).toUpperCase();
  console.log(sha);
  res.render('checkout', { title: 'Express', data, parameter, sha });
});

router.get('/success', (req, res, next) => {
  res.render('success', { title: 'Express' });
});

router.get('/fail', (req, res, next) => {
  res.render('fail', { title: 'Express' });
});

router.post('/order_create', (req, res, next) => {
  const data = req.body;
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  data.timestamp = timestamp;
  orders[timestamp] = data;
  res.redirect(`/checkout/${timestamp}`);
});

router.post('/spgateway', (req, res, next) => {
  res.render('fail', { title: 'Express' });
});

module.exports = router;
