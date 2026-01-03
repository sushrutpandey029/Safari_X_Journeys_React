import { getUserToken } from "./storage";

export const authHeaders = async () => {
  let token = getUserToken("safarix_token");
  console.log("token in authheaders", token);
  // 🔥 REMOVE accidental quotes
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};
