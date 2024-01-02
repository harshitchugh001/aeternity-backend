const User = require('../model/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    AeSdk,
    MemoryAccount,
    Node,
    CompilerHttp,
    AE_AMOUNT_FORMATS,
    generateKeyPair
} = require("@aeternity/aepp-sdk");



const saltRounds = 10;

exports.signup = async (req, res) => {
    console.log("hlo");
    const { userName, userEmail, userPassword } = req.body;

    try {
        const existingUser = await User.findOne({ email: userEmail });

        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        // Generate key pair for the user
        const keypair = generateKeyPair();
        const { secretKey, publicKey } = keypair;

        const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

        const newUser = new User({
            username: userName,
            email: userEmail,
            password: hashedPassword,
            publicKey: publicKey,
            secretKey: secretKey,
            userid: Math.floor(10000000 + Math.random() * 90000000),
        });
        console.log(newUser);

        await newUser.save();

        return res.status(201).json({ message: 'Signup successful.' });
    } catch (error) {
        console.error('SIGNUP ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).exec();

        if (!user) {
            return res.status(400).json({ error: 'User with that email does not exist. Please sign up.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: 'Email and password do not match.' });
        }

        const payload = {
            _id: user._id,
            userId: user.userid,
            name: user.username,
            email: user.email,
            publicKey: user.publicKey,
        };
        console.log(payload);

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.json({
            token,
            user: payload,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};


exports.send = async (req, res) => {

    console.log("hlo");
    const { userId, receiverpublicKey, amount } = req.body;
    console.log(req.body);
    console.log(receiverpublicKey);

    try {
        const user = await User.findOne({ userid: userId });
        // console.log(user);
        console.log(user.secretKey);
        const node = new Node("https://testnet.aeternity.io");

        const compiler = new CompilerHttp("https://v7.compiler.aepps.com");

        const senderAccount = new MemoryAccount(user.secretKey);
        
        const aeSdk = new AeSdk({
            nodes: [{ name: "testnet", instance: node }],
            accounts: [senderAccount],
            onCompiler: compiler,
        });

        const init = await aeSdk.spend(amount, receiverpublicKey, {
            // replace <RECIPIENT_PUBLIC_KEY>, Ideally you use public key from Superhero Wallet you have created before
            denomination: AE_AMOUNT_FORMATS.AE
        })
        console.log(init);
        return res.status(200).json({ message: init.hash });




    } catch (error) {
        console.error('send ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }

};

exports.batchsend = async (req, res) => {

    // console.log(req.body);
    const { userId, spends } = req.body;
    console.log(userId);
    console.log(spends);

    try {
        const user = await User.findOne({ userid: userId });
        // console.log(user);
        console.log(user.secretKey);
        const node = new Node("https://testnet.aeternity.io");

        const compiler = new CompilerHttp("https://v7.compiler.aepps.com");
        const senderAccount = new MemoryAccount(user.secretKey);
        const aeSdk = new AeSdk({
            nodes: [{ name: "testnet", instance: node }],
            accounts: [senderAccount],
            onCompiler: compiler,
        });

        const base = (await aeSdk.api.getAccountNextNonce(senderAccount.address)).nextNonce;
        const init = await Promise.all(spends.map(({ publicKey, amount }, idx) =>
            aeSdk.spend(amount, publicKey, { nonce: base + idx, verify: false, waitMined: false ,denomination: AE_AMOUNT_FORMATS.AE}))
        )
        console.log('base', base);
        console.log('init', init);
        return res.status(200).json({ transactions: init });




    } catch (error) {
        console.error('send ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }

};

