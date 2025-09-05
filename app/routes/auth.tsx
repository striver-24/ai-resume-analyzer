import React, {useEffect} from "react";
import {usePuterStore} from "~/lib/puter";
import Footer from "~/components/Footer";
import {useLocation, useNavigate} from "react-router";

export const meta =() => ([
    { title: 'StackResume.ai | Auth'},
    { name: 'description', content: 'An account where you are logged in.' },
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1] || '/';
    const navigate = useNavigate();

    useEffect(() => {
        if(auth.isAuthenticated) navigate(next);
    },  [auth.isAuthenticated, next]);
    return (
        <main className="bg-[url('public/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center h-full">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>Log In to Continue Your Job Journey</h2>
                    </div>
                    <div>
                        {isLoading ? (
                            <button className="auth-button animate-pulse">
                                <p>Signing You In.....</p>
                            </button>
                        ) : (
                            <>
                                {auth.isAuthenticated ? (
                                    <button className="auth-button" onClick={auth.signOut}>
                                        <p>Log Out</p>
                                    </button>
                                ) : (
                                    <button className="auth-button" onClick={auth.signIn}>
                                        <p>Login</p>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </main>
    )
}

export default Auth;