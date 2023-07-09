// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


import {WeirdFlatTown} from "./WeirdFlatTown.sol";

import "hardhat/console.sol";

contract WeirdFlatTownBadges is ERC1155, Ownable {


  WeirdFlatTown private _weirdFlatTownContract;

  error CallerNotWeirdFlatTownContract();

  modifier onlyWeirdFlatTown() { 
    if(msg.sender != address(_weirdFlatTownContract)) revert CallerNotWeirdFlatTownContract(); 
    _; 
  }

  constructor() ERC1155("") Ownable() {}

  function mint(address user, uint256 id, uint256 amount) external onlyWeirdFlatTown {
    _mint(user, id, amount, "");
  }

  function uri(uint256 id) public view override returns (string memory) {
    return "";
  }

  //change this
  function contractURI() public view returns (string memory) {
    return "ipfs://";
  }

}