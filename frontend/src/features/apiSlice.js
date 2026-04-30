import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Allocation', 'Hall', 'Student'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    uploadStudents: builder.mutation({
      query: (fileData) => ({
        url: '/upload/students',
        method: 'POST',
        body: fileData,
      }),
      invalidatesTags: ['Student'],
    }),
    generateAllocation: builder.mutation({
      query: (data) => ({
        url: '/allocation/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Allocation'],
    }),
    getAllocation: builder.query({
      query: (examId) => `/allocation/${examId}`,
      providesTags: ['Allocation'],
    }),
    getAllAllocations: builder.query({
      query: () => '/allocations/all',
      providesTags: ['Allocation'],
    }),
    getSystemStats: builder.query({
      query: () => '/stats',
      providesTags: ['Allocation', 'Student', 'Hall'],
    }),
    deleteAllocation: builder.mutation({
      query: (examId) => ({
        url: `/allocation/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Allocation'],
    }),
    getHalls: builder.query({
      query: () => '/halls',
      providesTags: ['Hall'],
    }),
    createHall: builder.mutation({
      query: (data) => ({
        url: '/halls',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Hall'],
    }),
    updateHall: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/halls/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Hall'],
    }),
    deleteHall: builder.mutation({
      query: (id) => ({
        url: `/halls/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Hall'],
    }),
  }),
});

export const {
  useLoginMutation,
  useUploadStudentsMutation,
  useGenerateAllocationMutation,
  useGetAllocationQuery,
  useGetAllAllocationsQuery,
  useGetSystemStatsQuery,
  useDeleteAllocationMutation,
  useGetHallsQuery,
  useCreateHallMutation,
  useUpdateHallMutation,
  useDeleteHallMutation,
} = apiSlice;
