import { Constructor, TinlakeParams, PendingTransaction } from '../Tinlake'
import BN from 'bn.js'

export function CurrencyActions<ActionsBase extends Constructor<TinlakeParams>>(Base: ActionsBase) {
  return class extends Base implements ICurrencyActions {
    // move out for tests only
    mintCurrency = async (usr: string, amount: string) => {
      return this.pending(this.contract('TINLAKE_CURRENCY').mint(usr, amount, this.overrides))
    }

    getCurrencyAllowance = async (owner: string, spender: string) => {
      const currencyContract = this.contract('TINLAKE_CURRENCY')
      return (await currencyContract.allowance(owner, spender)).toBN()
    }

    getJuniorForCurrencyAllowance = async (owner: string) => {
      if (!this.contractAddresses['JUNIOR_TRANCHE']) return
      return this.getCurrencyAllowance(owner, this.contractAddresses['JUNIOR_TRANCHE'])
    }

    getSeniorForCurrencyAllowance = async (owner: string) => {
      if (!this.contractAddresses['SENIOR_TRANCHE']) return
      return this.getCurrencyAllowance(owner, this.contractAddresses['SENIOR_TRANCHE'])
    }

    getCurrencyBalance = async (user: string) => {
      return (await this.contract('TINLAKE_CURRENCY').balanceOf(user)).toBN()
    }

    getJuniorTokenBalance = async (user: string) => {
      return (await this.contract('JUNIOR_TOKEN').balanceOf(user)).toBN()
    }
    getSeniorTokenBalance = async (user: string) => {
      return (await this.contract('SENIOR_TOKEN').balanceOf(user)).toBN()
    }

    approveCurrency = async (usr: string, currencyAmount: string) => {
      const currencyContract = this.contract('TINLAKE_CURRENCY')
      return this.pending(currencyContract.approve(usr, currencyAmount, this.overrides))
    }

    approveSeniorForCurrency = async (currencyAmount: string) => {
      if (!this.contractAddresses['SENIOR_TRANCHE']) return
      return this.approveCurrency(this.contractAddresses['SENIOR_TRANCHE'], currencyAmount)
    }

    approveJuniorForCurrency = async (currencyAmount: string) => {
      if (!this.contractAddresses['JUNIOR_TRANCHE']) return
      return this.approveCurrency(this.contractAddresses['JUNIOR_TRANCHE'], currencyAmount)
    }

    approveJuniorForToken = async (tokenAmount: string) => {
      const tokenContract = this.contract('JUNIOR_TOKEN')
      return this.pending(tokenContract.approve(this.contractAddresses['JUNIOR_TRANCHE'], tokenAmount, this.overrides))
    }

    approveSeniorForToken = async (tokenAmount: string) => {
      const tokenContract = this.contract('SENIOR_TOKEN')
      return this.pending(tokenContract.approve(this.contractAddresses['SENIOR_TRANCHE'], tokenAmount, this.overrides))
    }
  }
}

export type ICurrencyActions = {
  mintCurrency(usr: string, amount: string): Promise<PendingTransaction>
  getCurrencyBalance(usr: string): Promise<BN>
  getCurrencyAllowance: (owner: string, spender: string) => Promise<BN>
  getJuniorForCurrencyAllowance: (owner: string) => Promise<BN | undefined>
  getSeniorForCurrencyAllowance: (owner: string) => Promise<BN | undefined>
  approveCurrency(usr: string, amount: string): Promise<PendingTransaction>
  approveSeniorForCurrency: (currencyAmount: string) => Promise<PendingTransaction | undefined>
  approveJuniorForCurrency: (currencyAmount: string) => Promise<PendingTransaction | undefined>
  approveSeniorForToken: (tokenAmount: string) => Promise<PendingTransaction>
  approveJuniorForToken: (tokenAmount: string) => Promise<PendingTransaction>
}

export default CurrencyActions
