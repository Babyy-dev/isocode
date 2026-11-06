import { requireLeadActor, listLeads } from "@/features/leads/repository";
import { LeadWorkspace } from "@/features/leads/lead-workspace";
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const actor = await requireLeadActor();
  if (actor.role === "consultant" && !actor.profile)
    return (
      <section>
        <h1 className="section-title">Link your consultant profile</h1>
        <p className="mt-4 text-muted">
          Ask the operator to link your registered account to a showroom
          consultant profile. No buyer records are shown until that is done.
        </p>
      </section>
    );
  const { leads, fetchedAt } = await listLeads(actor);
  return <LeadWorkspace bookings={leads} renderedAt={fetchedAt} />;
}
