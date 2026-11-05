import { requireSession } from "@/features/auth/session";
import { BookingForm } from "@/features/bookings/booking-form";
import { listCars, listCities, toCar } from "@/features/cars/repository";
import { listCityPrices } from "@/features/pricing/repository";
import { occupiedSlots } from "@/features/bookings/queries";
export const dynamic = "force-dynamic";

export default async function BookPage() {
  await requireSession("/book");
  const [cars, cities, prices, slots] = await Promise.all([
    listCars(),
    listCities(),
    listCityPrices(undefined, true),
    occupiedSlots(),
  ]);
  return (
    <BookingForm
      cars={cars.map(toCar)}
      cities={cities}
      prices={prices}
      slots={slots}
    />
  );
}
