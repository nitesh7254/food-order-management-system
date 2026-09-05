package com.foodorder.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.foodorder.entity.Customer;
import com.foodorder.entity.FoodItem;
import com.foodorder.entity.Order;
import com.foodorder.entity.OrderItem;
import com.foodorder.exception.BadOrderRequestException;
import com.foodorder.exception.CustomerNotFoundException;
import com.foodorder.exception.FoodItemNotFoundException;
import com.foodorder.exception.OrderNotFoundException;
import com.foodorder.repository.CustomerRepository;
import com.foodorder.repository.FoodItemRepository;
import com.foodorder.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final FoodItemRepository foodItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            FoodItemRepository foodItemRepository) {

        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.foodItemRepository = foodItemRepository;
    }

    // ==========================================
    // GET ALL ORDERS
    // ==========================================

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }

    // ==========================================
    // GET ORDER BY ID
    // ==========================================

    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {

        // ------------------------------------------
        // Validate Order ID
        // ------------------------------------------

        if (id == null) {

            throw new BadOrderRequestException(
                    "Order ID cannot be null"
            );
        }

        // ------------------------------------------
        // Find Order
        // ------------------------------------------

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new OrderNotFoundException(
                                "Order not found with id: " + id
                        )
                );
    }

    // ==========================================
    // GET ORDERS BY CUSTOMER ID
    // ==========================================

    @Transactional(readOnly = true)
    public List<Order> getOrdersByCustomer(Long customerId) {

        // ------------------------------------------
        // Validate Customer ID
        // ------------------------------------------

        if (customerId == null) {

            throw new BadOrderRequestException(
                    "Customer ID cannot be null"
            );
        }

        // ------------------------------------------
        // Check Customer Exists
        // ------------------------------------------

        if (!customerRepository.existsById(customerId)) {

            throw new CustomerNotFoundException(
                    "Customer not found with id: " + customerId
            );
        }

        // ------------------------------------------
        // Find Customer Orders
        // ------------------------------------------

        return orderRepository.findByCustomerId(customerId);
    }

    // ==========================================
    // CREATE ORDER
    // ==========================================

    @Transactional
    public Order createOrder(
            Long customerId,
            List<OrderItemRequest> items) {

        // ------------------------------------------
        // Validate Customer ID
        // ------------------------------------------

        if (customerId == null) {

            throw new BadOrderRequestException(
                    "Customer ID cannot be null"
            );
        }

        // ------------------------------------------
        // Find Customer
        // ------------------------------------------

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new CustomerNotFoundException(
                                "Customer not found with id: " + customerId
                        )
                );

        // ------------------------------------------
        // Validate Order Items
        // ------------------------------------------

        if (items == null || items.isEmpty()) {

            throw new BadOrderRequestException(
                    "Order must contain at least one food item"
            );
        }

        // ------------------------------------------
        // Create Order
        // ------------------------------------------

        Order order = new Order();

        order.setCustomer(customer);

        // New orders always start as PENDING
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;

        // ------------------------------------------
        // Add Food Items
        // ------------------------------------------

        for (OrderItemRequest request : items) {

            // --------------------------------------
            // Validate Order Item
            // --------------------------------------

            if (request == null) {

                throw new BadOrderRequestException(
                        "Order item cannot be null"
                );
            }

            // --------------------------------------
            // Validate Food Item ID
            // --------------------------------------

            if (request.getFoodItemId() == null) {

                throw new BadOrderRequestException(
                        "Food item ID cannot be null"
                );
            }

            // --------------------------------------
            // Validate Quantity
            // --------------------------------------

            if (request.getQuantity() == null
                    || request.getQuantity() <= 0) {

                throw new BadOrderRequestException(
                        "Quantity must be greater than zero"
                );
            }

            // --------------------------------------
            // Find Food Item
            // --------------------------------------

            FoodItem foodItem = foodItemRepository
                    .findById(request.getFoodItemId())
                    .orElseThrow(() ->
                            new FoodItemNotFoundException(
                                    "Food item not found with id: "
                                            + request.getFoodItemId()
                            )
                    );

            // --------------------------------------
            // Check Food Availability
            // --------------------------------------

            if (!Boolean.TRUE.equals(foodItem.getAvailable())) {

                throw new BadOrderRequestException(
                        "Food item is not available: "
                                + foodItem.getName()
                );
            }

            // --------------------------------------
            // Get Current Food Price
            // --------------------------------------

            BigDecimal price = foodItem.getPrice();

            if (price == null) {

                throw new BadOrderRequestException(
                        "Food item price cannot be null: "
                                + foodItem.getName()
                );
            }

            // --------------------------------------
            // Calculate Subtotal
            // --------------------------------------

            BigDecimal subtotal = price.multiply(
                    BigDecimal.valueOf(request.getQuantity())
            );

            // --------------------------------------
            // Create OrderItem
            // --------------------------------------

            OrderItem orderItem = new OrderItem();

            orderItem.setFoodItem(foodItem);
            orderItem.setQuantity(request.getQuantity());

            // Store price at the time of ordering
            orderItem.setPrice(price);

            orderItem.setSubtotal(subtotal);

            // --------------------------------------
            // Connect OrderItem to Order
            // --------------------------------------

            order.addOrderItem(orderItem);

            // --------------------------------------
            // Add To Total
            // --------------------------------------

            totalAmount = totalAmount.add(subtotal);
        }

        // ------------------------------------------
        // Set Final Order Total
        // ------------------------------------------

        order.setTotalAmount(totalAmount);

        // ------------------------------------------
        // Save Order
        // ------------------------------------------

        return orderRepository.save(order);
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    @Transactional
    public Order updateOrderStatus(
            Long id,
            String status) {

        // ------------------------------------------
        // Validate Order ID
        // ------------------------------------------

        if (id == null) {

            throw new BadOrderRequestException(
                    "Order ID cannot be null"
            );
        }

        // ------------------------------------------
        // Validate Status
        // ------------------------------------------

        if (status == null || status.trim().isEmpty()) {

            throw new BadOrderRequestException(
                    "Order status cannot be empty"
            );
        }

        // ------------------------------------------
        // Get Existing Order
        // ------------------------------------------

        Order order = getOrderById(id);

        // ------------------------------------------
        // Normalize Status
        // ------------------------------------------

        String newStatus = status.trim().toUpperCase();

        // ------------------------------------------
        // Validate Status Value
        // ------------------------------------------

        validateStatus(newStatus);

        // ------------------------------------------
        // Validate Status Transition
        // ------------------------------------------

        validateStatusTransition(
                order.getStatus(),
                newStatus
        );

        // ------------------------------------------
        // Update Status
        // ------------------------------------------

        order.setStatus(newStatus);

        return orderRepository.save(order);
    }

    // ==========================================
    // VALIDATE STATUS
    // ==========================================

    private void validateStatus(String status) {

        if (!status.equals("PENDING")
                && !status.equals("CONFIRMED")
                && !status.equals("PREPARING")
                && !status.equals("READY")
                && !status.equals("DELIVERED")
                && !status.equals("CANCELLED")) {

            throw new BadOrderRequestException(
                    "Invalid order status: " + status
                            + ". Allowed statuses: "
                            + "PENDING, CONFIRMED, PREPARING, "
                            + "READY, DELIVERED, CANCELLED"
            );
        }
    }

    // ==========================================
    // VALIDATE STATUS TRANSITION
    // ==========================================

    private void validateStatusTransition(
            String currentStatus,
            String newStatus) {

        // ------------------------------------------
        // Protect Against Null Current Status
        // ------------------------------------------

        if (currentStatus == null
                || currentStatus.trim().isEmpty()) {

            throw new BadOrderRequestException(
                    "Current order status cannot be empty"
            );
        }

        currentStatus = currentStatus.trim().toUpperCase();

        // ------------------------------------------
        // Same Status
        // ------------------------------------------

        if (currentStatus.equals(newStatus)) {

            throw new BadOrderRequestException(
                    "Order is already in status: " + currentStatus
            );
        }

        // ------------------------------------------
        // CANCELLED Is Final
        // ------------------------------------------

        if (currentStatus.equals("CANCELLED")) {

            throw new BadOrderRequestException(
                    "Invalid status transition: "
                            + currentStatus
                            + " -> "
                            + newStatus
            );
        }

        // ------------------------------------------
        // DELIVERED Is Final
        // ------------------------------------------

        if (currentStatus.equals("DELIVERED")) {

            throw new BadOrderRequestException(
                    "Invalid status transition: "
                            + currentStatus
                            + " -> "
                            + newStatus
            );
        }

        // ------------------------------------------
        // PENDING
        //
        // Allowed:
        // PENDING -> CONFIRMED
        // PENDING -> CANCELLED
        // ------------------------------------------

        if (currentStatus.equals("PENDING")) {

            if (!newStatus.equals("CONFIRMED")
                    && !newStatus.equals("CANCELLED")) {

                throw new BadOrderRequestException(
                        "Invalid status transition: "
                                + currentStatus
                                + " -> "
                                + newStatus
                );
            }
        }

        // ------------------------------------------
        // CONFIRMED
        //
        // Allowed:
        // CONFIRMED -> PREPARING
        // CONFIRMED -> CANCELLED
        // ------------------------------------------

        else if (currentStatus.equals("CONFIRMED")) {

            if (!newStatus.equals("PREPARING")
                    && !newStatus.equals("CANCELLED")) {

                throw new BadOrderRequestException(
                        "Invalid status transition: "
                                + currentStatus
                                + " -> "
                                + newStatus
                );
            }
        }

        // ------------------------------------------
        // PREPARING
        //
        // Allowed:
        // PREPARING -> READY
        // PREPARING -> CANCELLED
        // ------------------------------------------

        else if (currentStatus.equals("PREPARING")) {

            if (!newStatus.equals("READY")
                    && !newStatus.equals("CANCELLED")) {

                throw new BadOrderRequestException(
                        "Invalid status transition: "
                                + currentStatus
                                + " -> "
                                + newStatus
                );
            }
        }

        // ------------------------------------------
        // READY
        //
        // Allowed:
        // READY -> DELIVERED
        // READY -> CANCELLED
        // ------------------------------------------

        else if (currentStatus.equals("READY")) {

            if (!newStatus.equals("DELIVERED")
                    && !newStatus.equals("CANCELLED")) {

                throw new BadOrderRequestException(
                        "Invalid status transition: "
                                + currentStatus
                                + " -> "
                                + newStatus
                );
            }
        }
    }

    // ==========================================
    // DELETE ORDER
    // ==========================================

    @Transactional
    public void deleteOrder(Long id) {

        // ------------------------------------------
        // Validate Order ID
        // ------------------------------------------

        if (id == null) {

            throw new BadOrderRequestException(
                    "Order ID cannot be null"
            );
        }

        // ------------------------------------------
        // Check Order Exists
        // ------------------------------------------

        if (!orderRepository.existsById(id)) {

            throw new OrderNotFoundException(
                    "Order not found with id: " + id
            );
        }

        // ------------------------------------------
        // Delete Order
        // ------------------------------------------

        orderRepository.deleteById(id);
    }

    // ==========================================
    // ORDER ITEM REQUEST
    // ==========================================

    public static class OrderItemRequest {

        private Long foodItemId;

        private Integer quantity;

        public OrderItemRequest() {
        }

        public Long getFoodItemId() {
            return foodItemId;
        }

        public void setFoodItemId(Long foodItemId) {
            this.foodItemId = foodItemId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}