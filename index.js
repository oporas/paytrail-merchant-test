//Notice: auth not working yet
const express = require('express');
const rp = require('request-promise');
const moment = require('moment');
const crypto = require('crypto');
const app = express();

const config = {
  merchantId: '13466', //test merchant's id
  merchantSecret: '6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ' //test merchant's secret
}

app.get('/', (req, res) => res.send('Add id to url'))

app.get('/:id', function (req, res, next) {
  const timestamp = moment().format('YYYY-MM-DDTHH:mm:ssZZ')
  const requestMethod = 'GET'
  const url = '/merchant/v1/payments/'+req.params.id
  const base64ContentMd5 = crypto.createHash('md5').update("").digest('base64');

  //Create signature
  const signatureContent = requestMethod + "\n" +
  url + "\n" +
  "PaytrailMerchantAPI " + config.merchantId + "\n" +
  timestamp + "\n" +
  base64ContentMd5
  const hmac = crypto.createHmac('sha256', config.merchantSecret);
  hmac.write(signatureContent);
  const signature = hmac.digest('base64')

  //options for request
  var options = {
      method: requestMethod,
      uri: 'https://api.paytrail.com/merchant/v1/payments/' + req.params.id,
      headers: {
        'Timestamp': timestamp,
        'Content-MD5': base64ContentMd5,
        'Authorization': 'PaytrailMerchantAPI '+config.merchantId+':'+signature
      },
      json: true
  };

  console.log('options', options)

  rp(options)
      .then(function (data) {
          console.log('SUCCESS!!!');
          console.log(data);
          res.setHeader('Content-Type', 'application/json');
          res.send(data)
      })
      .catch(function (err) {
          console.log('ERROR!!!')
          console.log(err)
          res.setHeader('Content-Type', 'application/json');
          res.send(err)
      });
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

module.exports = app;
