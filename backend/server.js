/* eslint-disable no-unused-vars */
// server.js TESTING PROGRESS WITH AND WITHOUT PROXY
require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const formData = require('./data');
const favicon = require('serve-favicon');
const path = require('path');

const app = express();
// const PORT = 5001;
const PORT = process.env.PORT || 5001;

app.use(favicon(path.join(__dirname, 'favicon.ico')));
// app.use(cors()); //FOR LOCALHOST
app.use(cors({
    origin: [process.env.CLIENT_ORIGIN, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));


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

// Route without Proxy
app.post('/fill-form-without-proxy', async (req, res) => {
    const { url } = req.body;

    try {
        const browserOptions = {
            executablePath: '/app/.cache/puppeteer/chrome',
            headless: true,
        };

        const browser = await puppeteer.launch(browserOptions);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.setViewport({width: 1080, height: 1024});

        const bodyContent = await page.evaluate(() => document.body && document.body.innerText.trim());
        if (!bodyContent) {
            sendEventMessage('Содержимое страницы пусто.');
            await browser.close();
            return res.status(400).send('Page content is empty.');
        } else {
            sendEventMessage('Содержимое страницы успешно загружено.');
        }

        const firstLinkSelector = 'a';
        await page.waitForSelector(firstLinkSelector);
        const firstLink = await page.$(firstLinkSelector);
        
        if (firstLink) {
            await firstLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            sendEventMessage('Перешли на страницу формы. Начало автоматической отправки форм.');
            
            const formCount = formData.length;
            const startTime = Date.now();

            for (const [index, data] of formData.entries()) {
                try {
                    await page.type('input[name="first_name"], input[name="firstname"], input[name="firstName"]', data.firstName);
                    await page.type('input[name="last_name"], input[name="lastname"], input[name="lastName"]', data.lastName);
                    await page.type('input[name="email"]', data.email);
                    await page.type('input[name="phone"], input[name="phone_visible"], input[type="tel"]', data.phone);

                    await page.evaluate(() => {
                        const submitButton = document.querySelector('button[type="submit"], input[type="submit"], .form-group .btn');
                        if (submitButton) submitButton.click();
                    });

                    await page.waitForNavigation({ waitUntil: 'networkidle0' });
                    await page.goto(url, { waitUntil: 'domcontentloaded' });
                    
                    await page.waitForSelector(firstLinkSelector);
                    await page.$eval(firstLinkSelector, link => link.click());
                    await page.waitForNavigation({ waitUntil: 'networkidle0' });

                } catch (formError) {
                    console.error(`Error submitting form ${index + 1}:`, formError);
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            const endTime = Date.now();
            const totalDuration = Math.round((endTime - startTime) / 1000);

            sendEventMessage('Все формы были успешно отправлены.');
            sendEventMessage(`Общее время процесса: ${totalDuration} секунд.`);
            await browser.close();
            res.send('All forms have been submitted successfully.');

        } else {
            sendEventMessage('Ссылки на целевой странице не найдены.');
            return res.status(400).send('No links found on the landing page.');
        }

    } catch (error) {
        console.error(error);
        sendEventMessage('Ошибка при отправке формы.' + error.message);
        res.status(500).send('Error during form submission.' + error.message);
    }
});

app.post('/fill-form-with-proxy', async (req, res) => {
    const { url, proxy } = req.body;

    try {
        const browserOptions = {
            executablePath: '/app/.cache/puppeteer/chrome',
            headless: true,
            proxy: `http://${proxy}`,
        };

        const browser = await puppeteer.launch(browserOptions);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.setViewport({width: 1080, height: 1024});

        const bodyContent = await page.evaluate(() => document.body && document.body.innerText.trim());
        if (!bodyContent) {
            sendEventMessage('Содержимое страницы пусто.');
            await browser.close();
            return res.status(400).send('Page content is empty.');
        } else {
            sendEventMessage('Содержимое страницы успешно загружено.');
        }

        const firstLinkSelector = 'a';
        await page.waitForSelector(firstLinkSelector);
        const firstLink = await page.$(firstLinkSelector);
        
        if (firstLink) {
            await firstLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            sendEventMessage('Перешли на страницу формы. Начало автоматической отправки форм.');
            
            const formCount = formData.length;
            const startTime = Date.now();

            for (const [index, data] of formData.entries()) {
                try {
                    await page.type('input[name="first_name"], input[name="firstname"], input[name="firstName"]', data.firstName);
                    await page.type('input[name="last_name"], input[name="lastname"], input[name="lastName"]', data.lastName);
                    await page.type('input[name="email"]', data.email);
                    await page.type('input[name="phone"], input[name="phone_visible"], input[type="tel"]', data.phone);

                    await page.evaluate(() => {
                        const submitButton = document.querySelector('button[type="submit"], input[type="submit"], .form-group .btn');
                        if (submitButton) submitButton.click();
                    });

                    await page.waitForNavigation({ waitUntil: 'networkidle0' });
                    await page.goto(url, { waitUntil: 'domcontentloaded' });
                    
                    await page.waitForSelector(firstLinkSelector);
                    await page.$eval(firstLinkSelector, link => link.click());
                    await page.waitForNavigation({ waitUntil: 'networkidle0' });

                } catch (formError) {
                    console.error(`Error submitting form ${index + 1}:`, formError);
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            const endTime = Date.now();
            const totalDuration = Math.round((endTime - startTime) / 1000);

            sendEventMessage('Все формы были успешно отправлены.');
            sendEventMessage(`Общее время процесса: ${totalDuration} секунд.`);
            await browser.close();
            res.send('All forms have been submitted successfully.');

        } else {
            sendEventMessage('Ссылки на целевой странице не найдены.');
            return res.status(400).send('No links found on the landing page.');
        }

    } catch (error) {
        console.error(error);
        sendEventMessage('Ошибка при отправке формы.');
        res.status(500).send('Error during form submission.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//FOR LOCALHOST
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });