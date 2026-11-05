import { demoConsultants } from "@/features/demo/data";

type Workload = { consultant: string; leadStatus: string; status: string };

export function assignConsultant(
  leads: Workload[],
  showroom: string,
  carId: string,
) {
  const eligible = demoConsultants.filter(
    (person) => person.showroom === showroom && person.models.includes(carId),
  );
  const count = (name: string) =>
    leads.filter(
      (lead) =>
        lead.consultant === name &&
        lead.status !== "Cancelled" &&
        !["Won", "Lost"].includes(lead.leadStatus),
    ).length;
  eligible.sort(
    (a, b) => count(a.name) - count(b.name) || a.name.localeCompare(b.name),
  );
  return (
    eligible[0]?.name ??
    demoConsultants.find(
      (person) => person.showroom === showroom && !person.models.length,
    )?.name
  );
}
