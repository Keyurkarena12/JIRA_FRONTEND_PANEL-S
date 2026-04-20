import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createWorkspace } from '../features/workspaceSlice'


function CreateWorkspace() {

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  const { loading, error } = useSelector(state => state.workspace)

  const navigate = useNavigate()
  const dispatch = useDispatch()


  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(createWorkspace(formData))
    .then(() => {
      navigate('/dashboard')
    })
    .catch((err) => {
      console.log(err)
    })
   
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Workspace
        </h2>

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Workspace Name"   
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-3 border rounded"
          required
        />

        {/* Slug */}
        <input
          type="text"
          name="slug"
          placeholder="Workspace Slug (unique)"
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full mb-4 p-3 border rounded"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description (optional)"
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full mb-4 p-3 border rounded"
        />

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Workspace"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-500 mt-3 text-center">
            {error}
          </p>
        )}

      </form>

    </div>
  )
}

export default CreateWorkspace