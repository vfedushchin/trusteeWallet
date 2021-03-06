/**
 * @version 0.5
 * https://github.com/tronscan/tronscan-frontend/wiki/TRONSCAN-API
 */
import BlocksoftCryptoLog from '../../../common/BlocksoftCryptoLog'
import BlocksoftAxios from '../../../common/BlocksoftAxios'

const BALANCE_PATH = 'https://apilist.tronscan.org/api/account?address='
const BALANCE_MAX_TRY = 10

const CACHE_TRONSCAN = {}
const CACHE_VALID_TIME = 3000 // 3 seconds

export default class TrxTronscanProvider {

    /**
     * https://apilist.tronscan.org/api/account?address=TUbHxAdhPk9ykkc7SDP5e9zUBEN14K65wk
     * @param {string} address
     * @param {string} tokenName
     * @returns {Promise<boolean|{unconfirmed: number, frozen: *, voteTotal: *, balance: *, provider: string}>}
     */
    async get(address, tokenName) {
        const now = new Date().getTime()
        if (typeof CACHE_TRONSCAN[address] !== 'undefined' && (now - CACHE_TRONSCAN[address].time) < CACHE_VALID_TIME) {
            if (typeof CACHE_TRONSCAN[address][tokenName] !== 'undefined') {
                BlocksoftCryptoLog.log('TrxTronscanProvider.get from cache', address + ' => ' + tokenName + ' : ' + CACHE_TRONSCAN[address][tokenName])
                const frozen = typeof CACHE_TRONSCAN[address][tokenName + 'frozen'] !== 'undefined' ? CACHE_TRONSCAN[address][tokenName + 'frozen'] : 0
                const voteTotal = typeof CACHE_TRONSCAN[address].voteTotal !== 'undefined' ? typeof CACHE_TRONSCAN[address].voteTotal : 0
                return { balance: CACHE_TRONSCAN[address][tokenName], voteTotal, frozen, unconfirmed : 0, provider: 'tronscan-cache' }
            }
        }

        const link = BALANCE_PATH + address
        BlocksoftCryptoLog.log('TrxTronscanProvider.get ' + link)
        const res = await BlocksoftAxios.getWithoutBraking(link, BALANCE_MAX_TRY)
        if (!res || !res.data) {
            return false
        }

        CACHE_TRONSCAN[address] = {}
        CACHE_TRONSCAN[address].time = now
        CACHE_TRONSCAN[address]._ = res.data.balance
        CACHE_TRONSCAN[address]._frozen = typeof res.data.frozen.total !== 'undefined' ? res.data.frozen.total : 0
        CACHE_TRONSCAN[address].voteTotal = typeof res.data.voteTotal !== 'undefined' ? res.data.voteTotal : 0
        let token
        if (res.data.tokenBalances) {
            for (token of res.data.tokenBalances) {
                CACHE_TRONSCAN[address][token.name] = token.balance
            }
        }
        if (res.data.trc20token_balances) {
            for (token of res.data.trc20token_balances) {
                CACHE_TRONSCAN[address][token.contract_address] = token.balance
            }
        }

        if (typeof CACHE_TRONSCAN[address][tokenName] === 'undefined') {
            return false
        }

        const balance = CACHE_TRONSCAN[address][tokenName]
        const frozen = typeof CACHE_TRONSCAN[address][tokenName + 'frozen'] !== 'undefined' ? CACHE_TRONSCAN[address][tokenName + 'frozen'] : 0
        const voteTotal = typeof CACHE_TRONSCAN[address].voteTotal !== 'undefined' ? CACHE_TRONSCAN[address].voteTotal : 0
        return { balance, frozen, voteTotal, unconfirmed: 0, provider: 'tronscan' }
    }
}
