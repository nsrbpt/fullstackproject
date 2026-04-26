import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
      query: () => '/allocation/all',
      providesTags: ['Allocation'],
    }),
    getSystemStats: builder.query({
      query: () => '/allocation/stats',
      providesTags: ['Allocation', 'Student', 'Hall'],
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
} = apiSlice;
