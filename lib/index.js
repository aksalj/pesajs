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

// FIXME: Safaricom did not properly bundle their certificates (Thu Jun 16 13:12:15 EAT 2016), so we need this **unsafe** workaround, for now...
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


// Lipa Na M-Pesa Online
exports.PaymentService = require("./services/lnmo");
exports.LipaNaMpesa = exports.PaymentService;

// Paybill and Buygoods Validation & Confirmation
exports.ValidationService = require("./services/vc");

// Transaction Extracts
exports.ExtractsService = require("./services/extracts");
