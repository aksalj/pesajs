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
var soap = require('soap');
var util = require('util');

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

var _initializeSoapClientForService = function (name, options, cb) {
    var service = _getService(name);
    if(!service)
        throw new Error("Service unknown");

    options = options || {};
    soap.createClient(service.url, options, function (err, client) {
        if (err) {
            console.error(err);
        }
        service.client = client || null;
        cb(err, service.client !== null);
    });
};


exports.CheckoutService = function() {
    var that = this;
    this._service = _getService(CHECKOUT.name);

    if(!this._service) {
        throw new Error("Service unknown");
    }

    var _client = this._service.client;
    var _init = function (cb) {
        _initializeSoapClientForService(that._service.name, null, function (err, inited) {
            if(!inited) {
                throw new Error("Checkout Soap client not initialized!");
            } else {
                _client = that._service.client;
                cb(true);
            }
        });
    };

    // Checkout Operations as documented
    this.processCheckOut = function(args, callback) {

        var sendRequest = function(clientReady) {
            if(clientReady) {
                //console.error(util.inspect(_client.describe(), false, null));
                _client.processCheckOut(args, callback);
            } else {
                throw new Error("Checkout Soap client not ready!");
            }
        };

        if(!_client) {
            _init(sendRequest);
        } else {
            sendRequest(true);
        }

    };

    this.transactionStatusQuery = function(args, callback) {

        var sendRequest = function(clientReady) {
            if(clientReady) {
                _client.transactionStatusQuery(args, callback);
            } else {
                throw new Error("Checkout Soap client not ready!");
            }
        };

        if(!_client) {
            _init(sendRequest);
        } else {
            sendRequest(true);
        }

    };

    this.confirmTransaction = function(args, callback) {

        var sendRequest = function(clientReady) {
            if(clientReady) {
                _client.confirmTransaction(args, callback);
            } else {
                throw new Error("Checkout Soap client not ready!");
            }
        };

        if(!_client) {
            _init(sendRequest);
        } else {
            sendRequest(true);
        }

    };

    this.LNMOResult = function(args, callback) {

        var sendRequest = function(clientReady) {
            if(clientReady) {
                _client.LNMOResult(args, callback);
            } else {
                throw new Error("Checkout Soap client not ready!");
            }
        };

        if(!_client) {
            _init(sendRequest);
        } else {
            sendRequest(true);
        }

    };
};