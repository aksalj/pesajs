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

var services = require("./services");

exports.ValidationService = services.VCService;
exports.ExtractsService = services.TxnExtractsService;
exports.CheckoutService = services.CheckoutService;