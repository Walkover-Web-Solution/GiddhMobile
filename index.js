/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import LogRocket from '@logrocket/react-native';
LogRocket.init("sd2s3m/giddh-books-mobile")
AppRegistry.registerComponent(appName, () => App);
