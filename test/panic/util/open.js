let _browsers = [];

module.exports = {
    web: (count, url, options) => {
        if (typeof count === 'string') {
            options = url;
            url = count;
            count = 1;
        }
        if (!url || typeof url !== 'string') {
            throw new Error('Invalid URL');
        }
        try {
			require('puppeteer').launch(options).then(browser => {
				_browsers.push(browser);
				Array(count).fill(0).forEach((x, i) => {
					console.log('Opening browser page ' + i + ' with puppeteer...');
					browser.newPage().then(page => {
						page.on('console', msg => {
							if (msg.text() === 'JSHandle@object') {
								// FIXME: Avoid text comparison
								return;
							}
							console.log(`${i} [${msg.type()}]: ${msg.text()}`);
						});
						return page.goto(url);
					}).then(() => {
						console.log('Browser page ' + i + ' open');
					});
				});
			});
		} catch (err) {
			console.log("PLEASE OPEN "+ url +" IN "+ count +" BROWSER(S)!");
			console.warn('Consider installing puppeteer to automate browser management (npm i -g puppeteer && npm link puppeteer)');
		}
	},
	cleanup: () => {
		if (_browsers.length === 0) {
			return undefined;
		}
		console.log('Closing all puppeteer browsers...');
		return Promise.all(_browsers.map(b => b.close()))
			.then(() => console.log('Closed all puppeteer browsers'));
	}
}
