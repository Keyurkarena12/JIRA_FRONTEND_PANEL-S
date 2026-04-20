import React, { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { useSelector,useDispatch } from 'react-redux'
import { resetpassword } from '../features/authSlice'
const ResetPassword = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { loading } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    email: '',
    resetpasswordcode: '',
    newpassword: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(resetpassword(formData))
    .unwrap()
    .then(()=>{
      navigate('/login')
    })
    .catch((err)=>{
      console.log(err)
    })
    // API call here
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-3">
          Reset Password
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email, reset code, and new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reset code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reset Code
            </label>
            <input
              type="text"
              placeholder="Enter reset code"
              value={formData.resetpasswordcode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resetpasswordcode: e.target.value
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={formData.newpassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newpassword: e.target.value
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Reset Password
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Back to{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword