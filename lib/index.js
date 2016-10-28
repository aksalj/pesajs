/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.com
 *  Website: http://www.aksalj.com
 *
 *  Project : pesajs
 *  File : index
 *  Date : 9/5/15 1:07 PM
 *  Description : MPesa Services
 *
 */
'use strict';

// Lipa Na M-Pesa Online
exports.PaymentService = require("./services/lnmo");
exports.LipaNaMpesa = exports.PaymentService;

// Paybill and Buygoods Validation & Confirmation
exports.ValidationService = require("./services/vc");

// Transaction Extracts
exports.ExtractsService = require("./services/extracts");
