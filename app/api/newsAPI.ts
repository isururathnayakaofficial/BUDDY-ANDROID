const API_KEY = "2f02a7215a8feccbe207fc1eb8856adf";

const topics = [
  "React Native",
  "Docker",
  "Kubernetes",
  "Artificial Intelligence"
];

export async function getArticles() {
  let articles: any[] = [];

  for (const topic of topics) {
    const url =
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&max=10&apikey=${API_KEY}`;

    const response = await fetch(url);

    const data = await response.json();

    if (data.articles) {
      articles.push(...data.articles);
    }
  }

  return articles;
}