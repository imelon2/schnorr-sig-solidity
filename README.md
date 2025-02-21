# Verify schnorr signature on Solidity
본 Repo는 [비탈릭 부테린이 제안한 방식](https://ethresear.ch/t/you-can-kinda-abuse-ecrecover-to-do-ecmul-in-secp256k1-today/2384/1)을 재해석하여, 
Solidity의 [ECDSA 서명 검증 함수 `ecrecover(m, v, r, s)`](https://docs.soliditylang.org/en/latest/cheatsheet.html#mathematical-and-cryptographic-functions)를 활용해 구현한 슈노스 서명 검증 함수를 소개합니다.

## Background
[`Schnorr.sol`](./contracts/Schnorr.sol)와 [`Schnorr.test.ts`](./test/Schnorr.test.ts)에 구현된 코드는 암호학적 개념이 다수 포함되어 있습니다. 코드를 리뷰하기전, 아래에 작성된 자료를 선행하기를 권장드립니다.
- https://hackmd.io/@hNKe7_azQwSjO7RoD9mONw/ByKXnuvLkl

## Run Test
```
npx hardhat test
```

## References/notes
- [How Schnorr signatures may improve Bitcoin](https://medium.com/cryptoadvance/how-schnorr-signatures-may-improve-bitcoin-91655bcb4744)
- [코드체인에서의 Schnorr 서명](https://medium.com/codechain-kr/%EC%BD%94%EB%93%9C%EC%B2%B4%EC%9D%B8%EC%97%90%EC%84%9C%EC%9D%98-schnorr-signatures-e32754dccad6)
- [Schnorr signature verification ecrecover hack](https://hackmd.io/@nZ-twauPRISEa6G9zg3XRw/SyjJzSLt9)
- [You can *kinda* abuse ECRECOVER to do ECMUL in secp256k1 today by vbuterin](https://ethresear.ch/t/you-can-kinda-abuse-ecrecover-to-do-ecmul-in-secp256k1-today/2384/5)