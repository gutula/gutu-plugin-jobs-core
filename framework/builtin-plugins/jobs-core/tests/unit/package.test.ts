import { describe, expect, it } from "bun:test";
import { executeAction } from "@platform/schema";
import manifest from "../../package";
import { scheduleJobExecutionAction } from "../../src/actions/default.action";
import { jobDefinitionKeys } from "../../src/jobs/catalog";
import { scheduleJobExecution } from "../../src/services/main.service";

describe("plugin manifest", () => {
  it("keeps a stable package id and primary capability", () => {
    expect(manifest.id).toBe("jobs-core");
    expect(manifest.providesCapabilities).toContain("jobs.executions");
  });

  it("publishes explicit queue job envelopes", () => {
    expect(jobDefinitionKeys).toEqual([
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
    ]);
  });

  it("queues immediate executions with observability metadata", () => {
    expect(
      scheduleJobExecution({
        executionId: "35d875b5-a2e8-4ebb-a993-ecf15c17a7c1",
        tenantId: "c8bf9151-bc0a-4bc7-a6e1-cf54cb0b8284",
        jobKey: "notifications.dispatch",
        concurrency: 2,
        retries: 4,
        timeoutMs: 20_000,
        reason: "dispatch due notifications"
      })
    ).toEqual({
      ok: true,
      nextStatus: "queued",
      queue: "notifications",
      observabilityKey: "c8bf9151-bc0a-4bc7-a6e1-cf54cb0b8284:notifications.dispatch:35d875b5-a2e8-4ebb-a993-ecf15c17a7c1",
      concurrency: 2,
      retries: 4
    });
  });

  it("validates the scheduling contract for delayed work", async () => {
    const result = await executeAction(scheduleJobExecutionAction, {
      executionId: "35d875b5-a2e8-4ebb-a993-ecf15c17a7c1",
      tenantId: "c8bf9151-bc0a-4bc7-a6e1-cf54cb0b8284",
      jobKey: "crm.sync-segments",
      runAt: new Date(Date.now() + 60_000).toISOString(),
      concurrency: 1,
      retries: 2,
      timeoutMs: 30_000,
      reason: "nightly segment refresh"
    });

    expect(result).toEqual({
      ok: true,
      nextStatus: "scheduled",
      queue: "crm-sync",
      observabilityKey: "c8bf9151-bc0a-4bc7-a6e1-cf54cb0b8284:crm.sync-segments:35d875b5-a2e8-4ebb-a993-ecf15c17a7c1",
      concurrency: 1,
      retries: 2
    });
  });

  it("guards retry exhaustion for recovery queues", () => {
    expect(() =>
      scheduleJobExecution({
        executionId: "job:company-recovery:retry-exhaustion",
        tenantId: "tenant-platform",
        jobKey: "company.work-intakes.recover",
        concurrency: 1,
        retries: 6,
        timeoutMs: 90_000,
        reason: "simulate retry exhaustion guard"
      })
    ).toThrow(/requested retries 6 exceeds company\.work-intakes\.recover limit 5/);
  });

  it("guards timeout and concurrency limits on orchestration queues", () => {
    expect(() =>
      scheduleJobExecution({
        executionId: "job:workflow-escalation:timeout-overflow",
        tenantId: "tenant-platform",
        jobKey: "workflow.approvals.escalate",
        concurrency: 1,
        retries: 2,
        timeoutMs: 60_000,
        reason: "timeout should exceed escalation cap"
      })
    ).toThrow(/requested timeout 60000 exceeds workflow\.approvals\.escalate limit 45000/);

    expect(() =>
      scheduleJobExecution({
        executionId: "job:company-classify:concurrency-overflow",
        tenantId: "tenant-platform",
        jobKey: "company.work-intakes.classify",
        concurrency: 7,
        retries: 2,
        timeoutMs: 60_000,
        reason: "concurrency should exceed classify cap"
      })
    ).toThrow(/requested concurrency 7 exceeds company\.work-intakes\.classify limit 6/);
  });
});
