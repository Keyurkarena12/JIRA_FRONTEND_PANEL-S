import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../features/authSlice'
import workspaceReducer from '../features/WorkspaceSlice'

export const store = configureStore({
    
    reducer: {
        auth: authReducer,
        workspace: workspaceReducer,
    } 

})