import React, { useEffect, useState } from "react";
import { FeedbackType } from "../types"; // Ensure the correct type for Feedback
import supabase from "../utils/supabase"; // Supabase client setup
import { FiEdit2, FiTrash2 } from "react-icons/fi"; // Import icons

const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editedFeedback, setEditedFeedback] = useState<FeedbackType | null>(null);
  const [newFeedback, setNewFeedback] = useState<string>(""); // For new feedback input
  const [loading, setLoading] = useState(false);

  // Fetch all feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("feedback").select("*");

        if (error) {
          console.error("Failed to fetch feedbacks:", error);
        } else {
          setFeedbacks(data || []);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Add new feedback
  const handleAddFeedback = async () => {
    if (!newFeedback.trim()) {
      alert("Please enter a valid feedback message.");
      return;
    }

    try {
      const { data, error } = await supabase.from("feedback").insert([
        {
          message: newFeedback,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error adding feedback:", error);
        alert("Failed to add feedback. Please try again.");
      } else {
        setFeedbacks((prev) => [...prev, ...(data || [])]);
        setNewFeedback(""); // Clear input field
        alert("Feedback added successfully.");
      }
    } catch (error) {
      console.error("Error adding feedback:", error);
    }
  };

  // Edit feedback
  const handleEditFeedback = (feedback: FeedbackType) => {
    setEditingFeedbackId(feedback.id); // Assuming `id` is the unique identifier
    setEditedFeedback({ ...feedback });
  };

  const handleSaveEdit = async () => {
    if (!editedFeedback || !editingFeedbackId) return;

    try {
      const { error } = await supabase
        .from("feedback")
        .update(editedFeedback)
        .eq("id", editingFeedbackId);

      if (error) {
        console.error("Error updating feedback:", error);
        alert("Failed to update feedback. Please try again.");
      } else {
        setFeedbacks((prev) =>
          prev.map((feedback) =>
            feedback.id === editingFeedbackId ? { ...editedFeedback } : feedback
          )
        );
        setEditingFeedbackId(null);
        setEditedFeedback(null);
        alert("Feedback updated successfully.");
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this feedback?"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("feedback").delete().eq("id", feedbackId);

      if (error) {
        console.error("Error deleting feedback:", error);
        alert("Failed to delete feedback.");
      } else {
        setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== feedbackId));
        alert("Feedback deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Feedback Management</h2>

      {/* Add New Feedback Section */}
      <div className="mb-8">
        <textarea
          className="border p-2 rounded w-full"
          placeholder="Write your feedback here"
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
        />
        <button
          onClick={handleAddFeedback}
          className="bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600"
        >
          Add Feedback
        </button>
      </div>

      {/* Feedback List Section */}
      {loading ? (
        <p>Loading feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <p>No feedbacks found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="border rounded-lg p-4 shadow-md">
              <h3 className="font-bold">Message:</h3>
              <p className="text-gray-600 text-sm">{feedback.message}</p>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleEditFeedback(feedback)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FiEdit2 size={20} />
                </button>
                <button
                  onClick={() => handleDeleteFeedback(feedback.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Feedback Section */}
      {editingFeedbackId && editedFeedback && (
        <div className="mt-8">
          <textarea
            className="border w-full p-2 rounded mb-4"
            value={editedFeedback.message || ""}
            onChange={(e) =>
              setEditedFeedback((prev) => prev && { ...prev, message: e.target.value })
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
                setEditingFeedbackId(null);
                setEditedFeedback(null);
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

export default FeedbackManagement;
