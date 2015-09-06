/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : consts
 *  Date : 9/5/15 7:25 PM
 *  Description : From M-PESA G2 API; DEVELOPERS GUIDE - LIPA NA M-PESA ONLINE CHECKOUT v 2.0
 *
 */
'use strict';
var request = require("request");
var packageJson = require("./../../../package.json");

var ReturnCode = function (code, description) {
    return {
        code: code,
        description: description
    }
};

exports.DEBUG = false;

exports.MERCHANT = {
    ID: null,
    PassKey: null
};

/**
 * Checkout cart
 * @param transaction
 * @param reference
 * @param account
 * @param amount
 * @param callbackUrl
 * @constructor
 */
exports.Cart = function (transaction, reference, account, amount, callbackUrl) {
    /*
     Transaction:
     Ref:
     Account:
     Amount:
     Details:
     CallbackUrl:
     */
    this.Transaction = transaction;
    this.Ref = reference;
    this.Account = account;
    this.Amount = amount;
    this.Details = null; // this is optional
    this.CallbackUrl = callbackUrl;

};

exports.RETURNCODES = {

    SUCCESS: new ReturnCode(0, "Success. The Request has been successfully received or the transaction has successfully completed."),

    NO_FUNDS: new ReturnCode(1, "Insufficient Funds on MSISDN account"),

    BAD_MIN_AMOUNT: new ReturnCode(3,"Amount less than the minimum single transfer allowed on the system."),
    BAD_MAX_AMOUNT: new ReturnCode(4,"Amount more than the maximum single transfer amount allowed."),
    BAD_AMOUNT: new ReturnCode(31,"Returned when the request amount is Invalid or blank"),

    BAD_REFERENCE: new ReturnCode(30,"Returned when the request is missing reference ID"),
    BAD_REQUEST: new ReturnCode(40,"Missing parameters"),
    BAD_MSISDN: new ReturnCode(41, "MSISDN is in incorrect format"),

    TXN_EXPIRED: new ReturnCode(5,"Transaction expired in the instance where it wasn’t picked in time for processing."),
    TXN_CONFIRM_FAILED: new ReturnCode(6,"Transaction could not be confirmed possibly due to confirm operation failure."),
    TXN_FAILED: new ReturnCode(11,"This message is returned when the system is unable to complete the transaction."),
    TXN_BAD_DATA: new ReturnCode(12,"Message returned when if the transaction details are different from original captured " +
        "request details."),

    ACCOUNT_LIMIT_REACHED: new ReturnCode(8,"Balance would rise above the allowed maximum amount. This happens if the MSISDN has " +
        "reached its maximum transaction limit for the day."),
    ACCOUNT_NOT_FOUND: new ReturnCode(10,"This occurs when the system is unable to resolve the credit account i.e the MSISDN " +
        "provided isn’t registered on M-PESA"),
    ACCOUNT_NOT_ACTIVE: new ReturnCode(32,"Returned when the account in the request hasn’t been activated."),
    ACCOUNT_NOT_AUTHORIZED: new ReturnCode(33,"Returned when the account hasn’t been approved to transact."),

    WRONG_PAYBILL: new ReturnCode(9,"The store number specified in the transaction could not be found.  This happens if the " +
        "Merchant Pay bill number was incorrectly captured during registration."),

    SYSTEM_DOWN: new ReturnCode(29,"System Downtime message when the system is inaccessible."),
    SYSTEM_DELAY: new ReturnCode(34,"Returned when there is a request processing delay."),

    DUPLICATE_REQUEST: new ReturnCode(35,"Response when a duplicate request is detected."),
    UNAUTHORIZED: new ReturnCode(36,"Response given if incorrect credentials are provided in the request")

};

exports.BaseRequest = request.defaults({
    headers: {
        "User-Agent" : packageJson.name + "/" + packageJson.version,
        'X-Powered-By': packageJson.name
    }
});