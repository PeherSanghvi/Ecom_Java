package com.ecomapi.repository;

import com.ecomapi.model.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findBySyncedToSearchFalse();

    Order findByIdempotencyKey(String idempotencyKey);

    @Query("{ 'customer.id': ?0 }")
    List<Order> findByCustomerId(String customerId, Pageable pageable);

    @Query(value = "{ 'customer.id': ?0 }", count = true)
    long countByCustomerEmail(String customerId);
}
