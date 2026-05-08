package com.app.controller;

import com.app.dto.ApiResponse;
import com.app.dto.CreateUserRequest;
import com.app.dto.ToggleStatusRequest;
import com.app.dto.UpdateUserRequest;
import com.app.dto.UserResponse;
import com.app.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("Admin request to create user with username='{}'", request.getUsername());
        UserResponse createdUser = userAdminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(createdUser));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.debug("Admin request to list all users page={} size={}", page, size);
        Page<UserResponse> users = userAdminService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        log.debug("Admin request to get user by id='{}'", id);
        UserResponse user = userAdminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {
        log.info("Admin request to update user id='{}'", id);
        UserResponse updatedUser = userAdminService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedUser));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable String id,
            @Valid @RequestBody ToggleStatusRequest request) {
        log.info("Admin request to set active={} for user id='{}'", request.getActive(), id);
        UserResponse user = userAdminService.setActive(id, request.getActive());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
