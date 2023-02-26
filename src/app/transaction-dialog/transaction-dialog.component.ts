import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Page } from 'thred-core';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.scss'],
})
export class TransactionDialogComponent implements OnInit {
  @Input() set data(value: any) {
    this.txData = value;

    switch (value.method) {
      case 'personal_sign':
        this.title = 'New Message';
        this.mode = 'signature';
        break;
      case 'eth_signTypedData_v4':
        this.title = 'New Message';
        this.mode = 'signature';
        break;
      case 'eth_sendTransaction':
        this.title = 'New Transaction';
        this.mode = 'transaction';
        break;
      default:
        break;
    }
  }
  @Input() page?: Page;
  @Input() safeArea: { top: number; bottom: number } = { top: 0, bottom: 0 };

  @Output() confirmed = new EventEmitter<boolean>();

  title = '';
  content = '';
  mode: 'signature' | 'transaction' = 'signature';

  txData: any;

  request: any;

  constructor(private loadService: LoadService) {}

  ngOnInit(): void {
    console.log(this.txData);
    setTimeout(() => {
      this.confirmed.emit(true);
    }, 5000);
    // this.loadService.getRequest(this.mode, this.txData, (result) => {
    //   console.log(result);
    //   this.request = result;

    //   setTimeout(() => {
    //     this.confirmed.emit(true);
    //   }, 2000);
    // });

    // let oy = {
    //   risk: { riskScore: 'LOW', riskFactors: [] },
    //   assetChanges: [],
    //   summary: '',
    //   rpcMethod: 'PERSONAL_SIGN',
    //   signatureType: 'MESSAGE',
    //   signer: '0xbc215c5e4a60a450a09be23996303dfb5dba1184',
    //   message:
    //     'Welcome to Launchcaster!\n\nSign this message to log in.\n0xbc215C5E4a60A450a09Be23996303Dfb5DBA1184\n\nNonce: 24d8edad-1041-4844-9f72-3a866bb2798d',
    // };

    let oy = {
      method: 'eth_signTypedData_v4',
      params: [
        '0xbc215c5e4a60a450a09be23996303dfb5dba1184',
        {
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
            ],
            OrderComponents: [
              { name: 'offerer', type: 'address' },
              { name: 'zone', type: 'address' },
              { name: 'offer', type: 'OfferItem[]' },
              { name: 'consideration', type: 'ConsiderationItem[]' },
              { name: 'orderType', type: 'uint8' },
              { name: 'startTime', type: 'uint256' },
              { name: 'endTime', type: 'uint256' },
              { name: 'zoneHash', type: 'bytes32' },
              { name: 'salt', type: 'uint256' },
              { name: 'conduitKey', type: 'bytes32' },
              { name: 'counter', type: 'uint256' },
            ],
            OfferItem: [
              { name: 'itemType', type: 'uint8' },
              { name: 'token', type: 'address' },
              { name: 'identifierOrCriteria', type: 'uint256' },
              { name: 'startAmount', type: 'uint256' },
              { name: 'endAmount', type: 'uint256' },
                                                                               ],
            ConsiderationItem: [
              { name: 'itemType', type: 'uint8' },
              { name: 'token', type: 'address' },
              { name: 'identifierOrCriteria', type: 'uint256' },
              { name: 'startAmount', type: 'uint256' },
              { name: 'endAmount', type: 'uint256' },
              { name: 'recipient', type: 'address' },
            ],
          },
          primaryType: 'OrderComponents',
          domain: {
            name: 'Seaport',
            version: '1.1',
            chainId: '137',
            verifyingContract: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
          },
          message: {
            offerer: '0xbc215C5E4a60A450a09Be23996303Dfb5DBA1184',
            offer: [
              {
                itemType: '3',
                token: '0xA604060890923Ff400e8c6f5290461A83AEDACec',
                identifierOrCriteria:
                  '85093758989523524877884232971486310575645069457830807352337547365688518115329',
                startAmount: '1',
                endAmount: '1',
              },
            ],
            consideration: [
              {
                itemType: '0',
                token: '0x0000000000000000000000000000000000000000',
                identifierOrCriteria: '0',
                startAmount: '4975000000000000000',
                endAmount: '4975000000000000000',
                recipient: '0xbc215C5E4a60A450a09Be23996303Dfb5DBA1184',
              },
              {
                itemType: '0',
                token: '0x0000000000000000000000000000000000000000',
                identifierOrCriteria: '0',
                startAmount: '25000000000000000',
                endAmount: '25000000000000000',
                recipient: '0x0000a26b00c1F0DF003000390027140000fAa719',
              },
            ],
            startTime: '1677016345',
            endTime: '1679431945',
            orderType: '1',
            zone: '0x0000000000000000000000000000000000000000',
            zoneHash:
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            salt: '24446860302761739304752683030156737591518664810215442929804854367554720946648',
            conduitKey:
              '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
            totalOriginalConsiderationItems: '2',
            counter: '0',
          },
        },
      ],
      chainId: '137',
    };
  }
}

//send tx

// {"params": [
//   {to,
//   data,
//   gasPrice,
//   gasLimit: ethers.BigNumber.from(gas),
//   value: ethers.BigNumber.from(value),
//   from}
// ], "chainId": "1"};

//sign msg

// {"params: [
// "57656c6366d6520746204c61756е6361", //sig
// "Oxbc215c54a60a450a09be23996303dfl" //address
// ] "chainId": "1"}

//sign data

/*
if (data.types.EIP712Domain){
    delete data.types.EIP712Domain
  }

 {"params: [
  null,
 {
  domain: "",
  types: {},
  message: ""
  }
 ] "chainId": "1"}

 */
