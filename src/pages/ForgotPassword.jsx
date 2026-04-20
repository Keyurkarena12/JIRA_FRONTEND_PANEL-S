import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { forgotpassword } from '../features/authSlice'
const ForgotPassword = () => {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')


  const { loading, error } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    dispatch(forgotpassword(email))
      .unwrap()
      .then(() => {
        navigate('/reset-password')
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-3">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email address and we’ll send you a reset code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Send Reset Code
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword