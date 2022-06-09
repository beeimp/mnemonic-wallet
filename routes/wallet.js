const express = require('express');
const router = express.Router();
const lightwallet = require("eth-lightwallet");
const fs = require('fs');
const path = require('path');

// lightwallet 모듈을 사용한 랜덤한 니모닉 코드 생성 API
router.post('/newMnemonic', async (req, res) => {
  // 니모닉 변수 생성
  let mnemonic;
  try {
    // mnemonic 변수에 lightwallet.keystore.generateRandomSeed()을 담아, mnemonic을 응답으로 전송
    mnemonic = lightwallet.keystore.generateRandomSeed();
    res.json({ mnemonic });
  } catch (err) {
    // (에러) 에러를 응답합니다.
    console.log(err);
  }
});


// 니모닉 코드와 패스워드를 이용한 keystore와 address 생성 API
router.post('/newWallet', async(req, res) => {
  // 요청에 포함된 니모딕, 패스워드
  const {password, mnemonic} = req.body;
  try{
    // 키스토어 생성
    lightwallet.keystore.createVault({
      password: password,
      seedPhrase: mnemonic,
      hdPathString: "m/0'"
    }, (err, ks)=> {
      // 파생키 생성
      ks.keyFromPassword(password, (err, pwDerivedKey) => {
        // 새로운 주소 생성
        ks.generateNewAddress(pwDerivedKey, 1);

        const address = ks.getAddresses().toString();
        const keystore = ks.serialize();

        // res.json({keystore: keystore, address: address});
        fs.writeFile('wallet.json', keystore, (err, data) => {
          if(err) throw err;
          res.json({code:1, message: `지갑 생성!(${__dirname + '/wallet.json'})`});
        })
      })
    })
  } catch(error){
    console.error("NewWallet ==>>>>",error);
  }
});

module.exports = router;