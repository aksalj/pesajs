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
const util = require('util');

const Const = require("../constants");

const CheckoutService = require("./checkout");
//const EXTRACTS = require("./extracts");
//const VALIDATION = require("./vc");


exports.init = function (options) {
    options = options || {};

    if (!options.id || !options.passkey) throw new Error("Need to specify both merchant ID and passkey");

    Const.DEBUG = options.debug || false;

    Const.MERCHANT.ID = options.id;
    Const.MERCHANT.PassKey = options.passkey;
};

exports.VCService = function() { };

exports.TxnExtractsService = function() { };

exports.CheckoutService = CheckoutService;