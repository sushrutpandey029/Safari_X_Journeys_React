import { getUserData } from "./storage";

export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// export const SESSION_DURATION = 5 * 60 * 1000; // 5 min testing

export const isUserSessionExpired = () => {
  const loginTime = getUserData("safarix_login_time");
  if (!loginTime) return true;
  return Date.now() - Number(loginTime) > SESSION_DURATION;
};

export const isGuideSessionExpired = () => {
  const loginTime = getUserData("guide_login_time");
  if (!loginTime) return true;
  return Date.now() - Number(loginTime) > SESSION_DURATION;
};
