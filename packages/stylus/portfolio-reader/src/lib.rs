#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloc::string::String;
use alloc::vec::Vec;
use stylus_sdk::{
    alloy_primitives::{Address, U256},
    prelude::*,
};

// Interface cho ERC20 token
sol_interface! {
    interface IERC20 {
        function balanceOf(address account) external view returns (uint256);
        function name() external view returns (string memory);
        function symbol() external view returns (string memory);
    }
}

sol_storage! {
    #[entrypoint]
    pub struct PortfolioReader {
        bool initialized;
    }
}

#[public]
impl PortfolioReader {
    pub fn initialize(&mut self) -> Result<(), Vec<u8>> {
        if self.initialized.get() {
            return Err(b"Already initialized".to_vec());
        }
        self.initialized.set(true);
        Ok(())
    }

    // Function 1: Get balances only
    pub fn get_balances(&self, user: Address, tokens: Vec<Address>) -> Vec<U256> {
        let mut balances = Vec::new();

        for token_addr in tokens {
            let token = IERC20::new(token_addr);
            let balance = token.balance_of(self, user).unwrap_or(U256::ZERO);
            balances.push(balance);
        }

        balances
    }

    // Function 2: Get token symbols
    pub fn get_symbols(&self, tokens: Vec<Address>) -> Vec<String> {
        let mut symbols = Vec::new();

        for token_addr in tokens {
            let token = IERC20::new(token_addr);
            let symbol = token.symbol(self).unwrap_or_default();
            symbols.push(symbol);
        }

        symbols
    }

    // Function 3: Get token names
    pub fn get_names(&self, tokens: Vec<Address>) -> Vec<String> {
        let mut names = Vec::new();

        for token_addr in tokens {
            let token = IERC20::new(token_addr);
            let name = token.name(self).unwrap_or_default();
            names.push(name);
        }

        names
    }
}
