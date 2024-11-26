import { useLocation, useNavigate } from "react-router-dom";
import { ItemType } from "../types";
import { useEffect, useState } from "react";
import ItemList from "../Components/Checkout/ItemList";
import { createOrder, deleteOrder, readOrder } from "../services/order";
import { createOrderedItem, deleteOrderedItem } from "../services/ordered_item";
import PendingOrder from "../Components/Checkout/PendingOrder";
import QRCode from "react-qr-code";
import { getUserSession } from "../services/get_session";
import { readProfile } from "../services/profile";

interface CartItem {
  item: ItemType;
  quantity: number;
}

const Checkout = () => {
  const currentLocation = useLocation();
  const { cartItems, total } = currentLocation.state as {
    cartItems: CartItem[];
    total: number;
  };
  const navigate = useNavigate();

  const [disabled, setDisabled] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = await getUserSession();
      if (user?.id) {
        const profile = await readProfile("student_id", "user_id", user.id);
        if (profile && profile.length > 0) {
          setStudentId(profile[0].student_id);
        }
      } else {
        console.log("No user session found.");
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (inputValue.trim() !== "") {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [inputValue]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  useEffect(() => {
    const handleRequestStatus = async () => {
      if (orderId && orderId !== "") {
        const data = (await readOrder("status", "order_id", orderId)) as
          | [{ status: string }]
          | [];
        if (data && data[0]?.status !== "Pending") {
          navigate("/check-orders");
        }
      }
    };
    handleRequestStatus();
  }, [seconds, orderId, navigate]);

  useEffect(() => {
    const handleCountdownComplete = async () => {
      if (seconds === 0 && orderId !== "") {
        await deleteOrderedItem("order_id", orderId).then(async () => {
          await deleteOrder("order_id", orderId);
        });
      }
    };
    handleCountdownComplete();
  }, [seconds, orderId]);

  const handleCreateOrder = async () => {
    if (!studentId) {
      console.error("Student ID not found.");
      return;
    }

    await createOrder(studentId, inputValue).then(async (order_id) => {
      setOrderId(order_id);
      for (const cartItem of cartItems) {
        await createOrderedItem(
          order_id,
          cartItem.item.item_id,
          cartItem.quantity,
          cartItem.item.item_price * cartItem.quantity
        );
      }
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Create payment URL or details for QR Code
  const paymentUrl = `https://your-payment-gateway.com/pay?amount=${
    total + 2
  }&orderId=${orderId}`;

  return (
    <div className="flex h-dvh">
      <div className="w-1/2 bg-neutral-100 flex flex-col justify-center items-center gap-4">
        {/* Back Button */}
        {seconds === 0 && (
          <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-transparent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        )}

        <div className="flex flex-col bg-white gap-2 w-3/4 border-2 rounded-md p-7">
          <h1 className="text-2xl font-bold py-2">Checkout Summary</h1>
          <ItemList middle="Quantity" right="Subtotal" />
          {cartItems.map((cartItem, key) => {
            return (
              <ItemList
                key={key}
                left={cartItem.item.item_name}
                middle={cartItem.quantity.toString()}
                right={`${cartItem.item.item_price * cartItem.quantity}`}
              />
            );
          })}
          <ItemList right={`${total}`} total />
          <ItemList left="Service Fee *" right={"2.00"} />
          <ItemList middle="Total" right={`RM ${total + 2}`} total />
        </div>
        <PendingOrder
          seconds={seconds}
          setInputValue={setInputValue}
          disabled={disabled}
          setSeconds={setSeconds}
          handleCreateOrder={handleCreateOrder}
          formatTime={formatTime}
        />
      </div>

      <div className="border-2 bg-white w-1/2 flex flex-col text-center justify-center items-center">
        <h2 className="text-xl font-semibold mb-4">Scan to Pay</h2>
        <QRCode value={paymentUrl} size={256} />
        <p className="mt-4 text-sm text-gray-500">
          Scan the QR code to complete your payment.
        </p>
      </div>
    </div>
  );
};

export default Checkout;
