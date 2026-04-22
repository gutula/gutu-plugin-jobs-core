import { defineJob } from "@platform/jobs";
import { z } from "zod";

export const jobDefinitionKeys = [
  "crm.sync-segments",
  "files.scan-uploads",
  "notifications.dispatch",
  "notifications.dispatch.immediate",
  "notifications.dispatch.scheduled",
  "notifications.dispatch.digest",
  "notifications.dispatch.retry",
  "ai.runs.intake",
  "ai.runs.verify",
  "workflow.approvals.remind",
  "workflow.approvals.escalate",
  "company.work-intakes.classify",
  "company.work-intakes.recover"
] as const;

export const jobDefinitions = {
  "crm.sync-segments": defineJob({
    id: "crm.sync-segments",
    queue: "crm-sync",
    payload: z.object({
      tenantId: z.string().uuid(),
      segmentId: z.string().uuid().optional()
    }),
    concurrency: 2,
    retryPolicy: {
      attempts: 3,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 60_000,
    handler: () => undefined
  }),
  "files.scan-uploads": defineJob({
    id: "files.scan-uploads",
    queue: "files-security",
    payload: z.object({
      tenantId: z.string().uuid(),
      assetId: z.string().uuid()
    }),
    concurrency: 4,
    retryPolicy: {
      attempts: 5,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 120_000,
    handler: () => undefined
  }),
  "notifications.dispatch": defineJob({
    id: "notifications.dispatch",
    queue: "notifications",
    payload: z.object({
      tenantId: z.string().uuid(),
      messageId: z.string().uuid()
    }),
    concurrency: 10,
    retryPolicy: {
      attempts: 8,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 30_000,
    handler: () => undefined
  }),
  "notifications.dispatch.immediate": defineJob({
    id: "notifications.dispatch.immediate",
    queue: "notifications",
    payload: z.object({
      tenantId: z.string().uuid(),
      messageId: z.string().uuid()
    }),
    concurrency: 10,
    retryPolicy: {
      attempts: 8,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 30_000,
    handler: () => undefined
  }),
  "notifications.dispatch.scheduled": defineJob({
    id: "notifications.dispatch.scheduled",
    queue: "notifications",
    payload: z.object({
      tenantId: z.string().uuid(),
      messageId: z.string().uuid()
    }),
    concurrency: 8,
    retryPolicy: {
      attempts: 8,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 30_000,
    handler: () => undefined
  }),
  "notifications.dispatch.digest": defineJob({
    id: "notifications.dispatch.digest",
    queue: "notifications-digest",
    payload: z.object({
      tenantId: z.string().uuid(),
      messageId: z.string().uuid()
    }),
    concurrency: 4,
    retryPolicy: {
      attempts: 5,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 45_000,
    handler: () => undefined
  }),
  "notifications.dispatch.retry": defineJob({
    id: "notifications.dispatch.retry",
    queue: "notifications-retry",
    payload: z.object({
      tenantId: z.string().uuid(),
      messageId: z.string().uuid()
    }),
    concurrency: 4,
    retryPolicy: {
      attempts: 5,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 45_000,
    handler: () => undefined
  }),
  "ai.runs.intake": defineJob({
    id: "ai.runs.intake",
    queue: "ai-intake",
    payload: z.object({
      tenantId: z.string().uuid(),
      runId: z.string().min(2)
    }),
    concurrency: 6,
    retryPolicy: {
      attempts: 3,
      backoff: "exponential",
      delayMs: 1_500
    },
    timeoutMs: 60_000,
    handler: () => undefined
  }),
  "ai.runs.verify": defineJob({
    id: "ai.runs.verify",
    queue: "ai-verification",
    payload: z.object({
      tenantId: z.string().uuid(),
      runId: z.string().min(2)
    }),
    concurrency: 4,
    retryPolicy: {
      attempts: 3,
      backoff: "exponential",
      delayMs: 1_500
    },
    timeoutMs: 60_000,
    handler: () => undefined
  }),
  "workflow.approvals.remind": defineJob({
    id: "workflow.approvals.remind",
    queue: "workflow-approvals",
    payload: z.object({
      tenantId: z.string().uuid(),
      runId: z.string().min(2)
    }),
    concurrency: 8,
    retryPolicy: {
      attempts: 4,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 45_000,
    handler: () => undefined
  }),
  "workflow.approvals.escalate": defineJob({
    id: "workflow.approvals.escalate",
    queue: "workflow-escalations",
    payload: z.object({
      tenantId: z.string().uuid(),
      runId: z.string().min(2)
    }),
    concurrency: 4,
    retryPolicy: {
      attempts: 4,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 45_000,
    handler: () => undefined
  }),
  "company.work-intakes.classify": defineJob({
    id: "company.work-intakes.classify",
    queue: "company-intake",
    payload: z.object({
      tenantId: z.string().uuid(),
      intakeId: z.string().min(2)
    }),
    concurrency: 6,
    retryPolicy: {
      attempts: 4,
      backoff: "exponential",
      delayMs: 1_000
    },
    timeoutMs: 60_000,
    handler: () => undefined
  }),
  "company.work-intakes.recover": defineJob({
    id: "company.work-intakes.recover",
    queue: "company-recovery",
    payload: z.object({
      tenantId: z.string().uuid(),
      intakeId: z.string().min(2)
    }),
    concurrency: 4,
    retryPolicy: {
      attempts: 5,
      backoff: "exponential",
      delayMs: 2_000
    },
    timeoutMs: 90_000,
    handler: () => undefined
  })
} as const;

export type JobDefinitionKey = (typeof jobDefinitionKeys)[number];
