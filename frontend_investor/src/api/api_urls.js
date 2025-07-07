import axios from "axios";

const API_URLS = "http://127.0.0.1:8000/api/";

const apiClient = axios.create({
    baseURL: API_URLS,
    withCredentials: true,
});


export { API_URLS, apiClient };