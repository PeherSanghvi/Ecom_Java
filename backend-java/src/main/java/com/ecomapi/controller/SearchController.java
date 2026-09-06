package com.ecomapi.controller;

import com.ecomapi.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    /**
     * GET /api/search — Basic product/order keyword search.
     */
    @GetMapping
    public ResponseEntity<?> search(@RequestParam(required = false) String q) {
        Object result = searchService.searchOrders(q, null);
        return ResponseEntity.ok(Map.of("success", true, "data", result != null ? result : java.util.List.of()));
    }

    /**
     * POST /api/search/orders — Admin-only order search with full-text and filters.
     * Matches dotnet POST /api/search/orders.
     */
    @PostMapping("/orders")
    public ResponseEntity<?> searchOrders(@RequestBody(required = false) Map<String, Object> body) {
        String keyword  = body != null ? (String) body.get("keyword")  : null;
        String status   = body != null ? (String) body.get("status")   : null;
        try {
            Object result = searchService.searchOrders(keyword, status);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", "Search failed", "message", e.getMessage()));
        }
    }
}
