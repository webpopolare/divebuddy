import type { CollectionEntry } from 'astro:content';

type Article = CollectionEntry<'articles'>;

export function getRelatedArticles(
  current: Article,
  allArticles: Article[],
  limit = 3
): Article[] {
  return allArticles
    .filter((article) => article.data.slug !== current.data.slug)
    .map((article) => {
      let score = 0;

      if (article.data.series && article.data.series === current.data.series) {
        score += 50;
      }

      if (article.data.hub === current.data.hub) {
        score += 30;
      }

      const sharedClusters = article.data.clusters.filter((cluster) =>
        current.data.clusters.includes(cluster)
      );
      score += sharedClusters.length * 20;

      const sharedAudience = article.data.audience.filter((audience) =>
        current.data.audience.includes(audience)
      );
      score += sharedAudience.length * 10;

      if (current.data.related?.includes(article.data.slug)) {
        score += 100;
      }

      if (article.data.priority === 'P1') score += 5;
      if (article.data.priority === 'P2') score += 3;

      return { article, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);
}