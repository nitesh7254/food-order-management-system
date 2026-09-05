package com.foodorder.service;

import java.util.List;

import com.foodorder.dto.FoodItemRequest;
import com.foodorder.dto.FoodItemResponse;

public interface FoodItemService {

    List<FoodItemResponse> getAllFoodItems();

    FoodItemResponse getFoodItemById(Long id);

    FoodItemResponse createFoodItem(FoodItemRequest request);

    FoodItemResponse updateFoodItem(Long id, FoodItemRequest request);

    void deleteFoodItem(Long id);
}