package com.ecomapi.worker;

import com.ecomapi.model.Order;
import com.ecomapi.repository.OrderRepository;
import com.ecomapi.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderSyncWorker {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SearchService searchService;

    @Scheduled(fixedDelay = 60000)
    public void syncOrdersToOpenSearch() {
        List<Order> unsyncedOrders = orderRepository.findBySyncedToSearchFalse();
        for (Order order : unsyncedOrders) {
            try {
                searchService.indexOrder(order.getId());
                order.setSyncedToSearch(true);
                orderRepository.save(order);
            } catch (Exception e) {
                // Log error and retry later
                System.err.println("Failed to sync order: " + order.getId() + " - " + e.getMessage());
            }
        }
    }
}
