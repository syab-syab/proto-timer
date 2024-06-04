import React from 'react'
import { useEffect, useState } from 'react'
import localSetItem from '../functions/localSetItem'
import millisecondsTest from '../functions/millisecondsTest'

type Props = {
  start: boolean,
  localCountedVal: string | null,
  localCountedKey: string
}

const Timer = (props: Props) => {

  // 経過時間をミリ秒で格納
  // const [time, setTime] = useState<number>(0)
  const [time, setTime] = useState<number>(Number(props.localCountedVal))
  // const [time, setTime] = useState<number>(Number(localStorage.getItem(props.localCountedKey)))
  // 経過したミリ秒の数値をローカル(出来ればindexedDB)に毎秒保存(更新していく)
  // アプリを閉じて再度立ち上げた際に
  // ローカルに保存してあるミリ秒をtimeに代入して
  // 続きをカウントし始める←ここまで出来た

  // 完成形は閉じて再び立ち上げる間の時間も加算してカウントする

  // timeの値をトリガーにして毎秒1000ミリ秒を加算していく
  // 次はここから
  // useEffectのテストとして https://qiita.com/c_hazama/items/59dfc0de28bbf0ae6d31 のコードをパクって
  // 別コンポーネントに切り分けてstartの真偽値で実行をコントロールしてみる
  useEffect(() => {
    // セットアップ処理
    const count = setInterval(() => {
      const tmpTime = time + 1000
      localSetItem(props.localCountedKey, tmpTime.toString())
      setTime(tmpTime)
    }, 1000)
    if (!props.start)  {
      // reset押したら今までカウントした時間をリセットする
      console.log("リセットしました")
      clearInterval(count)
      localSetItem(props.localCountedKey, "0")
      setTime(0)
    }
    // const count = setInterval(() => {
    //   const tmpTime = time + 1000
    //   localStorage.setItem(props.localCountedKey, tmpTime.toString())
    //   setTime(tmpTime)
    // }, 1000)

    // クリーンアップ処理
    // return無しだと挙動がおかしくなるから必要
    return () => clearInterval(count)
    // 依存配列にprops.localKeyとprops.startを追加しないと警告が出る(エラーではない)
  }, [
    time,
    props.localCountedKey,
    props.start
  ])

  return (
    <>
      <h2>setIntervalテスト {millisecondsTest(time)}</h2>
    </>
  )
}

export default Timer