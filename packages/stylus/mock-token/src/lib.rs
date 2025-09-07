#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use stylus_sdk::{alloy_primitives::{U256, Address}, prelude::*, storage::*};
use alloc::string::String;

sol_storage! {
    #[entrypoint]
    pub struct MockToken {
        mapping(address => uint256) balances;
        uint256 total_supply;
        string name;
        string symbol;
    }
}

#[public]
impl MockToken {
    pub fn balance_of(&self, account: Address) -> U256 {
        self.balances.getter(account).get()
    }
    
    pub fn name(&self) -> String {
        self.name.get_string()
    }
    
    pub fn symbol(&self) -> String {
        self.symbol.get_string()
    }
    
    pub fn mint(&mut self, to: Address, amount: U256) {
        let current = self.balances.getter(to).get();
        self.balances.setter(to).set(current + amount);
        self.total_supply.set(self.total_supply.get() + amount);
    }
}
