/* eslint-disable no-unused-vars */
// App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [url, setUrl] = useState('');
    const [proxy, setProxy] = useState('');
    const [messages, setMessages] = useState([]);
    const [progress, setProgress] = useState('0/0');
    const [totalForms, setTotalForms] = useState(0);
    const [useProxy, setUseProxy] = useState(false); // State to handle proxy option

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessages([]);
        setProgress('0/0');
        setTotalForms(0);

        try {
            const eventSource = new EventSource(`http://localhost:5001/events`); //FOR LOCALHOST
            // const eventSource = new EventSource(process.env.REACT_APP_EVENTS_URL);

            eventSource.onmessage = (event) => {
                const { message } = JSON.parse(event.data);
                setMessages((prevMessages) => [...prevMessages, message]);

                if (message.startsWith('Starting form submission for')) {
                    const match = message.match(/for (\d+) forms/);
                    if (match) {
                        setTotalForms(Number(match[1]));
                        setProgress(`0/${match[1]}`);
                    }
                }

                const match = message.match(/Form (\d+) of (\d+)/);
                if (match) {
                    setProgress(`${match[1]}/${match[2]}`);
                }
            };

            // await axios.post('http://localhost:5001/fill-form', { url, proxy: useProxy ? proxy : '' }); //FOR LOCALHOST
            // await axios.post(process.env.REACT_APP_FILL_FORM_URL, { url, proxy: useProxy ? proxy : '' });

            if (useProxy) {
                await axios.post('http://localhost:5001/fill-form-with-proxy', { url, proxy }); // With Proxy FOR LOCALHOST
                // await axios.post(process.env.REACT_APP_FILL_FORM_URL_PROXY, { url, proxy }); // With Proxy FOR LOCALHOST
            } else {
                await axios.post('http://localhost:5001/fill-form-without-proxy', { url }); // Without Proxy FOR LOCALHOST
                // await axios.post(process.env.REACT_APP_FILL_FORM_URL, { url });
            }

            eventSource.onclose = () => {
                eventSource.close();
            };
        } catch (error) {
            setMessages((prevMessages) => [...prevMessages, 'Ошибка при заполнении формы']);
        }
    };

    return (
        <div className='app-container'>
            <div className='form-wrapper'>
                <h2>Бот для заполнения форм</h2>

                <div className="toggle-container">
                    <label>
                        <input
                            type="radio"
                            name="proxyOption"
                            value="withoutProxy"
                            checked={!useProxy}
                            onChange={() => setUseProxy(false)}
                        />
                        Без Proxy
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="proxyOption"
                            value="withProxy"
                            checked={useProxy}
                            onChange={() => setUseProxy(true)}
                        />
                        С Proxy
                    </label>
                </div>

                <form onSubmit={handleSubmit} className='form'>
                    <label htmlFor="url">Введите URL:</label>
                    <input
                        type="text"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/form"
                        required
                    />

                    {useProxy && (
                        <div className='proxy-input'>
                            <label htmlFor="proxy">Введите Proxy URL:</label>
                            <input
                                type="text"
                                id="proxy"
                                value={proxy}
                                onChange={(e) => setProxy(e.target.value)}
                                placeholder="http://username:password@proxyhost:port"
                                required
                            />
                        </div>
                    )}

                    <button type="submit">
                        Заполнить Форму
                    </button>
                </form>

                <div className='progress'>
                    <div className='progress-header'>
                        <h3>Прогресс:</h3> 
                        {/* {progress} */}
                    </div>
                    <ul className='progress-list'>
                        {messages.map((msg, index) => (
                            <li key={index} className={`progress-item ${msg.includes('Общее время процесса') ? 'total-process-time' : ''}`}>{msg}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default App;
