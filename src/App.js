import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5001/fill-form', { url });
            setMessage(response.data);
        } catch (error) {
            setMessage('Ошибка при заполнении формы');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Form Filler Bot</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="url">Enter URL:</label>
                <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/form"
                    style={{ width: '100%', marginBottom: '10px' }}
                    required
                />
                <button type="submit">Заполнить Форму</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default App;