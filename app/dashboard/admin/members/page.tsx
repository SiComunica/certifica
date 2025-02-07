import CommissionInvites from "../components/CommissionInvites"

export default function MembersPage() {
  console.log("Rendering MembersPage")
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Membri Commissione</h1>
      </div>
      
      <CommissionInvites />
      
      <div className="mt-4 text-red-500">
        Test Rendering
      </div>
    </div>
  )
} 