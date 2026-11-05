import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  CatalogueHero,
  ShowroomHighlights,
} from "@/features/cars/components/catalogue-hero";
import { CarCatalogue } from "@/features/cars/components/car-catalogue";
import { listCars, toCar } from "@/features/cars/repository";
export const dynamic = "force-dynamic";
import { getLanguage } from "@/features/cars/presentation";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const cars = (await listCars()).map(toCar);
  const query = await searchParams;
  const language = getLanguage(query.lang);
  const type =
    query.type === "New" || query.type === "Used" ? query.type : "All";

  return (
    <div lang={language}>
      <SiteHeader language={language} />
      <main id="main-content">
        {cars[0] && <CatalogueHero car={cars[0]} language={language} />}
        <ShowroomHighlights language={language} />
        <CarCatalogue
          key={`${language}-${type}-${query.available}`}
          cars={cars}
          language={language}
          initialType={type}
          availableOnly={query.available === "true"}
        />
      </main>
      <SiteFooter language={language} />
    </div>
  );
}
