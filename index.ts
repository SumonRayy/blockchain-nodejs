import * as crypto from 'crypto';

class Transaction {
    
    constructor(
      public id: string,
      public sender: string,
      public recipient: string,
      public amount: number
    ) {

    }

    toString() {
        return JSON.stringify(this); 
        }
    
}

class Block {

    public nonce = Math.round(Math.random() * 9999999);
        
        constructor(
            public index: number,
            public transactions: Transaction[],
            public previousHash: string,
            public hash: string,
            public timestamp = Date.now()
        ) {
    
        }

        getHash() {
            const str = JSON.stringify(this);
            const hash = crypto.createHash('sha256');

            hash.update(str).end();
            return hash.digest('hex');
        }
    
}

class Chain {
    public static instance = new Chain();
    
    chain: Block[] = [];

    createGenesisBlock() {
        const genesisBlock = new Block(0, [], '0', '0');
        return genesisBlock;
    }

    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    mine(nonce: number) {
        let solution = 1;
        console.log(" ⛏ Mining...");

        while(true) {
            const hash = crypto.createHash('MD5');
            hash.update((nonce + solution).toString()).end();

            const attempt = hash.digest('hex');

            if (attempt.substring(0, 4) === '0000') {
                console.log(" ⛏ Success! : " + attempt + " - nonce : " + nonce + " - solution : " + solution);
                return solution;
            }
            
            solution++;
        }
        
    }

    addBlock(transactions: Transaction[], senderPublicKey: string, signature: string) {
        const verifier = crypto.createVerify('SHA256');
        verifier.update(transactions.toString());

        const isValid = verifier.verify(senderPublicKey, signature);

        if (isValid) {
            const newBlock = new Block(this.chain.length, transactions, this.lastBlock.hash, this.lastBlock.getHash());
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    }

}

class Wallet {
    public publicKey: string;
    public privateKey: string;

    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
    
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }

    sendMoney(recipient: string, amount: number) {
        const transaction = new Transaction(
            crypto.randomBytes(20).toString('hex'),
            this.publicKey,
            recipient,
            amount
        );

        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();

        const signature = sign.sign(this.privateKey, 'hex');
        Chain.instance.addBlock([transaction], this.publicKey, signature);
    }
}


// example of usages
const satoshi = new Wallet();
const moinak = new Wallet();
const sumit = new Wallet();

satoshi.sendMoney(moinak.publicKey, 100);
moinak.sendMoney(sumit.publicKey, 100);
sumit.sendMoney(satoshi.publicKey, 100);

console.log(Chain.instance);
console.log("\n\n\n");
console.log("Code by: @SumonRayy");


