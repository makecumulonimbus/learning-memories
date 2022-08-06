import { useState, useEffect, useContext, createContext } from "react";
import { firebaseApp } from "./firebaseConfig";
import LoadingApp from "../components/loading";

export const AuthContext = createContext();
export const AuthContextProvider = (props) => {
  const [user, setCurrentUser] = useState(null);
  const [error, setError] = useState(true);

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      setError(false);
    });
  }, []);
  if (error) {
    return (
      <>
        <section className="section section-hero section-shaped">
          <LoadingApp type={"bars"} color={"#5e72e4"} />
        </section>
      </>
    );
  }
  return <AuthContext.Provider value={{ user }} {...props} />;
};

export const useAuthState = () => {
  const auth = useContext(AuthContext);
  return { ...auth, isAuthenticated: auth.user != null };
};
