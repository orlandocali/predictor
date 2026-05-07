package com.app.exception;

public class PredictionLockedException extends RuntimeException {

    public PredictionLockedException(String message) {
        super(message);
    }
}
