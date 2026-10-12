import { useState } from "react";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch(
                `/api/v1/auth/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setMessage(data.message)
            onLogin(data.user);
            
        } catch (error) {
            setMessage(error.message);
        }

    };

    return (
        <>
            <h1>SoundVault</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email: </label>
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />

                <label htmlFor="password">Password: </label>
                <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />

                <button type="submit">Sign In</button>
            </form>

            <p>{message}</p>
        </>
    )
};