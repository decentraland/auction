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
