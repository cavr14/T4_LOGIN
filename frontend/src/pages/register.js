import { useState, useEffect } from 'react';
import RegisterForm from '../components/RegisterForm';
import Link from 'next/link';

export default function Register() {
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        fetch('http://localhost:3000/csrf-token', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setCsrfToken(data.csrfToken));
    }, []);

    return (
        <div className="container">
            <div className="card">
                <h1>Registro de Usuario</h1>
                <RegisterForm csrfToken={csrfToken} />
                <p style={{ marginTop: 16 }}>
                    ¿Ya tienes cuenta? <Link href="/">Inicia sesión</Link>
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
                }
                h1 {
                    text-align: center;
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
}