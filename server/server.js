// server.js TESTING PROGRESS WITH AND WITHOUT PROXY
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const formData = require('./data');
const favicon = require('serve-favicon');
const path = require('path');

const app = express();
const PORT = 5001;

app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(cors());
app.use(express.json());

let clients = [];

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Form Filling Server!</h1>');
});

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

const sendEventMessage = (message) => {
    clients.forEach(client => client.write(`data: ${JSON.stringify({ message })}\n\n`));
};

app.post('/fill-form', async (req, res) => {
    const { 
        url, 
        proxy 
    } = req.body;

    try {
        const browserOptions = {
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                `--proxy-server=${proxy}` // Ensure `proxy` is in the correct format
            ]
            // args: [`--proxy-server=${proxy}`]
            // args: [`--proxy-server=http://${proxy}`]
        };
        const browser = await puppeteer.launch(browserOptions);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });

        const formCount = formData.length;
        const startTime = Date.now();

        sendEventMessage(`Начинается отправка форм ${formCount}.`);

        for (const [index, data] of formData.entries()) {
            try {
                await page.type('input[name="first_name"], input[name="firstname"], input[name="firstName"]', data.firstName);
                await page.type('input[name="last_name"], input[name="lastname"], input[name="lastName"]', data.lastName);
                await page.type('input[name="email"]', data.email);
                await page.type('input[name="phone"], input[type="tel"]', data.phone);

                await page.evaluate(() => {
                    const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
                    if (submitButton) submitButton.click();
                });

                await page.waitForNavigation({ waitUntil: 'networkidle0' });

                // if we need more details for the submitting the forms
                // completedForms++;

                // const elapsedTime = Date.now() - startTime;
                // const averageTimePerForm = elapsedTime / completedForms;
                // const estimatedTimeRemaining = (formCount - completedForms) * averageTimePerForm;

                // const estimatedSecondsRemaining = Math.ceil(estimatedTimeRemaining / 1000);
                // const message = `Form ${completedForms} of ${formCount} submitted successfully. Estimated time remaining: ${estimatedSecondsRemaining} seconds`;

                // sendEventMessage(message);

            } catch (formError) {
                console.error(`Error submitting form ${index + 1}:`, formError);
                sendEventMessage(`Ошибка отправки формы ${index + 1}.`);
            }

            await new Promise(resolve => setTimeout(resolve, 3000));

            await page.goto(url, { waitUntil: 'networkidle0' });
        }

        const endTime = Date.now();
        const totalDuration = Math.round((endTime - startTime) / 1000);

        await browser.close();
        sendEventMessage('Все формы отправлены успешно.');
        sendEventMessage(`Процесс завершен за: ${totalDuration} секунд.`);
        res.send('Процесс завершен.');
    } catch (error) {
        console.error(error);
        sendEventMessage('Error during form submission.');
        res.status(500).send('Error during form submission.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// server.js
// const express = require('express');
// const puppeteer = require('puppeteer-extra');
// const ProxyPlugin = require('puppeteer-extra-plugin-proxy');
// const cors = require('cors');
// const formData = require('./data');

// const app = express();
// const PORT = 5001;

// app.use(cors());
// app.use(express.json());

// let clients = [];

// app.get('/', (req, res) => {
//     res.send('<h1>Welcome to the Form Filling Server!</h1>');
// });

// app.get('/events', (req, res) => {
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     clients.push(res);

//     req.on('close', () => {
//         clients = clients.filter(client => client !== res);
//     });
// });

// const sendEventMessage = (message) => {
//     clients.forEach(client => client.write(`data: ${JSON.stringify({ message })}\n\n`));
// };

// app.post('/fill-form', async (req, res) => {
//     const { url, proxy } = req.body;

//     try {
//         const [protocol, rest] = proxy.split('://');
//         const [auth, host] = rest.split('@');
//         const [username, password] = auth.split(':');
//         const [address, port] = host.split(':');

//         // Use the Proxy Plugin for Puppeteer
//         puppeteer.use(ProxyPlugin({
//             address,
//             port,
//             credentials: { username, password }
//         }));

//         const browser = await puppeteer.launch({ headless: false });
//         const page = await browser.newPage();
//         await page.goto(url, { waitUntil: 'networkidle0' });

//         const formCount = formData.length;
//         sendEventMessage(`Starting form submission for ${formCount} forms.`);

//         for (const [index, data] of formData.entries()) {
//             try {
//                 await page.type('input[name="first_name"], input[name="firstname"], input[name="firstName"]', data.firstName);
//                 await page.type('input[name="last_name"], input[name="lastname"], input[name="lastName"]', data.lastName);
//                 await page.type('input[name="email"]', data.email);
//                 await page.type('input[name="phone"], input[type="tel"]', data.phone);

//                 await page.evaluate(() => {
//                     const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
//                     if (submitButton) submitButton.click();
//                 });

//                 await page.waitForNavigation({ waitUntil: 'networkidle0' });
//                 sendEventMessage(`Form ${index + 1} of ${formCount} submitted successfully.`);
//             } catch (formError) {
//                 console.error(`Error submitting form ${index + 1}:`, formError);
//                 sendEventMessage(`Error submitting form ${index + 1}.`);
//             }

//             await new Promise(resolve => setTimeout(resolve, 3000));
//             await page.goto(url, { waitUntil: 'networkidle0' });
//         }

//         await browser.close();
//         sendEventMessage('All forms submitted successfully.');
//         res.send('Process complete.');
//     } catch (error) {
//         console.error('Error during form submission:', error);
//         sendEventMessage('Error during form submission.');
//         res.status(500).send('Error during form submission.');
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });