# Verify schnorr signature on Solidity
본 Repo는 [비탈릭 부테린이 제안한 방식](https://ethresear.ch/t/you-can-kinda-abuse-ecrecover-to-do-ecmul-in-secp256k1-today/2384/1)을 재해석하여, 
Solidity의 [ECDSA 서명 검증 함수 `ecrecover(m, v, r, s)`](https://docs.soliditylang.org/en/latest/cheatsheet.html#mathematical-and-cryptographic-functions)를 활용해 구현한 슈노스 서명 검증 함수를 소개합니다.

> [!NOTE]
> [`Schnorr.sol`](./contracts/Schnorr.sol)와 [`Schnorr.test.ts`](./test/Schnorr.test.ts)에 구현된 코드는 암호학적 개념이 다수 포함되어 있습니다. 코드를 리뷰하기전, [📚 Background reference](#-background-reference) 자료를 선행하기를 권장드립니다.

<br/>

## 📚 Background reference
- [Verify schnorr signature on smart contract [KR]](https://hackmd.io/@hNKe7_azQwSjO7RoD9mONw/ByKXnuvLkl)

<br/>

## Run Test
```
npx hardhat test
```
