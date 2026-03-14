// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Web3MarketplaceNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct RoyaltyInfo {
        address creator;
        uint96 royaltyBps; // basis points (e.g., 1000 = 10%)
    }

    mapping(uint256 => RoyaltyInfo) private _royalties;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        uint96 royaltyBps
    );

    constructor() ERC721("Web3 Marketplace NFT", "W3MNFT") Ownable(msg.sender) {}

    /// @notice Mint a new NFT with an IPFS metadata URI
    /// @param tokenURI_ The IPFS URI pointing to the NFT metadata JSON
    /// @param royaltyBps Royalty percentage in basis points (max 5000 = 50%)
    /// @return tokenId The ID of the newly minted token
    function mint(
        string calldata tokenURI_,
        uint96 royaltyBps
    ) external returns (uint256) {
        require(royaltyBps <= 5000, "Royalty cannot exceed 50%");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        _royalties[tokenId] = RoyaltyInfo({
            creator: msg.sender,
            royaltyBps: royaltyBps
        });

        emit NFTMinted(tokenId, msg.sender, tokenURI_, royaltyBps);
        return tokenId;
    }

    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view returns (address receiver, uint256 royaltyAmount) {
        RoyaltyInfo memory info = _royalties[tokenId];
        return (info.creator, (salePrice * info.royaltyBps) / 10000);
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage) returns (bool) {
        return
            interfaceId == 0x2a55205a ||
            super.supportsInterface(interfaceId);
    }
}
