import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const cybersoftToken = process.env.NEXT_PUBLIC_API_TOKEN_CYBERSOFT;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
}

if (!cybersoftToken) {
  throw new Error("NEXT_PUBLIC_API_TOKEN_CYBERSOFT is not configured");
}

export const axiosClient = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    TokenCybersoft: cybersoftToken,
  },
});

export const getAuthorizationHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});
