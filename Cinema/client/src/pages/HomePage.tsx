import { HeroSection } from '../components/sections/HeroSection';
import { FeaturedMoviesSection } from '../components/sections/FeaturedMoviesSection';
import { ScreeningsSection } from '../components/sections/ScreeningsSection';
import { AboutSection } from '../components/sections/AboutSection';

export function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedMoviesSection />
      <ScreeningsSection />
      <AboutSection />
    </main>
  );
}
