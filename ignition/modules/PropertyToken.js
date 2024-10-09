// scripts/deploy.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const escrow="0xc3062430Aa70dABd1e33a702323aB6c4980883fd"

module.exports = buildModule("PropertyToken", (m) => {
  const _owner = m.getParameter("_owner",escrow)
const PropertyToken =  m.contract("PropertyToken", [_owner]);
return {PropertyToken};
});