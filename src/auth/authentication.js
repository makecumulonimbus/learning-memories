import firebaseApp from "./firebaseConfig";
import React, { useEffect, useState } from "react";
import LoadingApp from '../components/loading';
import '../App.scss'

export const AuthContext = React.createContext();
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [pending, setPending] = useState(true);
    useEffect(() => {
        firebaseApp.auth().onAuthStateChanged((user) => {
            setCurrentUser(user)
            setPending(false)
        });
    }, []);
    if (pending) {
        return <>
            <section className="section section-hero section-shaped">
                <LoadingApp type={'bars'} color={'#5e72e4'} />
            </section>
        </>
    }
    return (
        <AuthContext.Provider
            value={{
                currentUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};