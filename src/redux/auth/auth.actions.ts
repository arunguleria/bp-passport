import axios, {AxiosResponse} from 'axios'
import {API_ENDPOINT} from '../../constants/api'
import {AuthActionTypes} from './auth.types'
import {AppThunk} from '../store'

export const setAuthParams = (authParams: AuthParams) => ({
  type: AuthActionTypes.SET_AUTH_PARAMS,
  payload: authParams,
})

export const activate = (
  passportId: string,
): AppThunk<Promise<boolean>> => async () => {
  try {
    await axios.post(`${API_ENDPOINT}/patient/activate`, {
      passport_id: passportId,
    })
    return true
  } catch (err) {
    const response: AxiosResponse | undefined = err.response
    if (response && response.status) {
      if (response.status === 404) {
        throw new Error("Can't verify account")
      }
    }
    throw err
  }
}

export const login = (passportId: string, otp: string): AppThunk => async (
  dispatch,
) => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/patient/login`, {
      passport_id: passportId,
      otp,
    })
    const authParams: AuthParams = response.data?.patient
    if (
      !authParams.id ||
      !authParams.access_token ||
      !authParams.passport ||
      !authParams.passport.id ||
      !authParams.passport.shortcode
    ) {
      throw new Error('Invalid auth data')
    }

    dispatch(setAuthParams(authParams))

    return true
  } catch (err) {
    throw err
  }
}
