import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { CarDetail } from "@/features/cars/components/car-detail";
import { listCars, listCities, toCar } from "@/features/cars/repository";
import { listCityPrices } from "@/features/pricing/repository";
import { carPath } from "@/features/cars/presentation";
import { carJsonLd, carMetadata, jsonLdScript } from "@/features/cars/seo";
import { requestLanguage } from "@/lib/i18n/request-language";

export const dynamic = "force-dynamic";

type CarPageProps = {
  params: Promise<{ slug: string }>;
};

async function findCar(slug: string) {
  const cars = (await listCars()).map(toCar);
  return cars.find((car) => carPath(car) === `/cars/${slug}`);
}

export async function generateMetadata({
  params,
}: CarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = await findCar(slug);

  if (!car) return { title: "Car not found" };
  return carMetadata(car, await requestLanguage());
}

export default async function CarPage({ params }: CarPageProps) {
  const { slug } = await params;
  const car = await findCar(slug);

  if (!car) notFound();

  const language = await requestLanguage();
  const [prices, cities] = await Promise.all([
    listCityPrices(car.stockId, true),
    listCities(),
  ]);

  return (
    <div lang={language}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(carJsonLd(car)) }}
      />
      <CarDetail
        car={car}
        language={language}
        prices={prices}
        cities={cities}
      />
      <SiteFooter language={language} />
    </div>
  );
}
