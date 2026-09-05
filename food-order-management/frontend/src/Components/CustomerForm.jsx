import { useState } from "react";

function CustomerForm({
    customer,
    onSubmit,
    onCancel,
    loading = false,
}) {
    const [formData, setFormData] = useState({
        name: customer?.name ?? "",
        email: customer?.email ?? "",
        phone: customer?.phone ?? "",
        address: customer?.address ?? "",
    });

    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    }

    function validateForm() {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Customer name is required.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Please enter a valid email.";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required.";
        } else if (!/^\d{10}$/.test(formData.phone.trim())) {
            newErrors.phone = "Phone number must contain 10 digits.";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        await onSubmit({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
        });
    }

    const isEditing = Boolean(customer);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onCancel();
                }
            }}
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-6 text-white">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl shadow-sm backdrop-blur">
                                {isEditing ? "✏️" : "👤"}
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold">
                                    {isEditing
                                        ? "Edit Customer"
                                        : "Add Customer"}
                                </h2>

                                <p className="mt-1 text-sm text-orange-100">
                                    {isEditing
                                        ? "Update customer information"
                                        : "Add a new customer to your system"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>

                    <div className="max-h-[70vh] overflow-y-auto px-7 py-7">

                        <div className="grid gap-5 sm:grid-cols-2">

                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Customer Name
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                                        👤
                                    </span>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter customer name"
                                        disabled={loading}
                                        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                                            errors.name
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                                        }`}
                                    />
                                </div>

                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email Address
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                                        ✉️
                                    </span>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="customer@example.com"
                                        disabled={loading}
                                        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                                            errors.email
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                                        }`}
                                    />
                                </div>

                                {errors.email && (
                                    <p className="mt-1.5 text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Phone Number
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                                        📞
                                    </span>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        maxLength="10"
                                        disabled={loading}
                                        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                                            errors.phone
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                                        }`}
                                    />
                                </div>

                                {errors.phone && (
                                    <p className="mt-1.5 text-sm text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="address"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Address
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-4 text-lg">
                                        📍
                                    </span>

                                    <textarea
                                        id="address"
                                        name="address"
                                        rows="4"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter complete customer address"
                                        disabled={loading}
                                        className={`w-full resize-none rounded-xl border bg-slate-50 py-3.5 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                                            errors.address
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                                        }`}
                                    />
                                </div>

                                {errors.address && (
                                    <p className="mt-1.5 text-sm text-red-500">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-7 py-5 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    {isEditing
                                        ? "Updating..."
                                        : "Creating..."}
                                </span>
                            ) : (
                                <span>
                                    {isEditing
                                        ? "✓ Update Customer"
                                        : "+ Create Customer"}
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CustomerForm;