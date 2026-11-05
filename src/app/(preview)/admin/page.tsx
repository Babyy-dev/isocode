import { requireRole } from "@/features/auth/session";
import { AdminWorkspace } from "@/features/admin/admin-workspace";
import { listCars, listCities, toCar } from "@/features/cars/repository";
import { listCityPrices } from "@/features/pricing/repository";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole("/admin", ["admin"]);
  const [cars, cities, prices] = await Promise.all([
    listCars(true),
    listCities(),
    listCityPrices(),
  ]);
  return (
    <AdminWorkspace cars={cars.map(toCar)} cities={cities} prices={prices} />
  );
}
