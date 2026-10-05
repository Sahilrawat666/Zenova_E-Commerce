import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy-loaded pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));
const About = lazy(() => import("../pages/About"));
const Shop = lazy(() => import("../pages/Shop"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Collections = lazy(() => import("../pages/Collections"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Cart = lazy(() => import("../pages/Cart.jsx"));
const Checkout = lazy(() => import("../pages/Checkout.jsx"));
const OrderConfirmation = lazy(() => import("../pages/OrderConfirmation.jsx"));
const Orders = lazy(() => import("../pages/Orders.jsx"));
const Account = lazy(() => import("../pages/Account.jsx"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/ResetPassword.jsx"));
const ComingSoon = lazy(() => import("../pages/ComingSoon.jsx"));

// // Page loading component
// const PageLoader = () => {
//   return (
//     <div className="flex min-h-[60vh] items-center justify-center">
//       <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#b08d57] border-t-transparent" />
//     </div>
//   );
// };

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main>
        {/* <Suspense fallback={<PageLoader />}> */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/order-confirmation/:orderId"
            element={<OrderConfirmation />}
          />
          <Route path="/orders" element={<Orders />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<ComingSoon />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
        {/* </Suspense> */}
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
