/**
 * Created by aksalj on 6/17/16.
 */
"use strict";
let chai = require('chai');
let expect = chai.expect;


const PesaJs = require('../index');
const service = new PesaJs.LipaNaMpesa(require("../.test.local.json"));

describe("PaymentService", function () {
    
    
    describe("request payment", function () {

        it("checks cart params", function (done) {
            service.requestPayment()
                .then((data) => {
                    data.should.exist();
                    done();
                })
                .catch((err) => {
                    expect(err).to.be.equal(null);
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
