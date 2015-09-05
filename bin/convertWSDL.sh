#!/usr/bin/env sh
#mkdir -p api/mpesa
cd api/mpesa
rm -rf checkout/
wsdl2.js checkout checkout.wsdl --keep-empty-tags
