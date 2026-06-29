package com.billjoy.exception;

public class BillNotFoundException extends RuntimeException {

    public BillNotFoundException(String billId) {
        super("Bill not found: " + billId);
    }
}
