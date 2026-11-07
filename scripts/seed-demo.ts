import { runDatabaseTask } from "./database-task";
import { ensureDemoAccounts } from "./demo/accounts";
import { resetDemoLeads } from "./demo/leads";
import { DEMO_BUYER_EMAIL, demoAccounts, demoLeads } from "./demo/fixtures";

// Reviewer accounts and a populated lead inbox. Safe to re-run: accounts are reused,
// demo leads (fixed ids, see DEMO_LEAD_ID_PREFIX) are reset; no other records are touched.
void runDatabaseTask(async (database) => {
  const ids = await ensureDemoAccounts(database, demoAccounts);
  const buyerId = ids.get(DEMO_BUYER_EMAIL)!;
  await resetDemoLeads(database, demoLeads, { id: buyerId, email: DEMO_BUYER_EMAIL });
  console.info(
    `Demo ready: ${demoAccounts.length} accounts, ${demoLeads.length} leads reset. Logins are listed in deployment.md.`,
  );
});
