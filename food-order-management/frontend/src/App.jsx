import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./Components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import FoodItems from "./pages/FoodItems";
import Orders from "./pages/Orders";


function App() {

    return (

        <Routes>

            {/* =====================================================
                PUBLIC ROUTES
                ===================================================== */}

            <Route
                path="/login"
                element={<Login />}
            />


            {/* =====================================================
                PROTECTED ROUTES
                ===================================================== */}

            <Route element={<ProtectedRoute />}>

                {/* =================================================
                    MAIN APPLICATION LAYOUT
                    Navbar + Sidebar + Footer
                    ================================================= */}

                <Route element={<MainLayout />}>

                    {/* =================================================
                        DEFAULT ROUTE
                        ================================================= */}

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />


                    {/* =================================================
                        DASHBOARD
                        ================================================= */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


                    {/* =================================================
                        CUSTOMERS
                        ================================================= */}

                    <Route
                        path="/customers"
                        element={<Customers />}
                    />


                    {/* =================================================
                        FOOD ITEMS
                        ================================================= */}

                    <Route
                        path="/food-items"
                        element={<FoodItems />}
                    />


                    {/* =================================================
                        ORDERS
                        ================================================= */}

                    <Route
                        path="/orders"
                        element={<Orders />}
                    />


                    {/* =================================================
                        INVALID ROUTE
                        ================================================= */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                </Route>

            </Route>

        </Routes>

    );

}


export default App;