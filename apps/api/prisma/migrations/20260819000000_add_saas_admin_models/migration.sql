-- AlterTable
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PlanConfig" (
    "tier" "PlanTier" NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "apiCallsLimit" INTEGER NOT NULL DEFAULT 0,
    "dispatchesLimit" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("tier")
);

-- CreateTable
CREATE TABLE "PaymentConfig" (
    "id" TEXT NOT NULL,
    "pixKey" TEXT,
    "pixMerchantName" TEXT,
    "pixCity" TEXT,
    "pixCopiaECola" TEXT,
    "pixEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pixInstructions" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentConfig_pkey" PRIMARY KEY ("id")
);