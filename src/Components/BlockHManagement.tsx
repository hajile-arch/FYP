import React, { useEffect, useState } from "react";
import { ItemType } from "../types";
import supabase from "../utils/supabase";
import { readItem } from "../services/item";
import { FiEdit2, FiTrash2 } from "react-icons/fi"; // Import icons

const BlockHManagement: React.FC = () => {
  const [items, setItems] = useState<ItemType[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<ItemType | null>(null);
  const [newItem, setNewItem] = useState<ItemType | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

useEffect(() => {
  const fetchCategoryId = async () => {
    try {
      const { data, error } = await supabase
        .from("item_category")
        .select("category_id") // Assuming the UUID field in the categories table is `id`
        .eq("category_name", "Block H Cafe")
        .single();

      if (error) {
        console.error("Failed to fetch category ID:", error);
      } else {
        setCategoryId(data?.category_id || null);
      }
    } catch (error) {
      console.error("Error fetching category ID:", error);
    }
  };

  fetchCategoryId();
  
}, []);

  // Fetch all items for Block H Cafe
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = (await readItem("*", "Block H Cafe")) as ItemType[];
        setItems(data || []);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Add new item
  const handleAddItem = async () => {
    if (!newItem || !newItem.item_name || !newItem.item_price) {
      alert("Please fill in all required fields.");
      return;
    }
    console.log("Category ID:", categoryId); // shane: let me know 2moro of the thing works or not
    try {
      const { data, error } = await supabase.from("item").insert([
        {
          ...newItem,
          category_id: categoryId, // Ensure this is the correct category_id for Block H Cafe
          item_status: "Valid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Error adding item:", error);
        alert("Failed to add item. Please try again.");
      } else {
        setItems((prev) => [...prev, ...(data || [])]);
        setNewItem(null); // Clear form
        alert("Item added successfully.");
        window.location.reload()
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Edit an existing item
  const handleEditItem = (item: ItemType) => {
    setEditingItemId(item.item_id);
    setEditedItem({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editedItem || !editingItemId) return;

    try {
      const { error } = await supabase
        .from("item")
        .update(editedItem)
        .eq("item_id", editingItemId);

      if (error) {
        console.error("Error updating item:", error);
        alert("Failed to update item. Please try again.");
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.item_id === editingItemId ? { ...editedItem } : item
          )
        );
        setEditingItemId(null);
        setEditedItem(null);
        alert("Item updated successfully.");
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Delete an item
  const handleDeleteItem = async (itemId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("item").delete().eq("item_id", itemId);
      if (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item.");
      } else {
        setItems((prev) => prev.filter((item) => item.item_id !== itemId));
        alert("Item deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6">Block H Cafe Management</h2>

      {/* Add New Item Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Add New Item</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Item Name"
            className="border p-2 rounded"
            value={newItem?.item_name || ""}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, item_name: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded"
            value={newItem?.item_price || ""}
            onChange={(e) =>
              setNewItem((prev) => ({
                ...prev,
                item_price: parseFloat(e.target.value),
              }))
            }
          />
          <textarea
            placeholder="Description"
            className="border p-2 rounded col-span-1 sm:col-span-2"
            value={newItem?.item_description || ""}
            onChange={(e) =>
              setNewItem((prev) => ({
                ...prev,
                item_description: e.target.value,
              }))
            }
          />
        </div>
        <button
          onClick={handleAddItem}
          className="bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600"
        >
          Add Item
        </button>
      </div>

      {/* Item List Section */}
      {loading ? (
        <p>Loading items...</p>
      ) : items.length === 0 ? (
        <p>No items found for Block H Cafe.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.item_id} className="border rounded-lg p-4 shadow-md">
              <h4 className="font-bold text-lg">{item.item_name}</h4>
              <p className="text-gray-600 text-sm">{item.item_description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="font-semibold text-gray-800">
                  ${item.item_price.toFixed(2)}
                </span>
                <div className="flex justify-between items-center mt-4">
  <button
    onClick={() => handleEditItem(item)}
    className="text-blue-500 hover:text-blue-600 "
  >
    <FiEdit2 size={20} />
  </button>
  <span className="h-5 border-l border-gray-400 mx-2"></span> {/* Separator */}
  <button
    onClick={() => handleDeleteItem(item.item_id)}
    className="text-red-500 hover:text-red-600"
  >
    <FiTrash2 size={20} />
  </button>
</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Item Section */}
      {editingItemId && editedItem && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Edit Item</h3>
          <input
            type="text"
            className="border w-full p-2 rounded mb-4"
            value={editedItem.item_name || ""}
            onChange={(e) =>
              setEditedItem((prev) => prev && { ...prev, item_name: e.target.value })
            }
          />
          <input
            type="number"
            className="border w-full p-2 rounded mb-4"
            value={editedItem.item_price || ""}
            onChange={(e) =>
              setEditedItem((prev) =>
                prev && { ...prev, item_price: parseFloat(e.target.value) }
              )
            }
          />
          <textarea
            className="border w-full p-2 rounded mb-4"
            value={editedItem.item_description || ""}
            onChange={(e) =>
              setEditedItem((prev) =>
                prev && { ...prev, item_description: e.target.value }
              )
            }
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSaveEdit}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditingItemId(null);
                setEditedItem(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockHManagement;
