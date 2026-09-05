package com.foodorder.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodorder.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}