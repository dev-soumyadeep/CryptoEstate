// scripts/deploy.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const myAddress=  "0x8798886B80638F4aA3BAd4f528497A335BdD9247"

module.exports = buildModule("PropertyToken", (m) => {
  const initialOwner = m.getParameter("initialOwner",myAddress)
const PropertyToken =  m.contract("PropertyToken", [initialOwner]);

return { PropertyToken };
});