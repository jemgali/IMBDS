import React from 'react'

const Contact = ({ contactRef }) => {
  return (
    <>
      <div ref={contactRef} className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md mt-12">
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p className="mb-2">Local Economic and Business Development Office</p>
        <p className="mb-2">City of San Fernando, La Union</p>
        <p className="mb-2"><span className='font-bold'>Email:</span> sample@email.com</p>
        <p className="mb-2"><span className='font-bold'>Phone:</span> (072) 000-0000</p>
      </div>
    </>
  )
}

export default Contact