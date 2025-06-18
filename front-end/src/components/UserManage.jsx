import React from "react"
import Layout from "./Layout"
import Table from "./Table"

const UserManage = () => {
  
  const columns = ["ID","Username", "Name", "Email", "Phone Number", "User Role", "Actions"]
  
  return (
  <Layout>
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-center text-5xl mb-4 text-blue-950 font-bold">Manage Users</h2>
      <div className="mb-4 text-center">
        <label className="block mb-2 text-2xl font-bold text-blue-950">Search User</label>
        <input type="text" className="bg-gray-200 w-1/2 h-10 p-3 rounded-md border border-black text-black"
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
          />
      </div>
    </div>
    <Table columns={columns} />
  </Layout>
  )
}

export default UserManage