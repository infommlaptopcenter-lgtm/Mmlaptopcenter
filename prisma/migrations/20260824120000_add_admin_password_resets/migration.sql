CREATE TABLE "AdminPasswordReset" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminPasswordReset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminPasswordReset_email_createdAt_idx" ON "AdminPasswordReset"("email", "createdAt");
CREATE INDEX "AdminPasswordReset_expiresAt_idx" ON "AdminPasswordReset"("expiresAt");