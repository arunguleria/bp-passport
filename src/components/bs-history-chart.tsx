import React, {useState, useEffect} from 'react'
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native'
import {format, addMonths} from 'date-fns'
import {FormattedMessage} from 'react-intl'
import {
  VictoryChart,
  VictoryTheme,
  VictoryScatter,
  VictoryAxis,
  VictoryTooltip,
} from 'victory-native'

import {
  BloodSugar,
  BLOOD_SUGAR_TYPES,
} from '../redux/blood-sugar/blood-sugar.models'
import {colors, containerStyles} from '../styles'
import {isHighBloodSugar} from '../utils/blood-sugars'
import {BodyText} from './text'
import {DateRange} from '../utils/dates'
import {generateChartData} from '../utils/data-transform'

type Props = {
  bss: BloodSugar[]
}

export const BsHistoryChart = ({bss}: Props) => {
  const [shownSugarType, setShownSugarType] = useState<BLOOD_SUGAR_TYPES>(
    BLOOD_SUGAR_TYPES.RANDOM_BLOOD_SUGAR,
  )
  const [hasRandom, setHasRandom] = useState<boolean>(false)
  const [hasFasting, setHasFasting] = useState<boolean>(false)
  const [hasHemoglobic, setHasHemoglobic] = useState<boolean>(false)

  const [chartData, setChartData] = useState<{
    dates: DateRange[]
    low: DateRange[]
    high: DateRange[]
    min: null | number
    max: null | number
  } | null>(null)

  const averageList = (value: DateRange) => {
    const valuesAccumulator = value.list.reduce(
      (memo: number, current: any) => {
        return (memo += Number(current.blood_sugar_value))
      },
      0,
    )

    return valuesAccumulator / value.list.length
  }

  useEffect(() => {
    setHasRandom(
      !!bss.find((bs) => {
        return (
          bs.blood_sugar_type === BLOOD_SUGAR_TYPES.RANDOM_BLOOD_SUGAR ||
          bs.blood_sugar_type === BLOOD_SUGAR_TYPES.POST_PRANDIAL
        )
      }),
    )

    setHasFasting(
      !!bss.find((bs) => {
        return bs.blood_sugar_type === BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR
      }),
    )

    setHasHemoglobic(
      !!bss.find((bs) => {
        return bs.blood_sugar_type === BLOOD_SUGAR_TYPES.HEMOGLOBIC
      }),
    )
  }, [bss])

  useEffect(() => {
    if (hasRandom) {
      setShownSugarType(BLOOD_SUGAR_TYPES.RANDOM_BLOOD_SUGAR)
    } else if (hasFasting) {
      setShownSugarType(BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR)
    } else {
      setShownSugarType(BLOOD_SUGAR_TYPES.HEMOGLOBIC)
    }
  }, [hasRandom, hasFasting, hasHemoglobic])

  useEffect(() => {
    const filteredValues = bss.filter((bs) => {
      if (shownSugarType === BLOOD_SUGAR_TYPES.HEMOGLOBIC) {
        return bs.blood_sugar_type === BLOOD_SUGAR_TYPES.HEMOGLOBIC
      } else if (shownSugarType === BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR) {
        return bs.blood_sugar_type === BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR
      } else {
        return (
          bs.blood_sugar_type !== BLOOD_SUGAR_TYPES.HEMOGLOBIC &&
          bs.blood_sugar_type !== BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR
        )
      }
    })

    setChartData(
      generateChartData(filteredValues, averageList, (value) => {
        return isHighBloodSugar({
          blood_sugar_value: value,
          blood_sugar_type: shownSugarType,
        } as BloodSugar)
      }),
    )
  }, [bss, shownSugarType])

  const generateScatter = (bss: DateRange[]): any[] => {
    return bss.map((bs: DateRange) => {
      return {x: bs.index, y: bs.averaged, label: bs.averaged}
    })
  }

  const getThreshhold = (): number => {
    switch (shownSugarType) {
      case BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR:
        return 126
      case BLOOD_SUGAR_TYPES.HEMOGLOBIC:
        return 7
      default:
        return 200
    }
  }

  const getMaxDomain = () => {
    const threshhold = getThreshhold()
    const difference = Math.round(threshhold / 10)
    let base = chartData?.max ?? threshhold

    if (base < threshhold) {
      base = threshhold
    }

    return base + difference
  }

  const getMinDomain = () => {
    const threshhold = getThreshhold()
    const difference = Math.round(threshhold / 10)
    let base = chartData?.min ?? threshhold

    if (base > threshhold) {
      base = threshhold
    }

    return base - difference
  }

  if (!chartData) {
    return (
      <View
        style={[
          containerStyles.fill,
          containerStyles.centeredContent,
          {height: 300},
        ]}>
        <ActivityIndicator size="large" color={colors.blue1} />
      </View>
    )
  }

  return (
    <>
      <View style={{flexDirection: 'row'}}>
        {hasRandom && (
          <TouchableWithoutFeedback
            onPress={() => {
              setShownSugarType(BLOOD_SUGAR_TYPES.RANDOM_BLOOD_SUGAR)
              setChartData(null)
            }}>
            <View
              style={[
                styles.pill,
                shownSugarType === BLOOD_SUGAR_TYPES.RANDOM_BLOOD_SUGAR
                  ? styles.pillActive
                  : {},
              ]}>
              <BodyText
                style={{
                  color:
                    shownSugarType === BLOOD_SUGAR_TYPES.RANDOM_BLOOD_SUGAR
                      ? colors.white100
                      : colors.blue2,
                }}>
                <FormattedMessage id="bs.random-blood-code" />/
                <FormattedMessage id="bs.post-prenial-code" />
              </BodyText>
            </View>
          </TouchableWithoutFeedback>
        )}
        {hasFasting && (
          <TouchableWithoutFeedback
            onPress={() => {
              setShownSugarType(BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR)
              setChartData(null)
            }}>
            <View
              style={[
                styles.pill,
                shownSugarType === BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR
                  ? styles.pillActive
                  : {},
              ]}>
              <BodyText
                style={{
                  color:
                    shownSugarType === BLOOD_SUGAR_TYPES.FASTING_BLOOD_SUGAR
                      ? colors.white100
                      : colors.blue2,
                }}>
                <FormattedMessage id="bs.fasting-code" />
              </BodyText>
            </View>
          </TouchableWithoutFeedback>
        )}
        {hasHemoglobic && (
          <TouchableWithoutFeedback
            onPress={() => {
              setShownSugarType(BLOOD_SUGAR_TYPES.HEMOGLOBIC)
              setChartData(null)
            }}>
            <View
              style={[
                styles.pill,
                shownSugarType === BLOOD_SUGAR_TYPES.HEMOGLOBIC
                  ? styles.pillActive
                  : {},
              ]}>
              <BodyText
                style={{
                  color:
                    shownSugarType === BLOOD_SUGAR_TYPES.HEMOGLOBIC
                      ? colors.white100
                      : colors.blue2,
                }}>
                <FormattedMessage id="bs.hemoglobic-code" />
              </BodyText>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
      <View
        style={{
          height: 260,
          borderColor: colors.grey3,
          borderLeftWidth: 1,
          borderTopWidth: 1,
          position: 'relative',
        }}>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            flexDirection: 'row',
            paddingLeft: 6,
          }}>
          {[...Array(chartData.dates.length / 4)].map((value, index) => {
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  flexShrink: 0,
                }}>
                <BodyText
                  style={{
                    color: colors.grey0,
                    fontWeight: '500',
                    fontSize: 14,
                    lineHeight: 18,
                  }}>
                  {format(
                    addMonths(chartData.dates[0].interval.start, index),
                    'MMM',
                  )}
                </BodyText>
                <BodyText
                  style={{
                    color: colors.grey2,
                    fontWeight: '500',
                    fontSize: 14,
                    lineHeight: 18,
                  }}>
                  {format(
                    addMonths(chartData.dates[0].interval.start, index),
                    'yyy',
                  )}
                </BodyText>
              </View>
            )
          })}
          <View style={{width: 12}} />
        </View>
        <VictoryChart
          maxDomain={{
            y: getMaxDomain(),
          }}
          minDomain={{
            y: getMinDomain(),
          }}
          width={Dimensions.get('window').width - 24}
          height={310}
          style={{
            parent: {
              position: 'relative',
              left: -44,
              top: -44,
            },
          }}
          scale={{x: 'linear'}}
          theme={VictoryTheme.material}>
          <VictoryAxis
            tickCount={5}
            tickFormat={(tick) => {
              return format(
                addMonths(chartData.dates[0].interval.start, tick / 4),
                'MMM-yy',
              )
            }}
            tickValues={chartData.dates.map((date, index) => index)}
            style={{
              grid: {stroke: colors.grey3, strokeDasharray: 4},
              axis: {stroke: colors.grey3, opacity: 0},
              ticks: {opacity: 0},
              tickLabels: {opacity: 0},
            }}
          />
          <VictoryAxis
            orientation="left"
            style={{
              axis: {
                strokeWidth: 2,
                stroke: colors.white100,
              },
              tickLabels: {
                opacity: 0,
              },
              ticks: {
                opacity: 0,
              },
              grid: {
                opacity: 0,
              },
            }}
          />
          <VictoryAxis
            orientation="right"
            dependentAxis
            tickFormat={(tick) => {
              if (shownSugarType === BLOOD_SUGAR_TYPES.HEMOGLOBIC) {
                return `${tick}%`
              }
              return tick
            }}
            tickValues={[getThreshhold()]}
            style={{
              grid: {stroke: colors.grey2, strokeDasharray: 4},
              axis: {stroke: colors.grey3, strokeDasharray: 4, strokeWidth: 0},
              ticks: {opacity: 0},
            }}
          />

          <VictoryScatter
            data={generateScatter(chartData.low)}
            size={5}
            style={{
              data: {
                fill: colors.white100,
                stroke: colors.green1,
                strokeWidth: 3,
              },
            }}
            labelComponent={<VictoryTooltip renderInPortal={false} />}
          />
          <VictoryScatter
            data={generateScatter(chartData.high)}
            size={5}
            style={{
              data: {
                fill: colors.white100,
                stroke: colors.red1,
                strokeWidth: 3,
              },
            }}
            labelComponent={<VictoryTooltip renderInPortal={false} />}
          />
        </VictoryChart>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.blue3,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    marginRight: 12,
  },
  pillActive: {
    backgroundColor: colors.blue2,
  },
})
