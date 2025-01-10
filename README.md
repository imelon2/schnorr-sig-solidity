

Reference:
- 비트코인 슈노르: https://medium.com/cryptoadvance/how-schnorr-signatures-may-improve-bitcoin-91655bcb4744
- 코드체인: https://medium.com/codechain-kr/%EC%BD%94%EB%93%9C%EC%B2%B4%EC%9D%B8%EC%97%90%EC%84%9C%EC%9D%98-schnorr-signatures-e32754dccad6
- noot: https://hackmd.io/@nZ-twauPRISEa6G9zg3XRw/SyjJzSLt9
- 비탈릭 제안: https://ethresear.ch/t/you-can-kinda-abuse-ecrecover-to-do-ecmul-in-secp256k1-today/2384/5

// 요약
슈노르 서명이란? + 장점
이더리움 같이 Secp256k1을 사용하지만, 스마트 컨트랙트에서 사용 가능한 함수는 ECDSA 서명 검증만 지원
이때 사용되는 ecrecover(m,v,r,s) 함수를 통해 슈노르 서명 검증 구현 가능

1. 슈노르 서명 알고리즘
2. ECDAS 서명 알고리즘
3. 동치 관계 증명
4. ecrecover(m,v,r,s) 매커니즘 알고리즘
5. 슈노르 서명 파라미터 생성
6. solidity 코드
7. test 코드 실행 명령어