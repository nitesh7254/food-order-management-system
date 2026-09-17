import { useEffect, useMemo, useState } from "react";

import CustomerForm from "../Components/CustomerForm";

import { customerApi } from "../services/api";

function Customers() {
    const userRole = localStorage.getItem("userRole");
    const isAdmin = userRole === "ADMIN";

    const [customers, setCustomers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [formLoading, setFormLoading] = useState(false);

    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingCustomer, setEditingCustomer] = useState(null);

    const [search, setSearch] = useState("");

    // =========================================================

    // LOAD CUSTOMERS

    // =========================================================

    useEffect(() => {

        let cancelled = false;

        async function fetchCustomers() {

            try {

                setLoading(true);

                setError("");

                const data = await customerApi.getAll();

                if (!cancelled) {

                    setCustomers(

                        Array.isArray(data) ? data : [],

                    );

                }

            } catch (err) {

                if (!cancelled) {

                    setError(

                        err?.message ||

                            "Failed to load customers.",

                    );

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }

        fetchCustomers();

        return () => {

            cancelled = true;

        };

    }, []);

    // =========================================================

    // RELOAD CUSTOMERS

    // =========================================================

    async function loadCustomers() {

        try {

            setLoading(true);

            setError("");

            const data = await customerApi.getAll();

            setCustomers(

                Array.isArray(data) ? data : [],

            );

        } catch (err) {

            setError(

                err?.message ||

                    "Failed to load customers.",

            );

        } finally {

            setLoading(false);

        }

    }

    // =========================================================

    // SEARCH

    // =========================================================

    const filteredCustomers = useMemo(() => {

        const query = search.trim().toLowerCase();

        if (!query) {

            return customers;

        }

        return customers.filter((customer) => {

            const name =

                customer?.name?.toLowerCase() || "";

            const email =

                customer?.email?.toLowerCase() || "";

            const phone =

                customer?.phone?.toString() || "";

            const address =

                customer?.address?.toLowerCase() || "";

            return (

                name.includes(query) ||

                email.includes(query) ||

                phone.includes(query) ||

                address.includes(query)

            );

        });

    }, [customers, search]);

    // =========================================================

    // ADD CUSTOMER

    // =========================================================

    function handleAdd() {

        setEditingCustomer(null);

        setError("");

        setSuccess("");

        setShowForm(true);

    }

    // =========================================================

    // EDIT CUSTOMER

    // =========================================================

    function handleEdit(customer) {

        setEditingCustomer(customer);

        setError("");

        setSuccess("");

        setShowForm(true);

    }

    // =========================================================

    // CLOSE FORM

    // =========================================================

    function handleCancel() {

        if (formLoading) {

            return;

        }

        setShowForm(false);

        setEditingCustomer(null);

    }

    // =========================================================

    // CREATE / UPDATE CUSTOMER

    // =========================================================

    async function handleSubmit(formData) {

        try {

            setFormLoading(true);

            setError("");

            setSuccess("");

            if (editingCustomer) {

                await customerApi.update(

                    editingCustomer.id,

                    formData,

                );

                setSuccess(

                    "Customer updated successfully.",

                );

            } else {

                await customerApi.create(formData);

                setSuccess(

                    "Customer added successfully.",

                );

            }

            setShowForm(false);

            setEditingCustomer(null);

            await loadCustomers();

        } catch (err) {

            setError(

                err?.message ||

                    "Failed to save customer.",

            );

        } finally {

            setFormLoading(false);

        }

    }

    // =========================================================

    // DELETE CUSTOMER

    // =========================================================

    async function handleDelete(id) {

        const customer = customers.find(

            (item) => item.id === id,

        );

        const customerName =

            customer?.name || "this customer";

        const confirmed = window.confirm(

            `Are you sure you want to delete ${customerName}?`,

        );

        if (!confirmed) {

            return;

        }

        try {

            setDeleteLoadingId(id);

            setError("");

            setSuccess("");

            await customerApi.delete(id);

            setCustomers((previousCustomers) =>

                previousCustomers.filter(

                    (item) => item.id !== id,

                ),

            );

            setSuccess(

                `${customerName} deleted successfully.`,

            );

        } catch (err) {

            const message =

                err?.message ||

                "Failed to delete customer.";

            /*

             * A customer cannot be deleted when an order

             * still references that customer.

             *

             * The backend/database must handle that

             * relationship before deletion can succeed.

             */

            if (

                message.toLowerCase().includes("referenced") ||

                message.toLowerCase().includes("foreign key") ||

                message.toLowerCase().includes("orders") ||

                message.toLowerCase().includes("still referenced")

            ) {

                setError(

                    "This customer cannot be deleted because existing orders are linked to this customer. Delete or reassign those orders first.",

                );

            } else {

                setError(message);

            }

        } finally {

            setDeleteLoadingId(null);

        }

    }

    // =========================================================

    // CLEAR SEARCH

    // =========================================================

    function handleClearSearch() {

        setSearch("");

    }

    // =========================================================

    // UI

    // =========================================================

    return (

        <div className="min-h-full bg-slate-100 px-5 py-6 sm:px-7 lg:px-8">

            <div className="mx-auto max-w-[1700px] space-y-6">

                {/* =====================================================

                    PAGE HERO

                ====================================================== */}

                <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-orange-50 blur-3xl" />

                    <div className="relative flex flex-col gap-6 p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">

                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">

                                    👥

                                </span>

                                Customer Management

                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">

                                Customers

                            </h1>

                            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">

                                Manage your customers,

                                contact information and

                                addresses from one organized

                                place.

                            </p>

                        </div>

                        <button

                            type="button"

                            onClick={handleAdd}

                            className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 font-bold text-white shadow-lg shadow-orange-200 transition duration-200 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-xl active:translate-y-0"

                        >

                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-xl transition group-hover:rotate-90">

                                +

                            </span>

                            Add Customer

                        </button>

                    </div>

                </section>

                {/* =====================================================

                    SUCCESS MESSAGE

                ====================================================== */}

                {success && (

                    <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">

                                ✓

                            </div>

                            <div>

                                <p className="font-bold text-emerald-800">

                                    Success

                                </p>

                                <p className="mt-1 text-sm text-emerald-700">

                                    {success}

                                </p>

                            </div>

                        </div>

                        <button

                            type="button"

                            onClick={() => setSuccess("")}

                            className="rounded-lg px-2 py-1 text-xl font-bold text-emerald-400 transition hover:bg-emerald-100 hover:text-emerald-600"

                        >

                            ×

                        </button>

                    </div>

                )}

                {/* =====================================================

                    ERROR MESSAGE

                ====================================================== */}

                {error && (

                    <div

                        role="alert"

                        className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm"

                    >

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg">

                                ⚠️

                            </div>

                            <div>

                                <p className="font-bold text-red-800">

                                    Something went wrong

                                </p>

                                <p className="mt-1 text-sm leading-6 text-red-700">

                                    {error}

                                </p>

                            </div>

                        </div>

                        <button

                            type="button"

                            onClick={() => setError("")}

                            className="rounded-lg px-2 py-1 text-xl font-bold text-red-400 transition hover:bg-red-100 hover:text-red-600"

                        >

                            ×

                        </button>

                    </div>

                )}

                {/* =====================================================

                    STAT CARDS

                ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    {/* TOTAL CUSTOMERS */}

                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-50 transition group-hover:scale-125" />

                        <div className="relative flex items-center justify-between">

                            <div>

                                <p className="text-sm font-semibold text-slate-500">

                                    Total Customers

                                </p>

                                <p className="mt-2 text-4xl font-extrabold text-slate-900">

                                    {loading

                                        ? "..."

                                        : customers.length}

                                </p>

                                <p className="mt-2 text-sm text-slate-400">

                                    Registered customers

                                </p>

                            </div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl shadow-sm">

                                👥

                            </div>

                        </div>

                    </div>

                    {/* SEARCH RESULTS */}

                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-50 transition group-hover:scale-125" />

                        <div className="relative flex items-center justify-between">

                            <div>

                                <p className="text-sm font-semibold text-slate-500">

                                    Showing

                                </p>

                                <p className="mt-2 text-4xl font-extrabold text-slate-900">

                                    {loading

                                        ? "..."

                                        : filteredCustomers.length}

                                </p>

                                <p className="mt-2 text-sm text-slate-400">

                                    Matching customers

                                </p>

                            </div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-sm">

                                🔎

                            </div>

                        </div>

                    </div>

                    {/* QUICK ACTION */}

                    <button

                        type="button"

                        onClick={handleAdd}

                        className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-left text-white shadow-lg shadow-orange-100 transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:col-span-2 xl:col-span-1"

                    >

                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-125" />

                        <div className="relative flex items-center justify-between">

                            <div>

                                <p className="text-sm font-semibold text-orange-100">

                                    Quick Action

                                </p>

                                <p className="mt-2 text-xl font-extrabold">

                                    Add a new customer

                                </p>

                                <p className="mt-2 text-sm text-orange-100">

                                    Create a customer profile

                                    in seconds.

                                </p>

                            </div>

                            <span className="ml-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">

                                +

                            </span>

                        </div>

                    </button>

                </div>

                {/* =====================================================

                    CUSTOMER LIST

                ====================================================== */}

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    {/* LIST HEADER */}

                    <div className="border-b border-slate-200 p-6 sm:p-7">

                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                            <div>

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">

                                        📋

                                    </div>

                                    <div>

                                        <h2 className="text-xl font-extrabold text-slate-900">

                                            Customer List

                                        </h2>

                                        <p className="mt-0.5 text-sm text-slate-500">

                                            View and manage all

                                            registered customers.

                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">

                                {/* SEARCH */}

                                <div className="relative">

                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">

                                        🔎

                                    </span>

                                    <input

                                        type="text"

                                        value={search}

                                        onChange={(event) =>

                                            setSearch(

                                                event.target.value,

                                            )

                                        }

                                        placeholder="Search customers..."

                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 sm:w-72"

                                    />

                                </div>

                                <span className="inline-flex h-12 items-center justify-center rounded-xl bg-orange-50 px-4 text-sm font-bold text-orange-600">

                                    {filteredCustomers.length}{" "}

                                    {filteredCustomers.length === 1

                                        ? "Customer"

                                        : "Customers"}

                                </span>

                            </div>

                        </div>

                    </div>

                    {/* =================================================

                        LOADING

                    ================================================== */}

                    {loading ? (

                        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">

                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />

                            </div>

                            <p className="mt-5 font-semibold text-slate-700">

                                Loading customers...

                            </p>

                            <p className="mt-1 text-sm text-slate-400">

                                Please wait a moment.

                            </p>

                        </div>

                    ) : filteredCustomers.length === 0 ? (

                        /* =================================================

                           EMPTY STATE

                        ================================================== */

                        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">

                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-4xl">

                                {search ? "��" : "��"}

                            </div>

                            <h3 className="mt-6 text-xl font-extrabold text-slate-800">

                                {search

                                    ? "No customers found"

                                    : "No customers yet"}

                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">

                                {search

                                    ? "Try searching with a different name, email, phone number or address."

                                    : "Add your first customer to start managing your customer database."}

                            </p>

                            {search ? (

                                <button

                                    type="button"

                                    onClick={handleClearSearch}

                                    className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"

                                >

                                    Clear Search

                                </button>

                            ) : (

                                <button

                                    type="button"

                                    onClick={handleAdd}

                                    className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 hover:shadow-lg"

                                >

                                    + Add Customer

                                </button>

                            )}

                        </div>

                    ) : (

                        /* =================================================

                           CUSTOMER TABLE

                        ================================================== */

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1050px] text-left">

                                <thead>

                                    <tr className="border-b border-slate-200 bg-slate-50/80">

                                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">

                                            ID

                                        </th>

                                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">

                                            Customer

                                        </th>

                                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">

                                            Phone

                                        </th>

                                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">

                                            Address

                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">

                                            Actions

                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {filteredCustomers.map(

                                        (customer) => {

                                            const initial =

                                                customer?.name

                                                    ?.charAt(0)

                                                    ?.toUpperCase() ||

                                                "?";

                                            const isDeleting =

                                                deleteLoadingId ===

                                                customer.id;

                                            return (

                                                <tr

                                                    key={customer.id}

                                                    className="group transition duration-150 hover:bg-orange-50/40"

                                                >

                                                    {/* ID */}

                                                    <td className="px-6 py-6">

                                                        <span className="inline-flex min-w-12 items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-600 transition group-hover:bg-orange-100 group-hover:text-orange-600">

                                                            #

                                                            {customer.id}

                                                        </span>

                                                    </td>

                                                    {/* CUSTOMER */}

                                                    <td className="px-6 py-6">

                                                        <div className="flex items-center gap-4">

                                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-lg font-extrabold text-white shadow-sm transition duration-200 group-hover:scale-105 group-hover:shadow-md">

                                                                {initial}

                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="truncate font-extrabold text-slate-800">

                                                                    {customer.name ||

                                                                        "Unnamed Customer"}

                                                                </p>

                                                                <p className="mt-1 max-w-[260px] truncate text-sm text-slate-500">

                                                                    {customer.email ||

                                                                        "No email provided"}

                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* PHONE */}

                                                    <td className="px-6 py-6">

                                                        <div className="flex items-center gap-3">

                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base">

                                                                📞

                                                            </span>

                                                            <span className="font-semibold text-slate-700">

                                                                {customer.phone ||

                                                                    "—"}

                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* ADDRESS */}

                                                    <td className="px-6 py-6">

                                                        <div className="flex max-w-[500px] items-start gap-3">

                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-base">

                                                                📍

                                                            </span>

                                                            <span className="break-words text-sm leading-6 text-slate-600">

                                                                {customer.address ||

                                                                    "No address provided"}

                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="px-6 py-6">

                                                        <div className="flex justify-end gap-2">

                                                            {/* EDIT */}

                                                            <button

                                                                type="button"

                                                                onClick={() =>

                                                                    handleEdit(

                                                                        customer,

                                                                    )

                                                                }

                                                                disabled={

                                                                    isDeleting

                                                                }

                                                                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"

                                                            >

                                                                ✏️

                                                                Edit

                                                            </button>

                                                            {/* DELETE */}

                                                            {isAdmin && (
                                                            <button

                                                                type="button"

                                                                onClick={() =>

                                                                    handleDelete(

                                                                        customer.id,

                                                                    )

                                                                }

                                                                disabled={

                                                                    isDeleting

                                                                }

                                                                className="inline-flex min-w-[105px] items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"

                                                            >

                                                                {isDeleting ? (

                                                                    <>

                                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />

                                                                        Deleting...

                                                                    </>

                                                                ) : (

                                                                    <>

                                                                        🗑️

                                                                        Delete

                                                                    </>

                                                                )}

                                                            </button>
                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        },

                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

                {/* =====================================================

                    FOOTER INFORMATION

                ====================================================== */}

                <div className="flex flex-col gap-2 pb-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                    <span>

                        Showing{" "}

                        <strong className="text-slate-600">

                            {filteredCustomers.length}

                        </strong>{" "}

                        of{" "}

                        <strong className="text-slate-600">

                            {customers.length}

                        </strong>{" "}

                        customers

                    </span>

                    <span>

                        Food Order Management System

                    </span>

                </div>

            </div>

            {/* =========================================================

                CUSTOMER FORM MODAL

            ========================================================== */}

            {showForm && (

                <CustomerForm

                    customer={editingCustomer}

                    onSubmit={handleSubmit}

                    onCancel={handleCancel}

                    loading={formLoading}

                />

            )}

        </div>

    );

}

export default Customers;