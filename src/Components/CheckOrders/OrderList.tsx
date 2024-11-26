import React from "react";
import { OrderTypeAndOrderedItemType } from "../../types";
import { updateOrder } from "../../services/order";

interface OrderListProps {
  title: string;
  myOrders: OrderTypeAndOrderedItemType[];
  calculateTotalPrice: (order: OrderTypeAndOrderedItemType[]) => number;
  toUser: {
    [key: string]: {
      name: string;
      phone_number: string;
    };
  };
  itemNames: { [key: string]: string };
  status: string;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
  studentId: string;
}

const OrderList: React.FC<OrderListProps> = ({
  title,
  myOrders,
  calculateTotalPrice,
  toUser,
  itemNames,
  status,
  setRefresh,
  studentId,
}) => {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">
        {status} Orders
      </h3>
      <div className="space-y-6">
        {myOrders
          .filter((order) => order.status === status)
          .map((order) => {
            return (
              <div
                key={order.order_id}
                className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Order ID:{" "}
                  <span className="font-bold">
                    {order.order_id
                      .toString()
                      .toUpperCase()
                      .replace(/-/g, "")
                      .slice(0, 9)}
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Status:{" "}
                  <span
                    className={`${
                      status === "Delivering"
                        ? "text-yellow-600"
                        : "text-green-600"
                    } font-semibold`}
                  >
                    {order.status}
                  </span>
                </p>

                {order.to_user_id && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      <strong>Delivery Student:</strong>
                    </p>
                    <p>ID: {order.to_user_id}</p>
                    <p>
                      Name: {toUser[order.to_user_id]?.name || "Loading..."}
                    </p>
                    <p>
                      Phone:{" "}
                      {toUser[order.to_user_id]?.phone_number || "Loading..."}
                    </p>
                  </div>
                )}

                <div className="mt-3">
                  <p className="text-md font-medium text-gray-600 mb-2">
                    Ordered Items:
                  </p>
                  <ul className="pl-5 list-disc text-sm text-gray-700 space-y-1">
                    {order.ordered_item.map((item, j) => (
                      <li key={j}>
                        {item.unit} x {itemNames[item.item_id] || "Loading..."}{" "}
                        - RM{item.total_price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  <strong>Location:</strong> {order.location}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="w-full text-lg font-semibold text-gray-800">
                    <strong>Total Price:</strong>{" "}
                    <span className="text-x text-green-600 font-bold">
                      RM{calculateTotalPrice(order.ordered_item)}
                    </span>{" "}
                    {title === "My Orders" ? (
                      <span className="text-sm text-gray-500">
                        (Including RM 2 service charge)
                      </span>
                    ) : (
                      <button
                        className={`${
                          status === "Delivering"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } transition-colors duration-500 float-end py-2 px-4 rounded-md text-white`}
                        onClick={async () => {
                          if (status === "Delivering") {
                            await updateOrder(
                              "Completed",
                              studentId,
                              "order_id",
                              order.order_id
                            ).then(() => {
                              setRefresh((prev) => prev + 1);
                            });
                          } else {
                            await updateOrder(
                              "Delivering",
                              studentId,
                              "order_id",
                              order.order_id
                            ).then(() => {
                              setRefresh((prev) => prev + 1);
                            });
                          }
                        }}
                      >
                        {status === "Delivering" ? "Complete" : "Accept"}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default OrderList;
