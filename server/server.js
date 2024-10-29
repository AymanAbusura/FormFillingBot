const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const formData = require('./data');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.post('/fill-form', async (req, res) => {
    const { url } = req.body;

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle0' });

        for (const data of formData) {
            await page.type('input[name="first_name"], input[name="firstname"], input[name="firstName"]', data.firstName);
            await page.type('input[name="last_name"], input[name="lastname"], input[name="lastName"]', data.lastName);
            await page.type('input[name="email"]', data.email);
            await page.type('input[name="phone"], input[type="tel"]', data.phone);

            await page.evaluate(() => {
                const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
                if (submitButton) {
                    submitButton.click();
                }
            });

            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            await new Promise(resolve => setTimeout(resolve, 3000));

            await page.goto(url, { waitUntil: 'networkidle0' });
        }

        await browser.close();
        res.send('Форма успешно заполнена и отправлена для всех записей');
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при заполнении формы');
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});