import axios from "axios";

export const USER_SIGN_UP = async (payload: any) => {
    const { data } = await axios.post("/api/v1/auth/signup", payload);
    return data;
}

export const USER_SIGN_IN = async (payload: any) => {
    const { data } = await axios.post("/api/v1/auth/login", payload);
    return data;
}

export const VALIDATE_USER_SESSION = async () => {
    const { data } = await axios.post("/api/v1/auth/verify-session");
    return data;
}