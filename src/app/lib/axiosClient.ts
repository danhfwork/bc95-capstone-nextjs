import "server-only";

import axios, { AxiosHeaders } from "axios";

export type CybersoftApiConfig = {
  baseURL: string;
  token: string;
};

function getEnvironmentValue(
  privateName: string,
  legacyPublicName: string,
): string | undefined {
  return process.env[privateName] || process.env[legacyPublicName];
}

export function getCybersoftApiConfig(): CybersoftApiConfig {
  const baseURL = getEnvironmentValue(
    "CYBERSOFT_API_BASE_URL",
    "NEXT_PUBLIC_API_BASE_URL",
  );
  const token = getEnvironmentValue(
    "CYBERSOFT_API_TOKEN",
    "NEXT_PUBLIC_API_TOKEN_CYBERSOFT",
  );

  if (!baseURL) {
    throw new Error(
      "CYBERSOFT_API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL) is not configured",
    );
  }

  if (!token) {
    throw new Error(
      "CYBERSOFT_API_TOKEN (or NEXT_PUBLIC_API_TOKEN_CYBERSOFT) is not configured",
    );
  }

  let parsedBaseURL: URL;

  try {
    parsedBaseURL = new URL(baseURL);
  } catch {
    throw new Error("CYBERSOFT_API_BASE_URL is not a valid URL");
  }

  if (!['http:', 'https:'].includes(parsedBaseURL.protocol)) {
    throw new Error("CYBERSOFT_API_BASE_URL must use HTTP or HTTPS");
  }

  return {
    baseURL: parsedBaseURL.toString().replace(/\/$/, ""),
    token,
  };
}

export const axiosClient = axios.create({
  headers: {
    Accept: "application/json",
  },
  timeout: 15_000,
});

axiosClient.interceptors.request.use((config) => {
  const { baseURL, token } = getCybersoftApiConfig();

  config.baseURL = baseURL;
  const headers = AxiosHeaders.from(config.headers);
  headers.set("TokenCybersoft", token);
  config.headers = headers;

  return config;
});

export const getAuthorizationHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});
