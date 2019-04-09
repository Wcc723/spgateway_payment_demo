const express = require('express');
const sha256 = require('sha256');
require('dotenv').config();

const router = express.Router();

const orders = {};
const spgateway = {
  HashKey: process.env.HASHKEY,
  HashIV: process.env.HASHIV,
  MerchantID: process.env.MERCHANTID,
};

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

router.get('/checkout/:id', (req, res) => {
  const id = req.param('id');
  const data = orders[id];
  let parameter = `Amt=${data.Amt}&MerchantID=${spgateway.MerchantID}&MerchantOrderNo=${
    data.timestamp
  }&TimeStamp=${data.timestamp}&Version=1.2`;
  console.log(parameter);
  parameter = `HashKey=${spgateway.HashKey}&${parameter}&HashIV=${spgateway.HashIV}`;
  const sha = sha256(parameter).toUpperCase();
  console.log();
  res.render('checkout', {
    title: 'Express',
    data,
    parameter,
    sha,
  });
});

router.get('/success/:id', (req, res) => {
  const id = req.param('id');
  const data = orders[id];
  res.render('success', { title: 'Express', data });
});

router.get('/fail', (req, res) => {
  res.render('fail', { title: 'Express' });
});

router.post('/order_create', (req, res) => {
  const data = req.body;
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  data.timestamp = timestamp;
  orders[timestamp] = data;
  console.log('訂單資訊', orders[timestamp]);
  res.redirect(`/checkout/${timestamp}`);
});

router.post('/spgateway_notify', (req, res) => {
  const JSONData = JSON.parse(req.body.JSONData);
  const Result = JSON.parse(JSONData.Result);
  const data = orders[Result.MerchantOrderNo];
  console.log('藍新 notify', JSONData, 'data', data);

  // 如果傳入交易成功
  if (JSONData.Status === 'SUCCESS') {
    // 解密驗證，注意 Result.TradeNo
    let parameter = `Amt=${data.Amt}&MerchantID=${spgateway.MerchantID}&MerchantOrderNo=${
      data.timestamp
    }&TradeNo=${Result.TradeNo}`;
    parameter = `HashIV=${spgateway.HashIV}&${parameter}&HashKey=${spgateway.HashKey}`;
    const sha = sha256(parameter).toUpperCase();
    console.log('parameter', parameter, 'sha', sha, 'CheckCode', Result.CheckCode);
    if (sha === Result.CheckCode) {
      // 另外可自訂其他驗證項目
      data.payment = Result;
      console.log('交易成功', data.payment);
      res.end();
    } else {
      console.log('交易失敗 交易碼不符合');
      res.end();
    }
  }
});

router.post('/spgateway_return', (req, res) => {
  const JSONData = JSON.parse(req.body.JSONData);
  const Result = JSON.parse(JSONData.Result);
  console.log('藍新 return', JSONData);
  if (JSONData.Status === 'SUCCESS') {
    res.redirect(`/success/${Result.MerchantOrderNo}`);
  } else {
    res.redirect(`/fail/${Result.MerchantOrderNo}`);
  }
});

module.exports = router;
