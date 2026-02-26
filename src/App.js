import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



import RootNavigation from "./component/navigations/RootNavigation";
import ScrollToTop from "./component/common/ScrollToTop";
// import { logout } from "./redux/slices/authSlice";
import { logout } from "./component/redux/slices/authSlice";
import {
  isUserSessionExpired,
  isGuideSessionExpired,
  SESSION_DURATION,
} from "./component/utils/session";
import { clearUserAuth, clearGuideAuth } from "./component/utils/authStorage";
import { getUserData } from "./component/utils/storage";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔹 On app load
  useEffect(() => {
    if (isUserSessionExpired()) {
      clearUserAuth();
    }
    if (isGuideSessionExpired()) {
      clearGuideAuth();
    }
  }, []);

  // 🔹 Auto logout timers
  useEffect(() => {
    setupAutoLogout("safarix_login_time", clearUserAuth);
    setupAutoLogout("guide_login_time", clearGuideAuth);
  }, []);

  const setupAutoLogout = (key, clearFn) => {
    const loginTime = getUserData(key);
    if (!loginTime) return;

    const expiresIn = SESSION_DURATION - (Date.now() - Number(loginTime));

    if (expiresIn <= 0) {
      clearFn();
      dispatch(logout());
      navigate("/");
    } else {
      const timer = setTimeout(() => {
        clearFn();
        dispatch(logout());
        navigate("/");
      }, expiresIn);

      return () => clearTimeout(timer);
    }
  };

  return (
    <div>
      <ScrollToTop />
      <RootNavigation />
       <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
