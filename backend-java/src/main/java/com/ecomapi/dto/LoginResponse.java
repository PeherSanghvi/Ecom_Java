package com.ecomapi.dto;

import com.ecomapi.model.UserRole;
import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private String userId;
    private String email;
    private String name;
    private UserRole role;
}
