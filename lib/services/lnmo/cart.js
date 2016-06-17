"use strict";

/**
 * Checkout cart
 * @param transaction
 * @param reference
 * @param account
 * @param amount
 * @param callbackUrl
 * @constructor
 */
exports = function (transaction, reference, account, amount, callbackUrl) {
    this.transaction = transaction;
    this.ref = reference;
    this.account = account;
    this.amount = amount;
    this.details = null; // this is optional
    this.callbackUrl = callbackUrl;
    this.timestamp = Date.now();
};