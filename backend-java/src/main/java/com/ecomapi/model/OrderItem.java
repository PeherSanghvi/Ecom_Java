package com.ecomapi.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
public class OrderItem {
    @Field("product_id")
    private String productId;
    private String sku;
    private String title;
    private int quantity;
    @Field("unit_price_minor")
    private int unitPriceMinor;
    @Field("line_total_minor")
    private int lineTotalMinor;
}
