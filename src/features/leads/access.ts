export type LeadActor = {
  userId: string;
  role: "admin" | "consultant";
  profile: string | null;
};

export function leadScope(actor: LeadActor): { consultant?: string } {
  if (actor.role === "admin") return {};
  if (!actor.profile)
    throw new Error(
      "Your consultant profile is not linked. Ask the operator to link your account.",
    );
  return { consultant: actor.profile };
}
