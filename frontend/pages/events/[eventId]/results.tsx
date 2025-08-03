import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function EventResultsPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const [results, setResults] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (eventId) {
      fetch(`/api/events/${eventId}/availability`)
        .then(res => res.json())
        .then(setResults);
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then(setEvent);
    }
  }, [eventId]);

  // 参加者ごとの選択日を集計（複数日選択対応）
  const participantSelections: { [name: string]: string[] } = {};
  results.forEach(r => {
    if (!r.participantName || !r.availableDate) return; // null/undefinedチェック
    if (!participantSelections[r.participantName]) {
      participantSelections[r.participantName] = [];
    }
    // 重複登録を防ぐ
    if (!participantSelections[r.participantName].includes(r.availableDate)) {
      participantSelections[r.participantName].push(r.availableDate);
    }
  });

  // ユニークな参加者名リスト
  const uniqueParticipants = Object.keys(participantSelections);

  // 候補日ごとに参加可能な参加者を集計
  const dateMap: { [date: string]: string[] } = {};
  (event?.candidateDates || []).forEach((date: string) => {
    dateMap[date] = uniqueParticipants.filter(name => 
      participantSelections[name] && participantSelections[name].includes(date)
    );
  });

  // ソート用配列生成
  const sortedDates = (event?.candidateDates || []).slice().sort((a: string, b: string) => {
    const countA = (dateMap[a] || []).length;
    const countB = (dateMap[b] || []).length;
    return countB - countA;
  });

  // グリッド色分けロジック（修正版）
  const getCellColor = (date: string) => {
    if (!event || !event.candidateDates || uniqueParticipants.length === 0) return "#fff";
    const count = (dateMap[date] || []).length;
    const total = uniqueParticipants.length;
    if (count === 0) return "#fff"; // 参加者なし：白
    if (count === total) return "#388e3c"; // 全員参加可：濃い緑
    return "#a5d6a7"; // 一部参加可：薄い緑
  };

  if (!event) return <div>読み込み中...</div>;

  // 編集権限チェック（現在はダミーユーザーIDで判定）
  const currentUserId = "dummy-user-id";
  const canEdit = event.creatorId === currentUserId;

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: 24, background: "#f5fff5", borderRadius: 12, boxShadow: "0 2px 8px #c8e6c9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>{event.title} の出欠結果</h2>
        {canEdit && (
          <button 
            onClick={() => router.push(`/events/${eventId}/edit`)}
            style={{ 
              padding: "8px 16px", 
              background: "#81c784", 
              color: "#fff", 
              border: "none", 
              borderRadius: 4, 
              cursor: "pointer",
              fontSize: 14
            }}
          >
            イベントを編集
          </button>
        )}
      </div>
      <div>{event.description}</div>
      <div style={{ margin: "16px 0" }}>
        <b>候補日時ごとの参加者</b>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {sortedDates.map((date: string) => {
            const participants = dateMap[date] || [];
            const count = participants.length;
            const total = uniqueParticipants.length;
            const bgColor = getCellColor(date);
            const isDarkGreen = bgColor === "#388e3c";
            const textColor = isDarkGreen ? "#fff" : "#388e3c";
            
            return (
              <div key={date} style={{ background: bgColor, border: "1px solid #a5d6a7", borderRadius: 6, padding: 8 }}>
                <div style={{ fontWeight: "bold", marginBottom: 4, color: textColor }}>{date.replace("T", " ")}</div>
                <div style={{ fontWeight: "bold", color: textColor, marginBottom: 4 }}>
                  {count} / {total} 人参加可
                </div>
                <div style={{ fontSize: 12, color: textColor, lineHeight: 1.3 }}>
                  {participants.length > 0 ? participants.join(", ") : "参加者なし"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
