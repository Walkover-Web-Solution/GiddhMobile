/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import LogRocket from '@logrocket/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// LogRocket.init("sd2s3m/giddh-books-mobile")
import zipy from 'zipyai-react-native';

zipy.init('3552cafd');

// AsyncStorage.clear();
AppRegistry.registerComponent(appName, () => App);
