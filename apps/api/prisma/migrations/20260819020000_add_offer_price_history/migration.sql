-- OfferPriceHistory — snapshots de preço para histórico/menor preço
CREATE TABLE "OfferPriceHistory" (
    "id"         TEXT NOT NULL,
    "offerId"    TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OfferPriceHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OfferPriceHistory_offerId_createdAt_idx" ON "OfferPriceHistory"("offerId", "createdAt");

ALTER TABLE "OfferPriceHistory"
    ADD CONSTRAINT "OfferPriceHistory_offerId_fkey" FOREIGN KEY ("offerId")
    REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;