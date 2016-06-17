## PesaJs

#### Goal

Simplify interactions with the official (`horribly documented`) [M-PESA API](http://www.safaricom.co.ke/business/m-pesa/api).

> `Important`: :construction: `Work in progress, NOT ready for use in production` 

#### Usage


```shell
$ npm install pesajs

```


- **Online checkout (`Lipa Na M-Pesa`)**: According to Safaricom, this is a "*Web service for integrating the M-Pesa 
Checkout API to a merchant site. The overall scope of this Web service is to provide primitives for application developers 
to handle checkout process in a simple way*."

**Initiate Lipa Na M-Pesa online payment**

```javascript
const PesaJs = require("pesajs");

let options = {
    merchant: "YOUR_MERCHANT_ID",
    passkey: "YOUR_PASSKEY",
    //debug: false || true
};
let paymentService = new PesaJs.LipaNaMpesa(options);


let cart = {
    transaction: MY_TRANSACTION_ID,
    ref: MY_REFERENCE,
    account: USER_MPESA_NUMBER,
    amount: AMOUNT,
    callbackUrl: MY_CALLBACK_URL,
    details: "Additional transaction details if any"
};
paymentService.requestPayment(cart).then(function(data) {

    // Now display M-Pesa message to user
    let msg = data.message;
    
    // Keep mpesa transaction id so you can use it to confirm transaction.
    let mpesa_txn = data.mpesa_txn
});

```

**Confirm payment request**
```javascript
let params = {
    transaction: MY_TRANSACTION, 
    mpesa_txn: mpesa_txn
};
paymentService.confirmPayment(params).then(function(data) {
    
    // User should see a USSD menu on their phone at this point.
    // Now relax and wait for M-Pesa to notify you of the payment

});
```

**Receive payment notification**
```javascript
// Wait for payment notification (example using express)
app.post("/ipn", paymentService.paymentNotification, function(req, res) {
    
    // Do whatever with payment info like confirm purchase, init shipping, send download link, etc.
    let paymentData = req.payment;
   
});

```

See the [example](example/app.js) app for a working demo.

- **Paybill and Buygoods validation &amp; confirmation**: `TODO`

- **Transaction Extracts**: `TODO`


#### Contributing

1. Fork this repo and make changes in your own fork.
2. Commit your changes and push to your fork `git push origin master`
3. Create a new pull request and submit it back to the project.


#### Bugs & Issues

To report bugs (or any other issues), use the [issues page](https://github.com/aksalj/pesajs/issues).
