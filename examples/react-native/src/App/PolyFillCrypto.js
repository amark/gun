import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import WebViewBridge from 'react-native-webview-bridge';

import { MainWorker, webViewWorkerString } from '../webview-crypto';

import encodeUtf8 from 'encode-utf8';
import encodeBase64 from 'fast-base64-encode';

const base64EncodeString = (input) => {
	return encodeBase64(new Uint8Array(encodeUtf8(input)));
};

const internalLibIOS = `
${webViewWorkerString}
(function () {
  var wvw = new WebViewWorker(WebViewBridge.send.bind(WebViewBridge));
  WebViewBridge.onMessage = wvw.onMainMessage.bind(wvw);
}());
`;

const intermediateLib = `
${webViewWorkerString}
(function () {
  var wvw = new WebViewWorker(WebViewBridge.send.bind(WebViewBridge));
  WebViewBridge.onMessage = wvw.onMainMessage.bind(wvw);
}());
`;

const internalLibAndroid = `eval(window.atob('${base64EncodeString(intermediateLib)}'))`;

export default class PolyfillCrypto extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	render() {
		let worker;
		const uri = 'file:///android_asset/html/blank.html';
		return (
			<View style={styles.hidden}>
				<WebViewBridge
					ref={(c) => {
						if (c && !worker) {
							worker = new MainWorker(c.sendToBridge, this.props.debug);

							if (window.crypto) {
								// we are in chrome debugger
								// this means overridng the crypto object itself won't
								// work, so we have to override all of it's methods
								for (const name in worker.crypto.subtle) {
									window.crypto.subtle[name] = worker.crypto.subtle[name];
								}
								window.crypto.fake = true;
							} else {
								window.crypto = worker.crypto;
							}
							window.crypto.loaded = true;
							console.log('*** poly injected', window.crypto);
						}
					}}
					onBridgeMessage={
						// can't refer to this.state.onBridgeMessage directly
						// because it is not defined when this component is first
						// started, only set in `ref`
						(message) => {
							worker.onWebViewMessage(message);
						}
					}
					injectedJavaScript={
						Platform.OS === 'android' ? internalLibAndroid : internalLibIOS
					}
					onError={(error) => {
						console.warn('Error creating webview: ', error);
					}}
					javaScriptEnabled={true}
					source={{
						uri: Platform.OS === 'android' ? uri : 'about:blank',
					}}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	hidden: {
		height: 0,
		opacity: 0,
	},
});
