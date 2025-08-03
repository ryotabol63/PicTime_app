import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/events/new");
    } else {
      setError("ログインに失敗しました");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, background: "#f5fff5", borderRadius: 12, boxShadow: "0 2px 8px #c8e6c9" }}>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", marginBottom: 12, padding: 8, borderRadius: 6, border: "1px solid #a5d6a7" }} />
        <input type="password" placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", marginBottom: 12, padding: 8, borderRadius: 6, border: "1px solid #a5d6a7" }} />
        <button type="submit" style={{ width: "100%", background: "#81c784", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontWeight: "bold" }}>ログイン</button>
        {error && <div style={{ color: "#d32f2f", marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}
