import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../features/authSlice'
import { useEffect } from 'react'
import { AUTH_API } from '../config/api'

export const Login = () => {

  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const handleGooglelogin = () => {
    try {
      setGoogleLoading(true)
      const googleUrl = `${AUTH_API}/google`;
      window.location.href = googleUrl;
    } catch (error) {
      console.log(error);
      setGoogleLoading(false)
    }
    finally {
      setGoogleLoading(false)
    }
  }

  const handleGithublogin = () => {
    try {
      setGithubLoading(true)
      const githubUrl = `${AUTH_API}/github`;
      window.location.href = githubUrl
    } catch (error) {
      console.log(error)
    }
    finally {
      setGithubLoading(false)
    }
  }

  const userData = localStorage.getItem('user')

  const dispatch = useDispatch()
  const { loading, error } = useSelector(state => state.auth)

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser(form))
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        console.log(err)
      })

  }




  useEffect(() => {
    if (userData) {
      navigate('/');
    }
    else {
      navigate('/login');
    }
  }, [userData])


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Login
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-sm text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGooglelogin}
            type="button"
            className="w-full border border-gray-300 py-3 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <button
            onClick={handleGithublogin}
            type="button"
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-black transition"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
              alt="GitHub"
              className="w-5 h-5"
            />
            Continue with GitHub
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login