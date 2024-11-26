import React from "react";
import { useNavigate } from "react-router-dom";

interface FoodTruckProps {
  category_name: string;
}

const FoodTruck: React.FC<FoodTruckProps> = ({
  category_name,
}) => {
  const navigate = useNavigate();

  const handleTruckClick = (truckName: string) => {
    navigate(`/red-brick-area/${truckName.replace(/ /g, "-").toLowerCase()}`);
  };
   
  return (
    <div
      className="relative h-[300px] w-full"
      style={{
        backgroundImage: `/img/food_truck/${category_name.replace(/ /g, "_").toLowerCase()}.jpg`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-50 transition-opacity"></div>
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
        <h2 className="text-4xl font-bold mb-4 dm-serif-display-regular">
          {category_name}
        </h2>
        <button
          onClick={() => {
            handleTruckClick(category_name);
          }}
          className="px-6 py-2 border-2 border-white text-white font-semibold  transition duration-300 hover:bg-white hover:text-black"
        >
          See Menu
        </button>
      </div>
    </div>
  );
};

export default FoodTruck;
