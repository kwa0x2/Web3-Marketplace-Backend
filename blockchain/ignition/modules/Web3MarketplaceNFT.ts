import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Web3MarketplaceNFTModule", (m) => {
  const nft = m.contract("Web3MarketplaceNFT");

  return { nft };
});
