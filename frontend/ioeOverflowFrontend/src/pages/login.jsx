import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pagesStyles/login.css"
 
const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setisLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setisLoading(true);

        try {
            const requestBody = {
                password
            }
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
            if(isEmail)
            {
                requestBody.email = identifier;
            }else{
                requestBody.username = identifier;
            }
            const response = await fetch('http://localhost:8000/api/v1/users/login',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                }
            );
            
            const data = await response.json();
            console.log(data.data.user)
            if (response.ok) {
                localStorage.setItem('accessToken',data.data.accessToken)
                localStorage.setItem('refreshToken',data.data.refreshToken)
                navigate('/')
            }
            else {
                setError(data.message || 'Login Failed')
            }
        } catch (error) {
            setError("An error occured. Please try again");
            console.log('Login Error: ', error)
        } finally {
            setisLoading(false);
        }
    }

    const isEmail = (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">please Enter your details to log in</p>
                {error && <div className="error-message"></div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="identifier">
                            {isEmail(identifier) ? 'Email' : 'Username'}
                        </label>
                        <input
                            type="text"
                            id="identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value.trim())}
                            placeholder="Enter Username or email"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="options-row">
                        <div className="remember-me">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                        <a href="/forgot-password" className="forgot-password">
                            Forgot password?
                        </a>
                    </div>

                    <button type="submit" disabled={isLoading} className="login-button">
                        {isLoading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="signup-link">
                    Don't have an account? <a href="/register">register</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;