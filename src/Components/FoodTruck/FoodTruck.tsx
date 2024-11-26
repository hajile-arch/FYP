import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface FoodTruckProps {
  category_name: string;
  category_type: string;
}

const FoodTruck: React.FC<FoodTruckProps> = ({
  category_name,
  category_type,
}) => {
  const navigate = useNavigate();

  const handleTruckClick = (truckType: string, truckName: string) => {
    navigate(
      `/${truckType.replace(/ /g, "-").toLowerCase()}/${truckName
        .replace(/ /g, "-")
        .toLowerCase()}`
    );
  };

  const [zoomImage, setZoomImage] = useState("");

  return (
    <>
      <div
        className="relative h-[300px] w-full flex justify-center items-center overflow-hidden"
        onMouseOver={() => {
          setZoomImage(category_name);
        }}
        onMouseLeave={() => setZoomImage("")}
      >
        <img
          src={`/img/${category_type
            .replace(/ /g, "_")
            .toLowerCase()}/${category_name
            .replace(/ /g, "_")
            .toLowerCase()}.jpg`}
          className={"w-full duration-500 ease-in-out"}
          style={{
            transform: zoomImage == category_name ? "scale(1.1)" : "scale(1.0)",
          }}
        />
        <div
          className={`${
            zoomImage == category_name ? "opacity-30" : "opacity-50"
          } absolute inset-0 bg-black transition-opacity duration-500`}
        ></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
          <h2 className="text-4xl font-bold mb-4 dm-serif-display-regular">
            {category_name}
          </h2>
          <button
            className="px-6 py-2 border-2 border-white text-white font-semibold  transition duration-300 hover:bg-white hover:text-black"
            onClick={() => {
              handleTruckClick(category_type, category_name);
            }}
          >
            See Menu
          </button>
        </div>
      </div>
    </>
  );
};

export default FoodTruck;
