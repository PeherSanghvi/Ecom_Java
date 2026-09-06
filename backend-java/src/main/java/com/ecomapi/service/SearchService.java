package com.ecomapi.service;

import com.ecomapi.model.Order;
import com.ecomapi.repository.OrderRepository;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.core.IndexRequest;
import org.opensearch.client.opensearch.core.IndexResponse;
import org.opensearch.client.opensearch.core.SearchRequest;
import org.opensearch.client.opensearch.core.SearchResponse;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch._types.query_dsl.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired(required = false)
    private OpenSearchClient openSearchClient;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    private static final String ORDER_INDEX = "orders";

    public void indexOrder(String orderId) {
        if (openSearchClient == null) {
            System.err.println("OpenSearch client is not configured");
            return;
        }
        try {
            IndexRequest<Map<String, String>> request = new IndexRequest.Builder<Map<String, String>>()
                .index(ORDER_INDEX)
                .id(orderId)
                .document(Map.of("id", orderId, "status", "syncing"))
                .build();
            IndexResponse response = openSearchClient.index(request);
            System.out.println("Indexed order: " + response.id());
        } catch (Exception e) {
            // Log but do not propagate — indexing failure must not break order creation
            System.err.println("Warning: failed to index order " + orderId + ": " + e.getMessage());
        }
    }

    /**
     * Search orders via OpenSearch when available.
     * Falls back to MongoDB when OpenSearch is unavailable or its index is empty,
     * so the admin dashboard always loads successfully.
     */
    public Object searchOrders(String keyword, String status) {
        // Try OpenSearch first
        if (openSearchClient != null) {
            try {
                Object result = searchOrdersInOpenSearch(keyword, status);
                if (result != null) return result;
            } catch (Exception e) {
                System.err.println("OpenSearch searchOrders failed, falling back to MongoDB: " + e.getMessage());
            }
        }
        // Fallback: query MongoDB directly
        return searchOrdersInMongo(keyword, status);
    }

    private Object searchOrdersInOpenSearch(String keyword, String status) throws Exception {
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        if (status != null && !status.isEmpty()) {
            boolQueryBuilder.filter(f -> f.term(t -> t.field("status").value(v -> v.stringValue(status))));
        }
        if (keyword != null && !keyword.isEmpty()) {
            boolQueryBuilder.must(m -> m.match(ma -> ma.field("customer.name").query(v -> v.stringValue(keyword))));
        }

        SearchRequest searchRequest = new SearchRequest.Builder()
            .index(ORDER_INDEX)
            .query(new Query.Builder().bool(boolQueryBuilder.build()).build())
            .aggregations("total_revenue", a -> a.sum(s -> s.field("total_minor")))
            .size(50)
            .build();

        SearchResponse<Map> response = openSearchClient.search(searchRequest, Map.class);

        long totalHits = response.hits().total() != null ? response.hits().total().value() : 0;

        // If OpenSearch has no data at all, fall through to MongoDB
        if (totalHits == 0 && (keyword == null || keyword.isEmpty()) && (status == null || status.isEmpty())) {
            long mongoCount = mongoTemplate.count(new org.springframework.data.mongodb.core.query.Query(), Order.class);
            if (mongoCount > 0) {
                return null; // Signal to caller to use MongoDB
            }
        }

        double totalRevenue = 0;
        if (response.aggregations().containsKey("total_revenue")) {
            totalRevenue = response.aggregations().get("total_revenue").sum().value();
        }

        List<Map> orders = response.hits().hits().stream()
            .map(hit -> hit.source())
            .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalHits", totalHits);
        result.put("totalRevenue", totalRevenue);
        result.put("orders", orders);
        result.put("success", true);
        return result;
    }

    private Object searchOrdersInMongo(String keyword, String status) {
        try {
            org.springframework.data.mongodb.core.query.Query mongoQuery =
                new org.springframework.data.mongodb.core.query.Query();

            if (status != null && !status.isEmpty()) {
                mongoQuery.addCriteria(Criteria.where("status").is(status));
            }
            if (keyword != null && !keyword.isEmpty()) {
                mongoQuery.addCriteria(Criteria.where("customer.name").regex(keyword, "i"));
            }

            long totalHits = mongoTemplate.count(mongoQuery, Order.class);

            // Compute total revenue from all orders (no keyword/status filter) for KPI
            long totalRevenueCents = 0;
            if (keyword == null && status == null) {
                List<Order> allOrders = mongoTemplate.findAll(Order.class);
                totalRevenueCents = allOrders.stream()
                    .mapToLong(Order::getTotalMinor)
                    .sum();
            }

            // Fetch up to 50 matching orders sorted by date desc
            mongoQuery.with(Sort.by(Sort.Direction.DESC, "createdAt")).limit(50);
            List<Order> orders = mongoTemplate.find(mongoQuery, Order.class);

            // Serialize orders to Map for a uniform response shape
            List<Map<String, Object>> orderMaps = orders.stream().map(o -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", o.getId());
                m.put("orderId", o.getId());
                m.put("status", o.getStatus() != null ? o.getStatus().name() : "PENDING");
                m.put("totalMinor", o.getTotalMinor());
                m.put("totalCents", o.getTotalMinor());
                m.put("orderDate", o.getOrderDate() != null ? o.getOrderDate().toString() : null);
                m.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
                if (o.getCustomer() != null) {
                    Map<String, Object> cust = new HashMap<>();
                    cust.put("id", o.getCustomer().getId());
                    cust.put("name", o.getCustomer().getName());
                    cust.put("email", o.getCustomer().getEmail());
                    m.put("customer", cust);
                }
                return m;
            }).collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("totalHits", totalHits);
            result.put("totalRevenue", totalRevenueCents);
            result.put("totalRevenueCents", totalRevenueCents);
            result.put("orders", orderMaps);
            result.put("success", true);
            return result;
        } catch (Exception e) {
            System.err.println("MongoDB searchOrders fallback failed: " + e.getMessage());
            Map<String, Object> empty = new HashMap<>();
            empty.put("totalHits", 0);
            empty.put("totalRevenue", 0);
            empty.put("totalRevenueCents", 0);
            empty.put("orders", List.of());
            empty.put("success", true);
            return empty;
        }
    }
}
