import { requireSession } from "@/features/auth/session";
import { BuyerBookings } from "@/features/bookings/buyer-bookings";
import { buyerBookings } from "@/features/bookings/queries";
import { requestLanguage } from "@/lib/i18n/request-language";
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await requireSession("/bookings");
  const [bookings, language] = await Promise.all([
    buyerBookings(session.user.id),
    requestLanguage(),
  ]);
  return <BuyerBookings bookings={bookings} language={language} />;
}
