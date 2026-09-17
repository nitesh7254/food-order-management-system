import { useEffect, useMemo, useState } from "react";

import {

    createOrder,

    deleteOrder,

    getCustomers,

    getFoodItems,

    getOrders,

    updateOrderStatus,

} from "../services/api";

const STATUS_FLOW = {

    PENDING: ["CONFIRMED", "CANCELLED"],

    CONFIRMED: ["PREPARING", "CANCELLED"],

    PREPARING: ["READY", "CANCELLED"],

    READY: ["DELIVERED"],

    DELIVERED: [],

    CANCELLED: [],

};

const STATUS_CLASSES = {

    PENDING: "bg-yellow-50 text-yellow-700",

    CONFIRMED: "bg-blue-50 text-blue-700",

    PREPARING: "bg-orange-50 text-orange-700",

    READY: "bg-purple-50 text-purple-700",

    DELIVERED: "bg-green-50 text-green-700",

    CANCELLED: "bg-red-50 text-red-700",

};

function Orders() {
    const userRole = localStorage.getItem("userRole");
    const isAdmin = userRole === "ADMIN";

    const [orders, setOrders] = useState([]);

    const [customers, setCustomers] = useState([]);

    const [foodItems, setFoodItems] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [updatingId, setUpdatingId] = useState(null);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);

    const [customerId, setCustomerId] = useState("");

    // Multiple items in one order

    const [orderItems, setOrderItems] = useState([

        {

            foodItemId: "",

            quantity: 1,

        },

    ]);

    // ============================================================

    // LOAD ORDERS, CUSTOMERS AND FOOD ITEMS

    // ============================================================

    useEffect(() => {

        let isMounted = true;

        const loadOrdersData = async () => {

            try {

                const [

                    ordersResponse,

                    customersResponse,

                    foodItemsResponse,

                ] = await Promise.all([

                    getOrders(),

                    getCustomers(),

                    getFoodItems(),

                ]);

                if (!isMounted) {

                    return;

                }

                setOrders(

                    Array.isArray(ordersResponse)

                        ? ordersResponse

                        : []

                );

                setCustomers(

                    Array.isArray(customersResponse)

                        ? customersResponse

                        : []

                );

                setFoodItems(

                    Array.isArray(foodItemsResponse)

                        ? foodItemsResponse

                        : []

                );

            } catch (err) {

                if (!isMounted) {

                    return;

                }

                setError(

                    err?.message ||

                        "Failed to load orders."

                );

            } finally {

                if (isMounted) {

                    setLoading(false);

                }

            }

        };

        loadOrdersData();

        return () => {

            isMounted = false;

        };

    }, []);

    // ============================================================

    // FILTER ORDERS

    // ============================================================

    const filteredOrders = useMemo(() => {

        const query = search.trim().toLowerCase();

        return orders.filter((order) => {

            const matchesStatus =

                statusFilter === "ALL" ||

                order.status === statusFilter;

            const customerName =

                order.customer?.name || "";

            const matchesSearch =

                !query ||

                String(order.id)

                    .toLowerCase()

                    .includes(query) ||

                customerName

                    .toLowerCase()

                    .includes(query) ||

                String(order.status || "")

                    .toLowerCase()

                    .includes(query);

            return (

                matchesStatus &&

                matchesSearch

            );

        });

    }, [orders, search, statusFilter]);

    // ============================================================

    // AVAILABLE FOOD ITEMS

    // ============================================================

    const availableFoodItems = useMemo(() => {

        return foodItems.filter(

            (item) => item.available === true

        );

    }, [foodItems]);

    // ============================================================

    // CALCULATE ORDER TOTAL

    // ============================================================

    const estimatedTotal = useMemo(() => {

        return orderItems.reduce(

            (total, orderItem) => {

                const food = foodItems.find(

                    (item) =>

                        String(item.id) ===

                        String(orderItem.foodItemId)

                );

                const price = Number(

                    food?.price || 0

                );

                const quantity = Number(

                    orderItem.quantity || 0

                );

                return (

                    total +

                    price * quantity

                );

            },

            0

        );

    }, [orderItems, foodItems]);

    // ============================================================

    // OPEN CREATE ORDER FORM

    // ============================================================

    const openForm = () => {

        setError("");

        setSuccess("");

        const firstCustomer = customers[0];

        const firstAvailableFood =

            availableFoodItems[0];

        setCustomerId(

            firstCustomer

                ? String(firstCustomer.id)

                : ""

        );

        setOrderItems([

            {

                foodItemId:

                    firstAvailableFood

                        ? String(

                              firstAvailableFood.id

                          )

                        : "",

                quantity: 1,

            },

        ]);

        setShowForm(true);

    };

    // ============================================================

    // CLOSE FORM

    // ============================================================

    const closeForm = () => {

        if (!saving) {

            setShowForm(false);

        }

    };

    // ============================================================

    // ADD NEW ITEM ROW

    // ============================================================

    const addOrderItem = () => {

        setError("");

        const usedFoodIds = orderItems

            .map((item) =>

                String(item.foodItemId)

            )

            .filter(Boolean);

        const nextFood = availableFoodItems.find(

            (food) =>

                !usedFoodIds.includes(

                    String(food.id)

                )

        );

        if (!nextFood) {

            setError(

                "All available food items have already been selected."

            );

            return;

        }

        setOrderItems((previous) => [

            ...previous,

            {

                foodItemId: String(nextFood.id),

                quantity: 1,

            },

        ]);

    };

    // ============================================================

    // REMOVE ITEM ROW

    // ============================================================

    const removeOrderItem = (index) => {

        setError("");

        if (orderItems.length === 1) {

            setError(

                "An order must contain at least one food item."

            );

            return;

        }

        setOrderItems((previous) =>

            previous.filter(

                (_, itemIndex) =>

                    itemIndex !== index

            )

        );

    };

    // ============================================================

    // CHANGE FOOD ITEM

    // ============================================================

    const handleFoodChange = (

        index,

        foodItemId

    ) => {

        setError("");

        const duplicate = orderItems.some(

            (item, itemIndex) =>

                itemIndex !== index &&

                String(item.foodItemId) ===

                    String(foodItemId)

        );

        if (duplicate) {

            setError(

                "This food item is already added to the order."

            );

            return;

        }

        setOrderItems((previous) =>

            previous.map(

                (item, itemIndex) =>

                    itemIndex === index

                        ? {

                              ...item,

                              foodItemId,

                          }

                        : item

            )

        );

    };

    // ============================================================

    // CHANGE QUANTITY

    // ============================================================

    const handleQuantityChange = (

        index,

        quantity

    ) => {

        setError("");

        setOrderItems((previous) =>

            previous.map(

                (item, itemIndex) =>

                    itemIndex === index

                        ? {

                              ...item,

                              quantity,

                          }

                        : item

            )

        );

    };

    // ============================================================

    // CREATE ORDER

    // ============================================================

    const handleCreateOrder = async (

        event

    ) => {

        event.preventDefault();

        setError("");

        setSuccess("");

        // Customer validation

        if (!customerId) {

            setError(

                "Please select a customer."

            );

            return;

        }

        // At least one item

        if (

            !orderItems ||

            orderItems.length === 0

        ) {

            setError(

                "Please add at least one food item."

            );

            return;

        }

        // Validate every item

        for (

            let index = 0;

            index < orderItems.length;

            index++

        ) {

            const item = orderItems[index];

            if (!item.foodItemId) {

                setError(

                    `Please select a food item for item #${

                        index + 1

                    }.`

                );

                return;

            }

            if (

                !item.quantity ||

                Number(item.quantity) <= 0

            ) {

                setError(

                    `Quantity for item #${

                        index + 1

                    } must be greater than zero.`

                );

                return;

            }

        }

        // Check duplicate food items

        const foodIds = orderItems.map(

            (item) => String(item.foodItemId)

        );

        const hasDuplicateFood =

            new Set(foodIds).size !==

            foodIds.length;

        if (hasDuplicateFood) {

            setError(

                "The same food item cannot be added twice. Change the duplicate item."

            );

            return;

        }

        try {

            setSaving(true);

            // Backend expects:

            // {

            //   customerId: number,

            //   items: [

            //      {

            //         foodItemId: number,

            //         quantity: number

            //      }

            //   ]

            // }

            const payload = {

                customerId: Number(customerId),

                items: orderItems.map(

                    (item) => ({

                        foodItemId:

                            Number(

                                item.foodItemId

                            ),

                        quantity:

                            Number(

                                item.quantity

                            ),

                    })

                ),

            };

            const newOrder =

                await createOrder(payload);

            setOrders((previous) => [

                newOrder,

                ...previous,

            ]);

            setShowForm(false);

            setSuccess(

                `Order #${

                    newOrder?.id || ""

                } created successfully.`

            );

            // Reset form

            setCustomerId("");

            setOrderItems([

                {

                    foodItemId: "",

                    quantity: 1,

                },

            ]);

        } catch (err) {

            setError(

                err?.message ||

                    "Failed to create order."

            );

        } finally {

            setSaving(false);

        }

    };

    // ============================================================

    // UPDATE ORDER STATUS

    // ============================================================

    const handleStatusChange = async (

        id,

        status

    ) => {

        if (!status) {

            return;

        }

        try {

            setError("");

            setSuccess("");

            setUpdatingId(id);

            const updatedOrder =

                await updateOrderStatus(

                    id,

                    status

                );

            setOrders((previous) =>

                previous.map((order) =>

                    order.id === id

                        ? updatedOrder

                        : order

                )

            );

            setSuccess(

                `Order #${id} status updated successfully.`

            );

        } catch (err) {

            setError(

                err?.message ||

                    "Failed to update order status."

            );

        } finally {

            setUpdatingId(null);

        }

    };

    // ============================================================

    // DELETE ORDER

    // ============================================================

    const handleDelete = async (id) => {

        const confirmed =

            window.confirm(

                `Delete order #${id}?`

            );

        if (!confirmed) {

            return;

        }

        try {

            setError("");

            setSuccess("");

            await deleteOrder(id);

            setOrders((previous) =>

                previous.filter(

                    (order) =>

                        order.id !== id

                )

            );

            setSuccess(

                `Order #${id} deleted successfully.`

            );

        } catch (err) {

            setError(

                err?.message ||

                    "Failed to delete order."

            );

        }

    };

    // ============================================================

    // FORMAT DATE

    // ============================================================

    const formatDateTime = (value) => {

        if (!value) {

            return "-";

        }

        const date = new Date(value);

        if (

            Number.isNaN(

                date.getTime()

            )

        ) {

            return "-";

        }

        return date.toLocaleString(

            "en-IN",

            {

                day: "2-digit",

                month: "short",

                year: "numeric",

                hour: "2-digit",

                minute: "2-digit",

            }

        );

    };

    // ============================================================

    // RENDER

    // ============================================================

    return (

        <div className="min-h-[calc(100vh-64px)] bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* ==================================================

                    HEADER

                ================================================== */}

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">

                            Orders

                        </h1>

                        <p className="mt-1 text-slate-500">

                            Create orders and manage their status

                        </p>

                    </div>

                    <button

                        type="button"

                        onClick={openForm}

                        disabled={

                            customers.length === 0 ||

                            availableFoodItems.length === 0

                        }

                        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"

                    >

                        + Create Order

                    </button>

                </div>

                {/* ==================================================

                    SUCCESS MESSAGE

                ================================================== */}

                {success && (

                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">

                        {success}

                    </div>

                )}

                {/* ==================================================

                    ERROR MESSAGE

                ================================================== */}

                {error && !showForm && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                        {error}

                    </div>

                )}

                {/* ==================================================

                    STATISTICS

                ================================================== */}

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <p className="text-sm text-slate-500">

                            All Orders

                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-900">

                            {orders.length}

                        </p>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <p className="text-sm text-slate-500">

                            Pending

                        </p>

                        <p className="mt-1 text-3xl font-bold text-yellow-600">

                            {

                                orders.filter(

                                    (order) =>

                                        order.status ===

                                        "PENDING"

                                ).length

                            }

                        </p>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <p className="text-sm text-slate-500">

                            Preparing

                        </p>

                        <p className="mt-1 text-3xl font-bold text-orange-600">

                            {

                                orders.filter(

                                    (order) =>

                                        order.status ===

                                        "PREPARING"

                                ).length

                            }

                        </p>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <p className="text-sm text-slate-500">

                            Delivered

                        </p>

                        <p className="mt-1 text-3xl font-bold text-green-600">

                            {

                                orders.filter(

                                    (order) =>

                                        order.status ===

                                        "DELIVERED"

                                ).length

                            }

                        </p>

                    </div>

                </div>

                {/* ==================================================

                    SEARCH / FILTER

                ================================================== */}

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">

                    <input

                        type="search"

                        value={search}

                        onChange={(event) =>

                            setSearch(

                                event.target.value

                            )

                        }

                        placeholder="Search by order ID, customer or status..."

                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"

                    />

                    <select

                        value={statusFilter}

                        onChange={(event) =>

                            setStatusFilter(

                                event.target.value

                            )

                        }

                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"

                    >

                        <option value="ALL">

                            All Statuses

                        </option>

                        {Object.keys(

                            STATUS_FLOW

                        ).map((status) => (

                            <option

                                key={status}

                                value={status}

                            >

                                {status}

                            </option>

                        ))}

                    </select>

                </div>

                {/* ==================================================

                    ORDERS

                ================================================== */}

                <div className="space-y-4">

                    {loading ? (

                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

                            <p className="text-sm text-slate-500">

                                Loading orders...

                            </p>

                        </div>

                    ) : filteredOrders.length === 0 ? (

                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">

                                🛒

                            </div>

                            <h2 className="mt-4 text-lg font-semibold text-slate-900">

                                No orders found

                            </h2>

                            <p className="mt-1 text-sm text-slate-500">

                                Create an order or change your filters.

                            </p>

                        </div>

                    ) : (

                        filteredOrders.map(

                            (order) => {

                                const nextStatuses =

                                    STATUS_FLOW[

                                        order.status

                                    ] || [];

                                return (

                                    <div

                                        key={

                                            order.id

                                        }

                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"

                                    >

                                        {/* ORDER HEADER */}

                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                            <div>

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <h2 className="text-xl font-bold text-slate-900">

                                                        Order #

                                                        {

                                                            order.id

                                                        }

                                                    </h2>

                                                    <span

                                                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${

                                                            STATUS_CLASSES[

                                                                order.status

                                                            ] ||

                                                            "bg-slate-100 text-slate-700"

                                                        }`}

                                                    >

                                                        {

                                                            order.status

                                                        }

                                                    </span>

                                                </div>

                                                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">

                                                    <p>

                                                        <span className="font-semibold text-slate-900">

                                                            Customer:

                                                        </span>{" "}

                                                        {

                                                            order.customer

                                                                ?.name ||

                                                            "-"

                                                        }

                                                    </p>

                                                    <p>

                                                        <span className="font-semibold text-slate-900">

                                                            Phone:

                                                        </span>{" "}

                                                        {

                                                            order.customer

                                                                ?.phone ||

                                                            "-"

                                                        }

                                                    </p>

                                                    <p>

                                                        <span className="font-semibold text-slate-900">

                                                            Created:

                                                        </span>{" "}

                                                        {formatDateTime(

                                                            order.createdAt

                                                        )}

                                                    </p>

                                                    <p>

                                                        <span className="font-semibold text-slate-900">

                                                            Total:

                                                        </span>{" "}

                                                        ₹

                                                        {Number(

                                                            order.totalAmount ||

                                                                0

                                                        ).toFixed(

                                                            2

                                                        )}

                                                    </p>

                                                </div>

                                            </div>

                                            {/* STATUS / DELETE */}

                                            <div className="flex flex-wrap gap-2">

                                                {nextStatuses.length >

                                                    0 && (

                                                    <select

                                                        value=""

                                                        disabled={

                                                            updatingId ===

                                                            order.id

                                                        }

                                                        onChange={(

                                                            event

                                                        ) =>

                                                            handleStatusChange(

                                                                order.id,

                                                                event

                                                                    .target

                                                                    .value

                                                            )

                                                        }

                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-orange-500"

                                                    >

                                                        <option value="">

                                                            {updatingId ===

                                                            order.id

                                                                ? "Updating..."

                                                                : "Change Status"}

                                                        </option>

                                                        {nextStatuses.map(

                                                            (

                                                                status

                                                            ) => (

                                                                <option

                                                                    key={

                                                                        status

                                                                    }

                                                                    value={

                                                                        status

                                                                    }

                                                                >

                                                                    →

                                                                    {

                                                                        status

                                                                    }

                                                                </option>

                                                            )

                                                        )}

                                                    </select>

                                                )}

                                                                                                {isAdmin && (
<button

                                                    type="button"

                                                    onClick={() =>

                                                        handleDelete(

                                                            order.id

                                                        )

                                                    }

                                                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"

                                                >

                                                    Delete

                                                </button>
                                                )}

                                            </div>

                                        </div>

                                        {/* ORDER ITEMS */}

                                        <div className="mt-5 border-t border-slate-100 pt-4">

                                            <p className="mb-3 text-sm font-bold text-slate-900">

                                                Items (

                                                {order

                                                    .orderItems

                                                    ?.length ||

                                                    0}

                                                )

                                            </p>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

                                                {(

                                                    order.orderItems ||

                                                    []

                                                ).map(

                                                    (

                                                        item

                                                    ) => (

                                                        <div

                                                            key={

                                                                item.id

                                                            }

                                                            className="rounded-xl bg-slate-50 p-4"

                                                        >

                                                            <div className="flex justify-between gap-3">

                                                                <div>

                                                                    <p className="font-semibold text-slate-900">

                                                                        {

                                                                            item

                                                                                .foodItem

                                                                                ?.name

                                                                        }

                                                                    </p>

                                                                    <p className="mt-1 text-sm text-slate-500">

                                                                        Qty:{" "}

                                                                        {

                                                                            item.quantity

                                                                        }

                                                                    </p>

                                                                    <p className="mt-1 text-xs text-slate-400">

                                                                        ₹

                                                                        {Number(

                                                                            item.price ||

                                                                                0

                                                                        ).toFixed(

                                                                            2

                                                                        )}{" "}

                                                                        each

                                                                    </p>

                                                                </div>

                                                                <p className="font-bold text-slate-900">

                                                                    ₹

                                                                    {Number(

                                                                        item.subtotal ||

                                                                            0

                                                                    ).toFixed(

                                                                        2

                                                                    )}

                                                                </p>

                                                            </div>

                                                        </div>

                                                    )

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                );

                            }

                        )

                    )}

                </div>

            </div>

            {/* ======================================================

                CREATE ORDER MODAL

            ====================================================== */}

            {showForm && (

                <div

                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"

                    onMouseDown={(event) => {

                        if (

                            event.target ===

                            event.currentTarget

                        ) {

                            closeForm();

                        }

                    }}

                >

                    <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="border-b border-slate-100 bg-orange-50 p-6">

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm font-semibold text-orange-600">

                                        Order Management

                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-slate-900">

                                        Create Order

                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">

                                        Select a customer and add one or more food items.

                                    </p>

                                </div>

                                <button

                                    type="button"

                                    onClick={

                                        closeForm

                                    }

                                    disabled={

                                        saving

                                    }

                                    className="rounded-lg px-3 py-2 text-slate-500 hover:bg-white disabled:opacity-50"

                                >

                                    ✕

                                </button>

                            </div>

                        </div>

                        {/* MODAL BODY */}

                        <form

                            onSubmit={

                                handleCreateOrder

                            }

                            className="p-6"

                        >

                            {/* FORM ERROR */}

                            {error && (

                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                                    {error}

                                </div>

                            )}

                            {/* CUSTOMER */}

                            <div className="mb-6">

                                <label className="mb-2 block text-sm font-semibold text-slate-700">

                                    Customer

                                </label>

                                <select

                                    value={

                                        customerId

                                    }

                                    onChange={(

                                        event

                                    ) =>

                                        setCustomerId(

                                            event

                                                .target

                                                .value

                                        )

                                    }

                                    disabled={

                                        saving

                                    }

                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"

                                >

                                    <option value="">

                                        Select customer

                                    </option>

                                    {customers.map(

                                        (

                                            customer

                                        ) => (

                                            <option

                                                key={

                                                    customer.id

                                                }

                                                value={

                                                    customer.id

                                                }

                                            >

                                                #

                                                {

                                                    customer.id

                                                }{" "}

                                                —{" "}

                                                {

                                                    customer.name

                                                }

                                            </option>

                                        )

                                    )}

                                </select>

                            </div>

                            {/* FOOD ITEMS HEADER */}

                            <div className="mb-3 flex items-center justify-between">

                                <div>

                                    <h3 className="text-lg font-bold text-slate-900">

                                        Food Items

                                    </h3>

                                    <p className="text-sm text-slate-500">

                                        Add multiple food items to this order.

                                    </p>

                                </div>

                                <button

                                    type="button"

                                    onClick={

                                        addOrderItem

                                    }

                                    disabled={

                                        saving ||

                                        orderItems.length >=

                                            availableFoodItems.length

                                    }

                                    className="rounded-lg bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"

                                >

                                    + Add Item

                                </button>

                            </div>

                            {/* ITEM ROWS */}

                            <div className="space-y-3">

                                {orderItems.map(

                                    (

                                        orderItem,

                                        index

                                    ) => {

                                        const selectedFood =

                                            foodItems.find(

                                                (

                                                    item

                                                ) =>

                                                    String(

                                                        item.id

                                                    ) ===

                                                    String(

                                                        orderItem.foodItemId

                                                    )

                                            );

                                        const itemTotal =

                                            Number(

                                                selectedFood?.price ||

                                                    0

                                            ) *

                                            Number(

                                                orderItem.quantity ||

                                                    0

                                            );

                                        return (

                                            <div

                                                key={

                                                    index

                                                }

                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"

                                            >

                                                <div className="mb-2 flex items-center justify-between">

                                                    <span className="text-sm font-bold text-slate-700">

                                                        Item #

                                                        {

                                                            index +

                                                            1

                                                        }

                                                    </span>

                                                    {orderItems.length >

                                                        1 && (

                                                        <button

                                                            type="button"

                                                            onClick={() =>

                                                                removeOrderItem(

                                                                    index

                                                                )

                                                            }

                                                            disabled={

                                                                saving

                                                            }

                                                            className="text-sm font-semibold text-red-600 hover:text-red-700"

                                                        >

                                                            Remove

                                                        </button>

                                                    )}

                                                </div>

                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_130px_110px]">

                                                    {/* FOOD */}

                                                    <div>

                                                        <label className="mb-1 block text-xs font-semibold text-slate-600">

                                                            Food Item

                                                        </label>

                                                        <select

                                                            value={

                                                                orderItem.foodItemId

                                                            }

                                                            onChange={(

                                                                event

                                                            ) =>

                                                                handleFoodChange(

                                                                    index,

                                                                    event

                                                                        .target

                                                                        .value

                                                                )

                                                            }

                                                            disabled={

                                                                saving

                                                            }

                                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"

                                                        >

                                                            <option value="">

                                                                Select food

                                                            </option>

                                                            {availableFoodItems.map(

                                                                (

                                                                    food

                                                                ) => {

                                                                    const alreadyUsed =

                                                                        orderItems.some(

                                                                            (

                                                                                existingItem,

                                                                                existingIndex

                                                                            ) =>

                                                                                existingIndex !==

                                                                                    index &&

                                                                                String(

                                                                                    existingItem.foodItemId

                                                                                ) ===

                                                                                    String(

                                                                                        food.id

                                                                                    )

                                                                        );

                                                                    return (

                                                                        <option

                                                                            key={

                                                                                food.id

                                                                            }

                                                                            value={

                                                                                food.id

                                                                            }

                                                                            disabled={

                                                                                alreadyUsed

                                                                            }

                                                                        >

                                                                            {

                                                                                food.name

                                                                            }{" "}

                                                                            — ₹

                                                                            {Number(

                                                                                food.price ||

                                                                                    0

                                                                            ).toFixed(

                                                                                2

                                                                            )}

                                                                        </option>

                                                                    );

                                                                }

                                                            )}

                                                        </select>

                                                    </div>

                                                    {/* QUANTITY */}

                                                    <div>

                                                        <label className="mb-1 block text-xs font-semibold text-slate-600">

                                                            Quantity

                                                        </label>

                                                        <input

                                                            type="number"

                                                            min="1"

                                                            step="1"

                                                            value={

                                                                orderItem.quantity

                                                            }

                                                            onChange={(

                                                                event

                                                            ) =>

                                                                handleQuantityChange(

                                                                    index,

                                                                    event

                                                                        .target

                                                                        .value

                                                                )

                                                            }

                                                            disabled={

                                                                saving

                                                            }

                                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"

                                                        />

                                                    </div>

                                                    {/* SUBTOTAL */}

                                                    <div>

                                                        <label className="mb-1 block text-xs font-semibold text-slate-600">

                                                            Subtotal

                                                        </label>

                                                        <div className="flex h-[42px] items-center rounded-lg bg-white px-3 text-sm font-bold text-orange-600">

                                                            ₹

                                                            {itemTotal.toFixed(

                                                                2

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }

                                )}

                            </div>

                            {/* ADD ITEM BUTTON */}

                            <button

                                type="button"

                                onClick={

                                    addOrderItem

                                }

                                disabled={

                                    saving ||

                                    orderItems.length >=

                                        availableFoodItems.length

                                }

                                className="mt-4 w-full rounded-xl border-2 border-dashed border-orange-200 py-3 text-sm font-semibold text-orange-600 hover:border-orange-400 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"

                            >

                                + Add Another Food Item

                            </button>

                            {/* TOTAL */}

                            <div className="mt-5 rounded-xl bg-slate-100 p-5">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-semibold text-slate-500">

                                            Estimated Total

                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">

                                            {

                                                orderItems.length

                                            }{" "}

                                            food item

                                            {orderItems.length !==

                                            1

                                                ? "s"

                                                : ""}

                                        </p>

                                    </div>

                                    <p className="text-2xl font-bold text-orange-600">

                                        ₹

                                        {estimatedTotal.toFixed(

                                            2

                                        )}

                                    </p>

                                </div>

                            </div>

                            {/* BUTTONS */}

                            <div className="mt-6 flex justify-end gap-3">

                                <button

                                    type="button"

                                    onClick={

                                        closeForm

                                    }

                                    disabled={

                                        saving

                                    }

                                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"

                                >

                                    Cancel

                                </button>

                                <button

                                    type="submit"

                                    disabled={

                                        saving ||

                                        customers.length ===

                                            0 ||

                                        availableFoodItems.length ===

                                            0

                                    }

                                    className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"

                                >

                                    {saving

                                        ? "Creating..."

                                        : "Create Order"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Orders;