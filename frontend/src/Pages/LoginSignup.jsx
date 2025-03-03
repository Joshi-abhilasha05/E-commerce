import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: ""
    });

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const login = async () => {
        console.log("Login Function Executed", formData);
        let responseData;
        await fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {
                Accept: 'application/form-data',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then((response) => response.json()).then((data) => responseData = data)
        if (responseData.success) {
            localStorage.setItem('auth-token', responseData.token);
            window.location.replace("/");
        }
        else {
            alert(responseData.errors)
        }
    };

    const signup = async () => {
        console.log("Signup Function Executed", formData);
        let responseData;
        await fetch('http://localhost:4000/signup', {
            method: 'POST',
            headers: {
                Accept: 'application/form-data',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then((response) => response.json()).then((data) => responseData = data)
        if (responseData.success) {
            localStorage.setItem('auth-token', responseData.token);
            window.location.replace("/");
        }
        else {
            alert(responseData.errors)
        }
    };

    const toggleState = () => {
        setState(state === "Sign Up" ? "Login" : "Sign Up");
    };

    return (
        <div className="loginsignup">
            <div className="loginsignup-container">
                <h1>{state}</h1>
                <div className="loginsignup-fields">
                    {state === "Sign Up" && (
                        <input
                            type="text"
                            name="username"
                            placeholder="Your Name"
                            value={formData.username}
                            onChange={changeHandler}
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={changeHandler}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={changeHandler}
                    />
                </div>
                <button onClick={() => (state === "Login" ? login() : signup())}>
                    Continue
                </button>
                <p className="loginsignup-login">
                    {state === "Sign Up"
                        ? "Already have an account?"
                        : "Don't have an account?"}{" "}
                    <span onClick={toggleState} style={{ cursor: "pointer", color: "blue" }}>
                        {state === "Sign Up" ? "Login here" : "Sign up here"}
                    </span>
                </p>
                <div className="loginsignup-agree">
                    <input type="checkbox" id="agree" />
                    <p>By continuing, I agree to the terms of use & policy.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
