package com.ecomapi.model;

import lombok.Data;

@Data
public class Address {
    private String street;
    private String city;
    private String state;
    private String pincode;
    private String country = "India";
}
