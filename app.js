const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/phonepe-payment', (req, res) => {
  const merchantId = 'MERCHANTUAT'; // Replace with your merchant ID
  const merchantTransactionId = (Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111).toString();
  const merchantUserId = `MUID${Date.now()}`;
  const amount = 1 * 100; // Amount in cents
  const redirectUrl = 'https://kumudu.in';
  const redirectMode = 'POST'; // or 'GET'
  const mobileNumber = '9999999999';
  const paymentInstrumentType = 'PAY_PAGE';

  const requestData = {
    merchantId,
    merchantTransactionId,
    merchantUserId,
    amount,
    redirectUrl,
    redirectMode,
    mobileNumber,
    paymentInstrument: {
      type: paymentInstrumentType,
    },
  };

  const apiKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'; // Replace with your API key
  const keyIndex = 1; // Replace with your key index

  const encodedData = Buffer.from(JSON.stringify(requestData)).toString('base64');
  const stringToHash = `${encodedData}/pg/v1/pay${apiKey}`;
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const finalXHeader = `${sha256}###${keyIndex}`;

  const apiUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'; // Testing URL

  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
    'X-VERIFY': finalXHeader,
  };

  axios
    .post(apiUrl, { request: encodedData }, { headers })
    .then((response) => {
      const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
      console.log('Redirect URL:', redirectUrl);
      res.redirect(redirectUrl);
    })
    .catch((error) => {
      if (error.response) {
        // The server responded with a non-2xx status code
        console.error('Error Status:', error.response.status);
        console.error('Error Data:', error.response.data);
        res.status(error.response.status).json({ error: error.response.data });
      } else {
        // Something happened in setting up the request that triggered an error
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
