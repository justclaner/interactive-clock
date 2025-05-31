import {useState, useEffect, useRef} from 'react'
import Clock from './Clock'
const App = () => {
  return (
    <div>
      <Clock inputHour={3} inputMinute={30} inputSecond={0}/>
    </div>
  )
}

export default App