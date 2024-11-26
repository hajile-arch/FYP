import { useEffect, useState } from "react";
import { OrderTypeAndOrderedItemType } from "../../types";
import { readProfile } from "../../services/profile";
import { readItemName } from "../../services/item";
import OrderList from "./OrderList";

interface OrderSectionProps {
  title: string;
  orders: OrderTypeAndOrderedItemType[];
  firstStatus: string;
  secondStatus: string;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
  studentId: string;
}

const OrderSection: React.FC<OrderSectionProps> = ({
  title,
  orders,
  firstStatus,
  secondStatus,
  setRefresh,
  studentId,
}) => {
  const [toUser, setToUser] = useState<{
    [key: string]: { name: string; phone_number: string };
  }>({});
  const [itemNames, setItemNames] = useState<{ [key: string]: string }>({});

  const getDeliverStudentInformation = async (student_id: string) => {
    const data = await readProfile(
      "name, phone_number",
      "student_id",
      student_id
    );
    return data[0];
  };

  const fetchItemNames = async (orders: OrderTypeAndOrderedItemType[]) => {
    const itemIds = Array.from(
      new Set(
        orders.flatMap((order) =>
          order.ordered_item.map((item) => item.item_id)
        )
      )
    );

    const itemNamePromises = itemIds.map(async (id) => {
      const itemData = await readItemName(id);
      return { id, name: itemData[0].item_name };
    });

    const itemNameArray = await Promise.all(itemNamePromises);
    const itemNameMap = itemNameArray.reduce((acc, { id, name }) => {
      acc[id] = name;
      return acc;
    }, {} as { [key: string]: string });

    setItemNames(itemNameMap);
  };

  useEffect(() => {
    const fetchAllDeliveryDetails = async () => {
      const uniqueStudentIds = Array.from(
        new Set(orders.map((order) => order.to_user_id).filter(Boolean))
      );
      const studentDataPromises = uniqueStudentIds.map(async (id) => {
        const studentData = await getDeliverStudentInformation(id);
        return { id, ...studentData };
      });

      const studentDataArray = await Promise.all(studentDataPromises);
      const studentDataMap = studentDataArray.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {} as { [key: string]: { name: string; phone_number: string } });

      setToUser(studentDataMap);
    };

    fetchAllDeliveryDetails();
    fetchItemNames(orders);
  }, [orders]);

  const calculateTotalPrice = (orderedItems: OrderTypeAndOrderedItemType[]) => {
    let totalPrice = 0;
    for (const item of orderedItems) {
      totalPrice += item.total_price;
    }
    return (totalPrice + 2).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-100 w-1/2 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          {title}
        </h2>

        <OrderList
          title={title}
          myOrders={orders}
          calculateTotalPrice={calculateTotalPrice}
          toUser={toUser}
          itemNames={itemNames}
          status={firstStatus}
          setRefresh={setRefresh}
          studentId={studentId}
        />

        <OrderList
          title={title}
          myOrders={orders}
          calculateTotalPrice={calculateTotalPrice}
          toUser={toUser}
          itemNames={itemNames}
          status={secondStatus}
          setRefresh={setRefresh}
          studentId={studentId}
        />
      </div>
    </div>
  );
};

export default OrderSection;
