// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Web3MarketplaceNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId;
    uint96 public marketplaceFeeBps = 250; // 2.5%

    struct RoyaltyInfo {
        address creator;
        uint96 royaltyBps; // basis points (e.g., 1000 = 10%)
    }

    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(uint256 => RoyaltyInfo) private _royalties;
    mapping(uint256 => Listing) private _listings;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        uint96 royaltyBps
    );

    event ItemListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event ItemSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event ListingCanceled(
        uint256 indexed tokenId,
        address indexed seller
    );

    constructor() ERC721("Web3 Marketplace NFT", "W3MNFT") Ownable(msg.sender) {}

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

    function listItem(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be > 0");
        require(
            getApproved(tokenId) == address(this) || isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        _listings[tokenId] = Listing({
            seller: msg.sender,
            price: price
        });

        emit ItemListed(tokenId, msg.sender, price);
    }

    function buyItem(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = _listings[tokenId];
        require(listing.price > 0, "Not listed");
        require(msg.value == listing.price, "Wrong price");
        require(listing.seller != msg.sender, "Cannot buy own NFT");

        delete _listings[tokenId];

        uint256 marketplaceFee = (listing.price * marketplaceFeeBps) / 10000;
        RoyaltyInfo memory royalty = _royalties[tokenId];
        uint256 royaltyFee = 0;

        if (royalty.creator != address(0) && royalty.creator != listing.seller) {
            royaltyFee = (listing.price * royalty.royaltyBps) / 10000;
        }

        uint256 sellerProceeds = listing.price - marketplaceFee - royaltyFee;

        _transfer(listing.seller, msg.sender, tokenId);

        payable(listing.seller).transfer(sellerProceeds);
        if (royaltyFee > 0) {
            payable(royalty.creator).transfer(royaltyFee);
        }

        emit ItemSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing memory listing = _listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");

        delete _listings[tokenId];

        emit ListingCanceled(tokenId, msg.sender);
    }

    function getListing(uint256 tokenId) external view returns (address seller, uint256 price) {
        Listing memory listing = _listings[tokenId];
        return (listing.seller, listing.price);
    }

    // !
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

   // !
    function setMarketplaceFeeBps(uint96 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee cannot exceed 10%");
        marketplaceFeeBps = newFeeBps;
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
