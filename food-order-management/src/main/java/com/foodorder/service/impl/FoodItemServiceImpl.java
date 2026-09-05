package com.foodorder.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.foodorder.dto.FoodItemRequest;
import com.foodorder.dto.FoodItemResponse;
import com.foodorder.entity.FoodItem;
import com.foodorder.repository.FoodItemRepository;
import com.foodorder.service.FoodItemService;

@Service
public class FoodItemServiceImpl implements FoodItemService {

    private final FoodItemRepository foodItemRepository;

    public FoodItemServiceImpl(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    @Override
    public List<FoodItemResponse> getAllFoodItems() {

        return foodItemRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FoodItemResponse getFoodItemById(Long id) {

        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Food item not found with id: " + id
                    )
                );

        return convertToResponse(foodItem);
    }

    @Override
    public FoodItemResponse createFoodItem(FoodItemRequest request) {

        FoodItem foodItem = new FoodItem();

        foodItem.setName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setCategory(request.getCategory());
        foodItem.setImageUrl(request.getImageUrl());

        if (request.getAvailable() == null) {
            foodItem.setAvailable(true);
        } else {
            foodItem.setAvailable(request.getAvailable());
        }

        FoodItem savedFoodItem =
                foodItemRepository.save(foodItem);

        return convertToResponse(savedFoodItem);
    }

    @Override
    public FoodItemResponse updateFoodItem(
            Long id,
            FoodItemRequest request) {

        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Food item not found with id: " + id
                    )
                );

        foodItem.setName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setCategory(request.getCategory());
        foodItem.setImageUrl(request.getImageUrl());

        if (request.getAvailable() == null) {
            foodItem.setAvailable(true);
        } else {
            foodItem.setAvailable(request.getAvailable());
        }

        FoodItem updatedFoodItem =
                foodItemRepository.save(foodItem);

        return convertToResponse(updatedFoodItem);
    }

    @Override
    public void deleteFoodItem(Long id) {

        if (!foodItemRepository.existsById(id)) {

            throw new RuntimeException(
                "Food item not found with id: " + id
            );
        }

        foodItemRepository.deleteById(id);
    }

    private FoodItemResponse convertToResponse(
            FoodItem foodItem) {

        return new FoodItemResponse(
                foodItem.getId(),
                foodItem.getName(),
                foodItem.getDescription(),
                foodItem.getPrice(),
                foodItem.getCategory(),
                foodItem.getImageUrl(),
                foodItem.getAvailable(),
                foodItem.getCreatedAt()
        );
    }
}