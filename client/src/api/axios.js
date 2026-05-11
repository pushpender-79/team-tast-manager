// import axios from 'axios'

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// })

// // Har request mein token automatically lagao
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// // 401 aane par logout karo
// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )

// export default API


import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',  // ← sirf ye line change karo
})

// Har request mein token automatically lagao
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 aane par logout karo
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API