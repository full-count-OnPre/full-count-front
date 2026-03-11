import client from "./client";

export const getComments = (gameId) => client.get(`/games/${gameId}/comments`);
export const postComment = (gameId, data) =>
  client.post(`/games/${gameId}/comments`, data);
