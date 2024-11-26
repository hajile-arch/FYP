import { useEffect, useState } from "react";
import { ItemType } from "../types";
import { readItem } from "../services/item";
import { useParams, Navigate } from "react-router-dom";

const FoodTruckMenuV2: React.FC = () => {
  const { food_truck } = useParams();
  const [items, setItems] = useState<ItemType[]>([]);
  const [goBack, setGoBack] = useState(false);

  useEffect(() => {
    if (food_truck) {
      void (async () => {
        try {
          const data = await readItem(
            "*",
            food_truck
              .replace(/-/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())
          );
          setItems(data as unknown as ItemType[]); // Set the fetched items
        } catch (error) {
          console.error("Failed to fetch items:", error);
        }
      })();
    } else {
      console.log("error: page not found");
    }
  }, [food_truck]);

  const formattedFoodTruck = food_truck
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleBackClick = () => {
    setGoBack(true);
  };

  if (goBack) {
    return <Navigate to="/red-brick-area" />;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-200">
      {/* Back Button */}
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

      <h2 className="text-4xl font-bold text-gray-800 mt-8 mb-6">
        {formattedFoodTruck} Menu
      </h2>

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
                src={`/img/menu/${item.item_name
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-gray-600 mt-6 text-sm">
        See Also Hungry dy leh. Why Not ORDER ?
      </p>
    </div>
  );
};

export default FoodTruckMenuV2;
