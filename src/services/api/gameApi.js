import client from "./client";

export const getGames = () => client.get("/games");
export const getGame = (id) => client.get(`/games/${id}`);
