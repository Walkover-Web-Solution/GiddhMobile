export const localeData = [
    {
      "accountType": "Debtors",
      "text": {
        "cr": "Is <accountName> giver?",
        "dr": "Is <accountName> receiver?"
      },
      "balanceText": {
        "cr": "Advance from Debtors",
        "dr": "Due"
      }
    },
    {
      "accountType": "Creditors",
      "text": {
        "cr": "Is <accountName> giver?",
        "dr": "Is <accountName> receiver?"
      },
      "balanceText": {
        "cr": "Payable to creditors",
        "dr": "Advance to creditors"
      }
    },
    {
      "accountType": "Revenue",
      "text": {
        "cr": "+ <accountName> (Increasing)",
        "dr": "- <accountName> (Decreasing)"
      },
      "balanceText": {
        "cr": "Revenue",
        "dr": "(-) Negative Revenue"
      }
    },
    {
      "accountType": "Expense",
      "text": {
        "cr": "<accountName> ↓  (decreasing)",
        "dr": "<accountName> ↑ (Increasing)"
      },
      "balanceText": {
        "cr": "Negative Expense (looks strange) ",
        "dr": "Expense"
      }
    },
    {
      "accountType": "Asset",
      "text": {
        "cr": "<accountName> is Going out (-)",
        "dr": "<accountName> is Coming in (+)"
      },
      "balanceText": {
        "cr": "(-) Asset ( ohh no!)",
        "dr": "Asset value"
      }
    },
    {
      "accountType": "Liability",
      "text": {
        "cr": "<accountName> is increasing ↑",
        "dr": "<accountName> is decreasing ↓"
      },
      "balanceText": {
        "cr": "Liability Payable",
        "dr": "Liabilities paid in advance (hurrey!)"
      }
    },
    {
      "accountType": "ReverseCharge",
      "text": {
        "cr": "<accountName> is decreasing ↓",
        "dr": "<accountName> is increasing ↑"
      },
      "balanceText": {
        "cr": "(-) Reverse Charge ( ohh no!)",
        "dr": "Reverse Charge value"
      }
    },
    {
      "accountType": "null",
      "text": {
        "cr": "<accountName> liability is going out",
        "dr": "<accountName> liability is coming in"
      },
      "balanceText": {
        "cr": "",
        "dr": ""
      }
    }
  ]
export const voucherTypes = [
    "Sales",
    "Contra",
    "Receipt",
    "Payment",
    "Journal",
    "Purchase",
    "Debit Note",
    "Credit Note",
    "Advance Receipt"
  ]  
export const KEYBOARD_EVENTS = {
    IOS_ONLY: {
      KEYBOARD_WILL_SHOW: 'keyboardWillShow',
      KEYBOARD_WILL_HIDE: 'keyboardWillHide'
    },
    KEYBOARD_DID_SHOW: 'keyboardDidShow',
    KEYBOARD_DID_HIDE: 'keyboardDidHide'
  };  

export function getAbbreviation(transactionType: string) {
  const abbreviations = {
      "Sales": "sal",
      "Contra": "cntr",
      "Receipt": "rcpt",
      "Payment": "pay",
      "Journal": "jr",
      "Purchase": "pur",
      "Debit Note": "debit note",
      "Credit Note": "credit note",
      "Advance Receipt": "rcpt"
  };

  return abbreviations[transactionType] || '';
}  