import axios from "axios";

export const api = axios.create({
    baseURL: "http://196.171.53.147:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

