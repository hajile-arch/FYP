import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import FoodTruckMenuV2 from "./pages/FoodTruckMenuV2";
import AdminAddUser from "./pages/Admin_users";
import { useSpring, animated } from "react-spring";
import Preloader from "./pages/Prelaoder";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPassword2 from "./pages/ForgotPassword2";
import FoodPlace from "./pages/FoodPlace";
import CheckOrders from "./pages/CheckOrders";
import Home from "./pages/Homepage";
import RedBrickArea from "./pages/RedBrickArea";
import Checkout from "./pages/Checkout";
import { ItemType } from "./types";
import ShoppingCart from "../src/Components/ShoppingCart";
import FoodTruckMenu from "./pages/FoodTruckMenu";
import supabase from "./utils/supabase";
import { Session } from "@supabase/supabase-js";
import StudentLounge from "./pages/StudentLounge";
import StallMenu from "./pages/StallMenu";
import BlockHCafeMenu from "./pages/BlockHCafeMenu";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/404";
import { ToastContainer } from "react-toastify";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<
    { item: ItemType; quantity: number }[]
  >([]);
  const [session, setSession] = useState<Session | null>(null);
  const fadeInProps = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: { duration: 1000 },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    getSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const hideCartOnRoutes = [
    "/login",
    "/",
    "/forgotpassword",
    "/checkout",
    "/check-orders",
    "/signup",
    "/admin",
  ];
  return (
    <div>
      {loading &&
      location.pathname !== "/login" &&
      location.pathname !== "/signup" ? (
        <Preloader />
      ) : (
        <Router>
          {!hideCartOnRoutes.includes(location.pathname) && (
            <ShoppingCart cartItems={cartItems} setCartItems={setCartItems} />
          )}
          <animated.div id="content" className="block" style={fadeInProps}>
            <Routes>
              {session ? (
                <>
                  <Route path="/notfound" element={<NotFound />} />
                  <Route path="/foodtruckv2" element={<FoodTruckMenuV2/>}/>
                  <Route path="/admin_users" element={<AdminAddUser/>}/>
                  <Route path="/admin" element={<AdminDashboard />} />
                  
                  <Route path="/home" element={<Home />} />
                  <Route path="/check-orders" element={<CheckOrders />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route
                    path="/foodplace"
                    element={
                      <FoodPlace
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                      />
                    }
                  />
                  <Route
                    path="/red-brick-area"
                    element={
                      <RedBrickArea
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                      />
                    }
                  />
                  <Route
                    path="/red-brick-area/:food_truck"
                    element={
                      <FoodTruckMenu
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                      />
                    }
                  />
                  <Route
                    path="/block-h-cafe"
                    element={
                      <BlockHCafeMenu
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                      />
                    }
                  />
                  <Route
                    path="/student-lounge"
                    element={
                      <StudentLounge
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                      />
                    }
                  />
                  <Route
                    path="/student-lounge/:stall"
                    element={
                      <StallMenu
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                      />
                    }
                  />
                </>
              ) : (
                <>
                  <Route path="/" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgotpassword" element={<ForgotPassword/>} />
                  <Route path="*" element={<Navigate to="/" />} />
                  
                </>
              )}
            </Routes>
          </animated.div>
          <ToastContainer />
        </Router>
      )}
    </div>
  );
};

export default App;
