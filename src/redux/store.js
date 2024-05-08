import {createStore, applyMiddleware, compose} from 'redux';
import createSagaMiddleware from 'redux-saga';
// import thunk from 'redux-thunk';
import promise from '../promise';
import reducer from './reducers';
import rootSaga from './RootSaga';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const sagaMiddleware = createSagaMiddleware();
const createDebugger = require('redux-flipper').default;

export default () => {
  const enhancer = compose(applyMiddleware(sagaMiddleware, promise, createDebugger()));
  const persistedReducer = persistReducer(persistConfig, reducer);
  const store = createStore(persistedReducer, enhancer);
  const persistor = persistStore(store);

  sagaMiddleware.run(rootSaga);
  return {store, persistor};
};
