/**
 * Central catalog of all backend API paths.
 * Paths are relative to API_BASE_URL (/api).
 * OAuth URLs use full origin (browser redirect).
 */
import { API_ORIGIN, AUTH_API } from '../config/api';

export const ENDPOINTS = {
  health: '/',

  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    currentUser: '/auth/current-user',
    user: '/auth/user',
    updateProfile: '/auth/update-profile',
    changePassword: '/auth/change-password',
  },

  workspace: {
    create: '/workspace/create',
    list: '/workspace/get-workspaces',
    byId: (workspaceId) => `/workspace/get-workspaces/${workspaceId}`,
    addMember: (workspaceId) => `/workspace/add-member/${workspaceId}`,
    acceptInvite: (token) => `/workspace/accept-invite?token=${encodeURIComponent(token)}`,
    members: (workspaceId) => `/workspace/get-workspace-members/${workspaceId}`,
    acceptedInvites: (workspaceId) => `/workspace/get-accepted-invites/${workspaceId}`,
  },

  project: {
    create: (workspaceId) => `/project/create-project/${workspaceId}`,
    list: (workspaceId) => `/project/get-all-projects/${workspaceId}`,
    update: (projectId) => `/project/update-project/${projectId}`,
    delete: (projectId) => `/project/delete-project/${projectId}`,
    addMember: (projectId) => `/project/add-projectmember/${projectId}`,
    members: (projectId) => `/project/get-project-members/${projectId}`,
    createTask: (projectId) => `/project/task/${projectId}`,
  },

  task: {
    byProject: (projectId) => `/task/project/${projectId}`,
    byId: (taskId) => `/task/${taskId}`,
    update: (taskId) => `/task/${taskId}`,
    delete: (taskId) => `/task/${taskId}`,
    assignee: (taskId) => `/task/assignee/${taskId}`,
    move: (taskId) => `/task/move/${taskId}`,
    comment: (taskId) => `/task/comments/${taskId}`,
  },

  plan: {
    all: '/plan/get-all-plans',
    byName: (name) => `/plan/${name}`,
  },

  subscription: {
    checkout: '/subscription/create-checkout-session',
    verifyCheckout: '/subscription/verify-checkout-session',
    billingHistory: '/subscription/billing-history',
    cancelRecurring: '/subscription/cancel-recurring-billing',
    testingEndDate: '/subscription/set-testing-end-date',
  },

  chat: {
    workspace: (workspaceId) => `/chat/workspace/${workspaceId}`,
    project: (projectId) => `/chat/project/${projectId}`,
    messages: (roomId) => `/chat/messages/${roomId}`,
    rooms: '/chat/rooms',
    directConversations: '/chat/direct/conversations',
    directSearch: '/chat/direct/search',
    directByUser: (userId) => `/chat/direct/${userId}`,
    directCreate: '/chat/direct',
  },
};

/** Full URLs for OAuth browser redirects */
export const OAUTH_URLS = {
  google: `${AUTH_API}/google`,
  github: `${AUTH_API}/github`,
};

export const HEALTH_URL = `${API_ORIGIN}/`;
