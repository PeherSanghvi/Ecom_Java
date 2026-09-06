package com.ecomapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthController {

    /** GET /health — used by docker-compose healthcheck */
    @GetMapping("/health")
    public Map<String, String> healthRoot() {
        return Map.of("status", "ok", "message", "Java backend is healthy");
    }

    /** GET /api/health — used by frontend/tests */
    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "message", "Java backend is healthy");
    }
}
