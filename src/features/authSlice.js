import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

import axios from 'axios'



const API ="http://localhost:5000/api/auth";





export const loginUser = createAsyncThunk('auth/login',async(data)=>{

    const response = await axios.post(`${API}/login`,data)

    localStorage.setItem('token',response.data.token);

    return response.data.user

})





export const registerUser = createAsyncThunk('auth/register',async(data)=>{

    const response = await axios.post(`${API}/register`,data)

    localStorage.setItem('token',response.data.token);

    return response.data.user

})



export const logoutUser = createAsyncThunk("auth/logout", async () => {

  await axios.post(`${API}/logout`, {}, { withCredentials: true });

  localStorage.removeItem("token");

  localStorage.removeItem("user");

});





export const forgotpassword = createAsyncThunk("auth/forgotpassword",async (email) =>{

 const response = await axios.post(`${API}/forgot-password`,{email});

 console.log(response.data);

 return response.data;

} )





export const resetpassword = createAsyncThunk('auth/resetpassword',async(data)=>{

    const response = await axios.post(`${API}/reset-password`,data)

    return response.data

})





export const currentUser = createAsyncThunk('auth/currentUser',async()=>{

    const token = localStorage.getItem('token');

    const response = await axios.get(`${API}/current-user`,{

        headers: {

            'Authorization': `Bearer ${token}`

        }

    })

    return response.data

})



export const updateProfile = createAsyncThunk('auth/updateProfile',async(data)=>{

    const token = localStorage.getItem('token');

    const response = await axios.post(`${API}/update-profile`,data,{

        headers: {

            'Authorization': `Bearer ${token}`

        }

    })

    return response.data

})



const authSlice = createSlice({

    name: "auth",

    initialState:{

        user:null,

        token: localStorage.getItem('token') || null,

        isAuthenticated:false,

        loading:false,

        error:null,

        otpInfo:null,

        resetInfo:null

    },

    reducers:{

        logout:(state) =>{

            state.user = null;

            state.token = null;

            state.isAuthenticated = false;

            localStorage.removeItem('token');

            localStorage.removeItem('user');

        },

        clearError:(state) =>{

            state.error = null;

        }

    },

    extraReducers:(builder) =>{

        builder

        //login 

        .addCase(loginUser.pending,(state)=>{

            state.loading =true;

            state.error = null; 

        })

        .addCase(loginUser.fulfilled,(state,action)=>{

            state.loading = false;

            state.user = action.payload;

            state.isAuthenticated = true;



        })

            .addCase(loginUser.rejected,(state,action)=>{

                state.loading = false;

                state.error = action.error.message;

                state.isAuthenticated = false;

            })

            .addCase(logoutUser.fulfilled,(state)=>{

                state.user = null;

                state.token = null;

                state.isAuthenticated = false;

            })

            .addCase(forgotpassword.pending,(state,action)=>{

                state.loading = true;

                state.error = null;

            })

            .addCase(forgotpassword.fulfilled,(state,action)=>{

                state.loading = false;

                state.otpInfo = action.payload;

            })

            .addCase(forgotpassword.rejected,(state,action)=>{

                state.loading = false;

                state.error = action.error.message;

            })

            .addCase(resetpassword.pending,(state,actino)=>{

                state.loading = true;

                state.error = null;

            })

            .addCase(resetpassword.fulfilled,(state,action)=>{

                state.loading = false;

                state.resetInfo = action.payload;

            })

            .addCase(resetpassword.rejected,(state,action)=>{

                state.loading = false;

                state.error = action.error.message;

            })

         

            .addCase(updateProfile.pending,(state)=>{

                state.loading = true;

                state.error = null;

            })

            .addCase(updateProfile.fulfilled,(state,action)=>{

                state.loading = false;

                state.user = action.payload;

            })

            .addCase(updateProfile.rejected,(state,action)=>{

                state.loading = false;

                state.error = action.error.message;

            })



            .addCase(currentUser.pending,(state)=>{

                state.loading = true;

                state.error = null;

            })

            .addCase(currentUser.fulfilled,(state,action)=>{

                state.loading = false;

                state.user = action.payload;

            })

            .addCase(currentUser.rejected,(state,action)=>{

                state.loading = false;

                state.error = action.error.message;

            })

        }

})  



export const {logout,clearError} = authSlice.actions;

export default authSlice.reducer;

