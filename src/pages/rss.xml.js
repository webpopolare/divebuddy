import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articles = await getCollection('articles', ({ data }) => {
    return data.status === 'published' && data.publishDate <= new Date();
  });

  return rss({
    title: 'DiveBuddy',
    description: 'Informazione subacquea con voce femminile.',
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishDate,
      link: `/blog/${article.data.slug}/`,
    })),
  });
}