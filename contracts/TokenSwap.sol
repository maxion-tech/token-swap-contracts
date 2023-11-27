// SPDX-License-Identifier: MIT
pragma solidity =0.8.7;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./interfaces/IERC20MintableBurnable.sol";

/**
 * @title TokenSwap
 * @dev This contract acts as a bridge between two types of tokens, allowing users to swap
 * between a transferable and a mintable/burnable token.
 */
contract TokenSwap is Pausable, AccessControlEnumerable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20MintableBurnable;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE"); // Role identifier for pausing functionality of the contract

    IERC20 public immutable transferToken; // Token that can be transferred by users
    IERC20MintableBurnable public immutable mintableToken; // Token that can be minted and burnt

    uint256 public rate; // Rate at which the tokens can be swapped
    uint256 public transferTokenFeePercentage; // Fee percentage for transferring token
    uint256 public mintableTokenFeePercentage; // Fee percentage for mintable token
    uint256 public constant DENOMINATOR = 10 ** 10; // Denominator for calculating fee percentage
    uint256 public constant FEE_PERCENTAGE_MAX = 90 * 10 ** 8; // Maximum fee percentage (90%)
    uint256 public constant MAX_RATE = 200; // Maximum rate

    event RateSet(uint256 oldRate, uint256 newRate); // Event emitted when the rate is set
    event FeesSet(
        uint256 oldTransferTokenFeePercentage,
        uint256 newTransferTokenFeePercentage,
        uint256 oldMintableTokenFeePercentage,
        uint256 newMintableTokenFeePercentage
    ); // Event emitted when the fees are set
    event SwappedTransferToMintable(
        address indexed user,
        uint256 amount,
        uint256 receivedAmount
    ); // Event emitted when tokens are swapped from transfer to mintable
    event SwappedMintableToTransfer(
        address indexed user,
        uint256 amount,
        uint256 receivedAmount
    ); // Event emitted when tokens are swapped from mintable to transfer

    /**
     * @dev Contract constructor that sets initial values.
     * @param _admin - Address of the admin.
     * @param _transferToken - Address of the transferable token.
     * @param _mintableToken - Address of the mintable token.
     * @param _rate - Initial rate for token swap.
     * @param _transferTokenFeePercentage - Initial transfer token fee percentage.
     * @param _mintableTokenFeePercentage - Initial mintable token fee percentage.
     */
    constructor(
        address _admin,
        address _transferToken,
        address _mintableToken,
        uint256 _rate,
        uint256 _transferTokenFeePercentage,
        uint256 _mintableTokenFeePercentage
    ) {
        require(_admin != address(0), "TokenSwap: Admin address cannot be 0");
        require(
            _transferToken != address(0),
            "TokenSwap: Transfer Token address cannot be 0"
        );
        require(
            _mintableToken != address(0),
            "TokenSwap: Mintable Token address cannot be 0"
        );
        require(_rate > 0, "TokenSwap: Rate must be greater than 0");
        require(
            _transferTokenFeePercentage <= FEE_PERCENTAGE_MAX,
            "TokenSwap: Transfer Token fee percentage must be less than or equal to 100"
        );
        require(
            _mintableTokenFeePercentage <= FEE_PERCENTAGE_MAX,
            "TokenSwap: Mintable Token fee percentage must be less than or equal to 100"
        );
        require(
            _transferToken != _mintableToken,
            "TokenSwap: Transfer Token and Mintable Token cannot be same"
        );

        _setupRole(DEFAULT_ADMIN_ROLE, _admin); // Assigns the admin role to the specified address
        _setupRole(PAUSER_ROLE, _admin); // Assigns the pauser role to the specified address

        transferToken = IERC20(_transferToken); // Sets the transfer token
        mintableToken = IERC20MintableBurnable(_mintableToken); // Sets the mintable token
        rate = _rate; // Sets the rate
        transferTokenFeePercentage = _transferTokenFeePercentage; // Sets the transfer token fee percentage
        mintableTokenFeePercentage = _mintableTokenFeePercentage; // Sets the mintable token fee percentage
    }

    /**
     * @dev Allows admin to set the rate of the token swap.
     * @param _rate - New rate to set.
     */
    function setRate(uint256 _rate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _rate > 0 && _rate <= MAX_RATE,
            "TokenSwap: Rate must be greater than 0 and less than max rate"
        );
        uint256 oldRate = rate;
        rate = _rate;
        emit RateSet(oldRate, _rate);
    }

    /**
     * @dev Allows admin to set the fees for token swap.
     * @param _transferTokenFeePercentage - New transfer token fee percentage to set.
     * @param _mintableTokenFeePercentage - New mintable token fee percentage to set.
     */
    function setFees(
        uint256 _transferTokenFeePercentage,
        uint256 _mintableTokenFeePercentage
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _transferTokenFeePercentage <= FEE_PERCENTAGE_MAX,
            "TokenSwap: Transfer Token fee percentage must be less than or equal to 100"
        );
        require(
            _mintableTokenFeePercentage <= FEE_PERCENTAGE_MAX,
            "TokenSwap: Mintable Token fee percentage must be less than or equal to 100"
        );
        uint256 oldTransferTokenFeePercentage = transferTokenFeePercentage;
        uint256 oldMintableTokenFeePercentage = mintableTokenFeePercentage;
        transferTokenFeePercentage = _transferTokenFeePercentage;
        mintableTokenFeePercentage = _mintableTokenFeePercentage;
        emit FeesSet(
            oldTransferTokenFeePercentage,
            _transferTokenFeePercentage,
            oldMintableTokenFeePercentage,
            _mintableTokenFeePercentage
        );
    }

    /**
     * @dev Allows users to swap their transfer tokens to mintable tokens.
     * @param amount - Amount of transfer tokens to swap.
     */
    function swapTransferToMintable(
        uint256 amount
    ) external whenNotPaused nonReentrant {
        require(amount > 0, "TokenSwap: Amount must be greater than 0");

        uint256 initialBalance = transferToken.balanceOf(address(this));
        transferToken.safeTransferFrom(msg.sender, address(this), amount); // Transfers the specified amount of transfer tokens from the user to this contract
        uint256 finalBalance = transferToken.balanceOf(address(this));
        uint256 actualReceived = finalBalance - initialBalance;

        uint256 fee = (actualReceived * transferTokenFeePercentage) /
            DENOMINATOR; // Calculates the fee
        uint256 amountToSwap = actualReceived - fee; // Amount after deducting the fee
        uint256 mintableAmount = amountToSwap / rate; // Calculates the equivalent mintable token amount

        mintableToken.mint(msg.sender, mintableAmount); // Mints the equivalent amount of mintable tokens to the user

        emit SwappedTransferToMintable(msg.sender, amount, mintableAmount); // Emits an event after swapping the tokens
    }

    /**
     * @dev Allows users to swap their mintable tokens to transfer tokens.
     * @param amount - Amount of mintable tokens to swap.
     */
    function swapMintableToTransfer(
        uint256 amount
    ) external whenNotPaused nonReentrant {
        require(amount > 0, "TokenSwap: Amount must be greater than 0");

        uint256 fee = (amount * mintableTokenFeePercentage) / DENOMINATOR; // Calculates the fee
        uint256 amountToSwap = amount - fee; // Amount after deducting the fee
        uint256 transferAmount = amountToSwap * rate; // Calculates the equivalent transfer token amount

        mintableToken.burnFrom(msg.sender, amount); // Burns the specified amount of mintable tokens from the user
        transferToken.safeTransfer(msg.sender, transferAmount); // Transfers the equivalent amount of transfer tokens to the user

        emit SwappedMintableToTransfer(msg.sender, amount, transferAmount); // Emits an event after swapping the tokens
    }

    /**
     * @dev Calculates the amount of mintable tokens that will be received for the specified amount of transfer tokens.
     * @param amount - Amount of transfer tokens to swap.
     */
    function getMintableAmount(uint256 amount) external view returns (uint256) {
        require(amount > 0, "TokenSwap: Amount must be greater than 0");
        uint256 fee = (amount * transferTokenFeePercentage) / DENOMINATOR; // Calculates the fee
        uint256 amountToSwap = amount - fee; // Amount after deducting the fee
        uint256 mintableAmount = amountToSwap / rate; // Calculates the equivalent mintable token amount
        return mintableAmount;
    }

    /**
     * @dev Calculates the amount of transfer tokens that will be received for the specified amount of mintable tokens.
     * @param amount - Amount of mintable tokens to swap.
     */
    function getTransferAmount(uint256 amount) external view returns (uint256) {
        require(amount > 0, "TokenSwap: Amount must be greater than 0");
        uint256 fee = (amount * mintableTokenFeePercentage) / DENOMINATOR; // Calculates the fee
        uint256 amountToSwap = amount - fee; // Amount after deducting the fee
        uint256 transferAmount = amountToSwap * rate; // Calculates the equivalent transfer token amount
        return transferAmount;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
