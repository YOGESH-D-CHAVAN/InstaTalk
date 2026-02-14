import axios from "axios";

const BASE_URL = "https://instatalk-tyq7.onrender.com/api"; 
// const BASE_URL = "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL,
});

export const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export default API;
