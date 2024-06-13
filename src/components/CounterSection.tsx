import React, { useEffect } from 'react'
import { useState } from 'react'
import { db } from '../models/db'
import milliSecEdit from '../functions/milliSecEdit'
import millisecondsTest from '../functions/millisecondsTest'
import { useLiveQuery } from 'dexie-react-hooks'
import { Deadline } from '../models/Deadline'
import dateCreate from '../functions/dateCreate'



const { deadline } = db

const CounterSection = () => {
  // もしかしたら必要の無いstateがあるかも
  // id は自動でインクリメント
  const [name, setName] = useState<string>("")
  // ミリ秒二つ↓も一応文字列で型付け
  // 期限のミリ秒
  const [deadlineSec, setDeadlineSec] = useState<string>("")

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
    // console.log(e)
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
  const deleteDeadline = async (id: number | undefined) => {
    let res = window.confirm('削除しますか？')
    if (res) {
      alert('削除しました')
      deadline.delete(id)
    }
  }

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

  const theEnd = async(id: number | any) => {
    let res = window.confirm('カウントを終わらせますか？')
    if (res) {
      // finishedをtrueにする処理を書く
      await deadline.update(id, {finished: true})
      alert("お疲れさまでした。")
    } else {
      alert("引き続き頑張ってください。")
    }
  }



  // 多分useLiveQuery, deadline, toArray() のどれかが悪さをしてる(あるいはindexedDBの仕様そのもの)
  // 参照(?)をするとエラーが出る
  const allItems: Array<Deadline> | any = useLiveQuery(() => deadline.toArray(), [])
  // 自分で止めない限りカウントは止めない
  // const nonFinishedCount: Array<Deadline> | any = allItems?.filter((item: Deadline | any) => item.finished === false)

  // とりあえず1秒ごとにカウントするよう動かしてみた
  const [current, setCurrent] = useState<number>(Date.now())
  useEffect(() => {
    // セットアップ処理
    const count = setInterval(() => {
      setCurrent(Date.now())
      allItems?.map(async (item: Deadline | any) => {
        if(!(item.achievement) && current > item.deadline) {
          await deadline.update(item.id, {achievement: true})
        } 
      })
    }, 1000)

    // クリーンアップ処理
    // return無しだと挙動がおかしくなるから必要
    return () => clearInterval(count)
  }, [current])


  return (
    <div>
      <p>Counter</p>
      <div>
        <form onSubmit={(e) => addDeadline(e)}>
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
      </div>
      <div className="card white darken-1">
        <div className="card-content">
          {/* 表示するのはfinishedがtrueのものだけ */}
          {allItems?.map((item: Deadline) => (
            <div className="row" key={item.id}>
              <p className="col s10">
                <label>
                  {/* finishedをtrueにしたらもうチェックボックス(カウント終了ボタン)を表示できなくする */}
                  <input
                    type="checkbox"
                    checked={item.finished}
                    className="checkbox-blue"
                    onChange={(e) => toggleStatus(item.id, e)}
                  />
                  {/* {!item.finished && <button>終</button>} */}
                  <span className={`black-tex ${item.finished && 'strike-text'}`}>
                    {item.name} : 
                    期限 | {dateCreate(item.deadline)} : 
                    開始日 | { dateCreate(item.startSec) }
                    {/* {(Date.now() - item.deadline) > 1 && ' : 達成'} */}
                    {item.achievement ? ' : 達成 ' : " : 未達成"}
                  </span>
                  <span>
                  {!item.finished && millisecondsTest(milliSecEdit(current - item.startSec))}
                  </span>
                </label>
              </p>
              {/* 削除ボタンはfinishedがtureにならない限りは押せないようにする */}
              {item.finished && 
                <i
                  onClick={() => deleteDeadline(item.id)}
                  className="col s2 material-icons delete-button"
                >
                  delete
                </i>
              }
            </div>            
          ))}
        </div>
      </div>
    </div>
  )
}

export default CounterSection