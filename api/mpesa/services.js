/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : services
 *  Date : 9/5/15 1:24 PM
 *  Description :
 *
 */
'use strict';
var util = require('util');
var soapHelper = require("../../util/soapHelper");

var CHECKOUT = require("./checkout");

var Services = [
    {
        name: CHECKOUT.name,
        url: CHECKOUT.wsdl,
        client: null // SOAP client
    }
];


var _getService = function (name) {
    if(name) {
        for (var i = 0; i < Services.length; i++) {
            if (Services[i].name === name) {
                return Services[i];
            }
        }
    }
    return null;
};




exports.CheckoutService = function() {
    var that = this;
    var _srv = _getService(CHECKOUT.name);

    if(!_srv) {
        throw new Error("Service unknown");
    }


    /**
     * Create the SOAP client
     * @param cb
     * @private
     */
    var _initClient = function (cb) {
        var opt = {
            endpoint: CHECKOUT.endpoint
        };
        soapHelper.createSoapClient(_srv, opt, function(err, client) {
            if(!client) {
                throw new Error("Checkout Soap client not initialized!");
            } else {
                _srv.client = client;
                //console.info(util.inspect(_client.describe(), false, null));
                cb(true);
            }
        });

    };

    /**
     * Send soap request
     * @param name
     * @param args
     * @param callback
     * @private
     */
    var _triggerOperation = function (name, args, callback) {
        if(!_srv.client) {
            _initClient(function(clientReady) {
                if(clientReady) {
                    CHECKOUT.trigger(name, _srv.client, args, callback);
                } else {
                    throw new Error("Checkout Soap client not ready!");
                }
            });
        } else {
            CHECKOUT.trigger(name, _srv.client, args, callback);
        }
    };






    // Public API for this service

    /**
     * Initiate checkout process
     * @param args
     * @param callback
     */
    this.processCheckOut = function(args, callback) {
        _triggerOperation("processCheckOut", args, callback);
    };

    /**
     * Confirm checkout transaction
     * @param args
     * @param callback
     */
    this.confirmTransaction = function(args, callback) {
        _triggerOperation("confirmTransaction", args, callback);
    };


    /**
     * Check transaction status
     * @param args
     * @param callback
     */
    this.transactionStatusQuery = function(args, callback) {
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
                next();
            }
        });

    };

};