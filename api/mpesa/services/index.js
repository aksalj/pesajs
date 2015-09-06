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
var soapHelper = require("../../../util/soapHelper");

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
    var _srv = {
        url: CHECKOUT.wsdl,
        client: null
    };

    if(!_srv) {
        throw new Error("Service unknown");
    }


    /**
     * Send soap request
     * @param name
     * @param args
     * @param callback
     * @private
     */
    var _triggerOperation = function (name, args, callback) {
        if(!_srv.client) {

            // Init Client
            var opt = {
                endpoint: CHECKOUT.endpoint
            };
            soapHelper.createSoapClient(_srv, opt, function(err, client) {
                if(!client) {
                    throw new Error("Checkout Soap client not initialized!");
                } else {
                    _srv.client = client;
                    if (Const.DEBUG) {
                        console.info(util.inspect(_srv.client.describe(), false, null));
                    }

                    CHECKOUT.trigger(name, _srv.client, args, callback);

                }
            }, Const.DEBUG);


        } else {
            CHECKOUT.trigger(name, _srv.client, args, callback);
        }
    };



    // Public API for this service

    /**
     * Initiate checkout process
     * @param cart Cart
     * @param callback
     */
    this.requestCheckout = function(cart, callback) {

        var params = {
            MERCHANT_TRANSACTION_ID: args.Transaction,
            REFERENCE_ID: args.Ref,
            AMOUNT: args.Amount,
            MSISDN: args.Account,
            ENC_PARAMS: args.Details,
            CALL_BACK_URL: args.CallbackUrl,
            CALL_BACK_METHOD: "xml", // get | post | xml; documentation not clear on how to send this param.
            TIMESTAMP: Date.now()
        };

        _triggerOperation("processCheckOut", params, callback);
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

        _triggerOperation("confirmTransaction", params, callback);
    };


    /**
     * Check transaction status
     * @param args
     * @param callback
     */
    this.getTransactionStatus = function(args, callback) {
        _triggerOperation("transactionStatusQuery", args, callback);
    };


    /**
     * Payment notification middleware
     * @param req
     * @param res
     */
    this.paymentNotification = function(req, res, next) {
        // TODO: hapi+express support

        var args = null; // GET params? Plain POST? XML POST?
        _triggerOperation("LNMOResult", args, function(err, data) {
            // TODO: Respond to SAG and make sure next middleware doesn't send anything
            console.error(err);


            req.ipn = data;
            if(next) {
                next(req, res);
            }
        });

    };

};