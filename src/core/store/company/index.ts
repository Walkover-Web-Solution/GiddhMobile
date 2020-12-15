import {createModel} from '@rematch/core';
import {RootModel} from '@/core/store';
import {companyReducer} from '@/core/store/company/company.reducer';
import {companyEffects} from '@/core/store/company/company.effect';
import {Company} from '@/models/interfaces/company';

export type CompanyState = {
  activeCompany: Company | null;
  companyList:{};
};

export const company = createModel<RootModel>()({
  state: {
    activeCompany: null,
    companyList: null,
  } as CompanyState,
  reducers: companyReducer,
  effects: companyEffects,
});
