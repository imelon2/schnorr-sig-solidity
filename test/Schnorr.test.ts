import { ethers } from "hardhat";
import secp256k1 from "secp256k1";
import { randomBytes } from "crypto";
import { keccak256, solidityPackedKeccak256, toBeArray } from "ethers";
import { expect } from "chai";

describe("Schnorr", () => {
  it("Should verify multi sig", async () => {
    const Schnorr = await ethers.getContractFactory("Schnorr");
    const schnorr = await Schnorr.deploy();
    await schnorr.waitForDeployment();

    const PKstr1 = randomBytes(32) // Signer 1
    const PKstr2 = randomBytes(32) // Signer 2

    const PK1 = Uint8Array.from(PKstr1);
    const PK2 = Uint8Array.from(PKstr2);

    const P1 = secp256k1.publicKeyCreate(PK1, false);
    const P2 = secp256k1.publicKeyCreate(PK2, false);

    console.log(`P1: ${Buffer.from(P1).toString("hex")}`);
    console.log(`P2: ${Buffer.from(P2).toString("hex")}`);

    const P = secp256k1.publicKeyCombine([P1, P2], false);
    const Pr = secp256k1.publicKeyConvert(P);
    console.log(`P:  ${Buffer.from(P).toString("hex")}`);
    console.log();

    const k1 = randomBytes(32);
    const R1 = secp256k1.publicKeyCreate(k1); // k1 * G
    const k2 = randomBytes(32);
    const R2 = secp256k1.publicKeyCreate(k2); // K2 * G

    const R = secp256k1.publicKeyCombine([R1, R2], false);
    console.log(`R:  ${Buffer.from(R).toString("hex")}`);

    const m = randomBytes(32);
    const R_uncomp = secp256k1.publicKeyConvert(R, false);
    const R_addr = keccak256(R_uncomp.slice(1, 65)).slice(-40);
    console.log(`address(R):  ${R_addr}`);

    const e = toBeArray(
      solidityPackedKeccak256(
        ["address", "uint8", "bytes32", "bytes32"],
        [R_addr, Pr[0] + 27 - 2, Pr.slice(1, 33), m]
      )
    );

    console.log(`e:  ${Buffer.from(e).toString("hex")}`);

    const ePk1 = secp256k1.privateKeyTweakMul(PK1, e);
    const s1 = secp256k1.privateKeyTweakAdd(k1, ePk1);

    const ePk2 = secp256k1.privateKeyTweakMul(PK2, e);
    const s2 = secp256k1.privateKeyTweakAdd(k2, ePk2);

    const s = secp256k1.privateKeyTweakAdd(s1, s2);
    console.log(`s:  ${Buffer.from(s).toString("hex")}`);

    console.log(Pr[0] - 2 + 27);

    expect(
      await schnorr.verify(Pr[0] - 2 + 27, Pr.slice(1, 33), m, e, s)
    ).to.equal(true);
  });
});
