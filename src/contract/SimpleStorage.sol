// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleStorage {
    address public owner;
    string private message;

    constructor() {
        owner = msg.sender;
    }

    // Guarda un mensaje
    function storeMessage(string calldata _message) external {
        message = _message;
    }

    // Lee el mensaje guardado
    function getMessage() external view returns (string memory) {
        return message;
    }

    // Permite recibir ETH
    function deposit() external payable {}

    // Permite al owner retirar todo el ETH
    function withdraw() external {
        require(msg.sender == owner, "Solo el owner puede retirar");
        uint256 balance = address(this).balance;
        require(balance > 0, "Sin fondos");
        payable(owner).transfer(balance);
    }

    // Ver saldo del contrato
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
