import { SiteFooter } from "@/components/layout/site-footer";
import {
  CatalogueHero,
  ShowroomHighlights,
} from "@/features/cars/components/catalogue-hero";
import { CarCatalogue } from "@/features/cars/components/car-catalogue";
import { listCars, toCar } from "@/features/cars/repository";
import { requestLanguage } from "@/lib/i18n/request-language";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const language = await requestLanguage();
  return {
    alternates: {
      canonical: language === "hi" ? "/?lang=hi" : "/",
      languages: { "en-IN": "/", "hi-IN": "/?lang=hi", "x-default": "/" },
    },
  };
}

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const cars = (await listCars()).map(toCar);
  const query = await searchParams;
  const language = await requestLanguage();
  const type =
    query.type === "New" || query.type === "Used" ? query.type : "All";

  return (
    <div lang={language}>
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
