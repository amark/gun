var Gun = (typeof window !== "undefined" && window.Gun) ? window.Gun : require('../gun');
var azureBlobStore;
try {
    azureBlobStore = require('@azure/storage-blob');
} catch (e) {
    console.log("Please `npm install @azure/storage-blob` or add it to your package.json !");
}

Gun.on('create', function(root) {
    var opt = root.opt;
    if (!opt.azureBlob && !opt.azure &&
        !process.env.AZURE_BLOB_CONTAINER &&
        !process.env.AZURE_BLOB_CONTAINER_NAME &&
        !process.env.AZURE_STORAGE_CONTAINER_NAME &&
        !process.env.AZURE_BLOB_CONTIAINER_NAME &&
        !process.env.AZURE_STORAGE_CONNECTION_STRING &&
        !process.env.AZURE_BLOB_CONNECTION_STRING) {
        this.to.next(root);
        return;
    }

    opt.store = Store(opt);
    this.to.next(root);
});

function Store(opt) {
    opt = opt || {};
    opt.file = String(opt.file || 'radata');
    var opts = opt.azureBlob || opt.azure || opt;
    if (opts === opt) {
        opts = opt.azureBlob = opt.azureBlob || opt.azure || {};
    }

    var storeKey = (opts.containerName || '') + '/' + opt.file;
    if (Store[storeKey] && !opt.newStore) {
        return Store[storeKey];
    }

    var containerClient = opts.containerClient;
    if (!containerClient) {
        if (!azureBlobStore) {
            try {
                azureBlobStore = require('@azure/storage-blob');
            } catch (e) {
                console.error("Please `npm install @azure/storage-blob` or add it to your package.json !");
                return;
            }
        }
        var BlobServiceClient = azureBlobStore.BlobServiceClient;
        var StorageSharedKeyCredential = azureBlobStore.StorageSharedKeyCredential;

        var connectionString = opts.connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_BLOB_CONNECTION_STRING;
        var accountName = opts.accountName || opt.accountName || process.env.AZURE_BLOB_ACCOUNT_NAME || process.env.AZURE_STORAGE_ACCOUNT_NAME;
        var accountKey = opts.accountKey || opt.accountKey || process.env.AZURE_BLOB_ACCOUNT_KEY || process.env.AZURE_STORAGE_ACCOUNT_KEY;
        var containerName = opts.containerName || opt.containerName ||
            process.env.AZURE_BLOB_CONTAINER_NAME || process.env.AZURE_BLOB_CONTAINER ||
            process.env.AZURE_STORAGE_CONTAINER_NAME || process.env.AZURE_BLOB_CONTIAINER_NAME ||
            opt.file || 'radata';

        opts.containerName = containerName;

        var blobServiceClient;
        if (connectionString) {
            blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        } else if (accountName && accountKey) {
            var sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
            var storageAccountBaseUrl = opts.accountUrl || `https://${accountName}.blob.core.windows.net`;
            blobServiceClient = new BlobServiceClient(storageAccountBaseUrl, sharedKeyCredential);
        } else if (opts.accountUrl) {
            blobServiceClient = new BlobServiceClient(opts.accountUrl, opts.credential);
        }

        if (blobServiceClient) {
            containerClient = blobServiceClient.getContainerClient(containerName);
        }
    }

    var prefix = (opts.prefix !== undefined) ? opts.prefix : (opt.prefix || '');
    if (prefix && !prefix.endsWith('/')) {
        prefix = prefix + '/';
    }
    function getBlobPath(file) {
        return prefix ? (prefix + file) : file;
    }

    var c = { p: {}, g: {}, l: {} };
    var readyPromise = null;

    function ensureContainer() {
        if (!containerClient) {
            return Promise.resolve(false);
        }
        if (!readyPromise) {
            if (typeof containerClient.createIfNotExists === 'function') {
                readyPromise = containerClient.createIfNotExists().then(function() {
                    return true;
                }).catch(function(err) {
                    console.error("Azure container error:", err.message || err);
                    return false;
                });
            } else {
                readyPromise = Promise.resolve(true);
            }
        }
        return readyPromise;
    }

    if (containerClient) {
        ensureContainer();
    }

    var store = function Store() {};
    Store[storeKey] = store;
    store.containerClient = containerClient;
    store.opt = opt;

    store.put = async function(file, data, cb) {
        if (!file) {
            if (cb) cb();
            return;
        }
        data = (data === undefined || data === null) ? '' : data;
        c.p[file] = data;
        delete c.g[file];

        try {
            await ensureContainer();
            const blobClient = containerClient.getBlockBlobClient(getBlobPath(file));
            const content = Buffer.isBuffer(data) ? data : Buffer.from(typeof data === 'string' ? data : JSON.stringify(data));
            await blobClient.uploadData(content);
            delete c.p[file];
            if (cb) cb(null, 'azure');
        } catch (error) {
            delete c.p[file];
            console.error("Azure upload error (" + file + "):", error.message || error);
            if (cb) cb(error, null);
        }
    };

    store.get = async function(file, cb) {
        if (!file) {
            if (cb) cb(undefined, undefined);
            return;
        }
        var tmp;
        if ((tmp = c.p[file]) !== undefined) {
            if (cb) cb(undefined, tmp);
            return;
        }
        if (tmp = c.g[file]) {
            tmp.push(cb);
            return;
        }
        var cbs = c.g[file] = cb ? [cb] : [];

        try {
            await ensureContainer();
            const blobClient = containerClient.getBlockBlobClient(getBlobPath(file));
            const buffer = await blobClient.downloadToBuffer();
            delete c.g[file];
            var data = buffer.toString('utf8');
            for (var i = 0; i < cbs.length; i++) {
                if (cbs[i]) cbs[i](null, data);
            }
        } catch (error) {
            delete c.g[file];
            var isNotFound = error.statusCode === 404 ||
                             error.code === 'BlobNotFound' ||
                             (error.details && error.details.errorCode === 'BlobNotFound');
            if (isNotFound) {
                for (var i = 0; i < cbs.length; i++) {
                    if (cbs[i]) cbs[i](undefined, undefined);
                }
                return;
            }
            console.error("Azure download error (" + file + "):", error.message || error);
            for (var i = 0; i < cbs.length; i++) {
                if (cbs[i]) cbs[i](error, undefined);
            }
        }
    };

    store.list = async function(cb) {
        if (!cb) return;
        try {
            await ensureContainer();
            const listOptions = prefix ? { prefix: prefix } : {};
            for await (const blob of containerClient.listBlobsFlat(listOptions)) {
                const name = prefix ? blob.name.slice(prefix.length) : blob.name;
                if (cb(name)) {
                    return;
                }
            }
            cb();
        } catch (error) {
            console.error("Azure list error:", error.message || error);
            cb();
        }
    };

    store.del = async function(file, cb) {
        delete c.p[file];
        delete c.g[file];
        try {
            await ensureContainer();
            const blobClient = containerClient.getBlockBlobClient(getBlobPath(file));
            if (typeof blobClient.deleteIfExists === 'function') {
                await blobClient.deleteIfExists();
            } else if (typeof blobClient.delete === 'function') {
                await blobClient.delete();
            }
            if (cb) cb(null, true);
        } catch (error) {
            if (cb) cb(error);
        }
    };

    if (opt.rfs === true) {
        try {
            require('./rfsmix')(opt, store);
        } catch(e) {}
    }

    return store;
}

module.exports = Store;