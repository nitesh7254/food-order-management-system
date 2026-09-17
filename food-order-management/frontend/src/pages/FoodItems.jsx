import { useEffect, useMemo, useState } from "react";

import { foodItemApi } from "../services/api";

const EMPTY_FOOD_ITEM = {

    name: "",

    description: "",

    price: "",

    category: "",

    imageUrl: "",

    available: true,

};

/*

|--------------------------------------------------------------------------

| RESTAURANT MENU CATEGORIES

|--------------------------------------------------------------------------

| These are the main visual categories shown on the Food Items page.

| Existing/custom categories from the database are added automatically.

*/

const MENU_CATEGORIES = [

    {

        name: "Soup & Salads",

        icon: "🥗",

        description: "Fresh soups & salads",

    },

    {

        name: "Starter",

        icon: "🍢",

        description: "Perfect before the meal",

    },

    {

        name: "Main Course",

        icon: "🍛",

        description: "Chef's special dishes",

    },

    {

        name: "Rice & Lentil",

        icon: "🍚",

        description: "Rice, dal & lentils",

    },

    {

        name: "Breads",

        icon: "🫓",

        description: "Fresh Indian breads",

    },

    {

        name: "Desserts",

        icon: "🍨",

        description: "Sweet finishing touch",

    },

];

function FoodItems() {

    const userRole = localStorage.getItem("userRole");

    const isAdmin = userRole === "ADMIN";

    const [foodItems, setFoodItems] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingItem, setEditingItem] = useState(null);

    const [formData, setFormData] =

        useState(EMPTY_FOOD_ITEM);

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =

        useState("ALL");

    /*

    |--------------------------------------------------------------------------

    | LOAD FOOD ITEMS

    |--------------------------------------------------------------------------

    */

    async function loadFoodItems(showLoading = true, clearError = true) {

        try {

            if (showLoading) {

                setLoading(true);

            }

            if (clearError) {

                setError("");

            }

            const data = await foodItemApi.getAll();

            setFoodItems(

                Array.isArray(data) ? data : []

            );

        } catch (err) {

            setError(

                err?.message ||

                    "Failed to load food items."

            );

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        // The initial state is already loading=true.

        // Avoid synchronous setState calls inside the effect.

        loadFoodItems(false, false);

    }, []);

    /*

    |--------------------------------------------------------------------------

    | STATISTICS

    |--------------------------------------------------------------------------

    */

    const totalItems = foodItems.length;

    const availableItems = foodItems.filter(

        (item) => item.available

    ).length;

    const unavailableItems =

        totalItems - availableItems;

    /*

    |--------------------------------------------------------------------------

    | DATABASE CATEGORIES

    |--------------------------------------------------------------------------

    */

    const databaseCategories = useMemo(() => {

        const values = foodItems

            .map((item) => item.category)

            .filter(Boolean)

            .map((category) => category.trim());

        return [...new Set(values)];

    }, [foodItems]);

    /*

    |--------------------------------------------------------------------------

    | COMBINED CATEGORIES

    |--------------------------------------------------------------------------

    */

    const allCategories = useMemo(() => {

        const standard = MENU_CATEGORIES.map(

            (category) => category.name

        );

        return [

            ...standard,

            ...databaseCategories.filter(

                (category) =>

                    !standard.some(

                        (standardCategory) =>

                            standardCategory.toLowerCase() ===

                            category.toLowerCase()

                    )

            ),

        ];

    }, [databaseCategories]);

    /*

    |--------------------------------------------------------------------------

    | CATEGORY COUNTS

    |--------------------------------------------------------------------------

    */

    const getCategoryCount = (categoryName) => {

        return foodItems.filter(

            (item) =>

                item.category?.toLowerCase() ===

                categoryName.toLowerCase()

        ).length;

    };

    /*

    |--------------------------------------------------------------------------

    | FILTER FOOD ITEMS

    |--------------------------------------------------------------------------

    */

    const filteredItems = useMemo(() => {

        const searchValue = search

            .trim()

            .toLowerCase();

        return foodItems.filter((item) => {

            const matchesSearch =

                !searchValue ||

                item.name

                    ?.toLowerCase()

                    .includes(searchValue) ||

                item.description

                    ?.toLowerCase()

                    .includes(searchValue) ||

                item.category

                    ?.toLowerCase()

                    .includes(searchValue);

            const matchesCategory =

                categoryFilter === "ALL" ||

                item.category?.toLowerCase() ===

                    categoryFilter.toLowerCase();

            return matchesSearch && matchesCategory;

        });

    }, [

        foodItems,

        search,

        categoryFilter,

    ]);

    /*

    |--------------------------------------------------------------------------

    | OPEN ADD FORM

    |--------------------------------------------------------------------------

    */

    function openAddForm() {

        setEditingItem(null);

        setFormData({

            ...EMPTY_FOOD_ITEM,

        });

        setError("");

        setShowForm(true);

    }

    /*

    |--------------------------------------------------------------------------

    | OPEN EDIT FORM

    |--------------------------------------------------------------------------

    */

    function openEditForm(item) {

        setEditingItem(item);

        setFormData({

            name: item.name || "",

            description: item.description || "",

            price: item.price ?? "",

            category: item.category || "",

            imageUrl: item.imageUrl || "",

            available: item.available ?? true,

        });

        setError("");

        setShowForm(true);

    }

    /*

    |--------------------------------------------------------------------------

    | CLOSE FORM

    |--------------------------------------------------------------------------

    */

    function closeForm() {

        if (saving) {

            return;

        }

        setShowForm(false);

        setEditingItem(null);

        setFormData({

            ...EMPTY_FOOD_ITEM,

        });

        setError("");

    }

    /*

    |--------------------------------------------------------------------------

    | FORM CHANGE

    |--------------------------------------------------------------------------

    */

    function handleChange(event) {

        const {

            name,

            value,

            type,

            checked,

        } = event.target;

        setFormData((previous) => ({

            ...previous,

            [name]:

                type === "checkbox"

                    ? checked

                    : value,

        }));

    }

    /*

    |--------------------------------------------------------------------------

    | SUBMIT

    |--------------------------------------------------------------------------

    */

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");

        if (!formData.name.trim()) {

            setError("Food name is required.");

            return;

        }

        if (!formData.category.trim()) {

            setError("Category is required.");

            return;

        }

        if (

            !formData.price ||

            Number(formData.price) <= 0

        ) {

            setError(

                "Price must be greater than 0."

            );

            return;

        }

        if (!formData.description.trim()) {

            setError(

                "Description is required."

            );

            return;

        }

        try {

            setSaving(true);

            const payload = {

                ...formData,

                name: formData.name.trim(),

                description:

                    formData.description.trim(),

                category:

                    formData.category.trim(),

                imageUrl:

                    formData.imageUrl.trim(),

                price: Number(formData.price),

                available:

                    formData.available,

            };

            if (editingItem) {

                await foodItemApi.update(

                    editingItem.id,

                    payload

                );

            } else {

                await foodItemApi.create(

                    payload

                );

            }

            closeForm();

            await loadFoodItems();

        } catch (err) {

            setError(

                err?.message ||

                    "Failed to save food item."

            );

        } finally {

            setSaving(false);

        }

    }

    /*

    |--------------------------------------------------------------------------

    | DELETE

    |--------------------------------------------------------------------------

    */

    async function handleDelete(id) {

        const confirmed = window.confirm(

            "Are you sure you want to delete this food item?"

        );

        if (!confirmed) {

            return;

        }

        try {

            setError("");

            await foodItemApi.delete(id);

            setFoodItems((previous) =>

                previous.filter(

                    (item) => item.id !== id

                )

            );

        } catch (err) {

            setError(

                err?.message ||

                    "Failed to delete food item."

            );

        }

    }

    /*

    |--------------------------------------------------------------------------

    | IMAGE FALLBACK

    |--------------------------------------------------------------------------

    */

    function handleImageError(event) {

        event.currentTarget.style.display =

            "none";

    }

    /*

    |--------------------------------------------------------------------------

    | SELECT CATEGORY

    |--------------------------------------------------------------------------

    */

    function selectCategory(category) {

        setCategoryFilter(category);

        // When selecting a category,

        // remove search so the category is clearly visible.

        setSearch("");

    }

    return (

        <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-[1550px]">

                {/* =====================================================

                    PAGE HEADER

                ====================================================== */}

                <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <div className="mb-2 flex items-center gap-2">

                            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />

                            <span className="text-sm font-bold tracking-wide text-orange-600">

                                MENU MANAGEMENT

                            </span>

                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">

                            Food Items

                        </h1>

                        <p className="mt-2 text-base text-slate-500">

                            Manage your restaurant menu,

                            categories, prices and availability.

                        </p>

                    </div>

                    <button

                        type="button"

                        onClick={openAddForm}

                        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-200 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl"

                    >

                        <span className="text-xl transition-transform group-hover:rotate-90">

                            +

                        </span>

                        Add Food Item

                    </button>

                </div>

                {/* =====================================================

                    ERROR

                ====================================================== */}

                {error && (

                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 shadow-sm">

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 font-bold">

                            !

                        </span>

                        <span>{error}</span>

                    </div>

                )}

                {/* =====================================================

                    STATISTICS

                ====================================================== */}

                <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    {/* TOTAL */}

                    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">

                                    Total Menu Items

                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">

                                    {totalItems}

                                </p>

                                <p className="mt-1 text-xs text-slate-400">

                                    Items in your menu

                                </p>

                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">

                                🍽️

                            </div>

                        </div>

                    </div>

                    {/* AVAILABLE */}

                    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">

                                    Available

                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-600">

                                    {availableItems}

                                </p>

                                <p className="mt-1 text-xs text-slate-400">

                                    Currently available

                                </p>

                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl text-green-600">

                                ✓

                            </div>

                        </div>

                    </div>

                    {/* UNAVAILABLE */}

                    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:col-span-2 xl:col-span-1">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">

                                    Unavailable

                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-500">

                                    {unavailableItems}

                                </p>

                                <p className="mt-1 text-xs text-slate-400">

                                    Currently unavailable

                                </p>

                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500">

                                ×

                            </div>

                        </div>

                    </div>

                </div>

                {/* =====================================================

                    RESTAURANT MENU CATEGORY SECTION

                ====================================================== */}

                <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    {/* CATEGORY HEADER */}

                    <div className="border-b border-slate-100 px-5 py-5 sm:px-7">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <div className="flex items-center gap-2">

                                    <span className="text-xl">

                                        📖

                                    </span>

                                    <h2 className="text-xl font-bold text-slate-900">

                                        Menu Categories

                                    </h2>

                                </div>

                                <p className="mt-1 text-sm text-slate-500">

                                    Browse your menu by category

                                </p>

                            </div>

                            <div className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600">

                                {allCategories.length} Categories

                            </div>

                        </div>

                    </div>

                    {/* CATEGORY CARDS */}

                    <div className="overflow-x-auto p-5 sm:p-6">

                        <div className="flex min-w-max gap-4">

                            {/* ALL MENU */}

                            <button

                                type="button"

                                onClick={() =>

                                    selectCategory("ALL")

                                }

                                className={`group relative w-44 overflow-hidden rounded-2xl border p-4 text-left transition duration-200 ${

                                    categoryFilter ===

                                    "ALL"

                                        ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"

                                        : "border-slate-200 bg-slate-50 hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-md"

                                }`}

                            >

                                <div className="mb-4 flex items-center justify-between">

                                    <div

                                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${

                                            categoryFilter ===

                                            "ALL"

                                                ? "bg-orange-500 text-white"

                                                : "bg-white shadow-sm"

                                        }`}

                                    >

                                        🍽️

                                    </div>

                                    <span

                                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${

                                            categoryFilter ===

                                            "ALL"

                                                ? "bg-orange-500 text-white"

                                                : "bg-white text-slate-500"

                                        }`}

                                    >

                                        {totalItems}

                                    </span>

                                </div>

                                <h3 className="font-bold text-slate-900">

                                    All Menu

                                </h3>

                                <p className="mt-1 text-xs text-slate-500">

                                    View everything

                                </p>

                                {categoryFilter ===

                                    "ALL" && (

                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-orange-500" />

                                )}

                            </button>

                            {/* STANDARD MENU CATEGORIES */}

                            {MENU_CATEGORIES.map(

                                (category) => {

                                    const count =

                                        getCategoryCount(

                                            category.name

                                        );

                                    const active =

                                        categoryFilter.toLowerCase() ===

                                        category.name.toLowerCase();

                                    return (

                                        <button

                                            key={

                                                category.name

                                            }

                                            type="button"

                                            onClick={() =>

                                                selectCategory(

                                                    category.name

                                                )

                                            }

                                            className={`group relative w-44 overflow-hidden rounded-2xl border p-4 text-left transition duration-200 ${

                                                active

                                                    ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"

                                                    : "border-slate-200 bg-slate-50 hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-md"

                                            }`}

                                        >

                                            <div className="mb-4 flex items-center justify-between">

                                                <div

                                                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${

                                                        active

                                                            ? "bg-orange-500 text-white"

                                                            : "bg-white shadow-sm"

                                                    }`}

                                                >

                                                    {

                                                        category.icon

                                                    }

                                                </div>

                                                <span

                                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${

                                                        active

                                                            ? "bg-orange-500 text-white"

                                                            : "bg-white text-slate-500"

                                                    }`}

                                                >

                                                    {count}

                                                </span>

                                            </div>

                                            <h3 className="font-bold text-slate-900">

                                                {

                                                    category.name

                                                }

                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">

                                                {

                                                    category.description

                                                }

                                            </p>

                                            {active && (

                                                <div className="absolute bottom-0 left-0 h-1 w-full bg-orange-500" />

                                            )}

                                        </button>

                                    );

                                }

                            )}

                            {/* CUSTOM CATEGORIES */}

                            {databaseCategories

                                .filter(

                                    (databaseCategory) =>

                                        !MENU_CATEGORIES.some(

                                            (menuCategory) =>

                                                menuCategory.name.toLowerCase() ===

                                                databaseCategory.toLowerCase()

                                        )

                                )

                                .map(

                                    (

                                        category

                                    ) => {

                                        const active =

                                            categoryFilter.toLowerCase() ===

                                            category.toLowerCase();

                                        return (

                                            <button

                                                key={

                                                    category

                                                }

                                                type="button"

                                                onClick={() =>

                                                    selectCategory(

                                                        category

                                                    )

                                                }

                                                className={`group relative w-44 overflow-hidden rounded-2xl border p-4 text-left transition duration-200 ${

                                                    active

                                                        ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"

                                                        : "border-slate-200 bg-slate-50 hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-md"

                                                }`}

                                            >

                                                <div className="mb-4 flex items-center justify-between">

                                                    <div

                                                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${

                                                            active

                                                                ? "bg-orange-500 text-white"

                                                                : "bg-white shadow-sm"

                                                        }`}

                                                    >

                                                        🍴

                                                    </div>

                                                    <span

                                                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${

                                                            active

                                                                ? "bg-orange-500 text-white"

                                                                : "bg-white text-slate-500"

                                                        }`}

                                                    >

                                                        {getCategoryCount(

                                                            category

                                                        )}

                                                    </span>

                                                </div>

                                                <h3 className="truncate font-bold text-slate-900">

                                                    {category}

                                                </h3>

                                                <p className="mt-1 text-xs text-slate-500">

                                                    Custom menu category

                                                </p>

                                                {active && (

                                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-orange-500" />

                                                )}

                                            </button>

                                        );

                                    }

                                )}

                        </div>

                    </div>

                </div>

                {/* =====================================================

                    SEARCH / FILTER

                ====================================================== */}

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                    <div className="flex flex-col gap-3 lg:flex-row">

                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">

                                🔎

                            </span>

                            <input

                                type="text"

                                value={search}

                                onChange={(event) =>

                                    setSearch(

                                        event.target.value

                                    )

                                }

                                placeholder="Search food items..."

                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"

                            />

                        </div>

                        {/* CATEGORY SELECT */}

                        <select

                            value={

                                categoryFilter

                            }

                            onChange={(event) =>

                                setCategoryFilter(

                                    event.target.value

                                )

                            }

                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 lg:w-60"

                        >

                            <option value="ALL">

                                🍽️ All Categories

                            </option>

                            {allCategories.map(

                                (category) => (

                                    <option

                                        key={category}

                                        value={category}

                                    >

                                        {category}

                                    </option>

                                )

                            )}

                        </select>

                        {/* RESULT */}

                        <div className="flex items-center justify-center rounded-xl bg-orange-50 px-5 py-3 text-sm font-bold text-orange-600">

                            {filteredItems.length}{" "}

                            {filteredItems.length ===

                            1

                                ? "Item"

                                : "Items"}

                        </div>

                    </div>

                </div>

                {/* =====================================================

                    CURRENT CATEGORY

                ====================================================== */}

                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                    <div>

                        <p className="text-sm font-semibold text-slate-400">

                            CURRENT MENU

                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-slate-900">

                            {categoryFilter ===

                            "ALL"

                                ? "All Food Items"

                                : categoryFilter}

                        </h2>

                    </div>

                    {categoryFilter !==

                        "ALL" && (

                        <button

                            type="button"

                            onClick={() =>

                                selectCategory(

                                    "ALL"

                                )

                            }

                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"

                        >

                            ← View All Menu

                        </button>

                    )}

                </div>

                {/* =====================================================

                    FOOD GRID

                ====================================================== */}

                {loading ? (

                    <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">

                        <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-orange-50 text-2xl">

                            🍔

                        </div>

                        <p className="font-semibold text-slate-700">

                            Loading menu...

                        </p>

                        <p className="mt-1 text-sm text-slate-400">

                            Please wait a moment.

                        </p>

                    </div>

                ) : filteredItems.length ===

                  0 ? (

                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">

                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-4xl">

                            🍽️

                        </div>

                        <h2 className="text-xl font-bold text-slate-800">

                            No food items found

                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">

                            {search ||

                            categoryFilter !==

                                "ALL"

                                ? "Try changing your search or category filter."

                                : "Start building your menu by adding your first food item."}

                        </p>

                        {!search &&

                            categoryFilter ===

                                "ALL" && (

                                <button

                                    type="button"

                                    onClick={

                                        openAddForm

                                    }

                                    className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-orange-600"

                                >

                                    + Add First Food Item

                                </button>

                            )}

                    </div>

                ) : (

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                        {filteredItems.map(

                            (item) => (

                                <div

                                    key={

                                        item.id

                                    }

                                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"

                                >

                                    {/* IMAGE */}

                                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-orange-50 to-slate-100">

                                        {item.imageUrl ? (

                                            <img

                                                src={

                                                    item.imageUrl

                                                }

                                                alt={

                                                    item.name

                                                }

                                                onError={

                                                    handleImageError

                                                }

                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"

                                            />

                                        ) : (

                                            <div className="flex h-full items-center justify-center text-6xl">

                                                🍔

                                            </div>

                                        )}

                                        {/* TOP BADGES */}

                                        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">

                                            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">

                                                #

                                                {

                                                    item.id

                                                }

                                            </span>

                                            <span

                                                className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${

                                                    item.available

                                                        ? "bg-green-100 text-green-700"

                                                        : "bg-red-100 text-red-700"

                                                }`}

                                            >

                                                {item.available

                                                    ? "● Available"

                                                    : "● Unavailable"}

                                            </span>

                                        </div>

                                    </div>

                                    {/* CONTENT */}

                                    <div className="p-5">

                                        <div className="mb-3 flex items-start justify-between gap-3">

                                            <div className="min-w-0">

                                                <h2 className="truncate text-lg font-bold text-slate-900">

                                                    {

                                                        item.name

                                                    }

                                                </h2>

                                                <span className="mt-1 inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">

                                                    🍴

                                                    {

                                                        item.category

                                                    }

                                                </span>

                                            </div>

                                            <p className="shrink-0 text-lg font-bold text-orange-600">

                                                ₹

                                                {Number(

                                                    item.price ||

                                                        0

                                                ).toFixed(

                                                    2

                                                )}

                                            </p>

                                        </div>

                                        <p className="mb-5 min-h-[42px] line-clamp-2 text-sm leading-5 text-slate-500">

                                            {

                                                item.description

                                            }

                                        </p>

                                        {/* ACTIONS */}

                                        <div className="flex gap-2 border-t border-slate-100 pt-4">

                                            <button

                                                type="button"

                                                onClick={() =>

                                                    openEditForm(

                                                        item

                                                    )

                                                }

                                                className="flex-1 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"

                                            >

                                                ✏️ Edit

                                            </button>

                                            {isAdmin && (

                                            <button

                                                type="button"

                                                onClick={() =>

                                                    handleDelete(

                                                        item.id

                                                    )

                                                }

                                                className="flex-1 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"

                                            >

                                                🗑️ Delete

                                            </button>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            )

                        )}

                    </div>

                )}

                {/* =====================================================

                    ADD / EDIT MODAL

                ====================================================== */}

                {showForm && (

                    <div

                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"

                        onMouseDown={(event) => {

                            if (

                                event.target ===

                                event.currentTarget

                            ) {

                                closeForm();

                            }

                        }}

                    >

                        <div className="my-6 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white shadow-2xl">

                            {/* MODAL HEADER */}

                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 sm:px-7">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">

                                        🍔

                                    </div>

                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">

                                            {editingItem

                                                ? "Edit Food Item"

                                                : "Add Food Item"}

                                        </h2>

                                        <p className="mt-0.5 text-sm text-slate-500">

                                            {editingItem

                                                ? "Update your menu item details."

                                                : "Add a new item to your restaurant menu."}

                                        </p>

                                    </div>

                                </div>

                                <button

                                    type="button"

                                    onClick={

                                        closeForm

                                    }

                                    disabled={

                                        saving

                                    }

                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"

                                >

                                    ×

                                </button>

                            </div>

                            {/* FORM */}

                            <form

                                onSubmit={

                                    handleSubmit

                                }

                                className="space-y-5 p-6 sm:p-7"

                            >

                                {error && (

                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                                        {error}

                                    </div>

                                )}

                                {/* FOOD NAME */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                                        Food Name

                                        <span className="ml-1 text-red-500">

                                            *

                                        </span>

                                    </label>

                                    <input

                                        type="text"

                                        name="name"

                                        value={

                                            formData.name

                                        }

                                        onChange={

                                            handleChange

                                        }

                                        placeholder="e.g. Chicken Biryani"

                                        required

                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"

                                    />

                                </div>

                                {/* CATEGORY + PRICE */}

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">

                                            Category

                                            <span className="ml-1 text-red-500">

                                                *

                                            </span>

                                        </label>

                                        <select

                                            name="category"

                                            value={

                                                formData.category

                                            }

                                            onChange={

                                                handleChange

                                            }

                                            required

                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"

                                        >

                                            <option value="">

                                                Select category

                                            </option>

                                            {allCategories.map(

                                                (

                                                    category

                                                ) => (

                                                    <option

                                                        key={

                                                            category

                                                        }

                                                        value={

                                                            category

                                                        }

                                                    >

                                                        {

                                                            category

                                                        }

                                                    </option>

                                                )

                                            )}

                                        </select>

                                    </div>

                                    <div>

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">

                                            Price

                                            <span className="ml-1 text-red-500">

                                                *

                                            </span>

                                        </label>

                                        <div className="relative">

                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-orange-600">

                                                ₹

                                            </span>

                                            <input

                                                type="number"

                                                name="price"

                                                value={

                                                    formData.price

                                                }

                                                onChange={

                                                    handleChange

                                                }

                                                min="0.01"

                                                step="0.01"

                                                placeholder="299.00"

                                                required

                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"

                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* DESCRIPTION */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                                        Description

                                        <span className="ml-1 text-red-500">

                                            *

                                        </span>

                                    </label>

                                    <textarea

                                        name="description"

                                        value={

                                            formData.description

                                        }

                                        onChange={

                                            handleChange

                                        }

                                        rows="4"

                                        required

                                        placeholder="Describe the food item..."

                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"

                                    />

                                </div>

                                {/* IMAGE URL */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                                        Image URL

                                    </label>

                                    <input

                                        type="url"

                                        name="imageUrl"

                                        value={

                                            formData.imageUrl

                                        }

                                        onChange={

                                            handleChange

                                        }

                                        placeholder="https://example.com/food.jpg"

                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"

                                    />

                                </div>

                                {/* AVAILABILITY */}

                                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50/40">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">

                                            ✓

                                        </div>

                                        <div>

                                            <p className="text-sm font-semibold text-slate-800">

                                                Item Available

                                            </p>

                                            <p className="text-xs text-slate-500">

                                                Customers can order this item

                                            </p>

                                        </div>

                                    </div>

                                    <input

                                        type="checkbox"

                                        name="available"

                                        checked={

                                            formData.available

                                        }

                                        onChange={

                                            handleChange

                                        }

                                        className="h-5 w-5 accent-orange-500"

                                    />

                                </label>

                                {/* BUTTONS */}

                                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                                    <button

                                        type="button"

                                        onClick={

                                            closeForm

                                        }

                                        disabled={

                                            saving

                                        }

                                        className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"

                                    >

                                        Cancel

                                    </button>

                                    <button

                                        type="submit"

                                        disabled={

                                            saving

                                        }

                                        className="rounded-xl bg-orange-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"

                                    >

                                        {saving

                                            ? "Saving..."

                                            : editingItem

                                            ? "Update Food Item"

                                            : "Add Food Item"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}

export default FoodItems;