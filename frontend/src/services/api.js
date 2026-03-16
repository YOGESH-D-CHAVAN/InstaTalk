import axios from "axios";

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocalhost 
  ? "http://localhost:5000/api" 
  : "https://instatalk-tyq7.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
});

export const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export default API;
