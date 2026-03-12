import client from "./client";

export const getComments = async (gameId, params) => {
  const response = await client.get(`/games/${gameId}/chat`, { params });
  return response.data;
};

export const postComment = async (gameId, message) => {
  const response = await client.post(`/games/${gameId}/chat`, { message });
  return response.data;
};
