import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === "localhost" ? "http://localhost:5000/api" : "https://instatalk-tyq7.onrender.com/api");

const API = axios.create({
  baseURL: BASE_URL,
});

export const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export default API;
