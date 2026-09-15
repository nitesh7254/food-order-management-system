import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        // Basic validation
        if (!email.trim() || !password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Invalid email or password.");
            }

            const data = await response.json();

            // =========================
            // SAVE LOGIN INFORMATION
            // =========================

            localStorage.setItem("token", data.token);
            localStorage.setItem("userEmail", data.email);
            localStorage.setItem("userRole", data.role);

            // =========================
            // REDIRECT TO DASHBOARD
            // =========================

            navigate("/dashboard");

        } catch (err) {
            setError(
                err.message || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">

            <div className="w-full max-w-md">

                {/* =========================
                    LOGIN HEADER
                ========================== */}

                <div className="mb-8 text-center">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl shadow-lg">
                        🍔
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Food Order Management
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to your account
                    </p>

                </div>

                {/* =========================
                    LOGIN CARD
                ========================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">

                    <div className="mb-7">

                        <h2 className="text-xl font-semibold text-slate-900">
                            Welcome back
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Enter your credentials to continue.
                        </p>

                    </div>

                    {/* =========================
                        ERROR MESSAGE
                    ========================== */}

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* =========================
                        LOGIN FORM
                    ========================== */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* EMAIL */}

                        <div>

                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Enter your email"
                                autoComplete="email"
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />

                        </div>

                        {/* PASSWORD */}

                        <div>

                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />

                        </div>

                        {/* SIGN IN BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}

                        </button>

                    </form>

                </div>

                {/* =========================
                    FOOTER TEXT
                ========================== */}

                <p className="mt-6 text-center text-xs text-slate-400">
                    Food Order Management System
                </p>

            </div>

        </div>
    );
}

export default Login;