export const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ticket-hive-twk0.onrender.com/',
    isDevelopment: process.env.NODE_ENV === 'development',
    cookieDomain: process.env.NODE_ENV === 'production' ? '.tickethive.fun' : 'localhost'
}
  