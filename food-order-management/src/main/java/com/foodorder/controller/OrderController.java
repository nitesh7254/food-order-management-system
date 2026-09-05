package com.foodorder.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodorder.entity.Order;
import com.foodorder.service.OrderService;
import com.foodorder.service.OrderService.OrderItemRequest;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {

        this.orderService = orderService;
    }

    // ==========================================
    // GET ALL ORDERS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    // ==========================================
    // GET ORDER BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.getOrderById(id)
        );
    }

    // ==========================================
    // GET ORDERS BY CUSTOMER ID
    // ==========================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderService.getOrdersByCustomer(customerId)
        );
    }

    // ==========================================
    // CREATE ORDER
    // ==========================================

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody CreateOrderRequest request) {

        Order order = orderService.createOrder(
                request.getCustomerId(),
                request.getItems()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(order);
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {

        Order order = orderService.updateOrderStatus(
                id,
                request.getStatus()
        );

        return ResponseEntity.ok(order);
    }

    // ==========================================
    // DELETE ORDER
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id) {

        orderService.deleteOrder(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    // ==========================================
    // CREATE ORDER REQUEST
    // ==========================================

    public static class CreateOrderRequest {

        private Long customerId;

        private List<OrderItemRequest> items;

        public CreateOrderRequest() {
        }

        public Long getCustomerId() {

            return customerId;
        }

        public void setCustomerId(Long customerId) {

            this.customerId = customerId;
        }

        public List<OrderItemRequest> getItems() {

            return items;
        }

        public void setItems(
                List<OrderItemRequest> items) {

            this.items = items;
        }
    }

    // ==========================================
    // STATUS REQUEST
    // ==========================================

    public static class StatusRequest {

        private String status;

        public StatusRequest() {
        }

        public String getStatus() {

            return status;
        }

        public void setStatus(String status) {

            this.status = status;
        }
    }
}