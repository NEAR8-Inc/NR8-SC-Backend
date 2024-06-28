const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();
const abi = require("./abi.json");

const app = express();
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, abi, wallet);

app.post("/createClub", async (req, res) => {
  const { name, maxRoles, pricePerRole, clubURI } = req.body;

  try {
    const tx = await contract.createClub(
      name,
      maxRoles,
      ethers.utils.parseEther(pricePerRole.toString()),
      clubURI
    );
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/claimRole", async (req, res) => {
  const { clubId, roleName, roleURI } = req.body;

  try {
    const tx = await contract.claimRole(clubId, roleName, roleURI);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/clubs/:clubId", async (req, res) => {
  const { clubId } = req.params;

  try {
    const club = await contract.clubIdToClubs(clubId);

    // Convert BigInt to string
    const clubResponse = {
      ownerAddress: club.ownerAddress,
      clubId: club.clubId.toString(),
      maxRoles: club.maxRoles.toString(),
      pricePerRole: club.pricePerRole.toString(),
      clubURI: club.clubURI,
    };

    res.json({ success: true, club: clubResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/roles/:roleId", async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await contract.roleIdToRoles(roleId);

    // Convert BigInt to string
    const roleResponse = {
      ownerAddress: role.ownerAddress,
      roleId: role.roleId.toString(),
      roleName: role.roleName,
      roleURI: role.roleURI,
    };

    res.json({ success: true, role: roleResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
