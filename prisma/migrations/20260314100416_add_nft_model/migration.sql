CREATE TABLE "nfts" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER,
    "chainId" INTEGER NOT NULL,
    "contractAddress" VARCHAR(42) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(1000),
    "category" TEXT,
    "fileUri" TEXT NOT NULL,
    "metadataUri" TEXT NOT NULL,
    "royaltyBps" INTEGER NOT NULL DEFAULT 1000,
    "creatorAddress" VARCHAR(42) NOT NULL,
    "txHash" VARCHAR(66),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nfts_creatorAddress_idx" ON "nfts"("creatorAddress");

CREATE INDEX "nfts_chainId_tokenId_idx" ON "nfts"("chainId", "tokenId");

ALTER TABLE "nfts" ADD CONSTRAINT "nfts_creatorAddress_fkey" FOREIGN KEY ("creatorAddress") REFERENCES "users"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
