// scripts/deploy.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const proptoken="0xF8D70e927b87106a0b4122efBdcDAF717DF08565"
const myAddress=  "0x8798886B80638F4aA3BAd4f528497A335BdD9247"

module.exports = buildModule("Escrow", (m) => {
  const _inspector = m.getParameter("_inspector",myAddress)
  const _nftaddress = m.getParameter("_nftaddress",proptoken)
const Escrow =  m.contract("Escrow", [_nftaddress,_inspector]);

return { Escrow };
});