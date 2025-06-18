import React from "react"

const Table = ({columns = [], rows = []}) => {
  return (
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right">
        <thead class="text-xs uppercase bg-rose-300">
          <tr>
            {columns.map((col, index) => (
              <th key={index} scope="col" className="px-6 py-3">{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b border-gray-200 hover:bg-rose-200">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table