import {init, Models, RematchDispatch, RematchRootState} from '@rematch/core';
import {auth} from '@/core/store/auth';
import {common} from '@/core/store/common';
import persistPlugin from '@rematch/persist';
import AsyncStorage from '@react-native-community/async-storage';
import {company} from '@/core/store/company';

export interface RootModel extends Models<RootModel> {
  auth: typeof auth;
  common: typeof common;
  company: typeof company;
}

const models: RootModel = {
  auth,
  common,
  company,
};

const persistConfig = {
  key: 'auth.token',
  storage: AsyncStorage,
};

export const store = init({
  models,
  plugins: [persistPlugin(persistConfig) as any],
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
