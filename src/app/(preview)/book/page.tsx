import { requireSession } from "@/features/auth/session";
import { BookingForm } from "@/features/bookings/booking-form";
import { listCars, listCities, toCar } from "@/features/cars/repository";
import { listCityPrices } from "@/features/pricing/repository";
import { occupiedSlots } from "@/features/bookings/queries";
import { requestLanguage } from "@/lib/i18n/request-language";
export const dynamic = "force-dynamic";

export default async function BookPage() {
  await requireSession("/book");
  const [cars, cities, prices, slots, language] = await Promise.all([
    listCars(),
    listCities(),
    listCityPrices(undefined, true),
    occupiedSlots(),
    requestLanguage(),
  ]);
  return (
    <BookingForm
      cars={cars.map(toCar)}
      cities={cities}
      prices={prices}
      slots={slots}
      language={language}
    />
  );
}
