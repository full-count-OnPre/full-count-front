import client from "./client";

export const getGames = (params) => client.get("/games", { params });
export const getGame = async (id) => {
  const response = await client.get(`/games/${id}`);
  return response.data;
};
export const getGameLive = async (id) => {
  const response = await client.get(`/games/${id}/live`);
  return response.data;
};
export const getGameRelay = async (id, params) => {
  const response = await client.get(`/games/${id}/relay`, { params });
  return response.data;
};
export const getGameChat = async (id, params) => {
  const response = await client.get(`/games/${id}/chat`, { params });
  return response.data;
};
export const postGameChat = async (id, message) => {
  const response = await client.post(`/games/${id}/chat`, { message });
  return response.data;
};
