import React from 'react'
import { useState } from 'react'
import { db } from '../models/db'
import milliSecEdit from '../functions/milliSecEdit'
import millisecondsTest from '../functions/millisecondsTest'
import { useLiveQuery } from 'dexie-react-hooks'
import { Deadline } from '../models/Deadline'
import dateCreate from '../functions/dateCreate'
import Test from './Test'


const { deadline } = db

const CounterSection = () => {
  // もしかしたら必要の無いstateがあるかも
  // id は自動でインクリメント
  const [name, setName] = useState<string>("")
  // ミリ秒二つ↓も一応文字列で型付け
  // 期限のミリ秒
  const [deadlineSec, setDeadlineSec] = useState<string>("")
  // スタート時のミリ秒(このstateは必要無いかも)
  // const [startSec, setStartSec] = useState<string>("")
  // 期限を達成したか否か
  // const [achievement, setAchievement] = useState<boolean>(false)
  // 達成・未達成に関わらずカウントを終えたかどうか
  // const [finished, setFinished] = useState<boolean>(false)

  const nameHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const deadlineHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeadlineSec(e.target.value)
  }

  const addDeadline = async (e: React.FormEvent<HTMLFormElement>) => {
    // デフォルトのリロードを防ぐ(？)
    e.preventDefault()
    
    // スタート時のミリ秒のした三桁を000にする
    const startMilli: number = milliSecEdit(Date.now())
    // setStateが効かない
    // setStartSec(String(tmpStart))
    console.log(startMilli)
    console.log(e)
    console.log(name, (Number(deadlineSec)*60000 + startMilli), startMilli, false, false)
    // finishedがfalseのデータが一つでもあったら追加できないようにする
    await deadline.add({
      name: name,
      deadline: (Number(deadlineSec)*60000 + startMilli),
      startSec: startMilli,
      achievement: false,
      finished: false,
    })
    setName('')
    setDeadlineSec('')
    // setStartSec('')

    alert("カウント開始")
  }

  // 以下の二つは後ほどやる
  // deleteにプライマリーキーを指定して削除できる
  const deleteDeadline = async (id: number | undefined) => deadline.delete(id)

  // finishedの値を変更
  // いずれは終了ボタンを押したらfinishedがtrueになって
  // その後二度と変更できないようにする
  const toggleStatus = async (
    id: number | any,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // updateは更新したいデータのプライマリーキーを第一引数に指定し
    // 第二引数に変更するプロパティとその値を指定する
    await deadline.update( id, {finished: !!e.target.checked })
  }

  // deadlineのミリ秒が現在のミリ秒に追い越されたら
  // 自動的にtrueになり
  // その後は決して変更できないようにする

  const theEnd = ():void => {
    let res = window.confirm('カウントを終わらせますか？')
    if (res) {
      alert("お疲れさまでした。")
    } else {
      alert("引き続き頑張ってください。")
    }
  }

  const allItems: Array<Deadline> | any = useLiveQuery(() => deadline.toArray(), [])
  // const nonFinishedCount: Array<Deadline> | any = allItems?.filter((item: Deadline | any) => item.finished === false)
  // const nonFinishedCount: Array<Deadline> | any = allItems?.find((item: Deadline | any) => item.finished === false)
  // console.log(nonFinishedCount)
  // ↑普通の配列や連想配列にできて当たり前のことをやったらエラーが出る(lengthとか)
  // filterで取得した配列をインデックスで指定するとエラーが出るっぽい
  // console.log(nonFinishedCount[0])
  // ↓をやったらエラーが出てしまう
  // const testSearch: Array<Deadline> | any  = allItems?.filter((item: Deadline | any) => item.finished === false)
  // const tmpAllItems: Array<Deadline> | any  = allItems.concat()
  // const testSearch: Array<Deadline> | any  = tmpAllItems?.filter((item: Deadline | any) => item.finished === false)
  // console.log(deadline.where(finished).equals(false).toArray())

  return (
    <div>
      <p>Counter</p>
      {/* <Test items={allItems}/> */}
      <Test />
      <div>
        {/* <p>{nonFinishedCount}</p> */}
        <form onSubmit={(e) => addDeadline(e)}>
        {/* ↑は本番 */}
        {/* <form onSubmit={addDeadline}> */}
          <label>何を我慢する？</label>
          <input type="text" value={name} onChange={nameHandleChange} required />
          {/* 期限は短いのから試していくこと */}
          {/* <label>何日我慢する？*86400000</label> */}
          {/* <label>何時間我慢する？*3600000</label> */}
          <label>何分我慢する？*60000</label>
          <input type="text" value={deadlineSec} onChange={deadlineHandleChange} />
          <button type='submit'>
            登録
          </button>
        </form>
      </div>
      <div>
        <h1>ここにカウントダウン</h1>
        {/* finishedがfalseのデータを見つけてきて */}
        {/* それを↓にぶち込む */}
        <h2>XX日XX時間XX分XX秒</h2>
        <button onClick={theEnd}>終了</button>
      </div>
      <div className="card white darken-1">
        <div className="card-content">
          {/* 表示するのはfinishedがtrueのものだけ */}
          {allItems?.map((item: Deadline) => (
            <div className="row" key={item.id}>
              <p className="col s10">
                <label>
                  <input
                    type="checkbox"
                    checked={item.finished}
                    className="checkbox-blue"
                    onChange={(e) => toggleStatus(item.id, e)}
                  />
                  <span className={`black-tex ${item.finished && 'strike-text'}`}>
                    {item.name} : 
                    期限 | {dateCreate(item.deadline)} : 
                    カウント | { millisecondsTest(milliSecEdit(Date.now() - item.startSec))}
                  </span>
                </label>
              </p>
              <i
                onClick={() => deleteDeadline(item.id)}
                className="col s2 material-icons delete-button"
              >
                delete
              </i>
            </div>            
          ))}
        </div>
      </div>
    </div>
  )
}

export default CounterSection