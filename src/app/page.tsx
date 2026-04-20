import { LandingPage } from '@/components/buyer/LandingPage';
import { getFeaturedProducts, getRecentUnpaidQuotes } from '@/lib/database/queries/landing';

export default async function Home() {
  try {
    const [featuredProducts, recentQuotes] = await Promise.all([
      getFeaturedProducts(6),
      getRecentUnpaidQuotes(5),
    ]);

    return <LandingPage featuredProducts={featuredProducts} recentQuotes={recentQuotes} />;
  } catch (error) {
    console.error('Error loading landing page data:', error);
    // Fallback to empty state if data loading fails
    return <LandingPage featuredProducts={[]} recentQuotes={[]} />;
  }
}
