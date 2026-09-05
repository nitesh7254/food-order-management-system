package com.foodorder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodorder.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ==========================================
    // FIND ORDERS BY CUSTOMER ID
    // ==========================================

    List<Order> findByCustomerId(Long customerId);
}