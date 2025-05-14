const fs = require('fs/promises');
const readline = require('readline');
const fetch = require('node-fetch');

// Читання JSON-файлу конфігурації
async function readConfig(path) {
    const content = await fs.readFile(path, 'utf8');
    return JSON.parse(content);
}

// Отримання даних з NewsAPI
async function fetchNews(query, apiKey) {
    const endpoint = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}`;
    try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`Сталася помилка при запиті: ${err.message}`);
        return null;
    }
}

// Вивід результатів у консоль
function displayArticles(articles) {
    console.log('\nТОП-5 результатів:\n');
    articles.slice(0, 5).forEach((item, i) => {
        console.log(`[${i + 1}] ${item.title}`);
        console.log(`    Дата: ${new Date(item.publishedAt).toLocaleString()}`);
        console.log(`    Опис: ${item.description || 'Опис відсутній'}\n`);
    });
}

// Основна логіка
async function startApp() {
    const settings = await readConfig('config.json');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Введіть тему для пошуку новин: ', async (searchTerm) => {
        const newsData = await fetchNews(searchTerm, settings.api_key);

        if (newsData?.articles?.length > 0) {
            displayArticles(newsData.articles);
            await fs.writeFile('output.json', JSON.stringify(newsData, null, 2));
            console.log('Дані збережено у файл "output.json"');
        } else {
            console.log('Результатів не знайдено або сталася помилка.');
        }
        rl.close();
    });
}

startApp();
