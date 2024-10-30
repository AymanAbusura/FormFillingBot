/* eslint-disable no-unused-vars */
// /* eslint-disable no-unused-vars */
// // App.js WITH AND WITHOUT PROXY
// import React, { useState } from 'react';
// import axios from 'axios';
// import './App.css';


// function App() {
//     const [url, setUrl] = useState('');
//     const [proxy, setProxy] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [progress, setProgress] = useState('0/0');
//     const [totalForms, setTotalForms] = useState(0);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessages([]);
//         setProgress('0/0');
//         setTotalForms(0);

//         try {
//             const eventSource = new EventSource(`http://localhost:5001/events`, { withCredentials: false });

//             eventSource.onmessage = (event) => {
//                 const { message } = JSON.parse(event.data);
//                 setMessages((prevMessages) => [...prevMessages, message]);

//                 if (message.startsWith('Starting form submission for')) {
//                     const match = message.match(/for (\d+) forms/);
//                     if (match) {
//                         setTotalForms(Number(match[1]));
//                         setProgress(`0/${match[1]}`);
//                     }
//                 }

//                 const match = message.match(/Form (\d+) of (\d+)/);
//                 if (match) {
//                     setProgress(`${match[1]}/${match[2]}`);
//                 }
//             };

//             await axios.post('http://localhost:5001/fill-form', { url });

//             eventSource.onclose = () => {
//                 eventSource.close();
//             };

//         } catch (error) {
//             setMessages((prevMessages) => [...prevMessages, 'Ошибка при заполнении формы']);
//         }
//     };

//     return (
//         <div className='app-container'>
//             <div className='form-wrapper'>
//                 <h2>Бот для заполнения форм</h2>
//                 <form onSubmit={handleSubmit} className='form'>
//                     <label htmlFor="url">Введите URL:</label>
//                     <input
//                         type="text"
//                         id="url"
//                         value={url}
//                         onChange={(e) => setUrl(e.target.value)}
//                         placeholder="https://example.com/form"
//                         required
//                     />

//                     <label htmlFor="proxy">Введите Proxy URL:</label>
//                     <input
//                         type="text"
//                         id="proxy"
//                         value={proxy}
//                         onChange={(e) => setProxy(e.target.value)}
//                         placeholder="http://username:password@proxyhost:port"
//                         required
//                     />

//                     <button type="submit">
//                         Заполнить Форму
//                     </button>
//                 </form>

//                 <div className='progress'>
//                     <div className='progress-header'>
//                         <h3>Прогресс:</h3> {progress}
//                     </div>
//                     <ul className='progress-list'>
//                         {messages.map((msg, index) => (
//                             <li key={index} className='progress-item'>{msg}</li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default App;

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessages([]);
        setProgress('0/0');
        setTotalForms(0);

        try {
            const eventSource = new EventSource(`http://localhost:5001/events`);

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

            await axios.post('http://localhost:5001/fill-form', { url, proxy });

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

                    <label htmlFor="proxy">Введите Proxy URL:</label>
                    <input
                        type="text"
                        id="proxy"
                        value={proxy}
                        onChange={(e) => setProxy(e.target.value)}
                        placeholder="http://username:password@proxyhost:port"
                        required
                    />

                    <button type="submit">
                        Заполнить Форму
                    </button>
                </form>

                <div className='progress'>
                    <div className='progress-header'>
                        <h3>Прогресс:</h3> {progress}
                    </div>
                    <ul className='progress-list'>
                        {messages.map((msg, index) => (
                            <li key={index} className='progress-item'>{msg}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default App;