// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ERC721} from "./ERC721.sol";
import {ERC721URIStorage} from "./ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyToken is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenId;

    constructor(address initialOwner)
        ERC721("PropertyToken", "PTK")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "demo";
    } 

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = ++_tokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenId;
    }

    function giveRentTo(address to, uint256 tokenId) onlyOwner public
    {
       transferFromOwner(to,tokenId);
    }
    function giveRentBack(address to, uint256 tokenId) onlyOwner public
    {
       transferToOwner(to,tokenId);
    }
}
