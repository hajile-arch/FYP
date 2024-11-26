import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../utils/supabase";
import { ProfileType } from "../types";
import { readItemCategory } from "../services/item_category";
import { FoodTruckType } from "../types";
import { ItemType } from "../types";
import { readItem } from "../services/item";
import AdminStallManagement from "../Components/AdminStallManagement";
import BlockHManagement from "../Components/BlockHManagement";
import { getUserSession } from "../services/get_session";
import { readProfile } from "../services/profile";
import FeedbackManagement from "../Components/FeedbackManagement";
import OrderSectionManagement from "../Components/OrderSectionManagement";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileType>>({});
  const navigate = useNavigate();
  const [foodTrucks, setFoodTrucks] = useState<FoodTruckType[]>([]);
  const [foodTrucksItems, setFoodTrucksItems] = useState<ItemType[][]>();
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);
  const [editedTruck, setEditedTruck] = useState<Partial<FoodTruckType>>({});
  const [editedItems, setEditedItems] = useState<ItemType[]>([]); // For food truck items
  const [initialItems, setInitialItems] = useState<ItemType[]>([]);
  const [isAddingTruck, setIsAddingTruck] = useState<boolean>(false); // State for adding new food truck
  const [newTruckName, setNewTruckName] = useState<string>(""); // New truck name input
  const [profile, setProfile] = useState<ProfileType>();
  const [showProfile, setShowProfile] = useState(false);
  const [hover, setHover] = useState<boolean>(false);

  // Refs for different sections
  const userSectionRef = useRef<HTMLDivElement>(null);
  const foodTruckSectionRef = useRef<HTMLDivElement>(null);
  const stallsSectionRef = useRef<HTMLDivElement>(null);
  const blockHCafeSectionRef = useRef<HTMLDivElement>(null);
  const feedbacksSectionRef = useRef<HTMLDivElement>(null);
  const orderSectionRef = useRef<HTMLDivElement>(null);

  const options = [
    {
      title: "Users",
      description: "Manage user accounts and roles",
      ref: userSectionRef,
    },
    {
      title: "Food Trucks",
      description: "Add, update, or remove food trucks",
      ref: foodTruckSectionRef,
    },
    {
      title: "Stalls",
      description: "Manage stalls within campus areas",
      ref: stallsSectionRef,
    },
    {
      title: "Block H Cafe",
      description: "Edit menus and offerings at Block H Cafe",
      ref: blockHCafeSectionRef,
    },
    {
      title: "Feedback",
      description: "View and manage the feedbacks by users",
      ref: feedbacksSectionRef,
    },
    {
      title: "Order",
      description: "View the orders by users",
      ref: feedbacksSectionRef,
    },
  ];

  useEffect(() => {
    getUserSession().then(async (user) => {
      if (user?.id) {
        await readProfile("*", "user_id", user.id).then((profile) => {
          setProfile(profile[0]);
        });
      } else {
        console.log("user_id not found");
      }
    });
  }, []);

  useEffect(() => {
    // Add or remove class to disable scrolling on body when profile modal is visible
    if (showProfile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Clean up on component unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showProfile]);

  const handleAddFoodTruck = async () => {
    if (!newTruckName) {
      alert("Please enter a food truck name.");
      return;
    }

    const currentDate = new Date().toISOString(); // Get current date and time in ISO format

    // Add the new food truck to the database with category_type and updated_at
    const { data, error } = await supabase.from("item_category").insert([
      {
        category_name: newTruckName,
        category_type: "Red Brick Area", // Setting the category_type
        updated_at: currentDate, // Setting updated_at to current date and time
      },
    ]);

    if (error) {
      console.error("Error adding food truck:", error);
      alert("Failed to add food truck.");
    } else {
      // Check if data is valid (i.e., not null or undefined)
      if (data) {
        setFoodTrucks((prev) => [...prev, ...data]); // Safe to set food trucks
        setNewTruckName(""); // Clear input after adding
        setIsAddingTruck(false); // Hide form
        alert("Food truck added successfully.");
      } else {
        alert("Food truck added successfully.");
        // window.location.reload();
      }
    }
  };

  const handleEditTruck = async (truck: FoodTruckType) => {
    console.log("hi");
    setEditingTruckId(truck.category_id); // Start editing this truck
    setEditedTruck(truck); // Pre-fill the form with the truck's details

    // Fetch items for the selected truck
    const items = (await readItem("*", truck.category_name)) as
      | ItemType[]
      | undefined;
    console.log("Fetched Items:", items);
    setInitialItems(items || []);
    setEditedItems(items || []);
    console.log("Edited Items State:", items);
  };

  const handleSaveTruck = async () => {
    if (!editingTruckId) return;
  
    const { error: truckError } = await supabase
      .from("item_category")
      .update({
        category_name: editedTruck.category_name,
      })
      .eq("category_id", editingTruckId);
  
    let itemError = null;
  
    for (const item of initialItems) {
      if (!editedItems.find((editedItem) => editedItem.item_id === item.item_id)) {
        const { error } = await supabase
          .from("item")
          .delete()
          .eq("item_id", item.item_id);
        if (error) {
          itemError = error;
          break;
        }
      }
    }
  
    for (const item of editedItems) {
      if (item.item_id) {
        const { error } = await supabase
          .from("item")
          .update({
            item_name: item.item_name,
            item_price: item.item_price,
            item_description: item.item_description,
          })
          .eq("item_id", item.item_id);
        if (error) {
          itemError = error;
          break;
        }
      } else {
        const { error } = await supabase
          .from("item")
          .insert({
            item_name: item.item_name,
            item_price: item.item_price,
            item_description: item.item_description,
            category_id: editingTruckId,
          });
        if (error) {
          itemError = error;
          break;
        }
      }
    }
  
    if (truckError || itemError) {
      toast.error("Failed to update the food truck or items. Please try again.", {
        position: "top-right", // You can customize the position
        autoClose: 3000, // Duration in ms
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error("Error updating truck or items:", truckError || itemError);
    } else {
      setFoodTrucks((prev) =>
        prev.map((truck) =>
          truck.category_id === editingTruckId
            ? { ...truck, ...editedTruck }
            : truck
        )
      );
      toast.success("Food truck and items updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setEditingTruckId(null);
      <ToastContainer/>
      setTimeout(() => {
        window.location.reload();
      }, 3500);
      
    }
  };
  

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingTruckId(null);
    setEditedTruck({});
  };

  // Handle Deletion
  const handleDeleteTruck = async (truckId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this food truck?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("item_category") // Replace with your table name
      .delete()
      .eq("category_id", truckId);

    if (error) {
      alert("Failed to delete the food truck. Please try again.");
      console.error("Error deleting food truck:", error);
    } else {
      setFoodTrucks((prev) =>
        prev.filter((truck) => truck.category_id !== truckId)
      );
      alert("Food truck deleted successfully.");
    }
  };

  // Fetch profiles from Supabase
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select("student_id, created_at, name, phone_number, user_id, email");

      if (error) {
        console.error("Error fetching profiles:", error);
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  // Handle deletion
  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("profile")
      .delete()
      .eq("user_id", userId);

    if (error) {
      alert("Failed to delete the user. Please try again.");
      console.error("Error deleting user:", error);
    } else {
      setProfiles((prev) =>
        prev.filter((profile) => profile.user_id !== userId)
      );
      alert("User deleted successfully.");
    }
  };

  // Handle editing
  const handleEdit = (userId: string) => {
    const profile = profiles.find((profile) => profile.user_id === userId);
    if (profile) {
      setEditingId(userId);
      setEditedProfile(profile);
    }
  };

  // Handle saving edited profile
  const handleSave = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from("profile")
      .update({
        student_id: editedProfile.student_id,
        name: editedProfile.name,
        phone_number: editedProfile.phone_number,
        email: editedProfile.email,
        // password: editedProfile.password,
      })
      .eq("user_id", editingId);

    if (error) {
      alert("Failed to update the user. Please try again.");
      console.error("Error updating user:", error);
    } else {
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.user_id === editingId
            ? { ...profile, ...editedProfile }
            : profile
        )
      );
      alert("User updated successfully.");
      setEditingId(null);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditedProfile({});
  };

  // Scroll to specific section
  const handleScrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    void (async () => {
      const trucks = (await readItemCategory(
        "category_id, category_name, category_type",
        "category_type",
        "Red Brick Area"
      )) as FoodTruckType[] | undefined;

      if (trucks) {
        let itemList: ItemType[][] = [];
        for (const truck of trucks) {
          const items = (await readItem("*", truck.category_name)) as
            | ItemType[]
            | undefined;
          if (items) {
            itemList.push(items);
          }
        }
        // console.log(itemList)
        setFoodTrucksItems(itemList);
      } else {
        console.log("no food truck with item");
      }

      if (trucks) {
        setFoodTrucks(trucks);
      } else {
        console.log("error: there's no food trucks");
      }
    })();
    console.log(foodTrucksItems);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button
        className="absolute top-4 right-4 z-50"
        onClick={() => setShowProfile((prev) => !prev)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="text-lg border-2 font-semibold text-black px-4 py-2 rounded-lg border-gray-300 shadow-md transition duration-300 hover:bg-white hover:text-black">
          <h1>
            {hover && profile
              ? `Hi, ${profile.student_id}`
              : `Hi, ${profile?.name}`}
          </h1>
        </div>
      </button>
      {showProfile && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-40 pointer-events-none" />
      )}
      {showProfile && (
        <>
          {/* Sign Out Button */}
          <button
            className="absolute top-[75px] right-4 z-50 border-2 border-red-300 bg-red-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-red-700"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </>
      )}
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {options.map((option, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition cursor-pointer"
            onClick={() => handleScrollToSection(option.ref)}
          >
            <h2 className="text-xl font-semibold mb-4">{option.title}</h2>
            <p className="text-gray-600">{option.description}</p>
          </div>
        ))}
      </div>
      {/* User Management Section */}
      <div
        ref={userSectionRef}
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4">User Management</h2>
        <div className="flex gap-4 mb-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => navigate("/notfound")}
          >
            Add User
          </button>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : profiles.length === 0 ? (
          <p>No profiles found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Student ID</th>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Email</th>
                  <th className="border border-gray-300 p-2">Phone Number</th>
                  {/* <th className="border border-gray-300 p-2">Password</th> */}
                  <th className="border border-gray-300 p-2">Created At</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) =>
                  editingId === profile.user_id ? (
                    <tr key={profile.user_id}>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border w-full p-1"
                          value={editedProfile.student_id || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              student_id: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border w-full p-1"
                          value={editedProfile.name || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              name: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="email"
                          className="border w-full p-1"
                          value={editedProfile.email || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              email: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border w-full p-1"
                          value={editedProfile.phone_number || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              phone_number: e.target.value,
                            })
                          }
                        />
                      </td>
                      {/* <td className="border border-gray-300 p-2">
                  <input
                    type="text"
                    className="border w-full p-1"
                    value={editedProfile.password || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        password: e.target.value,
                      })
                    }
                  />
                </td> */}
                      <td className="border border-gray-300 p-2">
                        {new Date(profile.created_at).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-2 flex justify-center gap-2">
                        <button
                          className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-500 text-white p-1 rounded hover:bg-gray-600"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={profile.user_id}>
                      <td className="border border-gray-300 p-2">
                        {profile.student_id}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {profile.name}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {profile.email}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {profile.phone_number}
                      </td>
                      {/* <td className="border border-gray-300 p-2">
                  {profile.password}
                </td> */}
                      <td className="border border-gray-300 p-2">
                        {new Date(profile.created_at).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-2 flex justify-center gap-2">
                        <button
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                          onClick={() => handleEdit(profile.user_id)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                          onClick={() => handleDelete(profile.user_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ;{/* Food Trucks Section */}
      <div
        ref={foodTruckSectionRef}
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Food Truck Management</h2>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => setIsAddingTruck(true)} // Show the form when adding a new food truck
          >
            Add Food Truck
          </button>
        </div>

        {isAddingTruck && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Add New Food Truck</h3>
            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Food Truck Name:
              </label>
              <input
                type="text"
                className="border w-full p-2 rounded"
                value={newTruckName}
                onChange={(e) => setNewTruckName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleAddFoodTruck}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setIsAddingTruck(false)} // Cancel adding food truck
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {foodTrucks.length === 0 ? (
          <p>No food trucks found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodTrucks.map((truck, index) => (
              <div
                key={truck.category_id}
                className="border rounded-lg shadow-md overflow-hidden"
              >
                <div className="bg-gray-100 p-4">
                  <h3 className="text-xl font-bold">{truck.category_name}</h3>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold mb-2">Menu Items:</h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">Item</th>
                        <th className="border p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodTrucksItems[index]?.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="text-center">
                            No items
                          </td>
                        </tr>
                      ) : (
                        foodTrucksItems[index]?.map((item, itemIndex) => (
                          <tr key={item.item_id} className="hover:bg-gray-100">
                            <td className="border p-2 text-left">
                              {item.item_name}
                            </td>
                            <td className="border p-2 text-right">
                              {item.item_price.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end items-center mr-4 mb-4">
                  <button
                    className="text-blue-800"
                    onClick={() => handleEditTruck(truck)}
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <span className="h-5 border-l border-gray-400 mx-2"></span>{" "}
                  {/* Separator */}
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteTruck(truck.category_id)}
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Food Truck Section */}
        {editingTruckId && (
          <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Edit Food Truck</h3>

            {/* Edit Truck Name */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Food Truck Name:
              </label>
              <input
                type="text"
                className="border w-full p-2 rounded"
                value={editedTruck.category_name || ""}
                onChange={(e) =>
                  setEditedTruck((prev) => ({
                    ...prev,
                    category_name: e.target.value,
                  }))
                }
              />
            </div>

            {/* Edit Items */}
            <h4 className="text-lg font-semibold mb-4">Edit Items:</h4>
            {editedItems.map((item, index) => (
              <div key={item.item_id} className="mb-4 border p-4 rounded">
                <div className="mb-2">
                  <label className="block font-semibold mb-1">Item Name:</label>
                  <input
                    type="text"
                    className="border w-full p-2 rounded"
                    value={item.item_name || ""}
                    onChange={(e) => {
                      const updatedItems = [...editedItems];
                      updatedItems[index].item_name = e.target.value;
                      setEditedItems(updatedItems);
                    }}
                  />
                </div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1">Price:</label>
                  <input
                    type="number"
                    step="0.01"
                    className="border w-full p-2 rounded"
                    value={item.item_price || ""}
                    onChange={(e) => {
                      const updatedItems = [...editedItems];
                      updatedItems[index].item_price = parseFloat(
                        e.target.value
                      );
                      setEditedItems(updatedItems);
                    }}
                  />
                </div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1">
                    Description:
                  </label>
                  <textarea
                    className="border w-full p-2 rounded"
                    value={item.item_description || ""}
                    onChange={(e) => {
                      const updatedItems = [...editedItems];
                      updatedItems[index].item_description = e.target.value;
                      setEditedItems(updatedItems);
                    }}
                  />
                </div>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => {
                    setEditedItems((prev) =>
                      prev.filter((_, itemIndex) => itemIndex !== index)
                    );
                  }}
                >
                  Delete Item
                </button>
              </div>
            ))}

            {/* Add New Item */}
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
              onClick={() =>
                setEditedItems((prev) => [
                  ...prev,
                  {
                    item_id: "",
                    item_name: "",
                    item_price: 0,
                    item_description: "",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    category_id: editingTruckId, // Ensure this is set correctly
                  },
                ])
              }
            >
              Add New Item
            </button>

            {/* Save or Cancel Changes */}
            <div className="flex justify-end gap-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleSaveTruck}
              >
                Save Changes
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        ref={stallsSectionRef}
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <AdminStallManagement />
      </div>
      <div
        ref={blockHCafeSectionRef}
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <BlockHManagement />
      </div>
      <div
        ref={feedbacksSectionRef}
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <FeedbackManagement />
      </div>
      <div
        ref={orderSectionRef} 
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <OrderSectionManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;
