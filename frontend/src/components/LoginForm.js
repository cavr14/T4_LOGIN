import { useState } from 'react';
import { useRouter } from 'next/router';

// Formulario de login, con diseño mejorado
export default function LoginForm({ csrfToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMsg('');
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password, csrfToken }),
        });
        const data = await res.json();
        if (res.ok) {
            router.push('/main');
        } else {
            setMsg(data.error || 'Error');
        }
    };

    return (
        <form onSubmit={handleLogin} className="form">
            <label>
                Usuario:
                <input
                    className="input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Escribe tu usuario"
                    required
                    autoComplete="username"
                />
            </label>
            <label>
                Contraseña:
                <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                    autoComplete="current-password"
                />
            </label>
            <input type="hidden" value={csrfToken} />
            <button className="btn" type="submit">Ingresar</button>
            {msg && <div className="msg">{msg}</div>}
            <style jsx>{`
                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .input {
                    margin-top: 0.25rem;
                    padding: 0.6rem;
                    border: 1px solid #c3cfe2;
                    border-radius: 5px;
                    width: 100%;
                    font-size: 1rem;
                }
                .btn {
                    background: #50b3fa;
                    color: #fff;
                    border: none;
                    padding: 0.7rem;
                    border-radius: 6px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn:hover {
                    background: #3296e0;
                }
                .msg {
                    color: #e74c3c;
                    text-align: center;
                }
                label {
                    display: flex;
                    flex-direction: column;
                    font-size: 1rem;
                }
            `}</style>
        </form>
    );
}