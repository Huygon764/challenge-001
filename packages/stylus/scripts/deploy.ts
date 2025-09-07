import deployStylusContract from "./deploy_contract";
import {
  getDeploymentConfig,
  getRpcUrlFromChain,
  printDeployedAddresses,
} from "./utils/";
import { DeployOptions } from "./utils/type";
import { config as dotenvConfig } from "dotenv";
import * as path from "path";
import * as fs from "fs";

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  dotenvConfig({ path: envPath });
}

/**
 * Define your deployment logic here
 */
export default async function deployScript(deployOptions: DeployOptions) {
  const config = getDeploymentConfig(deployOptions);

  console.log(`📡 Using endpoint: ${getRpcUrlFromChain(config.chain)}`);
  if (config.chain) {
    console.log(`🌐 Network: ${config.chain?.name}`);
    console.log(`🔗 Chain ID: ${config.chain?.id}`);
  }
  console.log(`🔑 Using private key: ${config.privateKey.substring(0, 10)}...`);
  console.log(`📁 Deployment directory: ${config.deploymentDir}`);
  console.log(`\n`);

  // Deploy a single contract
  await deployStylusContract({
    contract: "your-contract",
    constructorArgs: [config.deployerAddress!],
    ...deployOptions,
  });

  // EXAMPLE: Deploy to Orbit Chains, uncomment to try
  // await deployStylusContract({
  //   contract: "counter",
  //   constructorArgs: [100],
  //   isOrbit: true,
  //   ...deployOptions,
  // });

  // EXAMPLE: Deploy your contract with a custom name, uncomment to try
  // await deployStylusContract({
  //   contract: "your-contract",
  //   constructorArgs: [config.deployerAddress],
  //   name: "my-contract",
  //   ...deployOptions,
  // });

  // Array of token names
  const TOKEN_NAMES = [
    "WETH", "USDC", "ARB", "WBTC", "DAI", 
    "LINK", "UNI", "MATIC", "AAVE", "CRV"
  ];

  // Deploy function for multiple tokens
  const deployTokens = async (tokenNames: string[]) => {
    console.log(`📦 Deploying ${tokenNames.length} mock tokens...`);
    
    for (const tokenName of tokenNames) {
      console.log(`   Deploying ${tokenName}...`);
      await deployStylusContract({
        contract: "mock-token",
        constructorArgs: [],
        name: tokenName,
      });
    }
  };

  // Deploy all tokens
  await deployTokens(TOKEN_NAMES);

  // Deploy portfolio reader
  await deployStylusContract({
    contract: "portfolio-reader",
    constructorArgs: [],
    name: "PortfolioReader",
  });

  // Print the deployed addresses
  console.log("\n\n");
  printDeployedAddresses(config.deploymentDir, config.chain.id.toString());
}
