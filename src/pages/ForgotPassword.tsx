import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { resetPassword } from '../services/profile';

const ForgotPassword: React.FC = () => {
  const [studentID, setStudentID] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false); // Toggle visibility for new password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle visibility for confirm password
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // // The following function is commented out since it's no longer needed (api version)
  // const handleResetPassword = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Check if passwords match
  //   if (newPassword !== confirmPassword) {
  //     setError('Passwords do not match!');
  //     return;
  //   }

  //   try {
  //     const response = await fetch('http://localhost:8081/reset-password', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ studentID, newPassword }),
  //     });

  //     if (response.ok) {
  //       alert('Password reset successful!');
  //       navigate('/login'); // Redirect to login page after successful reset
  //     } else if (response.status === 404) {
  //       setError('Student ID not found');
  //     } else {
  //       setError('Failed to reset password');
  //     }
  //   } catch (error) {
  //     console.error('Error during password reset:', error);
  //     setError('Server error. Please try again later.');
  //   }
  // };

  const handleResetPassword = async (e: React.FormEvent) => {
    const reset = await resetPassword(studentID,newPassword)

    if(!reset) { 
      console.log("something happen in profile.ts")
    }

    // e.preventDefault();
    // // Simply navigate back to the login page when the button is pressed
    // navigate('/login');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleResetPassword} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-5">Reset Password</h2>

        {/* Commented out the error display */}
        {/* {error && <p className="text-red-500 mb-4">{error}</p>} */}

        <input
          className="mb-4 p-2 w-full border rounded"
          type="text"
          name="studentID"
          placeholder="Student ID"
          value={studentID}
          onChange={(e) => setStudentID(e.target.value)}
          required
        />

        <div className="relative mb-4">
          <input
            className="p-2 w-full border rounded pr-10"
            type={showNewPassword ? 'text' : 'password'}
            name="newPassword"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-0 pr-3 cursor-pointer"
            style={{ top: '9px' }}
          >
            <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
          </span>
        </div>

        <div className="relative mb-4">
          <input
            className="p-2 w-full border rounded pr-10"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-0 pr-3 cursor-pointer"
            style={{ top: '9px' }}
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
          </span>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
