import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CarDetail } from "@/features/cars/components/car-detail";
import { listCars, listCities, toCar } from "@/features/cars/repository";
import { listCityPrices } from "@/features/pricing/repository";
export const dynamic = "force-dynamic";
import { carPath, getLanguage } from "@/features/cars/presentation";

type CarPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

  return {
    title: `${car.model} ${car.variant} ${car.year}`,
    description: `Explore ${car.model} ${car.variant}: ${car.fuel}, ${car.year}, ${car.status.toLowerCase()}. Sample Brand X stock from Company A, Lucknow.`,
  };
}

export default async function CarPage({ params, searchParams }: CarPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const car = await findCar(slug);

  if (!car) notFound();

  const language = getLanguage(query.lang);
  const [prices, cities] = await Promise.all([
    listCityPrices(car.stockId, true),
    listCities(),
  ]);

  return (
    <div lang={language}>
      <SiteHeader language={language} path={`/cars/${slug}`} />
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
