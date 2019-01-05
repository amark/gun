import * as React from 'react';
import {View, StyleSheet, TextInput, Text, TouchableOpacity, AsyncStorage} from 'react-native';

import Gun from 'gun/gun';
import 'gun/lib/open';
import '../extensions/sea';

import adapter from '../extensions/asyncStorageAdapter';

Gun.on('create', function(db) {
	this.to.next(db);
	const pluginInterop = function(middleware) {
		return function(request) {
			this.to.next(request);
			return middleware(request, db);
		};
	}

	// Register the adapter
	db.on('get', pluginInterop(adapter.read));
	db.on('put', pluginInterop(adapter.write));
});

export class Demo extends React.Component {
    constructor() {
        super();

        this.gun = new Gun();
        this.user = this.gun.user();

        window.gun = this.gun;
        window.user = this.user;

        this.state = {
            authenticated: false,
            list: [],
            listText: '',
            username: '',
            password: '',
        }
    }

    hookUserList = () => {
        this.user.get('list').open((list) => {
            const userList = Object.keys(list).reduce((newList, key) => {
                if (!!Object.keys(list[key]).length) {
                    return [...newList, {text: list[key].text, key}];
                };
            }, []);
            this.setState({
                list: userList || [],
            });
        });
    }

    addToList = () => {
        this.user.get('list').set({text: this.state.listText});
    }

    doSignin = () => {
        this.user.auth(this.state.username, this.state.password, (d) => {
            if (d.err) {
                console.log('err', d.err);
                return;
            }

            this.setState({authenticated: true});
            this.hookUserList();
        });
    }

    doSignup = () => {
        this.user.create(this.state.username, this.state.password, () => {
            this.doSignin();
        });
    }

    loginScreen = () => {
        return (
            <View style={styles.sub}>
                <TextInput placeholder="username" onChangeText={(username) => this.setState({username})} value={this.state.username} style={styles.input} />
                <TextInput placeholder="password" secureTextEntry={true} onChangeText={(password) => this.setState({password})} value={this.state.password} style={styles.input} />
                <TouchableOpacity onPress={this.doSignin} style={styles.button}>
                    <Text>Sign in</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.doSignup} style={styles.button}>
                    <Text>Sign up</Text>
                </TouchableOpacity>
            </View>
        )
    }

    userListScreen = () => {
        return (
            <View style={styles.sub}>
                {
                    !!this.state.list.length && this.state.list.map((item) => <Text key={item.key}>*   {item.text}</Text>)
                }

                <TextInput placeholder="text here" onChangeText={(listText) => this.setState({listText})} value={this.state.listText} style={styles.input} />
                <TouchableOpacity onPress={this.addToList} style={styles.button}>
                    <Text>Add to list</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {
                    this.state.authenticated ?
                    this.userListScreen() : this.loginScreen()
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    sub: {
        height: '50%',
        width: '60%',
        justifyContent: 'space-between',
        padding: 4,
    },
    button: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 50,
    },
    input: {
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '32%',
    },
});
