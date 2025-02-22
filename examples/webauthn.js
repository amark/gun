/*
DISCUSSION WITH AI:
UPGRADE SEA.verify to allow put with signed

The goal of this dev session is to make the check() function in SEA handle signed puts, but without having the user to be authenticated. It should check if the signature matches the pub, thats it.

There are files that are related to this mission: sign.js, verify.js and index.js, they are in /sea folder.

The sign() function in sign.js create signature from given SEA pair. We will modify it to also be able to request WebAuthn signature. We must transform (normalize) the signature of passkey to make it look like SEA signature. But we must keep its current functionalities remain working.

MUST KEEP IN MIND: webauthn sign doesn't sign the original data alone, instead, it wrap the original data in an object 

The verify() function in verify.js verifies if signature matches pub. We will modify it to also be able to verify new kind of signature created by webauthn passkey.

The check() function in index.js handles every data packet that flows through the system. It works like a filter to filter out bad (signature not matched) datas.

We must also modify index.js in sea, the check.pub() function. It handles outgoing and incoming put data. In there we will make it to be able to use SEA.sign with external authenticator which is WebAuthn.

We must edit slowly. After every edition, we must debug on browser using examples/webauthn.html and examples/webauthn.js to check if it works, then keep editing slowly until it works.

What should we edit?
The sea.js in the root folder is just a built, it is very heavy and you cannot read it. So we must "blindly" debug in sign.js, verify.js and index.js in /sea folder. 

DO THIS AFTER EVERY EDITION:
npm run buildSea

We need to re-build sea before testing it.

BIG UPDATE:
Now after some coding, the sign.js and verify.js work perfectly in test in webauthn.js. Ok. We should now focus in modifying check.pub in index.js.

How it should work?
At line 147 in index.js, it currently checks:
- if user authenticated (in SEA) and must not have wrapped cert
    - if user is writing to his graph
    - if he is writing to someone else's graph, must have msg._.msg.opt.cert

Now what we want is to make it to also allows unauthenticated user to make put, using put(data, null, {opt: {authenticator}}).
It should detect if authenticator exists, then use that in replace for user._.sea. Then the following logic is the same. But we also must keep the current functionalities remain working.

What I want?
When putting with authenticator (webauthn), the device doesn't provide public key. So user must provide pub via opt.pub if he wants to put data to someone else's graph. If opt.pub doesn't exist, he can only writes to his own graph.
*/

console.log("WEB AUTHN EXAMPLE")

const base64url = {
    encode: function(buffer) {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    },
    decode: function(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
    }
};

const data = "Hello, World!"
let credential, pub, signature

document.getElementById('create').onclick = async () => {
    try {
        credential = await navigator.credentials.create({
            publicKey: {
                challenge: new Uint8Array(16),
                rp: { id: "localhost", name: "Example Inc." },
                user: {
                    id: new TextEncoder().encode("example-user-id"),
                    name: "Example User",
                    displayName: "Example User"
                },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 },
                    { type: "public-key", alg: -257 },
                    { type: "public-key", alg: -37 }
                ],
                authenticatorSelection: { userVerification: "preferred" },
                timeout: 60000,
                attestation: "none"
            }
        });
        
        console.log("Credential:", credential);
        
        const publicKey = credential.response.getPublicKey();
        const rawKey = new Uint8Array(publicKey);
        
        console.log("Raw public key bytes:", rawKey);
        
        const xCoord = rawKey.slice(27, 59);
        const yCoord = rawKey.slice(59, 91);
        
        console.log("X coordinate (32 bytes):", base64url.encode(xCoord));
        console.log("Y coordinate (32 bytes):", base64url.encode(yCoord));
        
        pub = `${base64url.encode(xCoord)}.${base64url.encode(yCoord)}`;
        console.log("Final pub format:", pub);
        
    } catch(err) {
        console.error('Create credential error:', err);
    }
}

const authenticator = async (data) => {
    const challenge = new TextEncoder().encode(data);
    const options = {
        publicKey: {
            challenge,
            rpId: window.location.hostname,
            userVerification: "preferred",
            allowCredentials: [{
                type: "public-key",
                id: credential.rawId
            }],
            timeout: 60000
        }
    };
    console.log("Auth options:", options);
    
    const assertion = await navigator.credentials.get(options);
    return assertion.response;
};

document.getElementById('sign').onclick = async () => {
    if (!credential) {
        console.error("Create credential first");
        return;
    }
    
    try {
        signature = await SEA.sign(data, authenticator);
        console.log("Signature:", signature);
    } catch(err) {
        console.error('Signing error:', err);
    }
}

document.getElementById('verify').onclick = async () => {
    if (!signature) {
        console.error("Sign message first");
        return;
    }

    try {
        const verified = await SEA.verify(signature, pub);
        console.log("Verified:", verified);
    } catch(err) {
        console.error('Verification error:', err);
    }
}

document.getElementById('put').onclick = async () => {
    gun.get(`~${pub}`).get('test').put("hello world", null, { opt: { authenticator }})
    setTimeout(() => {
        gun.get(`~${pub}`).get('test').once((data) => {
            console.log("Data:", data);
        })
    }, 2000)
}