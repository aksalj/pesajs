## PesaJs

#### Goal

Simplify interactions with the official [M-PESA API](http://www.safaricom.co.ke/business/m-pesa/api).


#### Usage
:construction: `Work in progress...`

##### Initialize

```javascript

var pesajs = require("pesajs");

var MPesa = pesajs.MPESA({
    ID: MERCHANT_ID,
    PassKey: MERCHANT_PASSKEY,
    debug: true // false in production!
});

```



#### Features

- **Online checkout (`Lipa Na M-Pesa`)**: According to Safaricom, this is a "*Web service for integrating the M-Pesa 
Checkout API to a merchant site. The overall scope of this Web service is to provide primitives for application developers 
to handle checkout process in a simple way*."

```javascript
var checkoutService = new MPesa.CheckoutService();

// Initiate Lipa Na M-Pesa online checkout

var cart = new MPesa.Cart(MY_TRANSACTION_ID, MY_REFERENCE, USER_MPESA_NUMBER, AMOUNT, MY_CALLBACK_URL);
checkoutService.requestCheckout(cart, function(err, data) {

    // Now display M-Pesa message to user
    var msg = data.Message;
    
    // Keep mpesa transaction id so you can use it to confirm transaction.
    var transaction = data.TXN_MPESA
});

// Confirm transaction

var params = {
    Transaction: MY_TRANSACTION, 
    TXN_MPESA: transaction
};
checkoutService.confirmCheckout(params, function(err, data) {
    
    // User should see a USSD menu on their phone at this point.
    // Now relax and wait for M-Pesa to notify you of the payment

});

// Wait for payment notification (example using express)

app.post("/ipn", checkoutService.paymentNotification, function(req, res) {
    
    // Do whatever with payment info like confirm purchase, init shipping, send download link, etc.
    var ipn = req.payment;
   
});


```


- **Paybill and Buygoods validation &amp; confirmation**: `TODO`

- **Transaction Extracts**: `TODO`


#### Contributing

1. Fork this repo and make changes in your own fork.
2. Commit your changes and push to your fork `git push origin master`
3. Create a new pull request and submit it back to the project.


#### Bugs & Issues

To report bugs (or any other issues), use the [issues page](https://github.com/aksalj/pesajs/issues).
