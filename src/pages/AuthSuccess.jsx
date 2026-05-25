import axios from 'axios'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUTH_API } from '../config/api'

const AuthSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const fetchuser = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('access_token') || params.get('token')

      if (!token) {
        return navigate('/login')
      }

      try {
        const res = await axios.get(`${AUTH_API}/user`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        })
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/')
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
