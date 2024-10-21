import { createEndpoint } from "@/utils/helper";

export const TaxUrls = {
    fetchTaxNumbers: createEndpoint('company/:companyUniqueName/tax-numbers?lang=en'),
    fetchVatObligations: (startDate:string,endDate:string,branchUniqueName:string,status:string) => createEndpoint(`company/:companyUniqueName/uk/vat-obligations?branchUniqueName=${branchUniqueName}&taxNumber=:taxNumber&status=${status}&from=${startDate}&to=${endDate}&lang=en`),
    fetchOpenVatReport: (start:string, end:string) => createEndpoint(`company/:companyUniqueName/uk/vat-report?from=${start}&to=${end}&taxNumber=:taxNumber&lang=en`),
    fetchFulfilledVatReport: (start:string, end:string, periodKey:string)=> createEndpoint(`company/:companyUniqueName/uk/view-vat-return?taxNumber=:taxNumber&periodKey=${periodKey}&from=${start}&to=${end}&lang=en`),
    submitFileReturn: (start:string, end:string, periodKey:string, branchUniqueName:string) => createEndpoint(`company/:companyUniqueName/uk/submit-vat-return?taxNumber=:taxNumber&periodKey=${periodKey}&from=${start}&to=${end}&branchUniqueName=${branchUniqueName}&lang=en`),
    authorize: createEndpoint('company/:companyUniqueName/authorize?lang=en')
}