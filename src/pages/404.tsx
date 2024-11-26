import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="text-center px-6 py-10 rounded-lg shadow-lg bg-white max-w-lg">
        <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800">
          Oops! Page not found.
        </h2>
        <p className="text-gray-600 mt-4">
          We couldn’t find the page you were looking for. It might have been moved or no longer exists.
        </p>
        <p className="text-gray-700 mt-2">
          Please note that the **User Sign-Up** and **Re-order History** features are currently under development. We're working hard to bring these exciting updates to you soon. We appreciate your patience and understanding!
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 shadow-md transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-200 text-gray-800 text-lg font-semibold rounded-lg hover:bg-gray-300 shadow-md transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
