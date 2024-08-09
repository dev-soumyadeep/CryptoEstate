// scripts/deploy.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const myAddress="0x40685354cCF95569593B3Ba951943bEDfcb87d09"

module.exports = buildModule("Escrow", (m) => {
  const _inspector = m.getParameter("_inspector",myAddress)
const Escrow =  m.contract("Escrow", [_inspector]);

return { Escrow };
});