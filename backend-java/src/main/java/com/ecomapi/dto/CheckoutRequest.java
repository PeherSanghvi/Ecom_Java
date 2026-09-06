package com.ecomapi.dto;

import lombok.Data;
import java.util.List;

@Data
public class CheckoutRequest {
    private String customerId;
    private String idempotencyKey;
    private List<CheckoutItem> items;
    private String currency = "USD";

    @Data
    public static class CheckoutItem {
        private String productId;
        private int quantity;
    }
}
