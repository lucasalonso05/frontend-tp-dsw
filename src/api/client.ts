import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const body = error.response?.data
    let message: string

    if (!error.response) {
      message = 'No se pudo conectar con el servidor'
    } else if (Array.isArray(body?.error)) {
      message = body.error.map((issue) => issue.message).join(' · ')
    } else if (typeof body?.error === 'string') {
      message = body.error
    } else {
      message = `Error ${error.response.status}`
    }

    return Promise.reject(new Error(message))
  },
)
