# Schnorr verification contract by solidity
슈노르(이하 Schnorr) 서명은 비트코인과 이더리움에서 사용하는 ECDSA와 같이 타원곡선(Elliptic Curve Cryptography:ECC) 암호학 기반의 디지털 서명 방식중 하나이다. 하지만 다른 디지털 서명에 비해 연산이 간단해 더 빠르게 처리할 수 있으며, 선형성(linearity)을 갖는 알고리즘으로, 멀티서명(multi-signature)과 배치 검증(batch verification) 같은 기능을 지원할 수 있다.

이더리움은 현재 타원곡선 암호학 중 Secp256k1을 사용하며, Schnorr 서명도 이와 호환 가능한 타원곡선이다. 하지만 이더리움은 Pre-Compiled Contract를 통해 스마트 컨트랙트에서 [ECDSA 서명 검증 함수(ecrecover)](https://docs.soliditylang.org/en/latest/cheatsheet.html#mathematical-and-cryptographic-functions)만을 지원한다. 이로 인해 슈노르 서명 검증 기능을 온체인에서 구현하는 데 여러 제약이 따른다. 그러나 [비탈릭 부테린이 제안한 방식](https://ethresear.ch/t/you-can-kinda-abuse-ecrecover-to-do-ecmul-in-secp256k1-today/2384/1)을 활용하면, Solidity에서 제공하는 `ecrecover(m, v, r, s)` 함수를 통해 슈노르 서명 검증에 필요한 기능을 충분히 구현할 수 있다. 

> [!NOTE]
> 본 자료는 Solidity의 ecrecover와 keccak256를 활용해 Schnorr 서명을 검증하는 스마트 컨트랙트 [`Schnorr.sol`](contracts/Schnorr.sol) 코드에 대해 리뷰하고, 이를 개발하기 위해 필요한 수학적 개념과 슈노르 서명 알고리즘의 원리도 함께 살펴볼 예정이다.

## Schnorr Signature
### 서명 생성

$$ P_1 = d_1 * G $$
$$ P_2 = d_2 * G $$

`G`는 seck256k1의 생성점, `d1과 d2`는 개인키, 그리고 `P1과 P2`는 공개키로 정의한다. ECDSA 처럼 하나의 키로 하나의 서명을 생성 할 수 있지만, Schnorr는 두개 이상의 키로 다중 서명(Multi Sig)을 만들 수 있기에, 이 경우 두개 이상의 공개키가 필요하다.

 </br>

$$ k_1 * G = R_1 $$
$$ k_2 * G = R_2 $$

서명을 생성하는 첫번째 과정으로 `무작위값 k`를 생성하여 `k*G = R값`을 구하는 것으로, 이는 ECDSA와 같다.
 
 </br>

$$ R_1 + R_2 = R $$
$$ P_1 + P_2 = P $$
$$ k_1 + k_2 = k $$

</br>

$$ e=hash(R,P,m)$$

각각의 키에서 생성한 변수의 합을 `R, P, k`로 정의하고, 서명하고자 하는 메시지 `m`를 R, P와 같이 해시한 값(Challenge)을 `e`로 정의한다.

</br>

$$ s = k + ed $$ 
$$ s_1 + s_2 = s $$

그리고, 본인이 소유중인 `개인키 d`와 `e`를 곱한 값에 `본인의 무작위 값 k`를 더하면 서명 값 `s`를 구할 수 있다. R, P와 마찬가지로 두 키가 생성한 s1과 s2를 더한 값을 `s`로 정의한다.

</br>


$$ Global~Param: P, G, R, s $$

이때, `s`, `R`은 서명 값이 되며 최종적으로 서명 검증을 위해 `P`, `G`, `R`, `s` 4가지의 파라미터가 공개되어야 하는 서명 스키마(Signature Schema)가 된다.

</br>
</br>


### 서명 검증
<div align="center">
<img src="docs/img/ecc_point1.png" width="50%">
</div>
</br>

타원곡선 암호학(ECC)에서, 곡선 상의 두 점 P와 Q를 잇는 직선은 항상 곡선과 한 점 R에서 추가로 교차한다. 그리고 이 점 R에 대해, 두 점의 합 P+Q는 R의 대칭점(곡선에 대해 R을 y축으로 반사한 점)으로 정의된다. 이 성질은 타원곡선 연산의 핵심으로, 덧셈과 스칼라 곱을 가능하게 한다.
</br>


<div align="center">
<img src="docs/img/schnoor_ecc1.png" width="50%">
</div>

</br>
</br>

$$ sG = R + eP $$

이러한 ECC의 성질을 이용하여, 서명 스키마를 타원 곡선상의 점으로 정의하면 위와 같은 공식을 유도할 수 있다. 그리고 해당 공식을 통해 생성된 슈노르 서명을 검증할 수 있다. 두 점 `R`, `eP`의 합의 대칭점을 `sG`로 정의하여, 해당 공식을 풀어 증명해보자

$$ sG = (s_1+s_2)G = (k_1 + ed_1 + k_1 + ed_1)G $$ 
$$ = (k_1 + k_2)G + e(d_1 + d_2)G $$

</br>

$$ \because k_1G + k_2G = R_1 + R_2 = R $$
$$ \therefore (k_1 + k_2)G = R $$

</br>

$$ \because (d_1 + d_2)G = P_1 + P_2 = P $$
$$ \therefore e(d_1 + d_2)G = eP $$ 

</br>

$$ \therefore sG = R + eP $$

</br>

## ecrecover(m,v,r,s) 알고리즘
이더리움에서 ECDSA 서명을 검증하는 함수 `ecrecover`는 네 가지 파라미터`(m, v, r, s)`를 입력받는다. 이를 각각 정의하면 다음과 같다: 
- 서명 대상 메시지: `m`
- 무작위 값 `k` * `G`: `R`
- `R`의 x-좌표: `r`
- `r`이 가지는 점의 y-좌표에 대한 대칭성(parity): `v` (= 0 || 1)
- 검증할 서명 값: `s`

</br>

$$ s = k^{-1} (m + rd) $$

ECDSA 서명은 주어진 공식을 통해 서명 값 `s`가 계산된다. 해당 공식에서 `k`는 무작위값, `d`는 서명자의 개인키, `r`은 무작위 점 `R`의 x-좌표로 정의된다. ecrecover는 네 가지 파라미터`(m, v, r, s)`를 아래와 같은 공식으로 서명자의 주소(address)를 구한다.

</br>

$$
R = R(r,y)=\begin{cases}
        y>0, if v matches~parity~of~y \\
        y<0, otherwise
        \end{cases} \\
$$

먼저, 파라미터로 전달 받은 r과 v를 통해 점 R을 계산한다.

</br>

$$ sk = m+rd $$
$$ skG = mG + rdG $$
$$ sR = mG+rP $$
$$ rP = sR - mG $$
$$ P = r^{-1}(sR - mG) $$ 

</br>

$$ Q = address(keccak256(P)) $$

그리고, s를 구하는 공식을 위와 같이 재정의 하면 서명자의 공개키 `P`를 유도할 수 있다. 최종적으로 공개키를 keccak256로 해시한 값의 마지막 20 bytes를 서명자의 지갑 주소로 return한다.

</br>

## Verify schnorr signature with ecrecover(m,v,r,s)
이제 schnorr 서명의 4가지 서명 스키마 `P`, `G`, `R`, `s`를 `ecrecover(m,v,r,s)`함수의 파라미터에 대입하여 검증해볼 예정이다. 먼저, ecrecover의 4가지 파라미터를 schnorr 서명 스키마에서 정의한 값으로 재정의 해보자.
- 공개키 P의 x-좌표: `r`
- 공개키 P의 대칭성(parity = 1 || 0): `v`
- -e * r: `s`
- -s * r: `m`

</br>

$$
P = P(r,y)=\begin{cases}
        y>0, if v matches~parity~of~y \\
        y<0, otherwise
        \end{cases} \\~\\
$$

마찬가지로 먼저, 파라미터로 전달 받은 r과 v를 통해 점 P을 계산한다. 이때, P는 서명자들의 공개키를 합한 값($P_1$ + $P_2$ = $P$)이다.

</br>

$$ \because P = r^{-1}(sR - mG) $$
$$ \therefore mG =(-s * r)G $$
$$ \therefore sR = (-e * r)P $$

$$ P = r^{-1}(srG - erP) $$
$$ P = sG - eP $$


위에서 설명했던것 처럼 슈노르 서명을 검증하는 공식은 $sG$ = $R$ + $eP$ 이며, 이를 재정의하면 아래와 같다.

</br>

$$ R = sG - eP $$

$$ P = sG - eP $$

최종적으로 return되는 값은 다르지만, 슈노르 서명의 검증 공식은 최종적으로 둘 다 동일한 것을 확인할 수 있다. 이제 프로토콜에서 서명 스키마에서 어떤 값을 검증하는지에 따라 검증하고자 하는 데이터가 달라지며, 아래와 같이 2가지 방법으로 서명 데이터를 검증할 수 있다.

서명 값이 R, s인 경우: 

$$ e = hash(address(R)~||~m) $$
$$ R' = sG - eP $$
$$ check~~R == R'$$

서명 값이 e, s인 경우:

$$ R = sG - eP $$ 
$$ e' = hash(address(R)~||~m) $$
$$ check~~e == e' $$

> [!IMPORTANT]
> 이더리움은 초기 **리플레이 공격(replay attack)**을 방지하기 위해 [EIP-155](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md)를 도입하여 트랜잭션 서명 메시지에 **체인 ID(chain id)**를 포함했다.
> 또한, 온체인에서 메시지가 포함된 서명 데이터를 검증하는 [EIP-712](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md)는 동일한 서명이 재사용되지 않도록 스마트 컨트랙트에서 관리되는 nonce 값을 추가로 사용한다.
> 이와 마찬가지로, **슈노르 서명(Schnorr Signature)**을 사용하는 경우에도 데이터를 보호하기 위한 장치를 반드시 구현할 것을 권장한다.

## Verify schnorr signature on Solidity
> [!NOTE]
> [`Schnorr.sol`](contracts/Schnorr.sol) 코드는 2번째 방식의 검증 로직이 구현되어 있다.

```solidity
//SPDX-License-Identifier: LGPLv3
pragma solidity ^0.8.0;


contract Schnorr {
  // secp256k1 group order
  uint256 constant public Q =
    0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;

  // parity := public key y-coord parity (27 or 28)
  // px := public key x-coord
  // message := 32-byte message
  // e := schnorr signature challenge
  // s := schnorr signature
  function verify(
    uint8 parity,
    bytes32 px,
    bytes32 message,
    bytes32 e,
    bytes32 s
  ) public pure returns (bool) {
    bytes32 sp = bytes32(Q - mulmod(uint256(s), uint256(px), Q));
    bytes32 ep = bytes32(Q - mulmod(uint256(e), uint256(px), Q));

    require(sp != 0);
    // the ecrecover precompile implementation checks that the `r` and `s`
    // inputs are non-zero (in this case, `px` and `ep`), thus we don't need to
    // check if they're zero.
    address R = ecrecover(sp, parity, px, ep);
    console.log(R);

    require(R != address(0), "ecrecover failed");
    return e == keccak256(
      abi.encodePacked(R, uint8(parity), px, message)
    );
  }
}
```

</br>

`verify()` 함수 내부를 살펴보면, `sp`와 `ep`를 계산하는 로직이 아래와 같이 스마트 컨트랙트에 구현되어 있다.

```solidity
bytes32 sp = bytes32(Q - mulmod(uint256(s), uint256(px), Q));
bytes32 ep = bytes32(Q - mulmod(uint256(e), uint256(px), Q));
```

이 로직에는 두 가지 중요한 이유가 포함되어 있다.

</br>
</br>

### Secp256k1 모듈러 연산
 `mulmod(a,b,q)` 함수는 $a$ * $b$ $mod$ $q$ 연산을 수행한다. `sp`와 `ep`는 Secp256k1 타원 곡선 상의 점으로, **유한체(finite field) $Q$**에서 정의된 연산 규칙을 따라야 한다. 따라서 $mod$ $Q$가 적용된 모듈러 곱셈을 사용해야 정확한 값을 계산할 수 있다.

</br>

### 모듈러 연산의 음수(-) 표현
`sp`와 `ep`는 *[Verify schnorr signature with ecrecover(m,v,r,s)](#verify-schnorr-signature-with-ecrecovermvrs)* 에서 설명했던것 처럼 음수(-)로 표현되어 있다. 하지만, 정수만 다루는 유한체(finite field) 기반 타원곡선에서는 음수를 직접적으로 사용할 수 없다. 대신 타원 곡선은 가역성(Invertibility)을 갖기에, 덧셈의 역원을 이용해 이를 양수로 변환한다. 이를 수식으로 표현하면 다음과 같다:

$$ -a~mod~n = (n - a)~mod~n $$

스마트 컨트랙트에서는 이를 구현하기 위해 mulmod(a, b, q) 계산 결과에서 $Q$를 뺌으로써 음수를 처리하고, 항상 양수 값으로 변환한다.


## Run Test
```
npx hardhat test
```

## References/notes
- [How Schnorr signatures may improve Bitcoin](https://medium.com/cryptoadvance/how-schnorr-signatures-may-improve-bitcoin-91655bcb4744)
- [코드체인에서의 Schnorr 서명](https://medium.com/codechain-kr/%EC%BD%94%EB%93%9C%EC%B2%B4%EC%9D%B8%EC%97%90%EC%84%9C%EC%9D%98-schnorr-signatures-e32754dccad6)
- [Schnorr signature verification ecrecover hack](https://hackmd.io/@nZ-twauPRISEa6G9zg3XRw/SyjJzSLt9)
- [You can *kinda* abuse ECRECOVER to do ECMUL in secp256k1 today by vbuterin](https://ethresear.ch/t/you-can-kinda-abuse-ecrecover-to-do-ecmul-in-secp256k1-today/2384/5)