import {createModel} from '@rematch/core';
import {RootModel} from '@/core/store';
import {Country} from '@/models/interfaces/country';
import {commonReducer} from '@/core/store/common/common.reducer';
import {commonEffects} from '@/core/store/common/common.effect';

export type CommonState = {
  countries: Country[];
  isCountriesLoading: boolean;
};

export const common = createModel<RootModel>()({
  state: {
    countries: [],
    isCountriesLoading: false,
  } as CommonState,
  reducers: commonReducer,
  effects: commonEffects,
});
