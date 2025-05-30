import {useState, useEffect, useRef} from 'react'

const Clock = () => {
  const minutes = new Array(60).fill(null);
  const hours = new Array(12).fill(null);

  const centerRef = useRef(null);

  //in viewport height units
  const clockWidth = 80;
  const clockRadius = clockWidth / 2;

  const dragCircleWidth = 8;

  const minuteMarkLength = 1.5;
  const minuteMarkDistance = clockRadius - minuteMarkLength;

  const minuteNumberDistance = clockRadius + 1 * minuteMarkLength;
  const hourNumberDistance = clockRadius - 6 * minuteMarkLength;

  const secondHandLength = 37.5;    //vh
  const secondHandWidth = 0.5;  //%

  const minuteHandLength = 29;  //vh
  const minuteHandWidth = 2;    //%

  const hourHandLength = 20; //vh
  const hourHandWidth = 4;  //%

  const [isDragging, setIsDragging] = useState(false);

  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);

  const [hourAngle, setHourAngle] = useState(90);
  const [minuteAngle, setMinuteAngle] = useState(90);
  const [secondAngle, setSecondAngle] = useState(90);

  const [centerX, setCenterX] = useState(null);
  const [centerY, setCenterY] = useState(null);

  const [showSecondHand, setShowSecondHand] = useState(true);
  const [showMinuteHand, setShowMinuteHand] = useState(true);

  const [showMinuteExtension, setShowMinuteExtension] = useState(false);
  const [showHourExtension, setShowHourExtension] = useState(false);

  const [minuteMarkersMode, setMinuteMarkersMode] = useState(0);
  const [showMinuteNumbers, setShowMinuteNumbers] = useState(false);

  const [showTime, setShowTime] = useState(true);

  const [militaryTime, setMilitaryTime] = useState(true);

  /**
   * difficulty
   * 0 - hour only
   * 1 - hour + (minutes divisible by 15)
   * 2 - hour + (minutes divisible by 5)
   * 3 - hour + minutes
   * 4 - hour + minutes + seconds
   */
  const [difficulty, setDifficulty] = useState(0);

  const handleKeyDown = (key) => {
    console.log(key);
    switch (key) {
        case 's':
            setShowSecondHand(!showSecondHand);
            break;
        case 'm':
            setShowMinuteHand(!showMinuteHand);
            break;
        case 'M':
            setShowMinuteNumbers(!showMinuteNumbers);
            break;
        case 'e':
            setShowHourExtension(!showHourExtension)
            break;
        case 'E':
            setShowMinuteExtension(!showMinuteExtension);
            break;
        case 't':
            setMinuteMarkersMode((minuteMarkersMode + 1) % 4);
            break;
        case 'T':
            setMinuteMarkersMode((minuteMarkersMode - 1) % 4);
            break;
        case 'f':
            setMilitaryTime(!militaryTime);
            break;
        case ' ':
            setShowTime(!showTime);
            break;
    }
  }

  useEffect(() => {
    updateCenterCoords();

    window.addEventListener('resize', updateCenterCoords);

    return () => {
      window.removeEventListener('resize', updateCenterCoords);
    }
  }, [])

  useEffect(() => {
    //console.log(`dragging ${isDragging}`);
  }, [isDragging])

  useEffect(() => {
    //console.log(second);
    // let newSecondAngle = 90;
    // if (second != 0) {
    //   newSecondAngle
    // }
    setSecondAngle(90 - (second == 0 ? 0 : (second * 6)));
    setMinuteAngle(90 - (minute == 0 ? 0 : (minute * 6)));
    setHourAngle(90 - (hour == 0 ? 0 : (hour * 30)));
  }, [second, minute, hour]);

  const updateCenterCoords = () => {
    const center = centerRef.current.getBoundingClientRect();
    setCenterX(center.x + (center.width / 2));
    setCenterY(center.y + (center.height / 2));
  }

  const moveHands = (e, hand) => {
    const x = e.clientX;
    const y = e.clientY;

    if (x == 0 && y == 0) {
      return;
    }

    const angleOffHorizontal = getAngle(x, y);

    if (angleOffHorizontal == secondAngle) {
      return;
    }
    let delta = 
    ((hand == 'second' ? secondAngle 
    : (hand == 'minute' ? minuteAngle
    : hourAngle))
    - angleOffHorizontal);
    //counter-clockwise
    if (delta > 180) {
      delta -= 360;
    } else if (delta < -180) {
      delta += 360;
    }

    if (hand == 'second') {
      setSecond((second + delta / 6) % 60);
      setMinute((minute + delta / (6 * 60)) % 60);
      setHour((hour + delta / (6 * 3600)) % (militaryTime ? 24 : 12));

    } else if (hand == 'minute') {
      setSecond((second + 10 * delta) % 60);
      setMinute((minute + delta / 6) % 60);
      setHour((hour + delta / (6 * 60)) % (militaryTime ? 24 : 12));

    } else if (hand == 'hour') {
      setSecond((second + 120 * delta) % 60);
      setMinute((minute + 2 * delta) % 60);
      setHour((hour + delta / 30) % (militaryTime ? 24 : 12));

    }
  }

  const getAngle = (x, y) => {
    let angleOffHorizontal = radToDeg(Math.atan2((degToRad(centerY) - degToRad(y)) , degToRad(x - centerX)));
    if (angleOffHorizontal < 0) {
      angleOffHorizontal += 360;
    }

    return angleOffHorizontal;
  }

  const degToRad = (deg) => {
    return deg * Math.PI / 180;
  }

  const radToDeg = (rad) => {
    return rad * 180 / Math.PI;
  }

  const randomizeTime = () => {
    //to-do write function generating time
  }

  return (
    <div 
    className='flex flex-row justify-between pb-[100px] mt-[50px]'>
      <div 
        style={{width:`${clockWidth}vh`, height:`${clockWidth}vh`}} 
        className='flex m-auto w-[80vh] h-[80vh] shrink-0 rounded-[50%] border-10 border-black relative'
        onKeyDown={(e) => {
            handleKeyDown(e.key);
        }}
        tabIndex={0}
      >
        {hours.map((_, i) => 
          <div 
            style={{
              translate: `calc(-50% + ${Math.cos(degToRad(60 - 30 * i)) * hourNumberDistance}vh) calc(-50% - ${Math.sin(degToRad(60 - 30 * i)) * hourNumberDistance}vh)`
            }}
            key={`hour${i}`}
            className='absolute left-[50%] top-[50%] text-[84px] text-center select-none'
          >{i + 1}</div>
        )}

        {minutes.map((_, i) => 
            <div key={`marker${i}`}>
                {/* Markers */}
                {(
                (i % 15 == 0 && minuteMarkersMode < 3)
                || (i % 5 == 0 && minuteMarkersMode < 2)
                || (minuteMarkersMode < 1)
                ) &&
                <div
                    style={{
                    translate: `
                    calc(-50% + ${Math.cos(degToRad(90 - 6 * i)) * minuteMarkDistance * (i % 5 == 0 ? 0.975 : 1)}vh)
                    calc(-50% - ${Math.sin(degToRad(90 - 6 * i)) * minuteMarkDistance * (i % 5 == 0 ? 0.975 : 1)}vh)
                    `,
                    rotate: `${6 * i}deg`,
                    width: `1vh`,
                    height: i % 5 == 0 ? `3vh` : `2vh`,
                    backgroundColor: i % 15 == 0 ? "red" : i % 5 == 0 ? "blue" : "black"
                    }}
                    key={`minute${i}`}
                    className='absolute left-[50%] top-[50%] origin-center bg-black'
                />}
                {/* Numbers */}
                {showMinuteNumbers && <div 
                    style={{
                    translate: `calc(-50% + ${Math.cos(degToRad(84 - 6 * i)) * minuteNumberDistance}vh) calc(-50% - ${Math.sin(degToRad(84 - 6 * i)) * minuteNumberDistance}vh)`
                    }}
                    key={`number${i}`}
                    className='absolute left-[50%] top-[50%] text-[16px] text-center select-none'
                >{i + 1}</div>}
            </div>
        )}
        {/* Hour Hand */}
        <div
        style={{
            width: `${hourHandWidth}%`,
            height: `${hourHandLength}vh`,
            rotate: `calc(90deg - ${hourAngle}deg)`
        }}
        className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-100%] origin-bottom border-2 border-neutral-300 bg-black z-10'>
          <div 
            style={{
            width: `${dragCircleWidth}vh`,
            height: `${dragCircleWidth}vh`,
            translate: `calc(-50% + ${(hourHandWidth * clockWidth / 250)}vh`
            }}
            className='relative mb-auto mt-[-5px] border-2 border-black border-dashed rounded-[50%] opacity-10'
            draggable={true}
            onDragStart={(e) => {
            setIsDragging(true);

            const img = new Image();
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
            e.dataTransfer.setDragImage(img, 0, 0);
            }}
            onDrag={(e) => {
            moveHands(e, 'hour');
            }}
            onDragEnd={() => {
            setIsDragging(false);
            }}
          />
        </div>
        {showHourExtension && <div
        style={{
            width: `${hourHandWidth}%`,
            height: `${clockRadius}vh`,
            rotate: `calc(90deg - ${hourAngle}deg)`
        }}
        className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-100%] origin-bottom border-2 border-neutral-300 bg-black z-10 opacity-25' />}

        {/* Minute Hand */}
        {showMinuteHand && <div 
        style={{
            width: `${minuteHandWidth}%`,
            height: `${minuteHandLength}vh`,
            rotate: `calc(90deg - ${minuteAngle}deg)`
        }}
        className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-100%] origin-bottom border border-neutral-300 bg-black z-20' 
        >
          <div 
            style={{
                width: `${dragCircleWidth}vh`,
                height: `${dragCircleWidth}vh`,
                translate: `calc(-50% + ${minuteHandWidth * clockWidth / 250}vh)`
            }}
            className='relative mb-auto mt-[-3px] border-2 border-black border-dashed rounded-[50%] opacity-10'
            draggable={true}
            onDragStart={(e) => {
                setIsDragging(true);

                const img = new Image();
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
                e.dataTransfer.setDragImage(img, 0, 0);
            }}
            onDrag={(e) => {
                moveHands(e, 'minute');
            }}
            onDragEnd={() => {
                setIsDragging(false);
            }}
        />
        </div>}

        {showMinuteHand && showMinuteExtension && <div 
        style={{
            width: `${minuteHandWidth}%`,
            height: `${clockRadius}vh`,
            rotate: `calc(90deg - ${minuteAngle}deg)`
        }}
        className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-100%] origin-bottom border border-neutral-300 bg-black z-20 opacity-25' 
        />}
        
        {/* Second Hand */}
        {showSecondHand && <div 
        style={{
            width: `${secondHandWidth}%`,
            height: `${secondHandLength}vh`,
            rotate: `calc(90deg - ${secondAngle}deg)`
        }}
        className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-100%] origin-bottom bg-black z-20'>
          <div 
            style={{
                width: `${dragCircleWidth}vh`,
                height: `${dragCircleWidth}vh`,
                translate: `calc(-50% + ${secondHandWidth * clockWidth / 250}vh)`
            }}
            className='relative mb-auto border-2 border-black border-dashed rounded-[50%] opacity-10'
            draggable={true}
            onDragStart={(e) => {
                setIsDragging(true);
                const img = new Image();
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
                e.dataTransfer.setDragImage(img, 0, 0);
            }}
            onDrag={(e) => {
                moveHands(e, 'second');
            }}
            onDragEnd={() => {
                setIsDragging(false);
            }}
          />
        </div>}

        {/* center */}
        <div 
        ref={centerRef}
        className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] border-2 border-black bg-white rounded-[50%] w-[4%] h-[4%] z-50'>
          {/* <div className='absolute text-[72px] text-center'>12</div> */}
        </div>

      </div>

      <div className='mx-auto border-2 border-black w-[350px] h-fit mb-[25px] flex flex-col p-2'> 
        <div 
        style={{
          visibility: showTime ? `visible` : `hidden`
        }}
        className='flex mx-auto items-center'>
            <input type='text' className=' w-[100px] text-[84px]' maxLength={2} value={Math.floor(hour < 1 ? 12 : hour).toString().padStart(2, '0')} onChange={(e) => {
                setHour(e.target.value);
            }} />
            <span className='text-[84px]'>:</span>
            <input type='text' className='text-[84px] w-[100px]' maxLength={2} value={Math.floor(minute).toString().padStart(2, '0')} onChange={(e) => {
                setMinute(e.target.value);
            }} />
            <span className='text-[48px] text-neutral-500'>:</span>
            <input type='text' className='text-[48px] w-[70px] text-neutral-500' maxLength={2} value={Math.floor(second).toString().padStart(2, '0')} onChange={(e) => {
                setSecond(e.target.value);
            }} />
        </div>
          <div>
            <div className="text-2xl">Difficulty</div>
            <div className="flex gap-2 items-center">
              <input type="range" min={0} max={4} value={difficulty} className='w-[100px]'
              onChange={(e) => {
                setDifficulty(e.target.value);
              }}/>
              <span>{difficulty}</span>
              <button 
              onClick={randomizeTime}
              className='border border-black rounded-md outline-none select-none px-1 py-0.5 text-sm bg-white hover:bg-neutral-200 active:bg-neutral-300 duration-100'>Generate</button>
            </div>
          </div>
      </div>
    </div>
  )
}

export default Clock