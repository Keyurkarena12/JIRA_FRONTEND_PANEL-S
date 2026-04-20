import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from "../features/authSlice"


const Register = () => {

  const [FormData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [googleLoading, setGoogleLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  const baseUrl = 'http://localhost:5000';


  const handleGooglelogin =() =>{
    try {
      setGoogleLoading(true)
      const googleUrl = `${baseUrl}/api/auth/google`;
      window.location.href = googleUrl;
    } catch (error) {
      console.log(error);
      setGoogleLoading(false)
    }
    finally{
      setGoogleLoading(false)
    }
  }

  const handleGithublogin = () =>{
    try {
      setGithubLoading(true)
      const githubUrl = `${baseUrl}/api/auth/github`;
      window.location.href = githubUrl
    } catch (error) {
      console.log(error)
    }
    finally{
      setGithubLoading(false)
    }
  }
  
  const userData = localStorage.getItem('user');

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error } = useSelector(state => state.auth)

  const handleSubmit = (e) => {
    e.preventDefault()

    dispatch(registerUser(FormData))
      .unwrap()
      .then(() => {
        setFormData({
          name: '',
          email: '',
          password: ''
        });
        navigate('/login');
      }).catch((err) => {
        console.log(err);
      })

  }
  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error])
  
  useEffect(() => {
    if (userData) {
      navigate('/');
    }
    else{
      navigate('/register');
    }
  }, [userData])

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-5">
    <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({ ...FormData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({ ...FormData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({ ...FormData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Register
          </button>

          <div className="mt-4">
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-3 text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

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
          </div>

        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{" "}
          <Link to="/login">
            <span className="text-blue-600 cursor-pointer hover:underline">
              Login
            </span>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register   


