import React, { useEffect, useState } from "react";
import supabase from "../utils/supabase"; // Ensure the Supabase client is configured properly
import { OrderedItemType, OrderType } from "../types"; // Ensure this type is correctly defined
import { FaTrash, FaEye } from "react-icons/fa"; // Import FontAwesome icons
import { Loader2, Package, Clock, DollarSign } from "lucide-react";

const OrderSectionManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null); // State for the selected order
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderedItemType | null>(null);
  const [totalOrder, setTotalOrder] = useState<Number>(0); // Number of total order
  const [totalDelivery, setTotalDelivery] = useState<Number>(0); // Number of total Delivery
  const [totalRevenue, setTotalRevenue] = useState<Number>(0);
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("order")
          .select("*")
          .order("status", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    const calcDeliery = () => {
      let totalDelivery = 0;
      orders.map((order) => {
        if (order.status == "Delivering") {
          totalDelivery++;
        }
      });

      return totalDelivery;
    };

    fetchOrders();
    
    setTotalDelivery(calcDeliery);
    setTotalOrder(orders.length);

  }, []);

  
  // Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmDelete) return;

    try {
      // Delete related records in the 'ordered_item' table
      const { error: itemError } = await supabase
        .from("ordered_item")
        .delete()
        .eq("order_id", orderId);

      if (itemError) {
        console.error("Error deleting related items:", itemError);
        alert("Failed to delete related items.");
        return;
      }

      // Now delete the order
      const { error } = await supabase
        .from("order")
        .delete()
        .eq("order_id", orderId);

      if (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order.");
      } else {
        setOrders((prev) => prev.filter((order) => order.order_id !== orderId));
        alert("Order deleted successfully.");
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-1">Order Management</h2>
      <p className="text-[15px] font-normal mb-6">
        Manage and track customer orders
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Orders Box */}
        <div className="border rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">{orders.length}</h3>
            </div>
          </div>
        </div>

        {/* Delivering Orders Box */}
        <div className="border rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500">Delivering Orders</p>
              <h3 className="text-2xl font-bold">
                {orders.filter((order) => order.status === "Delivering").length}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Revenue Box */}
        <div className="border rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">${(orders.length * 2).toFixed(2)}</h3>
              </div>
          </div>
        </div>
      </div>

      <hr className="border-2 mb-5 " />
      {/* Order List Section */}
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="border rounded-lg p-4 shadow-md"
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
              </h3>{" "}
              <p className="text-gray-500 text-sm mt-2 ">
                Status:{" "}
                {order.status == "Completed" ? (
                  <span className="text-green-700 font-bold ">
                    {order.status}
                  </span>
                ) : (
                  <span className="text-yellow-500 font-bold ">
                    {order.status}
                  </span>
                )}
              </p>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setSelectedOrder(order)} // Set the selected order to show in the modal
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                >
                  <FaEye className="mr-2" /> {/* Eye icon */}
                  View
                </button>
                <FaTrash
                  onClick={() => handleDeleteOrder(order.order_id)}
                  className="text-red-500 cursor-pointer text-xl hover:text-red-600"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Order ID:{" "}
              <span className="font-bold">
                {selectedOrder.order_id
                  .toString()
                  .toUpperCase()
                  .replace(/-/g, "")
                  .slice(0, 9)}
              </span>
            </h3>
            <p>
              <strong>Status:</strong> {selectedOrder.status}
              <br></br>
              <strong>Order Date:</strong>{" "}
              {new Date(selectedOrder.created_at).toLocaleString()}
              <br></br>
              <strong>Order Student ID:</strong>{" "}
              {selectedOrder.from_user_id || "N/A"}
              <br></br>
              <strong>Delivery Student ID:</strong>{" "}
              {selectedOrder.to_user_id || "N/A"}
              <br></br>
              <strong>Location :</strong>{" "}
              {selectedOrder.location || "N/A"}
              <br></br>

            </p>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedOrder(null)} // Close the modal
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSectionManagement;
