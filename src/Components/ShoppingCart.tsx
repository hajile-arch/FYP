import React, { useState } from "react";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ItemType } from "../types";

interface ShoppingCartProps {
  cartItems: { item: ItemType; quantity: number }[];
  setCartItems: React.Dispatch<
    React.SetStateAction<{ item: ItemType; quantity: number }[]>
  >;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cartItems,
  setCartItems,
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleQuantityChange = (item: ItemType, quantity: number) => {
    const updatedCartItems = [...cartItems];
    const existingItemIndex = updatedCartItems.findIndex(
      (cartItem) => cartItem.item.item_id === item.item_id
    );

    if (existingItemIndex !== -1) {
      if (quantity > 0) {
        updatedCartItems[existingItemIndex].quantity = quantity;
      } else {
        updatedCartItems.splice(existingItemIndex, 1);
      }
    }

    setCartItems(updatedCartItems);
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, cartItem) => total + cartItem.item.item_price * cartItem.quantity,
      0
    );
  };

  const proceedToCheckout = () => {
    navigate("/checkout", { state: { cartItems, total: calculateTotal() } });
  };

  return (
    <>
      <button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
      >
        <FaShoppingCart size={24} />
        <span className="absolute top-0 left-8 bg-red-600 text-white rounded-full text-xs px-1 transform -translate-x-1 -translate-y-1/2">
          {cartItems.length}
        </span>
      </button>

      {isCartOpen && (
        <div className="fixed inset-y-0 left-0 bg-white shadow-lg w-80 z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="p-6 relative">
            <button
              onClick={toggleCart}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Shopping Cart</h3>
            {cartItems.length > 0 ? (
              <ul>
                {cartItems.map(({ item, quantity }) => (
                  <li
                    key={item.item_id}
                    className="flex justify-between items-center mb-2"
                  >
                    <span
                      className="flex-1 mr-2 overflow-hidden text-ellipsis whitespace-nowrap"
                      title={item.item_name}
                    >
                      {item.item_name}
                    </span>
                    <div
                      className="flex items-center"
                      style={{ width: "80px" }}
                    >
                      <input
                        type="number"
                        value={quantity}
                        min="0"
                        onChange={(e) =>
                          handleQuantityChange(item, Number(e.target.value))
                        }
                        className="w-16 border rounded p-1 text-center"
                      />
                      <button
                        onClick={() => handleQuantityChange(item, 0)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <span className="w-16 text-right">
                      ${(item.item_price * quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Your cart is empty.</p>
            )}
            <hr className="my-4 border-gray-500" />
            <div className="flex justify-between items-center mt-2 font-bold">
              <button
                onClick={proceedToCheckout}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Order
              </button>
              <span className="mb-6">
                Total: ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShoppingCart;
