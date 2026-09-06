package com.ecomapi.dto;

import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String _id;
    private String name;
    private String email;
    private String phone;
    private String role;
}
