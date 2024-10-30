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
            sendEventMessage('Перешли на страницу формы. Начинаем заполнять формы автоматически.');
            
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

                    sendEventMessage(`Форма ${index + 1} of ${formCount} успешно отправлена.`);

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


// app.post('/fill-form', async (req, res) => {
//     const { 
//         url, 
//         proxy 
//     } = req.body;

//     try {
//         const browserOptions = {
//             headless: false,
//             proxy: `http://${proxy}`,
//         };
//         const browser = await puppeteer.launch(browserOptions);
//         const page = await browser.newPage();
//         await page.goto(url, { waitUntil: 'domcontentloaded' });

//         // Click the first link on the landing page
//         const firstLinkSelector = 'a'; // This selects all anchor tags
//         await page.waitForSelector(firstLinkSelector); // Wait for the first link to be available
//         const firstLink = await page.$(firstLinkSelector); // Get the first link element
//         if (firstLink) {
//             await firstLink.click(); // Click the first link to go to the form page
//             await page.waitForNavigation({ waitUntil: 'networkidle0' }); // Wait for the navigation to complete
//             sendEventMessage('Navigated to the form page. Starting to fill the forms automatically.');

//             const formCount = formData.length;

//             for (const [index, data] of formData.entries()) {
//                 try {
//                     // Fill out the form fields
//                     await page.type('input[name="first_name"], input[name="firstname"], input[name="firstName"]', data.firstName);
//                     await page.type('input[name="last_name"], input[name="lastname"], input[name="lastName"]', data.lastName);
//                     await page.type('input[name="email"]', data.email);
//                     await page.type('input[name="phone"], input[name="phone_visible"], input[type="tel"]', data.phone);

//                     // Submit the form
//                     await page.evaluate(() => {
//                         const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
//                         if (submitButton) submitButton.click();
//                     });

//                     // Wait for the navigation after form submission
//                     await page.waitForNavigation({ waitUntil: 'networkidle0' });

//                     sendEventMessage(`Form ${index + 1} of ${formCount} submitted successfully.`);

//                     // Navigate back to the original landing page to fill the next form
//                     await page.goto(url, { waitUntil: 'domcontentloaded' });
                    
//                     // Click the first link again to go back to the form page
//                     await page.waitForSelector(firstLinkSelector);
//                     await page.$eval(firstLinkSelector, link => link.click());
//                     await page.waitForNavigation({ waitUntil: 'networkidle0' }); // Wait for the form page to load again

//                 } catch (formError) {
//                     console.error(`Error submitting form ${index + 1}:`, formError);
//                     sendEventMessage(`Error submitting form ${index + 1}.`);
//                 }

//                 // Wait before filling the next form (3 seconds)
//                 await new Promise(resolve => setTimeout(resolve, 3000));
//             }

//             sendEventMessage('All forms submitted successfully.');
//             res.send('All forms have been submitted.');

//         } else {
//             sendEventMessage('No links found on the landing page.');
//             return res.status(400).send('No links found on the landing page.');
//         }

//     } catch (error) {
//         console.error(error);
//         sendEventMessage('Error during form submission.');
//         res.status(500).send('Error during form submission.');
//     }
// });

// IT OPENED THE LAND BUT DOESNT FILLIT
// app.post('/fill-form', async (req, res) => {
//     const { 
//         url, 
//         proxy 
//     } = req.body;

//     try {
//         const browserOptions = {
//             headless: false,
//             proxy: `http://${proxy}`,
//         };
//         const browser = await puppeteer.launch(browserOptions);
//         const page = await browser.newPage();
//         await page.goto(url, { waitUntil: 'domcontentloaded' });

//         // Click the first link on the pre-landing page
//         const firstLinkSelector = 'a'; // This selects all anchor tags
//         await page.waitForSelector(firstLinkSelector); // Wait for the first link to be available
//         const firstLink = await page.$(firstLinkSelector); // Get the first link element
//         if (firstLink) {
//             await firstLink.click(); // Click the first link
//             await page.waitForNavigation({ waitUntil: 'networkidle0' }); // Wait for the navigation to complete
//             sendEventMessage('Navigated to the form page. You can fill out the forms manually.');

//             // Leave the browser open for the user to fill out the forms manually
//             res.send('You have been redirected to the form page. You can fill out the forms manually.');
//             return; // End the function here
//         } else {
//             sendEventMessage('No links found on the landing page.');
//             return res.status(400).send('No links found on the landing page.');
//         }

//     } catch (error) {
//         console.error(error);
//         sendEventMessage('Error during form submission.');
//         res.status(500).send('Error during form submission.');
//     }
// });

// WORKS WITH PROXY AND NAVIGATE TO LAND BUT its not submitting
// app.post('/fill-form', async (req, res) => {
//     const { 
//         url, 
//         proxy 
//     } = req.body;

//     try {
//         const browserOptions = {
//             headless: false,
//             proxy: `http://${proxy}`,
//         };
//         const browser = await puppeteer.launch(browserOptions);
//         const page = await browser.newPage();
//         await page.goto(url, { waitUntil: 'domcontentloaded' });

//         // Click the first link on the pre-landing page
//         const firstLinkSelector = 'a'; // This selects all anchor tags
//         await page.waitForSelector(firstLinkSelector); // Wait for the first link to be available
//         const firstLink = await page.$(firstLinkSelector); // Get the first link element
//         if (firstLink) {
//             await firstLink.click(); // Click the first link
//             await page.waitForNavigation({ waitUntil: 'networkidle0' }); // Wait for the navigation to complete
//         } else {
//             sendEventMessage('No links found on the landing page.');
//             return res.status(400).send('No links found on the landing page.');
//         }

//         const formCount = formData.length;
//         const startTime = Date.now();

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

//         const endTime = Date.now();
//         const totalDuration = Math.round((endTime - startTime) / 1000);

//         await browser.close();
//         sendEventMessage('All forms submitted successfully.');
//         sendEventMessage(`Process completed in: ${totalDuration} seconds.`);
//         res.send('Process complete.');
//     } catch (error) {
//         console.error(error);
//         sendEventMessage('Error during form submission.');
//         res.status(500).send('Error during form submission.');
//     }
// });

// WORKS 100% WITH PROXY
// app.post('/fill-form', async (req, res) => {
//     const { 
//         url, 
//         proxy 
//     } = req.body;

//     try {
//         const browserOptions = {
//             headless: false,
//             proxy: `http://${proxy}`,
//         };
//         const browser = await puppeteer.launch(browserOptions);
//         const page = await browser.newPage();
//         // await page.goto(url, { waitUntil: 'networkidle0' });
//         await page.goto(url, { waitUntil: 'domcontentloaded' });

//         const formCount = formData.length;
//         const startTime = Date.now();

//         sendEventMessage(`Начинается отправка форм ${formCount}.`);

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

//                 // if we need more details for the submitting the forms
//                 // completedForms++;

//                 // const elapsedTime = Date.now() - startTime;
//                 // const averageTimePerForm = elapsedTime / completedForms;
//                 // const estimatedTimeRemaining = (formCount - completedForms) * averageTimePerForm;

//                 // const estimatedSecondsRemaining = Math.ceil(estimatedTimeRemaining / 1000);
//                 // const message = `Form ${completedForms} of ${formCount} submitted successfully. Estimated time remaining: ${estimatedSecondsRemaining} seconds`;

//                 // sendEventMessage(message);

//             } catch (formError) {
//                 console.error(`Error submitting form ${index + 1}:`, formError);
//                 sendEventMessage(`Ошибка отправки формы ${index + 1}.`);
//             }

//             await new Promise(resolve => setTimeout(resolve, 3000));

//             await page.goto(url, { waitUntil: 'networkidle0' });
//         }

//         const endTime = Date.now();
//         const totalDuration = Math.round((endTime - startTime) / 1000);

//         await browser.close();
//         sendEventMessage('Все формы отправлены успешно.');
//         sendEventMessage(`Процесс завершен за: ${totalDuration} секунд.`);
//         res.send('Процесс завершен.');
//     } catch (error) {
//         console.error(error);
//         sendEventMessage('Error during form submission.');
//         res.status(500).send('Error during form submission.');
//     }
// });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});