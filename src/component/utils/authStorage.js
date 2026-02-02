import { removeUserData } from "./storage";

// export const clearAuthStorage = () => {
//   removeUserData("safarix_user");
//   removeUserData("safarix_token");
//   removeUserData("safarix_refreshtoken");
//   removeUserData("safarix_login_time");
// };


export const clearUserAuth = () => {
  removeUserData("safarix_user");
  removeUserData("safarix_token");
  removeUserData("safarix_refreshtoken");
  removeUserData("safarix_login_time");
};

export const clearGuideAuth = () => {
  removeUserData("guide");
  removeUserData("guide_token");
  removeUserData("guide_refreshtoken");
  removeUserData("guide_login_time");
};
