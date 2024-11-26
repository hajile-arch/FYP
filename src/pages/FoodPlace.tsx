import Option from "../Components/FoodPlace/Option";
import { Navigate } from "react-router-dom";
import ShoppingCart from "../Components/ShoppingCart";
import { ItemType } from "../types";
import { useEffect, useState } from "react";
import { readAllItems } from "../services/item";

interface FoodPlaceProps {
  cartItems: { item: ItemType; quantity: number }[];
  setCartItems: React.Dispatch<
    React.SetStateAction<{ item: ItemType; quantity: number }[]>
  >;
}

const FoodPlace: React.FC<FoodPlaceProps> = ({ cartItems, setCartItems }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [foodItems, setFoodItems] = useState<ItemType[]>([]);
  const [goBack, setGoBack] = useState(false);
  const [filteredFoods, setFilteredFoods] = useState<ItemType[]>([]);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);

  // Use index signature for specialCases to allow dynamic keys
  const specialCases: { [key: string]: string } = {
    "block h cafe": "/block-h-cafe", // Handle Block H Cafe as a special case
    // Add more special cases if needed
  };

  const handleBackClick = () => {
    setGoBack(true);
  };

  useEffect(() => {
    void (async () => {
      await readAllItems("*, item_category(*)").then((items) => {
        setFoodItems(items as unknown as ItemType[]);
        setFilteredFoods([]); // Show default options initially
      });
    })();
  }, []);

  const handleSubmitButtonState = (query: string) => {
    setDisableSubmitButton(!query.trim());
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setFilteredFoods([]);
    } else {
      const filteredFoodItems = foodItems.filter((item) =>
        item.item_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredFoods(filteredFoodItems);
    }

    handleSubmitButtonState(value); // Update button state
  };

  if (goBack) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="fixed h-screen w-screen bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 overflow-y-auto">
      <div className="relative flex flex-col min-h-full">
        
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

        <div className="flex flex-col justify-center items-center mt-12 mb-6">
          <h1 className="text-[3.5rem] font-extrabold text-gray-800">
            EAT WHAT TODAY BRO?
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Choose from our venue options below
          </p>
          <p className="text-gray-500 text-md mt-1">
            Different Variety <span className="text-yellow-400">Everyday!</span>
          </p>
        </div>

        {/* Search Section */}
        <div className="flex justify-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Search Foods"
            className="p-3 w-1/2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:border-blue-400 transition"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)} // Trigger dynamic search
          />
          <button
            disabled={disableSubmitButton}
            className={`py-3 px-6 rounded-full text-white transition ${
              disableSubmitButton
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 shadow-md"
            }`}
          >
            Search
          </button>
        </div>

        {/* Food Options Section */}
        <div className="flex justify-center items-center bg-white shadow-md rounded-lg py-6 mx-12">
          <div className="grid grid-cols-3 gap-6 p-4">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food, key) => {
                // Handle special cases for categories
                const categoryName = food.item_category.category_name.toLowerCase();
                const specialLink = specialCases[categoryName];

                const linkTo = specialLink
                  ? specialLink
                  : `/${food.item_category.category_type
                      .toLowerCase()
                      .replace(/ /g, "-")}/${categoryName.replace(/ /g, "-")}`;

                return (
                  <Option
                    key={key}
                    imageSrc={`/img/menu/${food.item_name
                      .replace(/ /g, "_")
                      .toLowerCase()}.jpg`}
                    imageTitle={food.item_name}
                    linkTo={linkTo} // Use special or default link
                  />
                );
              })
            ) : searchQuery.trim() ? (
              // No food found for search query
              <p className="text-gray-500 text-lg text-center col-span-3">
                No luck! But hey, the perfect bite might just be a search away!
              </p>
            ) : (
              // Default venue options
              <>
                <Option
                  imageSrc="/food_truck_area.jpeg"
                  imageTitle="RED BRICK AREA"
                  linkTo="/red-brick-area"
                />
                <Option
                  imageSrc="/block_h_cafe.jpeg"
                  imageTitle="BLOCK H CAFE"
                  linkTo="/block-h-cafe" // Will not have the /block-h-cafe/block-h-cafe
                />
                <Option
                  imageSrc="/student_lounge.jpeg"
                  imageTitle="STUDENT LOUNGE"
                  linkTo="/student-lounge"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ShoppingCart Component */}
      <ShoppingCart cartItems={cartItems} setCartItems={setCartItems} />
    </div>
  );
};

export default FoodPlace;
