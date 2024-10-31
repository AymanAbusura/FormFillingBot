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
    const { url, proxy } = req.body;

    try {
        const browserOptions = {
            headless: false,
            proxy: `http://${proxy}`,
        };
        const browser = await puppeteer.launch(browserOptions);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const firstLinkSelector = 'a';
        await page.waitForSelector(firstLinkSelector);
        const firstLink = await page.$(firstLinkSelector);
        if (firstLink) {
            await firstLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            sendEventMessage('Перешли на страницу формы. Начинаю заполнять формы автоматически.');
            
            const formCount = formData.length;

            const startTime = Date.now();

            for (const [index, data] of formData.entries()) {
                try {
                    await page.type('input[name="first_name"], input[name="firstname"], input[name="firstName"]', data.firstName);
                    await page.type('input[name="last_name"], input[name="lastname"], input[name="lastName"]', data.lastName);
                    await page.type('input[name="email"]', data.email);
                    await page.type('input[name="phone"], input[name="phone_visible"], input[type="tel"]', data.phone);

                    await page.evaluate(() => {
                        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
                        if (submitButton) submitButton.click();
                    });

                    await page.waitForNavigation({ waitUntil: 'networkidle0' });

                    // sendEventMessage(`Форма ${index + 1} of ${formCount} успешно отправлена.`);

                    await page.goto(url, { waitUntil: 'domcontentloaded' });
                    
                    await page.waitForSelector(firstLinkSelector);
                    await page.$eval(firstLinkSelector, link => link.click());
                    await page.waitForNavigation({ waitUntil: 'networkidle0' });

                } catch (formError) {
                    console.error(`Error submitting form ${index + 1}:`, formError);
                    sendEventMessage(`Ошибка отправки формы ${index + 1}.`);
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            const endTime = Date.now();
            const totalDuration = Math.round((endTime - startTime) / 1000);

            sendEventMessage('Все формы отправлены успешно.');
            sendEventMessage(`Общее время процесса: ${totalDuration} секунд.`);
            await browser.close();
            res.send('Все формы успешно отправлены.');

        } else {
            sendEventMessage('No links found on the landing page.');
            return res.status(400).send('No links found on the landing page.');
        }

    } catch (error) {
        console.error(error);
        sendEventMessage('Error during form submission.');
        res.status(500).send('Error during form submission.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});