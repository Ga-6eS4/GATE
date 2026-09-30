import { useState, useEffect } from "react";

// Point this at your deployed backend when you go live.
// For local dev, this matches what you've been testing with curl.
const API_BASE_URL = "http://localhost:8000";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("signai_token");

      if (!token) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          setError("You are not authorized to view this page.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-300">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="p-6 text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Registered Users</h1>
      <p className="text-gray-400 mb-4">{users.length} total</p>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2 pr-4">ID</th>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-800">
              <td className="py-2 pr-4">{u.id}</td>
              <td className="py-2 pr-4">{u.name}</td>
              <td className="py-2 pr-4">{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}