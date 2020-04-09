import React, {useState} from 'react'
import {SafeAreaView, View, Image} from 'react-native'
import {FormattedMessage, useIntl} from 'react-intl'
import Modal from 'react-native-modal'
import {StackNavigationProp} from '@react-navigation/stack'

import SCREENS from '../constants/screens'
import {containerStyles, colors, bpPassportImage} from '../styles'
import {Button, Link, PageHeader, BodyText, BodyHeader} from '../components'
import {RootStackParamList} from '../Navigation'

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  SCREENS.LOGIN
>

type Props = {
  navigation: LoginScreenNavigationProp
}

function Login({navigation}: Props) {
  const intl = useIntl()
  const [showNoBpPassportModal, setShowNoBpPassportModal] = useState(false)

  return (
    <View style={{flex: 1}}>
      <SafeAreaView
        style={[containerStyles.fill, {backgroundColor: colors.white}]}>
        <View
          style={[
            containerStyles.fill,
            containerStyles.centeredContent,
            containerStyles.pageContainer,
          ]}>
          <Image source={bpPassportImage} />
          <View
            style={[
              {
                width: '80%',
              },
            ]}>
            <PageHeader style={{textAlign: 'center'}}>
              <FormattedMessage id="login.title" />
            </PageHeader>
          </View>
        </View>
        <View
          style={[
            {
              margin: 16,
            },
          ]}>
          <Button
            title={intl.formatMessage({id: 'login.primary-button'})}
            onPress={() => {
              navigation.navigate(SCREENS.SCAN_BP_PASSPORT)
            }}
          />
          <View
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 16,
              },
            ]}>
            <Link
              onPress={() => {
                setShowNoBpPassportModal(true)
              }}>
              <FormattedMessage id="login.no-bp-passport" />
            </Link>
          </View>
        </View>
      </SafeAreaView>
      <Modal
        isVisible={showNoBpPassportModal}
        style={{
          alignItems: 'center',
        }}>
        <View
          style={{
            backgroundColor: colors.white100,
            padding: 24,
            width: '80%',
          }}>
          <BodyHeader>
            <FormattedMessage id="login.bp-update-incoming-title" />
          </BodyHeader>
          <BodyText
            style={{marginTop: 16, marginBottom: 32, color: colors.grey1}}>
            <FormattedMessage id="login.bp-update-incoming" />
          </BodyText>
          <Link
            style={{
              textAlign: 'right',
              textTransform: 'uppercase',
              color: colors.blue2,
            }}
            onPress={() => {
              setShowNoBpPassportModal(false)
            }}>
            <FormattedMessage id="general.ok" />
          </Link>
        </View>
      </Modal>
    </View>
  )
}

export default Login
