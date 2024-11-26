import { useEffect, useState } from "react";
import FoodTruck from "../Components/FoodTruck/FoodTruck";
import { readItemCategory } from "../services/item_category";
import type { FoodTruckType, ItemType } from "../types";
import { Navigate } from "react-router-dom";
import ShoppingCart from "../Components/ShoppingCart";

interface RedBrickAreaProps {
  cartItems: { item: ItemType; quantity: number }[];
  setCartItems: React.Dispatch<
    React.SetStateAction<{ item: ItemType; quantity: number }[]>
  >;
}

const RedBrickArea: React.FC<RedBrickAreaProps> = ({
  cartItems,
  setCartItems,
}) => {
  const [itemCategory, setItemCategory] = useState<FoodTruckType[]>([]);

  useEffect(() => {
    void (async () => {
      const items = (await readItemCategory(
        "category_id, category_name, category_type",
        "category_type",
        "Red Brick Area"
      )) as FoodTruckType[] | undefined;
      if (items) {
        setItemCategory(items);
      } else {
        console.log("error: there's no item category");
      }
    })();
  }, []);

  const [goBack, setGoBack] = useState(false);

  const handleBackClick = () => {
    setGoBack(true);
  };

  if (goBack) {
    return <Navigate to="/foodplace" />;
  }

  return (
    <div className="h-screen w-full bg-white overflow-auto relative">
      <button
        onClick={handleBackClick}
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

      <h1 className="text-5xl font-bold text-center mt-8">Red Brick Area</h1>
      <p className="text-center text-lg mt-2 text-gray-700">
        Number of food trucks to choose from for today: {itemCategory.length}
      </p>

      <div className="mt-8 space-y-1">
        {itemCategory.map((truck) => {
          return (
            <FoodTruck
              key={truck.category_id}
              category_name={truck.category_name}
              category_type={truck.category_type}
            />
          );
        })}
      </div>

      <ShoppingCart cartItems={cartItems} setCartItems={setCartItems} />
    </div>
  );
};

export default RedBrickArea;
