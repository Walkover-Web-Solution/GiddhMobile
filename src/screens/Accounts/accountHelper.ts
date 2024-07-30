export const getInvoiceListRequest = (data: any): any => {
    const particularAcccountUniqueName = data?.particularAccount?.stock ? data?.oppositeAccountUniqueName : data?.particularAccount?.uniqueName
    const debitNoteVoucher = "debit note";
    const creditNoteVoucher = "credit note";
    const salesParentGroups = ['revenuefromoperations', 'otherincome'];
    const purchaseParentGroups = ['operatingcost', 'indirectexpenses'];
    const debtorCreditorParentGroups = ['sundrydebtors', 'sundrycreditors'];
    const cashBankParentGroups = ['cash', 'bankaccounts', 'loanandoverdraft'];
    const fixedAssetsGroups = ['fixedassets'];
    const journalVoucherTypes = ["jr", "journal"];
    const journalVoucherType = "journal";
    if (data?.particularAccount?.parentGroups?.length > 0) {
      if (data?.particularAccount?.parentGroups[0]?.uniqueName) {
        data.particularAccount.parentGroups = data?.particularAccount?.parentGroups?.map(group => group?.uniqueName);
      }
    }

    let isSalesLedger = false;
    let isPurchaseLedger = false;
    let isDebtorCreditorLedger = false;
    let isCashBankLedger = false;
    let isFixedAssetsLedger = false;

    data?.ledgerAccount?.parentGroups?.forEach(group => {
      if (salesParentGroups.includes(group?.uniqueName)) {
        isSalesLedger = true;
      } else if (purchaseParentGroups.includes(group?.uniqueName)) {
        isPurchaseLedger = true;
      } else if (debtorCreditorParentGroups.includes(group?.uniqueName)) {
        isDebtorCreditorLedger = true;
      } else if (cashBankParentGroups.includes(group?.uniqueName)) {
        isCashBankLedger = true;
      } else if (fixedAssetsGroups.includes(group?.uniqueName)) {
        isFixedAssetsLedger = true;
      }
    });

    let isSalesAccount = false;
    let isPurchaseAccount = false;
    let isDebtorCreditorAccount = false;
    let isCashBankAccount = false;
    let isFixedAssetsAccount = false;

    data?.particularAccount?.parentGroups?.forEach(groupUniqueName => {
      if (salesParentGroups.includes(groupUniqueName)) {
        isSalesAccount = true;
      } else if (purchaseParentGroups.includes(groupUniqueName)) {
        isPurchaseAccount = true;
      } else if (debtorCreditorParentGroups.includes(groupUniqueName)) {
        isDebtorCreditorAccount = true;
      } else if (cashBankParentGroups.includes(groupUniqueName)) {
        isCashBankAccount = true;
      } else if (fixedAssetsGroups.includes(groupUniqueName)) {
        isFixedAssetsAccount = true;
      }
    });

    let request = {
      accountUniqueName: undefined,
      voucherType: undefined,
      noteVoucherType: undefined
    };
    if (isSalesLedger || isPurchaseLedger) {
      if (isDebtorCreditorAccount) {
        request = {
          accountUniqueName: particularAcccountUniqueName,
          voucherType: data?.voucherType,
          noteVoucherType: ((data?.voucherType === debitNoteVoucher || data?.voucherType === creditNoteVoucher) && isSalesLedger) ? "sales" : ((data?.voucherType === debitNoteVoucher || data?.voucherType === creditNoteVoucher) && isPurchaseLedger) ? "purchase" : undefined
        };
      } else if (journalVoucherTypes.includes(data?.voucherType)) {
        request = {
          accountUniqueName: data?.ledgerAccount?.uniqueName,
          voucherType: journalVoucherType,
          noteVoucherType: undefined
        };
      } else {
        request = undefined;
      }
    } else if (isFixedAssetsLedger) {
      if (isDebtorCreditorAccount) {
        request = {
          accountUniqueName: particularAcccountUniqueName,
          voucherType: data?.voucherType,
          noteVoucherType: (data?.voucherType === creditNoteVoucher) ? "sales" : (data?.voucherType === debitNoteVoucher) ? "purchase" : undefined
        };
      } else if (journalVoucherTypes.includes(data?.voucherType)) {
        request = {
          accountUniqueName: data?.ledgerAccount?.uniqueName,
          voucherType: journalVoucherType,
          noteVoucherType: undefined
        };
      } else {
        request = undefined;
      }
    } else if (isDebtorCreditorLedger) {
      request.accountUniqueName = data?.ledgerAccount?.uniqueName;
      request.voucherType = data?.voucherType;
      if (isSalesAccount) {
        request.noteVoucherType = (data?.voucherType === debitNoteVoucher || data?.voucherType === creditNoteVoucher) ? "sales" : undefined;
      } else if (isPurchaseAccount) {
        request.noteVoucherType = (data?.voucherType === debitNoteVoucher || data?.voucherType === creditNoteVoucher) ? "purchase" : undefined;
      } else if (isCashBankAccount) {
        request.noteVoucherType = undefined;
      } else if (isFixedAssetsAccount) {
        request.noteVoucherType = (data?.voucherType === creditNoteVoucher) ? "sales" : (data?.voucherType === debitNoteVoucher) ? "purchase" : undefined;
      } else if (journalVoucherTypes.includes(data?.voucherType)) {
        request.voucherType = journalVoucherType;
      } else {
        request = undefined;
      }
    } else if (isCashBankLedger) {
      if (isDebtorCreditorAccount) {
        request = {
          accountUniqueName: particularAcccountUniqueName,
          voucherType: data?.voucherType,
          noteVoucherType: undefined
        };
      } else if (journalVoucherTypes.includes(data?.voucherType)) {
        request = {
          accountUniqueName: data?.ledgerAccount?.uniqueName,
          voucherType: journalVoucherType,
          noteVoucherType: undefined
        };
      } else {
        request = undefined;
      }
    }

    return request;
  }