// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721A} from "erc721a/contracts/ERC721A.sol";
//import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract WeirdFlatTown is ERC721A, ReentrancyGuard, Ownable {
  
  uint256 private _terrainFee = 0.003 ether;

  string private immutable defaultURI;


  struct Neighborhood {
    address owner;
    bool locked;
    string finalURI;
    LandParcel[100] parcels;
  }

  struct LandParcel {
    address landLord;
    uint256 x;
    uint256 y;
    Estate estate;
  }

  struct Estate {
    string uri;
    string title;
    uint256 price;
  }

  mapping(uint256 nbhdId => Neighborhood nbhd) private _nbhds;

  mapping(uint256 landId => ParcelOfLand parcel) private _lands;
  mapping(uint256 estateId => Estate estate) private _estates;
  mapping(bytes32 => bool) private _coordsHashes;

  event MintedLand();
  event DevelopedLand();
  event UpdatedLandInfo();

  error WrongPrice(uint256 correctPrice);
  error NotLandOwner();
  error EstateNotExists();
  error MintNotAuthorized();
  error TooManyTerrain();
  error LandAlreadyBuyed();
  error LandAlreadyDeveloped();
  error LandInvalid();


  modifier onlyLandOwner(uint256 landId) {
    if (msg.sender != _lands[landId].owner) revert NotLandOwner(); 
    _; 
  }

  constructor(string calldata _defaultURI) ERC721A("WEIRD FLAT TOWN", "WFT") Ownable() {
    defaultURI = _defaultURI;
  }

  function mintLand(uint256 quantity, uint256[2][] calldata grid) external payable nonReentrant {
    if (quantity > 5) revert TooManyTerrain();
    if (_landFee * quantity != msg.value) revert WrongPrice({ correctPrice: _landFee * quantity });
    if (tx.origin != msg.sender) revert MintNotAuthorized();

    for (uint256 i; i < quantity; i++) {

      bytes32 coordsHash = keccak256(abi.encode(grid[i]));

      if (grid[i][0] > 2 || grid[i][1] > 2) revert LandInvalid();
      if (_coordsHashes[coordsHash]) revert LandAlreadyBuyed();

      _coordsHashes[coordsHash] = true;

      _lands[_nextTokenId() + i] = ParcelOfLand({
        title: "",
        message: "",
        buyedPrice: _landFee,
        owner: msg.sender,
        coords: grid[i],
        estate: _estates[0]
      });
    }

    _landFee += 0.0001 ether;

    _mint(msg.sender, quantity);

    emit MintedLand();
  }

  function mintTerrain(uint256 quantity) external payable {
    if (_numberMinted(msg.sender) + quantity > 10) revert TooManyTerrain();
    if (msg.value != quantity * _terrainFee) revert WrongPrice({ correctPrice: quantity * _terrainFee });
    if (tx.origin != msg.sender) revert MintNotAuthorized();

    for (uint256 i; i < quantity; i++) {

      _nbhds[_nextTokenId() + i] = Neighborhood({
        owner: msg.sender,
        locked: false,
        finalURI: "",
        parcels: []
      });

    }

    _mint(msg.sender, quantity);
  }

  function developLand(uint256 parcelId, uint256 terrainId, uint256 estateId) external nonReentrant {

    Neighborhood storage nbhd = _nbhds[terrainId];

    if (nbhd.parcels[parcelId].landLord != address(0)) revert LandAlreadyDeveloped();
    if (estateId == 0 || estateId > 15) revert EstateNotExists();

    nbhd.parcels[parcelId].landLord = msg.sender;
    nbhd.parcels[parcelId].estate = _estates[estateId];

    emit DevelopedLand();
  }

  function addEstates(
    string[15] calldata uris,
    string[15] calldata titles
  ) external onlyOwner {
    
    for (uint256 i; i < 15;) {

      unchecked {

        _estates[i+1] = Estate({  
          price: 0,
          uri: uris[i],
          title: titles[i] 
        });

        i++;

      }
    }

  }


  function updateLandInfo(uint256 landId, string calldata title, string calldata message) external onlyLandOwner(landId) {
    
    _lands[landId].title = title;
    _lands[landId].message = message;

    emit UpdatedLandInfo();
  }

  function collectFees() external onlyOwner {
    (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(success, "Withdraw fees error");
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    _requireMinted(tokenId);

    Neighborhood memory nbhd = _nbhds[tokenId];

    if (bytes(nbhd).length == 0) {
      return defaultURI;
    }

    return nbhd.finalURI;
  }

  function _startTokenId() internal pure override returns (uint256) {
    return 1;
  }
}
