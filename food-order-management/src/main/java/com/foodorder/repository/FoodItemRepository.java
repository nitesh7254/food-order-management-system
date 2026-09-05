package com.foodorder.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodorder.entity.FoodItem;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

}