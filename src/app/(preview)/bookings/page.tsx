import { requireSession } from "@/features/auth/session";
import { BuyerBookings } from "@/features/bookings/buyer-bookings";
import { buyerBookings } from "@/features/bookings/queries";
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await requireSession("/bookings");
  const bookings = await buyerBookings(session.user.id);
  return <BuyerBookings bookings={bookings} />;
}
