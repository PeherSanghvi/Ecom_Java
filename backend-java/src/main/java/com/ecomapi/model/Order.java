package com.ecomapi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    @Field("order_date")
    private LocalDateTime orderDate = LocalDateTime.now();
    @Field("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    private int version = 1;
    private OrderStatus status = OrderStatus.PENDING;
    private String currency = "USD";
    @Field("total_minor")
    private int totalMinor;
    @Field("idempotency_key")
    private String idempotencyKey;
    private CustomerSnapshot customer;
    private List<OrderItem> items = new ArrayList<>();
    @Field("subtotal_minor")
    private int subtotalMinor;
    @Field("shipping_minor")
    private int shippingMinor;
    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    @Field("synced_to_search")
    private boolean syncedToSearch = false;
}
