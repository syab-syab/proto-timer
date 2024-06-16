import React, { useState } from 'react'
import { db } from '../models/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Deadline } from '../models/Deadline'

// const { deadline } = db

const ValidateTest = () => {
  // let validateC: number | any = 0
  const [validate, setValidate] = useState<number | any>(0)

  db.deadline.where("name").equals("外出").count(function (count) {
    setValidate(count)
    console.log(count)
  });


  if (validate) {
    return (
      <p>データ有り</p>
    )
  } else {
    return (
      <p>データ無し</p>
    )
  }
}

export default ValidateTest