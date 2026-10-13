// Base URL of the Flask API. Set NEXT_PUBLIC_API_URL in the hosting
// environment for a deployed build; falls back to the local dev server.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
