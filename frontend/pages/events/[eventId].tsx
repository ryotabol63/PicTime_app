import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function EventParticipationPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const [event, setEvent] = useState<any>(null);
  const [participantName, setParticipantName] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (eventId) {
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then(setEvent);
    }
  }, [eventId]);

  const handleToggle = (date: string) => {
    setSelectedDates(selectedDates.includes(date)
      ? selectedDates.filter(d => d !== date)
      : [...selectedDates, date]);
  };

  // 名前のバリデーション
  const validateName = (name: string) => {
    // 半角英数字、漢字、ひらがな、カタカナのみ許可
    const validPattern = /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/;
    if (!name || name.trim() === "") {
      return "名前を入力してください";
    }
    if (!validPattern.test(name)) {
      return "名前は半角英数字、漢字、ひらがな、カタカナのみ使用できます";
    }
    return "";
  };

  // 実際の登録処理
  const performRegistration = async () => {
    for (const date of selectedDates) {
      await fetch(`/api/events/${eventId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName, availableDate: date }),
      });
    }
    setMessage("出欠を登録しました");
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setMessage("");

    // 名前のバリデーション
    const validationError = validateName(participantName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    if (selectedDates.length === 0) {
      setMessage("候補日を1つ以上選択してください");
      return;
    }

    // 重複チェック
    try {
      const res = await fetch(`/api/events/${eventId}/check-participant?name=${encodeURIComponent(participantName)}`);
      const data = await res.json();
      
      if (data.exists) {
        // 重複していた場合はモーダルを表示
        setShowModal(true);
      } else {
        // 重複していない場合は直接登録
        await performRegistration();
      }
    } catch (error) {
      setMessage("エラーが発生しました");
    }
  };

  const handleModalOk = () => {
    performRegistration();
  };

  const handleModalChange = () => {
    setShowModal(false);
    setParticipantName("");
    // selectedDatesは保持される
  };

  if (!event) return <div>読み込み中...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 24, background: "#f5fff5", borderRadius: 12, boxShadow: "0 2px 8px #c8e6c9" }}>
      <h2>{event.title}</h2>
      <div>{event.description}</div>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: "16px 0" }}>
          <b>候補日時</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            {event.candidateDates?.map((date: string) => (
              <button type="button" key={date} onClick={() => handleToggle(date)}
                style={{ background: selectedDates.includes(date) ? "#a5d6a7" : "#fff", border: "1px solid #a5d6a7", borderRadius: 6, padding: 8 }}>
                {date.replace("T", " ")}
              </button>
            ))}
          </div>
        </div>
        <input 
          type="text" 
          placeholder="参加者名（半角英数字、漢字、ひらがな、カタカナのみ）" 
          value={participantName} 
          onChange={e => setParticipantName(e.target.value)} 
          required 
          style={{ 
            width: "100%", 
            marginBottom: 12, 
            padding: 8, 
            borderRadius: 6, 
            border: nameError ? "1px solid #f44336" : "1px solid #a5d6a7" 
          }} 
        />
        {nameError && <div style={{ color: "#f44336", marginBottom: 8, fontSize: 14 }}>{nameError}</div>}
        <button type="submit" style={{ width: "100%", background: "#81c784", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontWeight: "bold" }}>登録</button>
        {message && <div style={{ color: "#388e3c", marginTop: 8 }}>{message}</div>}
      </form>
      <button
        type="button"
        style={{ width: "100%", background: "#388e3c", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontWeight: "bold", marginTop: 16 }}
        onClick={() => router.push(`/events/${eventId}/results`)}
      >
        出欠一覧を確認する
      </button>

      {/* 重複確認モーダル */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
          background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ 
            background: "#fff", borderRadius: 12, padding: 24, 
            minWidth: 320, maxWidth: 400, margin: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)" 
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>確認</h3>
            <p style={{ margin: "0 0 20px 0", lineHeight: 1.5 }}>
              「{participantName}」はすでに登録されている名前ですが、よろしいでしょうか？
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button 
                onClick={handleModalChange}
                style={{ 
                  background: "#fff", color: "#666", border: "1px solid #ddd", 
                  borderRadius: 6, padding: "8px 16px", cursor: "pointer" 
                }}
              >
                変更する
              </button>
              <button 
                onClick={handleModalOk}
                style={{ 
                  background: "#81c784", color: "#fff", border: "none", 
                  borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontWeight: "bold" 
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
