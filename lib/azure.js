var Gun = require('../gun');
var azureBlobStore;
let containerClient;

const { Readable } = require('stream');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

Gun.on('create', function(root) {
    console.log("Please note this adapter is not fully working yet");
    this.to.next(root);
    var opt = root.opt;
    if (!opt.azureBlob && !process.env.AZURE_BLOB_CONTAINER) {
        return;
    }

    try {
        azureBlobStore = require('@azure/storage-blob');
    } catch (e) {
        console.log("Please `npm install @azure/storage-blob` or add it to your package.json !");
    }

    var opts = opt.azureBlob || (opt.azureBlob = {});
    opts.accountName = opts.accountName || process.env.AZURE_BLOB_ACCOUNT_NAME;
    opts.accountKey = opts.accountKey || process.env.AZURE_BLOB_ACCOUNT_KEY;
    opts.containerName = opts.containerName || process.env.AZURE_BLOB_CONTIAINER_NAME;

    const storageAccountBaseUrl = `https://${opts.accountName}.blob.core.windows.net`,
          sharedKeyCredential = new StorageSharedKeyCredential(opts.accountName, opts.accountKey);

    const blobServiceClient = new BlobServiceClient(
        storageAccountBaseUrl,
        sharedKeyCredential
    );

    containerClient = blobServiceClient.getContainerClient(opts.containerName);

    // Check if the container exists, if not, create it
    containerClient.exists().then((exists) => {
        if (!exists) {
            containerClient.create();
            console.log(`Blob container ${opts.containerName} created successfully.`);
        }
    }).catch((error) => {
        console.error("Error checking container existence:", error);
    });

    opt.store = Store(opt);
});

function Store(opt) {
    opt = opt || {};
    opt.file = String(opt.file || 'radata');
    var opts = opt.azureBlob,
        azureBlob = opts.azureBlob;
    var c = { p: {}, g: {}, l: {} };

    var store = function Store() {};
    if (Store[opt.file]) {
        console.log("Warning: reusing same Azure Blob store and options as 1st.");
        return Store[opt.file];
    }
    Store[opt.file] = store;

    store.put = async function(file, data, cb) {
        try {
            const blobClient = containerClient.getBlockBlobClient(file);
            const stream = Readable.from(data);
            const uploadResponse = await blobClient.uploadStream(stream, data.length, undefined, undefined);
            console.log("File uploaded successfully", uploadResponse);
            cb(null, 'azure');
        } catch (error) {
            console.error("Error uploading file:", error);
            cb(error, null);
        }
    };

    store.get = async function(file, cb) {
        try {
            const blobClient = containerClient.getBlockBlobClient(file);
            const downloadResponse = await blobClient.download(0);
            const downloadedData = [];
            downloadResponse.readableStreamBody.on("data", (data) => {
                downloadedData.push(data.toString());
            });
            downloadResponse.readableStreamBody.on("end", () => {
                const data = downloadedData.join('');
                cb(null, data);
            });
            downloadResponse.readableStreamBody.on("error", (err) => {
                console.error("Error reading stream:", err);
                cb(err, null);
            });
        } catch (error) {
            // console.error("Error downloading file:", error);
            cb(error, null);
        }
    };

    store.list = async function(cb) {
        try {
            const response = await containerClient.listBlobsFlat();
            const keys = [];
            response.segment.blobItems.forEach((blob) => {
                keys.push(blob.name);
            });
            cb(keys);
        } catch (error) {
            //console.error("Error listing blobs:", error);
            cb([]);
        }
    };

    return store;
}

module.exports = Store;
