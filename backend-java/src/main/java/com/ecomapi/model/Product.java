package com.ecomapi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String sku;
    private String title;
    private String description;
    private String category;
    private String primaryCategory;
    private String subCategory;
    private String department;
    private String subcategory;
    private String color;
    private String brand;
    @Field("price_minor")
    @com.fasterxml.jackson.annotation.JsonProperty("price_minor")
    private int priceMinor;
    private String currency = "INR";
    private int stock;
    private boolean active = true;
    private List<String> images;
    private Double rating;
    private Integer reviewsCount;
    @Field("created_at")
    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    private LocalDateTime createdAt;
    @Field("updated_at")
    @com.fasterxml.jackson.annotation.JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
