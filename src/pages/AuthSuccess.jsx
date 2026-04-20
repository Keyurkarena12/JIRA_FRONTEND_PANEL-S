import axios from 'axios'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthSuccess = () => {

  const navigate = useNavigate()

  useEffect(() => {

    const fetchuser = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('access_token') || params.get('token')

      console.log("token", token)

      if (!token) {
        return navigate('/login')

      }

      try {
        // console.log(process.env.VITE_API_URL);
        const res = await axios.get('http://localhost:5000/api/auth/user', { 
          withCredentials: true, 
          headers: { Authorization: `Bearer ${token}` } 
        })
        console.log("res", res);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      } catch (error) {
        console.log('error fetching user', error)
        navigate('/login')
      }

    }

    fetchuser()

  }, [navigate])


  return (
    <div>AuthSuccess</div>
  )
}

export default AuthSuccess