import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { FastifyBaseLogger } from "fastify";
import { db, schema } from "../db/index.js";

const MAX_AUDIT_INPUT_LENGTH = 200;

/**
 * Check whether tool operation audit logging is enabled.
 *
 * Two paths can enable it:
 *   1. The `auditToolOperations` admin setting is explicitly "true".
 *   2. An active enterprise license enables the `audit_export` feature.
 *
 * Returns false on any error so a broken check never blocks tool execution.
 */
export async function isToolAuditEnabled(): Promise<boolean> {
  try {
    const result = await db
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "auditToolOperations"))
      .limit(1);
    if (result.length > 0 && result[0].value === "true") return true;
  } catch {
    // fall through to enterprise check
  }

  try {
    const enterprise = await import("@snapotter/enterprise");
    return enterprise.isFeatureEnabled("audit_export");
  } catch {
    return false;
  }
}

export function sanitizeAuditInput(raw: string): string {
  return raw.replace(/[<>&"']/g, "").slice(0, MAX_AUDIT_INPUT_LENGTH) || "(empty)";
}

/**
 * Emit a structured audit log entry for security-relevant events.
 *
 * Dual-writes: structured stdout log (for aggregators) + DB row.
 */
export async function auditLog(
  logger: FastifyBaseLogger,
  event: string,
  details: Record<string, unknown> = {},
  ip: string | null = null,
): Promise<void> {
  logger.info({ audit: true, event, ip, ...details }, `[AUDIT] ${event}`);

  const actorId = (details.userId as string) ?? (details.adminId as string) ?? null;
  const actorUsername = (details.username as string) ?? (details.newUsername as string) ?? "system";
  const targetId = (details.targetUserId as string) ?? (details.keyId as string) ?? null;
  const targetType = deriveTargetType(event);

  try {
    await db.insert(schema.auditLog).values({
      id: randomUUID(),
      actorId,
      actorUsername,
      action: event,
      targetType,
      targetId,
      details,
      ipAddress: ip,
    });
  } catch {
    logger.warn({ event }, "Failed to write audit log to DB");
  }
}

function deriveTargetType(event: string): string | null {
  if (
    event.startsWith("USER_") ||
    event.startsWith("LOGIN") ||
    event.startsWith("PASSWORD") ||
    event.startsWith("OIDC_") ||
    event.startsWith("SAML_") ||
    event.startsWith("SCIM_") ||
    event.startsWith("MFA_") ||
    event === "LOGOUT"
  )
    return "user";
  if (event.startsWith("API_KEY")) return "api_key";
  if (event.startsWith("FILE")) return "file";
  if (event.startsWith("ROLE")) return "role";
  if (event === "SETTINGS_UPDATED" || event === "IP_ALLOWLIST_UPDATED") return "setting";
  if (event.startsWith("TOOL_") || event.startsWith("BATCH_") || event.startsWith("PIPELINE_"))
    return "tool";
  if (event.startsWith("LEGAL_HOLD")) return "compliance";
  if (event.startsWith("SIEM_") || event.startsWith("WEBHOOK_")) return "integration";
  return null;
}
