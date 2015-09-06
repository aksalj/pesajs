/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : index
 *  Date : 9/5/15 8:02 PM
 *  Description :
 *
 */
'use strict';
var util = require('util');

var Const = require("../constants");

var CHECKOUT = require("./checkout");
var EXTRACTS = require("./extracts");
var VALIDATION = require("./vc");


exports.init = function (options) {
    options = options || {};

    if (!options.ID || !options.PassKey) throw new Error("Need to specify both merchant ID and passkey");

    Const.DEBUG = options.debug || false;

    Const.MERCHANT.ID = options.ID;
    Const.MERCHANT.PassKey = options.PassKey;
};

exports.VCService = function() { };

exports.TxnExtractsService = function() { };



exports.CheckoutService = function() {

    /**
     * Initiate checkout process
     * @param cart Cart
     * @param callback
     */
    this.requestCheckout = function(cart, callback) {

        var params = {
            MERCHANT_TRANSACTION_ID: cart.Transaction,
            REFERENCE_ID: cart.Ref,
            AMOUNT: cart.Amount,
            MSISDN: cart.Account,
            ENC_PARAMS: cart.Details,
            CALL_BACK_URL: cart.CallbackUrl,
            CALL_BACK_METHOD: "xml", // get | post | xml; documentation not clear on how to send this param.
            TIMESTAMP: Date.now()
        };

        CHECKOUT.trigger("processCheckOut", params, callback);
    };

    /**
     * Confirm checkout transaction
     * @param args
     * @param callback
     */
    this.confirmCheckout = function(args, callback) {

        /*
        Transaction
        TXN_MPESA
         */

        var params = {
            MERCHANT_TRANSACTION_ID: args.Transaction,
            TRX_ID: args.TXN_MPESA,
            TIMESTAMP: Date.now()
        };

        CHECKOUT.trigger("confirmTransaction", params, callback);
    };


    /**
     * Check transaction status
     * @param args
     * @param callback
     */
    this.getTransactionStatus = function(args, callback) {

        /*
         Transaction
         TXN_MPESA
         */

        var params = {
            MERCHANT_TRANSACTION_ID: args.Transaction,
            TRX_ID: args.TXN_MPESA
        };

        CHECKOUT.trigger("transactionStatusQuery", params, callback);
    };


    /**
     * Payment notification middleware
     * @param req
     * @param res
     */
    this.paymentNotification = function(req, res, next) {
        // TODO: hapi+express support

        var args = req.body; // GET params? Plain POST? XML POST?
        CHECKOUT.trigger("LNMOResult", args, function(err, data) {
            // TODO: Respond to SAG and make sure next middleware doesn't send anything
            console.error(err);


            req.payment = data;
            if(next) {
                next(req, res);
            }
        });

    };

};