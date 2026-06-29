package com.billjoy.exception;

public class UnauthorizedBillAccessException extends RuntimeException {

    public UnauthorizedBillAccessException() {
        super("You do not have permission to pay this bill");
    }
}
