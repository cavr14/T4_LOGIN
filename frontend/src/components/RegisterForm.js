import { useState } from 'react';

// Formulario de registro con diseño mejorado
export default function RegisterForm({ csrfToken }) {
    const [usuario, setUsuario] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [msg, setMsg] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setMsg('');
        setSuccess(false);
        const res = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ usuario, password1, password2, csrfToken }),
        });
        const data = await res.json();
        if (res.ok) {
            setMsg('¡Usuario registrado!');
            setSuccess(true);
        } else {
            setMsg(data.error || 'Error');
        }
    };

    return (
        <form onSubmit={handleRegister} className="form">
            <label>
                Usuario:
                <input
                    className="input"
                    value={usuario}
                    onChange={e => setUsuario(e.target.value)}
                    placeholder="Ej: Cesar123"
                    required
                    autoComplete="username"
                />
            </label>
            <label>
                Contraseña:
                <input
                    className="input"
                    type="password"
                    value={password1}
                    onChange={e => setPassword1(e.target.value)}
                    placeholder="Mínimo 10 caracteres"
                    required
                    autoComplete="new-password"
                />
            </label>
            <label>
                Repetir contraseña:
                <input
                    className="input"
                    type="password"
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                    autoComplete="new-password"
                />
            </label>
            <input type="hidden" value={csrfToken} />
            <button className="btn" type="submit">Registrar</button>
            {msg && <div className={success ? "msg-success" : "msg"}>{msg}</div>}
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
                .msg-success {
                    color: #27ae60;
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