package com.ecomapi.service;

import com.ecomapi.dto.CheckoutRequest;
import com.ecomapi.model.*;
import com.ecomapi.repository.OrderRepository;
import com.ecomapi.repository.ProductRepository;
import com.ecomapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // ── GET /api/orders ──────────────────────────────────────────────────────
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ── GET /api/orders/{id} ─────────────────────────────────────────────────
    public Map<String, Object> getOrderById(String id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return Map.of("success", false, "error", "Order not found", "message", "Order not found");
        }
        return Map.of("success", true, "order", order, "syncedToSearch", order.isSyncedToSearch());
    }

    // ── GET /api/orders/customer/{customerId} ────────────────────────────────
    public Map<String, Object> getOrdersByCustomer(String customerId, int page, int limit) {
        if (page  < 1)  page  = 1;
        if (limit < 1)  limit = 1;
        if (limit > 100) limit = 100;

        long total = orderRepository.countByCustomerEmail(customerId);
        int totalPages = (int) Math.ceil((double) total / limit);

        PageRequest pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Order> orders = orderRepository.findByCustomerId(customerId, pageable);

        return Map.of(
            "success", true,
            "orders", orders,
            "pagination", Map.of(
                "page", page,
                "limit", limit,
                "total", total,
                "totalPages", totalPages
            )
        );
    }

    // ── POST /api/orders (create order / checkout) ───────────────────────────
    public Map<String, Object> createOrder(CheckoutRequest request, String idempotencyKeyHeader) {
        // Resolve idempotency key
        String iKey = request.getIdempotencyKey();
        if (iKey == null || iKey.isBlank()) iKey = idempotencyKeyHeader;
        if (iKey == null || iKey.isBlank()) {
            return Map.of("success", false, "error", "Invalid request",
                    "message", "Idempotency key is required and must be a string");
        }

        // Validate items
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return Map.of("success", false, "error", "Invalid request",
                    "message", "Items array is required and must contain at least one item");
        }

        // Idempotency check via Redis (degrades gracefully if Redis is offline)
        if (redisTemplate != null) {
            try {
                String redisKey = "idemp:" + iKey;
                String existing = redisTemplate.opsForValue().get(redisKey);
                if (existing != null) {
                    // Key already processed — look up the existing order
                    Order existingOrder = orderRepository.findByIdempotencyKey(iKey);
                    if (existingOrder != null) {
                        return Map.of("success", true, "order", existingOrder,
                                "message", "Order already exists (idempotent request)");
                    }
                }
            } catch (Exception redisEx) {
                System.err.println("[WARN] Redis unavailable, skipping idempotency check: " + redisEx.getMessage());
            }
        }

        // Resolve customer (guest checkout allowed)
        User customer = null;
        if (request.getCustomerId() != null && !request.getCustomerId().isBlank()) {
            customer = userRepository.findById(request.getCustomerId()).orElse(null);
        }

        // Build order items and totals
        List<OrderItem> orderItems = new ArrayList<>();
        int subtotal = 0;

        for (int i = 0; i < request.getItems().size(); i++) {
            CheckoutRequest.CheckoutItem ci = request.getItems().get(i);
            if (ci.getProductId() == null || ci.getProductId().isBlank()) {
                return Map.of("success", false, "error", "Invalid request",
                        "message", "Item at index " + i + ": Product ID is required");
            }
            if (ci.getQuantity() <= 0) {
                return Map.of("success", false, "error", "Invalid request",
                        "message", "Item at index " + i + ": Quantity must be greater than 0");
            }

            Product product = productRepository.findById(ci.getProductId()).orElse(null);
            if (product == null || !product.isActive()) {
                return Map.of("success", false, "error", "Not found",
                        "message", "Product " + ci.getProductId() + " not found or inactive");
            }
            if (product.getStock() < ci.getQuantity()) {
                return Map.of("success", false, "error", "Conflict",
                        "message", "Insufficient stock for product: " + product.getTitle());
            }

            int lineTotal = ci.getQuantity() * product.getPriceMinor();
            subtotal += lineTotal;

            OrderItem oi = new OrderItem();
            oi.setProductId(product.getId());
            oi.setSku(product.getSku());
            oi.setTitle(product.getTitle());
            oi.setQuantity(ci.getQuantity());
            oi.setUnitPriceMinor(product.getPriceMinor());
            oi.setLineTotalMinor(lineTotal);
            orderItems.add(oi);

            // Deduct stock (best-effort, no distributed tx)
            product.setStock(product.getStock() - ci.getQuantity());
            productRepository.save(product);
        }

        int shipping = subtotal >= 5000 ? 0 : 499;
        int total    = subtotal + shipping;

        LocalDateTime now = LocalDateTime.now();
        Order order = new Order();
        order.setOrderDate(now);
        order.setUpdatedAt(now);
        order.setCreatedAt(now);
        order.setVersion(1);
        order.setStatus(OrderStatus.PENDING);
        order.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        order.setTotalMinor(total);
        order.setSubtotalMinor(subtotal);
        order.setShippingMinor(shipping);
        order.setIdempotencyKey(iKey);
        order.setItems(orderItems);

        if (customer != null) {
            CustomerSnapshot snap = new CustomerSnapshot();
            snap.setId(customer.getId());
            snap.setName(customer.getName());
            snap.setEmail(customer.getEmail());
            order.setCustomer(snap);
        }

        orderRepository.save(order);

        // Mark idempotency key as consumed in Redis (best-effort)
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set("idemp:" + iKey, order.getId(), 24, TimeUnit.HOURS);
            } catch (Exception redisEx) {
                System.err.println("[WARN] Redis unavailable, idempotency key not stored: " + redisEx.getMessage());
            }
        }

        return Map.of(
            "success", true,
            "order", order,
            "totals", Map.of(
                "subtotalMinor", subtotal,
                "shippingMinor", shipping,
                "totalMinor", total
            ),
            "message", "Order created successfully"
        );
    }

    // ── POST /api/orders/checkout (legacy idempotency-key header path) ────────
    public Map<String, Object> checkout(Map<String, Object> request, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isEmpty() && redisTemplate != null) {
            try {
                Boolean isNewKey = redisTemplate.opsForValue()
                        .setIfAbsent("idemp:" + idempotencyKey, "processed", 24, TimeUnit.HOURS);
                if (Boolean.FALSE.equals(isNewKey)) {
                    return Map.of("success", false, "message", "Duplicate request detected based on Idempotency-Key.");
                }
            } catch (Exception redisEx) {
                System.err.println("[WARN] Redis unavailable, skipping idempotency check: " + redisEx.getMessage());
            }
        }
        return Map.of("success", true, "message", "Checkout completed successfully");
    }

    // ── PATCH /api/orders/{id}/status ────────────────────────────────────────
    public Map<String, Object> updateOrderStatus(String orderId, String statusString) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return Map.of("success", false, "error", "Order not found",
                    "message", "Order not found");
        }
        Order order = orderOpt.get();
        String[] allowed = {"PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"};
        boolean valid = false;
        for (String s : allowed) { if (s.equalsIgnoreCase(statusString)) { valid = true; break; } }
        if (!valid) {
            return Map.of("success", false, "error",
                    "Invalid status. Allowed values: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED",
                    "message", "Invalid status. Allowed values: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED");
        }
        try {
            order.setStatus(OrderStatus.valueOf(statusString.toUpperCase()));
            order.setUpdatedAt(LocalDateTime.now());
            order.setVersion(order.getVersion() + 1);
            orderRepository.save(order);
            return Map.of("success", true, "order", order, "message", "Order status updated successfully");
        } catch (IllegalArgumentException e) {
            return Map.of("success", false, "error", "Invalid status value", "message", "Invalid status value");
        }
    }
}
