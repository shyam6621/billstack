package com.billjoy.exception;

public class BillAlreadyPaidException extends RuntimeException {

    public BillAlreadyPaidException(String billId) {
        super("Bill is already paid: " + billId);
    }
}
