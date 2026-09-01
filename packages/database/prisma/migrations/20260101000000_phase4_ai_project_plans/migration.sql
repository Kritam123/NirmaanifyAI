-- CreateTable
CREATE TABLE "ai_project_plans" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "prompt" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ai_project_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_project_plans_workspaceId_idx" ON "ai_project_plans"("workspaceId");

-- CreateIndex
CREATE INDEX "ai_project_plans_projectId_idx" ON "ai_project_plans"("projectId");

-- CreateIndex
CREATE INDEX "ai_project_plans_expiresAt_idx" ON "ai_project_plans"("expiresAt");

-- AddForeignKey
ALTER TABLE "ai_project_plans" ADD CONSTRAINT "ai_project_plans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
