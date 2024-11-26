import { useEffect, useState } from "react";
import { readOrder } from "../services/order";
import { OrderTypeAndOrderedItemType } from "../types";
import OrderSection from "../Components/CheckOrders/OrderSection";
import { getUserSession } from "../services/get_session";
import { readProfile } from "../services/profile";
import { useNavigate } from "react-router-dom";

const CheckOrders = () => {
  const [studentId, setStudentId] = useState("");
  const [myOrders, setMyOrders] = useState<OrderTypeAndOrderedItemType[]>([]);
  const [otherOrders, setOtherOrders] = useState<OrderTypeAndOrderedItemType[]>(
    []
  );
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      await getUserSession().then(async (user) => {
        await readProfile("*", "user_id", user?.id).then((profile) => {
          setStudentId(profile[0].student_id);
        });
      });
    })();
  }, []);

  useEffect(() => {
    const getOrderAndOrderedItem = async () => {
      readOrder("*, ordered_item(*)").then(
        async (orders: OrderTypeAndOrderedItemType[]) => {
          const myOrderLists = orders?.filter((order) => {
            return order.from_user_id.toString() === studentId;
          });
          setMyOrders(myOrderLists);
          const otherOrderLists = orders?.filter((order) => {
            return order.from_user_id.toString() !== studentId;
          });
          setOtherOrders(otherOrderLists);
        }
      );
    };
    getOrderAndOrderedItem();
  }, [studentId, refresh]);

  return (
    <div className="flex w-full">
      <button
        onClick={() => navigate(-1)} // Navigate to the previous page
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
      <OrderSection
        title={"My Orders"}
        orders={myOrders}
        firstStatus="Delivering"
        secondStatus="Completed"
        setRefresh={setRefresh}
        studentId={studentId}
      />
      <OrderSection
        title={"Other Orders"}
        orders={otherOrders}
        firstStatus="Delivering"
        secondStatus="Pending"
        setRefresh={setRefresh}
        studentId={studentId}
      />
      {/* <OtherOrders otherOrders={otherOrders} /> */}
    </div>
  );
};

export default CheckOrders;
