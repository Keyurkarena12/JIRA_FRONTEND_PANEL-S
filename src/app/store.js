import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../features/authSlice'
import workspaceReducer from '../features/WorkspaceSlice'
import projectReducer from '../features/ProjectSlice'
import taskReducer from '../features/TaskSlice'
import subscriptionReducer from '../features/subscriptionSlice'
import billingReducer from '../features/billingSlice'

export const store = configureStore({
    
    reducer: {
        auth: authReducer,
        workspace: workspaceReducer,
        project: projectReducer,
        task: taskReducer,
        subscription: subscriptionReducer,
        billing: billingReducer,
    } 

})