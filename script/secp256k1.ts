import secp256k1 from "secp256k1"
import {randomBytes} from "crypto"
import { keccak256, solidityPackedKeccak256, toBeArray } from "ethers";


async function main() {

    const PKstr1 = "8c6c1bfa3a68833c54ac0c985038cd8b251096884d82df8e34f4a32beddec7bf" // 0xaaa
    const PKstr2 = "8cfdf86c6171d23b7289c684711a69c63a1e8b3d4c210c36c4b27da034e3fc3f" // 0xbbb

    const PK1 = Uint8Array.from(Buffer.from(PKstr1, "hex"));
    const PK2= Uint8Array.from(Buffer.from(PKstr2, "hex"));

    const P1 = secp256k1.publicKeyCreate(PK1,false)
    const P2 = secp256k1.publicKeyCreate(PK2,false)
    
    
    // console.log(`Steve Pub: ${Buffer.from(stevePub.slice(1,33)).toString('hex')}`);
    console.log(`P1: ${Buffer.from(P1).toString('hex')}`);
    console.log(`P2: ${Buffer.from(P2).toString('hex')}`);
    // console.log(`Bob Pub: ${Buffer.from(bobPub.slice(1,33)).toString('hex')}`);

    const P = secp256k1.publicKeyCombine([P1,P2],false)
    console.log(`P:  ${Buffer.from(P).toString('hex')}`);
    console.log();
    
    const k1 = randomBytes(32);
    const R1 = secp256k1.publicKeyCreate(k1) // k1 * G
    const k2 = randomBytes(32);
    const R2 = secp256k1.publicKeyCreate(k2) // K2 * G

    const R = secp256k1.publicKeyCombine([R1,R2],false)
    console.log(`R:  ${Buffer.from(R).toString('hex')}`);

    const m = randomBytes(32);
    const R_uncomp = secp256k1.publicKeyConvert(R, false);    
    const R_addr = keccak256(R_uncomp.slice(1, 65)).slice(0,42);
    console.log(R_addr);
    
    const e = toBeArray(solidityPackedKeccak256(
        ["address", "uint8", "bytes32", "bytes32"],
        [R_addr, P[0] + 27 - 2, P.slice(1, 33), m]));
        
    console.log(`e:  ${Buffer.from(e).toString('hex')}`);


    const ePk1 = secp256k1.privateKeyTweakMul(PK1,e)
    const s1 = secp256k1.privateKeyTweakAdd(k1,ePk1)

    const ePk2 = secp256k1.privateKeyTweakMul(PK2,e)
    const s2 = secp256k1.privateKeyTweakAdd(k2,ePk2)

    const s = secp256k1.privateKeyTweakAdd(s1,s2)
    console.log(`s:  ${Buffer.from(s).toString('hex')}`);


}

void main()