
import React from "react"

const Dashboard = () => {

  const Styles: React.CSSProperties =  {
    display: 'flex', 
    flexDirection: 'column',
    gap: '10px',
    height: '100vh', 
    width: '100%', 
    justifyContent:'center', 
    alignItems:'center'
  }

  return (
    <div style={Styles}>
      <p>
        <b>
            Dashboard Service
        </b>
      </p>
    </div>
  )
}

export default Dashboard;