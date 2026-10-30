package com.booknest.library.exception;

/** Thrown when a request is well-formed but breaks a library rule (duplicate ISBN, no copies left, ...). */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
