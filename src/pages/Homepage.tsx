import { useEffect, useState } from "react";
import Content from "../Components/Homepage/Content";
import Scrollbar from "../Components/Homepage/Scrollbar";
import { getUserSession } from "../services/get_session";
import { readProfile } from "../services/profile";
import { ProfileType } from "../types";
import supabase from "../utils/supabase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [profile, setProfile] = useState<ProfileType>();
  const [showProfile, setShowProfile] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [hover, setHover] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleSubmitFeedback = async () => {
    try {
      // Check if feedback message is empty
      if (!feedbackMessage.trim()) {
        toast.info("type smtg pls :D", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setShowFeedbackModal(false); // Close the modal even if feedback is empty
        setFeedbackMessage(""); // Clear the input field
        return; // Skip database insertion
      }

      // Insert feedback into the "feedback" table
      const { data, error } = await supabase
        .from("feedback")
        .insert([{ message: feedbackMessage }]);

      if (error) {
        console.error("Error inserting feedback:", error.message);
        toast.error("Failed to submit feedback. Please try again.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      console.log("Feedback submitted:", data);
      setShowFeedbackModal(false); // Close feedback modal
      setFeedbackMessage(""); // Clear the input field

      // Show success toast
      toast.success("Thank you for your feedback!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <>
      {/* Profile Button */}
      <button
        className="absolute top-4 right-4 z-50"
        onClick={() => setShowProfile((prev) => !prev)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="text-lg border-2 font-semibold text-white px-4 py-2 rounded-lg border-gray-300 shadow-md transition duration-300 hover:bg-white hover:text-black">
          <h1>{hover && profile ? `Hi, ${profile.student_id}` : `Hi, ${profile?.name}`}</h1>
        </div>
      </button>

      {/* Overlay for blocking clicks */}
      {showProfile && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-40 pointer-events-none" />
      )}

      {showProfile && (
        <>
          {/* Feedback Button */}
          <button
            className="absolute top-20 right-4 z-50 border-2 border-blue-300 bg-blue-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-600"
            onClick={() => setShowFeedbackModal(true)}
          >
            Feedback
          </button>

          {/* Sign Out Button */}
          <button
            className="absolute top-[138px] right-4 z-50 border-2 border-red-300 bg-red-500 text-white px-4 py-2 rounded-md transition duration-300 hover:bg-red-700"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl font-semibold mb-4">Submit Your Feedback</h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              rows={4}
              placeholder="Type your feedback here..."
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleSubmitFeedback}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <ToastContainer />

      <div className="h-screen flex relative">
        <Scrollbar />
        <Content />
      </div>
    </>
  );
};

export default Home;
