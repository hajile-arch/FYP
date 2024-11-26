import { useEffect, useState } from "react";
import { ItemType } from "../types";
import { readItem } from "../services/item";
import ShoppingCart from "../Components/ShoppingCart";
import { useNavigate } from "react-router-dom";

interface BlockHCafeMenuProps {
  cartItems: { item: ItemType; quantity: number }[];
  setCartItems: React.Dispatch<
    React.SetStateAction<{ item: ItemType; quantity: number }[]>
  >;
}

const BlockHCafeMenu: React.FC<BlockHCafeMenuProps> = ({
  cartItems,
  setCartItems,
}) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemType[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await readItem("*", "Block H Cafe"); // Fetch items specific to Block H Cafe
        setItems(data as unknown as ItemType[]);
        console.log(data)
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    })();
  }, []);

  const handleAddToOrder = (item: ItemType) => {
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.item.item_id === item.item_id
    );

    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { item, quantity: 1 }]);
    }
    alert(`Added ${item.item_name} to order!`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-200 relative">
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
      <h2 className="text-4xl font-bold text-gray-800 mt-8 mb-6">
        Block H Cafe Menu
      </h2>

      {/* Menu Items */}
      <div className="flex justify-center w-full px-6">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            items.length >= 4
              ? "lg:grid-cols-4"
              : "lg:grid-cols-" + items.length
          } gap-6 max-w-6xl`}
        >
          {items.map((item) => (
            <div
              key={item.item_id}
              className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300"
              style={{ width: "250px", height: "300px" }}
            >
              <img
                src={`/img/block-h-cafe/${item.item_name
                  .replace(/ /g, "_")
                  .toLowerCase()}.jpg`}
                alt={item.item_name}
                className="w-full h-32 object-cover"
              />
              <div className="p-4 flex flex-col h-[calc(100%-8rem)] justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {item.item_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    {item.item_description}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-800">
                    ${item.item_price.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleAddToOrder(item)}
                    className="px-2 py-1 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Text */}
      <p className="text-gray-600 mt-6 text-sm">
        Don't miss out! Place your order now.
      </p>

      {/* Shopping Cart */}
      <ShoppingCart cartItems={cartItems} setCartItems={setCartItems} />
    </div>
  );
};

export default BlockHCafeMenu;
