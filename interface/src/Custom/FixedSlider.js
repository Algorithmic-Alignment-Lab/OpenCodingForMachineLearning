import * as React from 'react';

import "./styles.css"

/**
* Fixed length and width slider.
*/
export default function FixedSlider({name, width, startValue, endValue, defaultValue, updateValue}) {
  let [value, setValue] = React.useState(defaultValue);

  const handleChange = (event) => {
    setValue(parseInt(event.target.value));
    updateValue(parseInt(event.target.value));
  };

  return (
    <div style={{width: width}}>
         <div className="slidecontainer">
            <input type="range" min={startValue} max={endValue} value={value} onChange={handleChange} className="slider" id={name}/>
        </div>
    </div>
  );
}