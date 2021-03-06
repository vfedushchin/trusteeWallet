/**
 * @version 0.9
 */
import React, { Component } from 'react'
import { View, Text, ScrollView, Linking, Image, TouchableOpacity } from 'react-native'

import Navigation from '../../components/navigation/Navigation'
import Button from '../../components/elements/Button'
import { strings } from '../../services/i18n'
import GradientView from '../../components/elements/GradientView'
import { connect } from 'react-redux'
import config from '../../config/config'
import Moment from 'moment';
import { setLoaderStatus } from '../../appstores/Stores/Main/MainStoreActions'
import NavStore from '../../components/navigation/NavStore'
import DaemonCache from '../../daemons/DaemonCache'
import { getFioNames } from '../../../crypto/blockchains/fio/FioUtils'

class FioAddresses extends Component {

    constructor(props) {
        super(props)
        this.state = {
            fioAddresses: [],
        }
    }

    async componentDidMount() {
        setLoaderStatus(true)
        try {
            await this.resolveFioAccount()
        } finally {
            setLoaderStatus(false)
        }
    }

    resolveFioAccount = async () => {
        const { selectedWallet } = this.props.mainStore
        const fioAccount = await DaemonCache.getCacheAccount(selectedWallet.walletHash, 'FIO')
        if (fioAccount && fioAccount.address) {
            const fioNames = await getFioNames(fioAccount.address)
            if (fioNames && fioNames.length > 0) {
                this.setState({
                    fioAddresses: fioNames,
                })
            }
        }
    }

    handleRegisterFIOAddress = async () => {
        const { accountList } = this.props.accountStore
        const { selectedWallet } = this.props.mainStore
        const { apiEndpoints } = config.fio

        const publicFioAddress = accountList[selectedWallet.walletHash]['FIO']?.address
        if (publicFioAddress) {
            Linking.openURL(`${apiEndpoints.registrationSiteURL}${publicFioAddress}`)
        } else {
            // TODO show some warning tooltip
        }
    }

    gotoFioSettings = (fioAddress) => {
        NavStore.goNext('FioSettings', { fioAddress })
    }

    render() {
        Moment.locale('en');

        return (
            <View>
                <Navigation
                    title= {strings('FioAddresses.title')}
                />

                <View style={{paddingTop: 80, height: '100%'}}>

                    <GradientView
                        array={styles_.array}
                        start={styles_.start} end={styles_.end}>
                        <View style={styles.titleSection}>
                            <View>
                                <Text style={styles.titleTxt1}>{strings('FioAddresses.description')}</Text>
                            </View>
                        </View>
                    </GradientView>

                    <View style={styles.container}>


                        <View style={{flex: 1, paddingVertical: 20}}>
                            <ScrollView>
                                {
                                    this.state.fioAddresses.map(address => (
                                        <TouchableOpacity key={address.fio_address}
                                                          onPress={() => this.gotoFioSettings(address)}>
                                            <View style={styles.fio_item}>
                                                <Image style={styles.fio_img} resize={'stretch'}
                                                       source={require('../../assets/images/fio-logo.png')}/>
                                                <Text style={styles.fio_txt}>{address.fio_address}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                }
                            </ScrollView>
                        </View>


                        <View style={{marginTop: 20}}>
                            <Button press={this.handleRegisterFIOAddress}>
                                {strings('FioAddresses.btnText')}
                            </Button>
                        </View>


                    </View>

                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    mainStore: state.mainStore,
    accountStore: state.accountStore,
    currencyStore: state.currencyStore
})

export default connect(mapStateToProps, {})(FioAddresses)

const styles_ = {
    array: ['#43156d', '#7127ab'],
    start: { x: 0.0, y: 0.5 },
    end: { x: 1, y: 0.5 }
}

const styles = {

    container: {
        padding: 30,
        paddingTop: 10,
        height: '100%',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
    },

    titleSection: {
        padding: 10,
        color: '#fff',
    },

    txtCenter: {
        textAlign: 'center',
    },

    fio_item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',

        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e3e6e9',
        backgroundColor: '#fff',
        borderRadius: 20
    },

    fio_txt: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 19,
        color: '#404040',
    },

    fio_img: {
        width: 25,
        height: 25,
        marginRight: 20,
        borderWidth: 1,
        borderColor: '#e3e6e9',
        padding: 20,
        borderRadius: 100
    },


    titleTxt1: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 19,
        color: '#fff',
        textAlign: 'center',
    },

    txt: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 19,
        color: '#777',
        textAlign: 'center',
    },


}
