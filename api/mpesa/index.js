/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : index
 *  Date : 9/5/15 1:07 PM
 *  Description : MPesa Services
 *
 */
'use strict';

var Const = require("./constants");
var services = require("./services");

exports = module.exports = function (opt) {
    services.init(opt);

    return { // Exposed interfaces


        // Data
        Cart: Const.Cart,

        // Services

            // Lipa Na M-Pesa Online
        CheckoutService: services.CheckoutService,

            // Paybill and Buygoods Validation & Confirmation
        ValidationService: services.VCService,

            // Transaction Extracts
        ExtractsService: services.TxnExtractsService
    };
};