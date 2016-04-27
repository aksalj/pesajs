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
var packageJson = require("../package.json");

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


exports.Error = ReturnCode;

exports.RETURNCODES = {

    // Succesful transaction, all went well
    SUCCESS: new ReturnCode(0, "Success. The Request has been successfully received or the transaction has successfully completed."),

    // Unsuccesful due to insufficient funds on the MSISDN account
    NO_FUNDS: new ReturnCode(1, "Insufficient Funds on MSISDN account"),

    // Unsuccesful due to less than allowed minimum amount per transaction
    BAD_MIN_AMOUNT: new ReturnCode(3,"Amount less than the minimum single transfer allowed on the system."),

    // Unsuccesful due to more than allowed maximum amount per transaction
    BAD_MAX_AMOUNT: new ReturnCode(4,"Amount more than the maximum single transfer amount allowed."),

    // Unsuccesful because the transaction got expired, because it wasnt picked in time for processing
    TXN_EXPIRED: new ReturnCode(5,"Transaction expired in the instance where it wasn’t picked in time for processing."),

    // Unsuccesful due to failure in confimation operation
    TXN_CONFIRM_FAILED: new ReturnCode(6,"Transaction could not be confirmed possibly due to confirm operation failure."),

    // Unsuccesful due to reached maximum account limit for the day
    ACCOUNT_LIMIT_REACHED: new ReturnCode(8,"Balance would rise above the allowed maximum amount. This happens if the MSISDN has reached its maximum transaction limit for the day."),

    // Unsuccesful because of wrong paybill number
    WRONG_PAYBILL: new ReturnCode(9,"The store number specified in the transaction could not be found.  This happens if the Merchant Pay bill number was incorrectly captured during registration."),

    // Unsuccesful because the account could not be found in the system
    ACCOUNT_NOT_FOUND: new ReturnCode(10,"This occurs when the system is unable to resolve the credit account i.e the MSISDN provided isn’t registered on M-PESA"),

    // Unsuccesful transaction because the system could not complete the transaction
    TXN_FAILED: new ReturnCode(11,"This message is returned when the system is unable to complete the transaction."),

    // Unsuccesful because somehow the details are different from when they got captured
    TXN_BAD_DATA: new ReturnCode(12,"Message returned when if the transaction details are different from original captured request details."),

    // Unsuccesful because the system is down.
    SYSTEM_DOWN: new ReturnCode(29,"System Downtime message when the system is inaccessible."),

    // Unsuccesful transaction due to inavailability of reference ID
    BAD_REFERENCE: new ReturnCode(30,"Returned when the request is missing reference ID"),

    // Unsuccesful due to invalid request amount supplied
    BAD_AMOUNT: new ReturnCode(31,"Returned when the request amount is Invalid or blank"),

    // Unsuccesful beacuse the account is not activated
    ACCOUNT_NOT_ACTIVE: new ReturnCode(32,"Returned when the account in the request hasn’t been activated."),

    // Unsuccesful beacuse the account is not authorised to make transactions
    ACCOUNT_NOT_AUTHORIZED: new ReturnCode(33,"Returned when the account hasn’t been approved to transact."),


    // Unsuccesul beacuse there is delays in transaction processing.
    SYSTEM_DELAY: new ReturnCode(34,"Returned when there is a request processing delay."),

    // Unsuccesful because the request has been processed before.
    DUPLICATE_REQUEST: new ReturnCode(35,"Response when a duplicate request is detected."),

    // Unsuccesful because the request credintial supplied are wrong.
    BAD_CREDENTIALS: new ReturnCode(36,"Response given if incorrect credentials are provided in the request"),

    // Unsuccesful due to missing parameters in the request
    BAD_REQUEST: new ReturnCode(40,"Missing parameters"),

    // Unsuccesful due to bad format for the MSISDN
    BAD_MSISDN: new ReturnCode(41, "MSISDN is in incorrect format"),

    // Unsuccesful because the authentication failed.
    UNAUTHORIZED: new ReturnCode(42, "Authentication Failed")
};

exports.BaseRequest = request.defaults({
    headers: {
        "User-Agent" : packageJson.name + "/" + packageJson.version,
        'X-Powered-By': packageJson.name
    }
});
