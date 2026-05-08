package com.app.config;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Known limitation: MDC is not propagated to @Async threads. If async methods are introduced,
 * use a custom TaskDecorator.
 */
@Configuration
@Slf4j
public class LoggingConfig {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_ID_MDC_KEY = "requestId";
    private static final int MAX_REQUEST_ID_LENGTH = 64;

    @Bean
    public OncePerRequestFilter requestIdFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(
                    HttpServletRequest request,
                    HttpServletResponse response,
                    FilterChain filterChain
            ) throws ServletException, IOException {
                HttpServletRequest httpRequest = (HttpServletRequest) request;
                HttpServletResponse httpResponse = (HttpServletResponse) response;

                String incomingRequestId = httpRequest.getHeader(REQUEST_ID_HEADER);
                String requestId = resolveRequestId(incomingRequestId);

                MDC.put(REQUEST_ID_MDC_KEY, requestId);
                httpResponse.setHeader(REQUEST_ID_HEADER, requestId);
                log.trace("Request ID set: {}", requestId);

                try {
                    filterChain.doFilter(httpRequest, httpResponse);
                } finally {
                    MDC.remove(REQUEST_ID_MDC_KEY);
                }
            }
        };
    }

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> requestIdFilterRegistration(
            OncePerRequestFilter requestIdFilter
    ) {
        FilterRegistrationBean<OncePerRequestFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(requestIdFilter);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    private String resolveRequestId(String incomingRequestId) {
        if (incomingRequestId == null || incomingRequestId.isBlank()) {
            return UUID.randomUUID().toString();
        }

        String sanitizedRequestId = sanitizeRequestId(incomingRequestId);
        if (sanitizedRequestId.isBlank()) {
            return UUID.randomUUID().toString();
        }

        return sanitizedRequestId;
    }

    private String sanitizeRequestId(String requestId) {
        String trimmed = requestId.trim();
        String limited = trimmed.length() > MAX_REQUEST_ID_LENGTH
                ? trimmed.substring(0, MAX_REQUEST_ID_LENGTH)
                : trimmed;

        return limited.replaceAll("[^A-Za-z0-9_-]", "");
    }
}
