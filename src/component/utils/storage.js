export const getUserData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.log("error reading data from localstorage: ", err);
    return null;
  }
};

export const getUserToken = (key) => {
  try {
    const token = localStorage.getItem(key);
    return token ? token : null;
  } catch (err) {
    console.log("error reading data from localstorage: ", err);
    return null;
  }
};

export const saveUserData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.log("error in saving data to localstorage", err);
  }
};

export const removeUserData = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.log("error in removing data from localstorage.");
  }
};
