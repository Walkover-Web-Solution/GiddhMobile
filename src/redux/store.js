import {createStore, applyMiddleware, compose} from 'redux';
import promise from '../promise';
import reducer from './reducers';
import rootSaga from './RootSaga';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const createSagaMiddleware = require('redux-saga').default;
const sagaMiddleware = createSagaMiddleware();

export default () => {
  const enhancer = compose(applyMiddleware(sagaMiddleware, promise));
  const persistedReducer = persistReducer(persistConfig, reducer);
  const store = createStore(persistedReducer, enhancer);
  const persistor = persistStore(store);

  sagaMiddleware.run(rootSaga);
  return {store, persistor};
};
