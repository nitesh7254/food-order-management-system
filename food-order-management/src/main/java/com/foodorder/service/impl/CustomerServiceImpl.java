package com.foodorder.service.impl;

import com.foodorder.dto.CustomerRequest;
import com.foodorder.dto.CustomerResponse;
import com.foodorder.entity.Customer;
import com.foodorder.entity.Order;
import com.foodorder.exception.CustomerNotFoundException;
import com.foodorder.exception.DuplicateCustomerException;
import com.foodorder.repository.CustomerRepository;
import com.foodorder.repository.OrderRepository;
import com.foodorder.service.CustomerService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    public CustomerServiceImpl(
            CustomerRepository customerRepository,
            OrderRepository orderRepository) {

        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }

    // =========================================================
    // CREATE CUSTOMER
    // =========================================================

    @Override
    public CustomerResponse createCustomer(
            CustomerRequest customerRequest) {

        // Check duplicate email
        if (customerRepository.existsByEmail(
                customerRequest.getEmail())) {

            throw new DuplicateCustomerException(
                    "Customer already exists with email: "
                            + customerRequest.getEmail());
        }

        // Check duplicate phone
        if (customerRepository.existsByPhone(
                customerRequest.getPhone())) {

            throw new DuplicateCustomerException(
                    "Customer already exists with phone: "
                            + customerRequest.getPhone());
        }

        Customer customer = new Customer();

        customer.setName(customerRequest.getName());
        customer.setEmail(customerRequest.getEmail());
        customer.setPhone(customerRequest.getPhone());
        customer.setAddress(customerRequest.getAddress());

        Customer savedCustomer =
                customerRepository.save(customer);

        return convertToResponse(savedCustomer);
    }

    // =========================================================
    // GET ALL CUSTOMERS
    // =========================================================

    @Override
    public List<CustomerResponse> getAllCustomers() {

        return customerRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET CUSTOMER BY ID
    // =========================================================

    @Override
    public CustomerResponse getCustomerById(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new CustomerNotFoundException(
                                "Customer not found with id: " + id));

        return convertToResponse(customer);
    }

    // =========================================================
    // UPDATE CUSTOMER
    // =========================================================

    @Override
    public CustomerResponse updateCustomer(
            Long id,
            CustomerRequest customerRequest) {

        Customer existingCustomer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new CustomerNotFoundException(
                                        "Customer not found with id: " + id));

        existingCustomer.setName(customerRequest.getName());
        existingCustomer.setEmail(customerRequest.getEmail());
        existingCustomer.setPhone(customerRequest.getPhone());
        existingCustomer.setAddress(customerRequest.getAddress());

        Customer updatedCustomer =
                customerRepository.save(existingCustomer);

        return convertToResponse(updatedCustomer);
    }

    // =========================================================
    // DELETE CUSTOMER
    // =========================================================

    @Override
    @Transactional
    public void deleteCustomer(Long id) {

        // 1. Find customer
        Customer existingCustomer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new CustomerNotFoundException(
                                        "Customer not found with id: " + id));

        // 2. Find all orders belonging to this customer
        List<Order> customerOrders =
                orderRepository.findByCustomerId(id);

        // 3. Delete customer's orders first
        //    OrderItem records will be removed because
        //    Order has CascadeType.ALL + orphanRemoval=true
        if (!customerOrders.isEmpty()) {

            orderRepository.deleteAll(customerOrders);
        }

        // 4. Now delete the customer
        customerRepository.delete(existingCustomer);
    }

    // =========================================================
    // CONVERT ENTITY → RESPONSE DTO
    // =========================================================

    private CustomerResponse convertToResponse(
            Customer customer) {

        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getCreatedAt()
        );
    }
}