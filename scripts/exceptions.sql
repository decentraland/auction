/*
{
  "address": "0xd5508cb1d545f10946019be079db7245a2729e1a",
  "msg": "Hi Eordano, this is to confirm I am Saf and I am the person messaging you on rocket chat requesting that you change the address my land gets sent to. Can you please send the land to 0x1fCE36dDBB058757851D9391E65606cE4EBcaE8A",
  "sig": "0xbf0ba8e32dbdd90a023ead52ae06b89a85e043e135ba78a68c76c536149d1db9522988cdb3de1decbafa1c1459c9aa40643c198b69e6abc636709c1bd46203b31c",
  "version": "2"
}
 */
UPDATE address_states SET address='0x1fCE36dDBB058757851D9391E65606cE4EBcaE8A' WHERE address='0xd5508cb1d545f10946019be079db7245a2729e1a';

/*
  User: @widedot on slack
  Address: 0x80ACB88C37422c7A8A132ce260b0040b02645DDb
  Tried to stake on Oct. 31 but lock transaction took too long -- Bonus of 500 MANA
*/
UPDATE address_states SET balance=(balance::int * 1.1)::text WHERE address='0x80ACB88C37422c7A8A132ce260b0040b02645DDb';


/**
 * After Auction
 {
"address": "0x6e129c4bef43eb234a10b969f15bc564511bec6c",
"msg": "My address has been compromised. Please, for the Decentraland auction, use this new address: 0xfA6236e28e9Af20424d2a16Daccd481B63375473. Time: 17:02 GMT+1 22/12/2017",
"sig": "0x8f2446b0a2fa301da7ae7191d429847cc28ca8bfc1cef29880417d41a826f12f684668186dc3bdb6baf3fc72209cc8ab662478297197c9b7a765e184c9838d9a1b",
"version": "2"
}
 */
