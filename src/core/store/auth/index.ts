import {createModel} from '@rematch/core';
import {RootModel} from '../index';
import {authEffects} from '@/core/store/auth/auth.effect';
import {authReducer} from '@/core/store/auth/auth.reducer';
import {User} from '@/models/interfaces/user';

export type AuthState = {
  isLoginInProcess: boolean;
  token: string | undefined;
  user: User | null;
};

export const auth = createModel<RootModel>()({
  state: {
    isLoginInProcess: false,
    token: '',
    user: null,
  } as AuthState,
  reducers: authReducer,
  effects: authEffects,
});
