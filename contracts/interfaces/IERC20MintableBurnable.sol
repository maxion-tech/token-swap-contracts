// SPDX-License-Identifier: MIT
pragma solidity =0.8.7;

interface IERC20MintableBurnable {
    function mint(address to, uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
    function grantRole(bytes32 role, address account) external;
}