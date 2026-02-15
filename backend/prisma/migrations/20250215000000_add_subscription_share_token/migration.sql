-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_share_token_key" ON "subscriptions"("share_token");
