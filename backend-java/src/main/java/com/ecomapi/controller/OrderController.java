package com.ecomapi.controller;

import com.ecomapi.dto.CheckoutRequest;
import com.ecomapi.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * POST /api/orders — Create a new order (authenticated users).
     * If no customerId is provided in the body, falls back to the token subject.
     */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKeyHeader,
            @RequestBody CheckoutRequest request,
            Authentication authentication) {

        // Fall back to the authenticated user's ID if customerId is not in the body
        if ((request.getCustomerId() == null || request.getCustomerId().isBlank())
                && authentication != null) {
            request.setCustomerId((String) authentication.getPrincipal());
        }

        Map<String, Object> result = orderService.createOrder(request, idempotencyKeyHeader);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        if (!success) {
            Object error = result.get("error");
            if (error != null) {
                String errStr = error.toString();
                if (errStr.contains("Not found"))    return ResponseEntity.status(404).body(result);
                if (errStr.contains("Conflict"))      return ResponseEntity.status(409).body(result);
                if (errStr.contains("Invalid"))       return ResponseEntity.badRequest().body(result);
                if (errStr.contains("Idempotency"))   return ResponseEntity.badRequest().body(result);
            }
        }
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/orders/customer/{customerId} — List orders for a customer (authenticated).
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getOrdersByCustomer(
            @PathVariable String customerId,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId, page, limit));
    }

    /**
     * GET /api/orders/{id} — Get a single order (authenticated).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        Map<String, Object> result = orderService.getOrderById(id);
        if (!Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.status(404).body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/orders/checkout — Legacy idempotency-key header checkout.
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(orderService.checkout(request, idempotencyKey));
    }

    /**
     * PATCH /api/orders/{id}/status — Update order status (ADMIN only).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        String status = (String) request.get("status");
        Map<String, Object> result = orderService.updateOrderStatus(id, status);
        if (!Boolean.TRUE.equals(result.get("success"))) {
            String err = String.valueOf(result.getOrDefault("error", ""));
            if (err.contains("not found")) return ResponseEntity.status(404).body(result);
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
