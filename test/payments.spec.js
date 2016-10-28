/**
 * Created by aksalj on 6/17/16.
 */
"use strict";
let chai = require('chai');
let expect = chai.expect;


const PesaJs = require('../index');
const service = new PesaJs.LipaNaMpesa(require("../.test.local.json"));

const cart = {
    transaction: "54fgftgh",
    ref: "ytrytfytf",
    account: "254709998888",
    amount: 8765,
    callbackUrl: "http://awesome-store.co.ke/ipn",
    details: "Additional transaction details if any"
};

describe("PaymentService", function () {
    
    
    describe("request payment", function () {

        it("checks cart params", function (done) {
            service.requestPayment()
                .then((data) => {
                    data.should.not.exist();
                    done();
                })
                .catch((err) => {
                    expect(err).to.be.not.equal(null);
                    done();
                });
        });

        it("submits payment request", function (done) {
            service.requestPayment(cart)
                .then((data) => {
                    data.should.exist();
                    done();
                })
                .catch((err) => {
                    expect(err).to.be.equal(null); // grr really?
                    done();
                });
        });


    });
    
    describe("confirm payment", function () {
        it("checks params", function (done) {
            service.confirmPayment()
                .then((data) => {
                    data.should.exist();
                    done();
                })
                .catch((err) => {
                    expect(err).to.be.equal(null);
                });
        });
    });
    
    describe("check payment status", function () {
        it("checks params", function (done) {
            service.getPaymentStatus()
                .then((data) => {
                    data.should.exist();
                    done();
                })
                .catch((err) => {
                    expect(err).to.be.equal(null);
                });
        });
    });
    
});
