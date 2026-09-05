import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  customerApi,
  foodItemApi,
  orderApi,
} from "../services/api";

const initialStats = {
  customers: 0,
  foodItems: 0,
  orders: 0,
  revenue: 0,
};

function Dashboard() {
  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [customers, foodItems, orders] = await Promise.all([
        customerApi.getAll(),
        foodItemApi.getAll(),
        orderApi.getAll(),
      ]);

      const customerList = Array.isArray(customers)
        ? customers
        : [];

      const foodItemList = Array.isArray(foodItems)
        ? foodItems
        : [];

      const orderList = Array.isArray(orders)
        ? orders
        : [];

      const revenue = orderList
        .filter(
          (order) =>
            String(order.status || "").toUpperCase() !==
            "CANCELLED",
        )
        .reduce(
          (total, order) =>
            total + Number(order.totalAmount || 0),
          0,
        );

      const sortedOrders = [...orderList].sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0),
      );

      setStats({
        customers: customerList.length,
        foodItems: foodItemList.length,
        orders: orderList.length,
        revenue,
      });

      setAllOrders(orderList);
      setRecentOrders(sortedOrders.slice(0, 5));
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    return () => {};
  }, [loadDashboardData]);

  /* =========================================================
     DERIVED ORDER STATISTICS
  ========================================================= */

  const orderStats = useMemo(() => {
    const counts = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    allOrders.forEach((order) => {
      const status = String(
        order.status || "",
      ).toUpperCase();

      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    const activeOrders =
      allOrders.length -
      counts.DELIVERED -
      counts.CANCELLED;

    const completedOrders = counts.DELIVERED;

    const cancelledOrders = counts.CANCELLED;

    const nonCancelledOrders =
      allOrders.length - cancelledOrders;

    const averageOrderValue =
      nonCancelledOrders > 0
        ? stats.revenue / nonCancelledOrders
        : 0;

    const cancellationRate =
      allOrders.length > 0
        ? (cancelledOrders / allOrders.length) * 100
        : 0;

    return {
      counts,
      activeOrders,
      completedOrders,
      cancelledOrders,
      averageOrderValue,
      cancellationRate,
    };
  }, [allOrders, stats.revenue]);

  /* =========================================================
     MAIN STAT CARDS
  ========================================================= */

  const cards = useMemo(
    () => [
      {
        title: "Customers",
        value: stats.customers,
        description: "Registered customers",
        icon: "👥",
        path: "/customers",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        accent: "bg-blue-500",
      },
      {
        title: "Food Items",
        value: stats.foodItems,
        description: "Items available in menu",
        icon: "🍔",
        path: "/food-items",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        accent: "bg-orange-500",
      },
      {
        title: "Total Orders",
        value: stats.orders,
        description: "Orders received",
        icon: "🛒",
        path: "/orders",
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
        accent: "bg-violet-500",
      },
      {
        title: "Revenue",
        value: `₹${stats.revenue.toFixed(2)}`,
        description: "From non-cancelled orders",
        icon: "💰",
        path: "/orders",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        accent: "bg-emerald-500",
      },
    ],
    [stats],
  );

  /* =========================================================
     STATUS CONFIG
  ========================================================= */

  const statusItems = [
    {
      key: "PENDING",
      label: "Pending",
      dot: "bg-slate-400",
      bar: "bg-slate-400",
    },
    {
      key: "CONFIRMED",
      label: "Confirmed",
      dot: "bg-blue-500",
      bar: "bg-blue-500",
    },
    {
      key: "PREPARING",
      label: "Preparing",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
    },
    {
      key: "OUT_FOR_DELIVERY",
      label: "Out for delivery",
      dot: "bg-violet-500",
      bar: "bg-violet-500",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
    },
    {
      key: "CANCELLED",
      label: "Cancelled",
      dot: "bg-red-500",
      bar: "bg-red-500",
    },
  ];

  /* =========================================================
     HELPERS
  ========================================================= */

  function getStatusClasses(status) {
    const normalized = String(status || "")
      .toUpperCase();

    switch (normalized) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";

      case "PREPARING":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

      case "OUT_FOR_DELIVERY":
        return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";

      case "PENDING":
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }
  }

  function formatStatus(status) {
    if (!status) {
      return "UNKNOWN";
    }

    return String(status)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatMoney(value) {
    return `₹${Number(value || 0).toFixed(2)}`;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-6 shadow-xl sm:p-8">

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="absolute left-1/2 top-0 h-full w-px bg-white/[0.03]" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-orange-200 backdrop-blur">

              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              Restaurant Admin Panel

            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Monitor your restaurant activity, orders,
              customers and revenue from one place.
            </p>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-xl">
                ⚡
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  System Status
                </p>

                <p className="mt-0.5 text-sm font-bold text-white">
                  {error
                    ? "Connection issue"
                    : "All systems operational"}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh Dashboard"}
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">

          <span className="text-lg">
            ⚠️
          </span>

          <div className="flex-1">

            <p className="font-bold">
              Unable to load dashboard
            </p>

            <p className="mt-1 text-red-600">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-100"
          >
            Retry
          </button>

        </div>
      )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.path}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >

            <div
              className={`absolute inset-x-0 top-0 h-1 ${card.accent}`}
            />

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <p className="text-sm font-bold text-slate-500">
                  {card.title}
                </p>

                <p
                  className={`mt-3 ${
                    card.title === "Revenue"
                      ? "text-2xl sm:text-3xl"
                      : "text-3xl"
                  } truncate font-black tracking-tight text-slate-900`}
                >
                  {loading ? "..." : card.value}
                </p>

                <p className="mt-2 text-xs font-medium text-slate-400">
                  {card.description}
                </p>

              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBg} ${card.iconColor} text-2xl transition duration-300 group-hover:scale-110`}
              >
                {card.icon}
              </div>

            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

              <span className="text-xs font-bold text-slate-400">
                View details
              </span>

              <span className="font-black text-orange-500 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>

            </div>

          </Link>
        ))}

      </section>

      {/* =====================================================
          PERFORMANCE SNAPSHOT
      ===================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-xl font-black text-slate-900">
            Performance Snapshot
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A quick look at your restaurant's current activity.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                🔥
              </div>

              <span className="text-xs font-bold text-orange-500">
                LIVE
              </span>

            </div>

            <p className="mt-5 text-sm font-bold text-slate-500">
              Active Orders
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {loading ? "..." : orderStats.activeOrders}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
              ✓
            </div>

            <p className="mt-5 text-sm font-bold text-slate-500">
              Completed Orders
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {loading
                ? "..."
                : orderStats.completedOrders}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              ₹
            </div>

            <p className="mt-5 text-sm font-bold text-slate-500">
              Average Order Value
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {loading
                ? "..."
                : formatMoney(
                    orderStats.averageOrderValue,
                  )}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
              ↘
            </div>

            <p className="mt-5 text-sm font-bold text-slate-500">
              Cancellation Rate
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {loading
                ? "..."
                : `${orderStats.cancellationRate.toFixed(1)}%`}
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          ORDER OVERVIEW + QUICK ACTIONS
      ===================================================== */}

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">

        {/* ORDER STATUS */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-lg">
                  📊
                </div>

                <h2 className="text-lg font-black text-slate-900">
                  Order Overview
                </h2>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                Current distribution of all orders.
              </p>

            </div>

            <Link
              to="/orders"
              className="font-bold text-orange-500 transition hover:text-orange-700"
            >
              Manage Orders →
            </Link>

          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            {statusItems.map((item) => {
              const count =
                orderStats.counts[item.key];

              const percentage =
                stats.orders > 0
                  ? (count / stats.orders) * 100
                  : 0;

              return (
                <div
                  key={item.key}
                  className="rounded-2xl bg-slate-50 p-4"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2">

                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
                      />

                      <span className="text-sm font-bold text-slate-700">
                        {item.label}
                      </span>

                    </div>

                    <span className="text-sm font-black text-slate-900">
                      {loading ? "—" : count}
                    </span>

                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className={`h-full rounded-full ${item.bar} transition-all duration-500`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-[11px] font-medium text-slate-400">
                    {loading
                      ? "Loading..."
                      : `${percentage.toFixed(0)}% of total orders`}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-lg">
                ⚡
              </div>

              <h2 className="text-lg font-black text-slate-900">
                Quick Actions
              </h2>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Jump directly to common tasks.
            </p>

          </div>

          <div className="mt-5 space-y-3">

            <Link
              to="/customers"
              className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                👥
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">
                  Manage Customers
                </p>
                <p className="text-xs text-slate-400">
                  View registered customers
                </p>
              </div>

              <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                →
              </span>

            </Link>

            <Link
              to="/food-items"
              className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:border-orange-200 hover:bg-orange-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                🍔
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">
                  Manage Menu
                </p>
                <p className="text-xs text-slate-400">
                  Update food items
                </p>
              </div>

              <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500">
                →
              </span>

            </Link>

            <Link
              to="/orders"
              className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:border-violet-200 hover:bg-violet-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                🛒
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">
                  Manage Orders
                </p>
                <p className="text-xs text-slate-400">
                  Track customer orders
                </p>
              </div>

              <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500">
                →
              </span>

            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          RECENT ORDERS
      ===================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-lg">
                🛒
              </div>

              <h2 className="text-lg font-black text-slate-900">
                Recent Orders
              </h2>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              The latest orders received by your restaurant.
            </p>

          </div>

          <Link
            to="/orders"
            className="inline-flex items-center justify-center rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-100"
          >
            View All Orders
            <span className="ml-2">
              →
            </span>
          </Link>

        </div>

        {loading ? (
          <div className="space-y-3 p-5 sm:p-6">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl bg-slate-50 p-5"
              >
                <div className="flex items-center gap-4">

                  <div className="h-11 w-11 rounded-xl bg-slate-200" />

                  <div className="flex-1 space-y-2">

                    <div className="h-3 w-32 rounded bg-slate-200" />

                    <div className="h-3 w-48 rounded bg-slate-200" />

                  </div>

                  <div className="h-8 w-20 rounded-full bg-slate-200" />

                </div>
              </div>
            ))}

          </div>
        ) : recentOrders.length === 0 ? (

          <div className="px-6 py-14 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🛒
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              No orders yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              New customer orders will appear here.
            </p>

          </div>

        ) : (

          <>
            {/* DESKTOP */}

            <div className="hidden overflow-x-auto md:block">

              <table className="min-w-full">

                <thead className="bg-slate-50">

                  <tr className="text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-400">

                    <th className="px-6 py-4">
                      Order
                    </th>

                    <th className="px-6 py-4">
                      Customer
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group transition hover:bg-orange-50/40"
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600 transition group-hover:bg-orange-100 group-hover:text-orange-600">
                            #{order.id}
                          </div>

                          <div>

                            <p className="font-bold text-slate-800">
                              Order #{order.id}
                            </p>

                            <p className="text-xs text-slate-400">
                              {order.orderItems?.length || 0}{" "}
                              item
                              {(order.orderItems?.length || 0) !==
                              1
                                ? "s"
                                : ""}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <p className="font-semibold text-slate-700">
                          {order.customer?.name ||
                            "Unknown Customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {order.customer?.email ||
                            "No email"}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">

                        <span className="font-black text-slate-800">
                          {formatMoney(
                            order.totalAmount,
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${getStatusClasses(
                            order.status,
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-right">

                        <Link
                          to="/orders"
                          className="font-bold text-orange-500 transition hover:text-orange-700"
                        >
                          View →
                        </Link>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {/* MOBILE */}

            <div className="space-y-3 p-4 md:hidden">

              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-700 shadow-sm">
                        #{order.id}
                      </div>

                      <div>

                        <p className="font-bold text-slate-800">
                          {order.customer?.name ||
                            "Unknown Customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(order.createdAt)}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${getStatusClasses(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">

                    <span className="text-xs font-medium text-slate-400">
                      Order Amount
                    </span>

                    <span className="font-black text-slate-800">
                      {formatMoney(
                        order.totalAmount,
                      )}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          </>
        )}

      </section>

      {/* =====================================================
          DASHBOARD FOOTER INFO
      ===================================================== */}

      <div className="flex flex-col items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-400 sm:flex-row">

        <p>
          Food Order Management System
        </p>

        <p>
          Dashboard updated from live API data
        </p>

      </div>

    </div>
  );
}

export default Dashboard;