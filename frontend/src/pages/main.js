import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Página protegida con diseño sencillo
export default function Main() {
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:3000/me', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('No autenticado');
                return res.json();
            })
            .then(data => setUsername(data.username))
            .catch(() => router.push('/'));
    }, []);

    return (
        <div className="container">
            <div className="card">
                <h1>Bienvenido</h1>
                <p style={{ fontSize: '1.1rem' }}>
                    ¡Hola <b>{username}</b>! Has iniciado sesión correctamente.
                </p>
            </div>
            <style jsx>{`
                .container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(120deg, #f5f7fa 0%, #c3cfe2 100%);
                }
                .card {
                    background: #fff;
                    padding: 2rem 2.5rem;
                    border-radius: 10px;
                    box-shadow: 0 2px 16px 0 rgba(0,0,0,0.1);
                    min-width: 320px;
                    text-align: center;
                }
                h1 {
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
}