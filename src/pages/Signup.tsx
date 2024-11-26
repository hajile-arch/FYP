import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faUser, faIdBadge, faPhone, faLock } from "@fortawesome/free-solid-svg-icons";
import { FormType, CandidateKeyType } from "../types";
import supabase from "../utils/supabase";
import { createProfile, readProfile } from "../services/profile";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<FormType>({
    email: "",
    name: "",
    studentID: "",
    password: "",
    phoneNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const accountAlreadyExist = (users: CandidateKeyType[]) => {
    for (const user of users) {
      if (user.student_id.toUpperCase() === formData.studentID.toUpperCase()) {
        alert("Student ID already exists");
        return true;
      }
      if (user.email.toLowerCase() === formData.email.toLowerCase()) {
        alert("Email already exists");
        return true;
      }
      if (user.phone_number === formData.phoneNumber) {
        alert("Phone number already exists");
        return true;
      }
    }
    return false;
  };

  const handleSignUp = async (formData: FormType) => {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert("Failed to create account, please try again.");
      console.log("Error signing up: ", error);
    } else {
      if (data.user && data.user.id) {
        const user_created = await createProfile(
          formData.studentID,
          data.user.id,
          formData.name,
          formData.phoneNumber,
          formData.email
        );

        if (user_created) {
          navigate("/login");
        } else {
          console.log("Error: Failed to create profile");
        }
      }
    }
  };

  const handleSubmit = async (formData: FormType) => {
    const users = await readProfile("student_id, email, phone_number");

    if (users) {
      if (!accountAlreadyExist(users as unknown as CandidateKeyType[])) {
        handleSignUp(formData);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create an Account</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(formData);
          }}
        >
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Student ID Field */}
          <div className="mb-4">
            <label htmlFor="studentID" className="block text-sm font-medium text-gray-700">
              Student ID
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faIdBadge} />
              </span>
              <input
                type="text"
                name="studentID"
                id="studentID"
                placeholder="e.g., B1234567"
                value={formData.studentID}
                onChange={handleChange}
                pattern="^B\d{7}$"
                title="Student ID should start with 'B' followed by 7 digits."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                pattern="^\d{10,11}$"
                title="Enter a valid 10 or 11-digit phone number."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-600 transition"
          >
            Sign Up
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
