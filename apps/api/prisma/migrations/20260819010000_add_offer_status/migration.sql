-- OfferStatus enum + coluna status em Offer
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'PUBLISHED', 'IGNORED', 'FAILED');

ALTER TABLE "Offer" ADD COLUMN "status" "OfferStatus" NOT NULL DEFAULT 'PENDING';

CREATE INDEX "Offer_status_idx" ON "Offer"("status");