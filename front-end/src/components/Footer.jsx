import React from 'react'

const Footer = () => {

  const Year = new Date().getFullYear()
  
  return (
    <div className="text-black h w-full flex items-center justify-center">
      @{Year}, City of San Fernando, La Union
    </div>
  )
}

export default Footer
