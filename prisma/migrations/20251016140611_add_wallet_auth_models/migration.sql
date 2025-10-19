-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "chainId" INTEGER,
    "nonce" VARCHAR(500),
    "nonceExpiry" TIMESTAMP(3),
    "avatar" TEXT,
    "bio" VARCHAR(500),
    "website" VARCHAR(255),
    "twitter" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");
