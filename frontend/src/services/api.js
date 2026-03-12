import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const client = axios.create({
  baseURL: API_BASE,
});

export const registerUser = (payload) =>
  client.post("/auth/register", payload).then((r) => r.data);

export const loginUser = (payload) =>
  client.post("/auth/login", payload).then((r) => r.data);

export const getMe = (token) =>
  client
    .get("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);

export const getRecommendedPlans = (token) =>
  client
    .get("/policies/recommended", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);

export const createPolicy = (token, plan_type) =>
  client
    .post(
      "/policies/create",
      { plan_type },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((r) => r.data);

export const getClaims = (token) =>
  client
    .get("/claims", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);

export const getRiskScore = (token) =>
  client
    .get("/risk/score", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);

export const getAnalytics = (token) =>
  client
    .get("/risk/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);

export const triggerCityDisruption = (token, { city, curfew }) =>
  client
    .post(
      "/claims/trigger",
      { city, curfew },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((r) => r.data);

export const simulateRainstormApi = (token, { city }) =>
  client
    .post(
      "/claims/simulate-rainstorm",
      { city },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((r) => r.data);

