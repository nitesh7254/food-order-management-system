import { createContext, useContext, useState } from "react";

const AuthContext = createContext();


export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [userEmail, setUserEmail] = useState(
        localStorage.getItem("userEmail")
    );

    const [userRole, setUserRole] = useState(
        localStorage.getItem("userRole")
    );


    function login(loginData) {

        localStorage.setItem("token", loginData.token);
        localStorage.setItem("userEmail", loginData.email);
        localStorage.setItem("userRole", loginData.role);

        setToken(loginData.token);
        setUserEmail(loginData.email);
        setUserRole(loginData.role);
    }


    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        setToken(null);
        setUserEmail(null);
        setUserRole(null);
    }


    const isAuthenticated = Boolean(token);


    return (
        <AuthContext.Provider
            value={{
                token,
                userEmail,
                userRole,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    return useContext(AuthContext);

}