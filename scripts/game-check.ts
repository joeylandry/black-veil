/**
 * Cross-checks the whole Black Veil game bible. Exits non-zero if any check fails.
 *
 * npm run game:check
 */
import { formatReport, runValidation } from "@/lib/game/validate";

const report = runValidation();
console.log(formatReport(report));
process.exit(report.ok ? 0 : 1);
