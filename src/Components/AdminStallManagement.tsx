import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StallType, ItemType, FoodTruckType } from "../types"; // Assuming you have these types
import supabase from "../utils/supabase";
import { readItemCategory } from "../services/item_category";
import { readItem } from "../services/item";
import { toast, ToastContainer } from 'react-toastify';
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const AdminStallManagement: React.FC = () => {
  const [stalls, setStalls] = useState<StallType[]>([]);
  const [editingStallId, setEditingStallId] = useState<string | null>(null);
  const [editedStall, setEditedStall] = useState<StallType | null>(null);
  const [editedItems, setEditedItems] = useState<ItemType[]>([]);
  const [stallItems, setStallItems] = useState<ItemType[][]>([]);
  const [loading, setLoading] = useState(false);
  const [initialItems, setInitialItems] = useState<ItemType[]>([]);

  const [newStallName, setNewStallName] = useState<string>("");
  const [isAddingStall, setIsAddingStall] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const stallsData = (await readItemCategory(
        "category_id, category_name, category_type",
        "category_type",
        "Student Lounge"
      )) as FoodTruckType[] | undefined;

      if (stallsData) {
        let itemList: ItemType[][] = [];
        for (const stall of stallsData) {
          const items = (await readItem("*", stall.category_name)) as
            | ItemType[]
            | undefined;
          if (items) itemList.push(items);
        }
        setStallItems(itemList);
        setStalls(stallsData);
        // console.log("stall data:",stallsData)
      } else {
        console.error("Error: There's no stalls available.");
      }
    })();
  }, []);

  const handleDeleteStall = async (categoryId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this stall?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("item_category")
      .delete()
      .eq("category_id", categoryId);

    if (error) {
      console.error("Error deleting stall:", error);
      alert("Failed to delete stall. Please try again.");
    } else {
      setStalls((prevStalls) =>
        prevStalls.filter((stall) => stall.category_id !== categoryId)
      );
      alert("Stall deleted successfully.");
    }
  };

  const handleEditStall = async (stall: StallType) => {
    setEditingStallId(stall.category_id);
    setEditedStall({ ...stall });
    setEditedItems(
      stallItems[
        stalls.findIndex((s) => s.category_id === stall.category_id)
      ] || []
    );
    const items = (await readItem("*", stall.category_name)) as
      | ItemType[]
      | undefined;
    console.log("Fetched Items:", items);
    setInitialItems(items || []);
    setEditedItems(items || []);
    console.log("Edited Items State:", items);
  };

 

  const handleSaveStall = async () => {
    if (!editingStallId || !editedStall) return;
  
    // Update stall details
    const { error: stallError } = await supabase
      .from("item_category")
      .update({ category_name: editedStall.category_name })
      .eq("category_id", editingStallId);
  
    if (stallError) {
      console.error("Error updating stall:", stallError);
      toast.error("Failed to update stall. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
  
    console.log("Editing Stall ID:", editingStallId);
    console.log("Initial Items:", initialItems);
    console.log("Edited Items:", editedItems);
  
    let itemError = null;
  
    // Delete removed items
    for (const item of initialItems) {
      if (
        !editedItems.find((editedItem) => editedItem.item_id === item.item_id)
      ) {
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
  
    // Update or insert items
    for (const item of editedItems) {
      if (item.item_id) {
        // Update existing item
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
        // Insert new item
        const { error } = await supabase.from("item").insert({
          item_name: item.item_name,
          item_price: item.item_price,
          item_description: item.item_description,
          category_id: editingStallId,
        });
  
        if (error) {
          itemError = error;
          break;
        }
      }
    }
  
    if (itemError) {
      console.error("Error updating items:", itemError);
      toast.error("Failed to update stall items. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      setStalls((prevStalls) =>
        prevStalls.map((stall) =>
          stall.category_id === editingStallId
            ? { ...stall, category_name: editedStall.category_name }
            : stall
        )
      );
      toast.success("Stall and items updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
  
      setEditingStallId(null);
      <ToastContainer/>
      // Delay reload to allow the toast to appear
      setTimeout(() => {
        window.location.reload();
      }, 3500);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingStallId(null);
    setEditedStall(null);
    setEditedItems([]);
  };

  const handleAddStall = async () => {
    if (!newStallName) {
      alert("Please enter a stall name.");
      return;
    }

    const currentDate = new Date().toISOString(); // Get current date and time in ISO format

    // Add the new stall to the database
    const { data, error } = await supabase.from("item_category").insert([
      {
        category_name: newStallName,
        category_type: "Student Lounge", // Set category_type
        updated_at: currentDate, // Set updated_at to the current date and time
      },
    ]);

    if (error) {
      console.error("Error adding stall:", error);
      alert("Failed to add stall.");
    } else {
      // Check if data is valid
      if (data) {
        setStalls((prev) => [...prev, ...data]); // Update the stall list
        setNewStallName(""); // Clear the input field
        setIsAddingStall(false); // Hide the form
        alert("Stall added successfully.");
      } else {
        alert("No data returned from the server.");
        window.location.reload();
      }
    }
  };

  const handleCancelAddStall = () => {
    setNewStallName(""); // Clear the input field
    setIsAddingStall(false); // Hide the form
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Stall Management</h2>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => setIsAddingStall(true)} // Show form to add a new stall
        >
          Add Stall
        </button>
      </div>

      {isAddingStall && (
        <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-4">Add New Stall</h3>

          <div className="mb-4">
            <label className="block font-semibold mb-2">Stall Name:</label>
            <input
              type="text"
              className="border w-full p-2 rounded"
              value={newStallName}
              onChange={(e) => setNewStallName(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleAddStall}
            >
              Add Stall
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={handleCancelAddStall}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {stalls.length === 0 ? (
        <p>No stalls found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stalls.map((stall, index) => (
            <div
              key={stall.category_id}
              className="border rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-gray-100 p-4">
                <h3 className="text-xl font-bold">{stall.category_name}</h3>
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
                    {stallItems[index]?.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center">
                          No items
                        </td>
                      </tr>
                    ) : (
                      stallItems[index]?.map((item) => (
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

              <div className="flex justify-end items-center mr-4 mb-5">
                <button
                  className="text-blue-800"
                  onClick={() => handleEditStall(stall)}
                >
                  <FiEdit2 size={20} />
                </button>
                <span className="h-5 border-l border-gray-400 mx-2"></span>{" "}
                {/* Separator */}
                <button
                  className="text-red-500"
                  onClick={() => handleDeleteStall(stall.category_id)}
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Stall Section */}
      {editingStallId && editedStall && (
        <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-4">Edit Stall</h3>

          {/* Edit Stall Name */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Stall Name:</label>
            <input
              type="text"
              className="border w-full p-2 rounded"
              value={editedStall.category_name || ""}
              onChange={(e) =>
                setEditedStall(
                  (prev) => prev && { ...prev, category_name: e.target.value }
                )
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
                    updatedItems[index].item_price = parseFloat(e.target.value);
                    setEditedItems(updatedItems);
                  }}
                />
              </div>
              <div className="mb-2">
                <label className="block font-semibold mb-1">Description:</label>
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
            onClick={() => {
              setEditedItems((prev) => [
                ...prev,
                {
                  item_id: "",
                  item_name: "",
                  item_price: 0,
                  item_description: "",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  category_id: editingStallId, // Ensure this is set correctly
                },
              ]);
            }}
          >
            Add New Item
          </button>

          {/* Save or Cancel Changes */}
          <div className="flex justify-end gap-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleSaveStall}
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
  );
};

export default AdminStallManagement;
