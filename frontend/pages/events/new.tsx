import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface CandidateDate {
  date: string;
  time: string;
  displayTime: string; // 表示用の時間情報
  source: 'bulk' | 'individual'; // 生成元
}

export default function EventCreationPage() {
  const router = useRouter();
  const { edit, eventId } = router.query;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [candidateDates, setCandideDates] = useState<CandidateDate[]>([]);
  const [shareUrl, setShareUrl] = useState("");
  
  // 曜日時間帯一括指定関連の状態
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [bulkTimeSlot, setBulkTimeSlot] = useState("morning");
  const [customStartTime, setCustomStartTime] = useState("09:00");
  const [customEndTime, setCustomEndTime] = useState("17:00");
  const [bulkStartDate, setBulkStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkEndDate, setBulkEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  // カレンダー個別指定関連の状態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [individualTimeType, setIndividualTimeType] = useState("none");
  const [individualStartTime, setIndividualStartTime] = useState("09:00");
  const [individualEndTime, setIndividualEndTime] = useState("17:00");

  // モーダル状態
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [pendingCandidate, setPendingCandidate] = useState<CandidateDate | null>(null);

  // 時間プリセット
  const timePresets = {
    morning: { start: "09:00", end: "12:00", display: "午前" },
    afternoon: { start: "13:00", end: "17:00", display: "午後" },
    allday: { start: "09:00", end: "17:00", display: "終日" }
  };

  // 30分刻みの時間オプション
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  // 日付フォーマット関数
  const formatDate = (date: Date) => {
    // JSTでYYYY-MM-DD
    return date.toLocaleDateString('sv-SE');
  };

  // カレンダーの日付生成
  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const dates = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };
  const calendarDates = generateCalendarDates();

  // 曜日時間帯一括生成
  const generateBulkDates = () => {
    const start = new Date(bulkStartDate);
    const end = new Date(bulkEndDate);
    const generated: CandidateDate[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      if (selectedWeekdays.includes(currentDate.getDay())) {
        let timeValue, displayTime;
        if (bulkTimeSlot === "custom") {
          timeValue = customStartTime;
          displayTime = `${customStartTime}-${customEndTime}`;
        } else {
          const preset = timePresets[bulkTimeSlot as keyof typeof timePresets];
          timeValue = preset.start;
          displayTime = preset.display;
        }
        generated.push({
          date: formatDate(currentDate),
          time: timeValue,
          displayTime: displayTime,
          source: 'bulk'
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // 重複除去
    const existingDates = candidateDates.map(cd => cd.date);
    const filteredGenerated = generated.filter(g => !existingDates.includes(g.date));
    setCandideDates([...candidateDates, ...filteredGenerated]);
  };

  // 個別日付選択
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowTimeModal(false);
  };

  // 個別日付追加
  const addIndividualDate = () => {
    if (!selectedDate) return;
    const dateStr = formatDate(selectedDate);
    let timeValue, displayTime;
    if (individualTimeType === "none") {
      timeValue = "09:00";
      displayTime = "";
    } else if (individualTimeType === "custom") {
      timeValue = individualStartTime;
      displayTime = `${individualStartTime}-${individualEndTime}`;
    } else {
      const preset = timePresets[individualTimeType as keyof typeof timePresets];
      timeValue = preset.start;
      displayTime = preset.display;
    }
    const newCandidate: CandidateDate = {
      date: dateStr,
      time: timeValue,
      displayTime: displayTime,
      source: 'individual'
    };
    // 日付+時間重複チェック
    if (candidateDates.some(cd => cd.date === dateStr && cd.time === timeValue)) {
      alert("この日付・時間は既に追加されています");
      return;
    }
    // 日付だけ重複（時間違い）はモーダル
    if (candidateDates.some(cd => cd.date === dateStr)) {
      setPendingCandidate(newCandidate);
      setShowTimeModal(true);
      return;
    }
    setCandideDates([...candidateDates, newCandidate]);
    setSelectedDate(null);
  };

  // 時間プリセット関数
  const addTimePreset = (presetType: 'morning' | 'afternoon' | 'allday') => {
    if (!selectedDate) return;
    const dateStr = formatDate(selectedDate);
    const preset = timePresets[presetType];
    const newCandidate: CandidateDate = {
      date: dateStr,
      time: preset.start,
      displayTime: preset.display,
      source: 'individual'
    };
    // 日付+時間重複チェック
    if (candidateDates.some(cd => cd.date === dateStr && cd.time === preset.start)) {
      alert("この日付・時間は既に追加されています");
      return;
    }
    // 日付だけ重複（時間違い）はモーダル
    if (candidateDates.some(cd => cd.date === dateStr)) {
      setPendingCandidate(newCandidate);
      setShowTimeModal(true);
      return;
    }
    setCandideDates([...candidateDates, newCandidate]);
    setSelectedDate(null);
  };

  // 候補日削除
  const removeCandidate = (index: number) => {
    setCandideDates(candidateDates.filter((_, i) => i !== index));
  };

  // 候補日をソート（日付昇順）
  const sortedCandidates = [...candidateDates].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 曜日名
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // 月の変更
  const changeMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // フォームリセット関数
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCandideDates([]);
    setShareUrl("");
    setSelectedWeekdays([]);
    setBulkTimeSlot("morning");
    setCustomStartTime("09:00");
    setCustomEndTime("17:00");
    setBulkStartDate(new Date().toISOString().split('T')[0]);
    setBulkEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setCurrentMonth(new Date());
    setSelectedDate(null);
    setIndividualTimeType("none");
    setIndividualStartTime("09:00");
    setIndividualEndTime("17:00");
  };

  useEffect(() => {
    // 編集モード時の初期値取得
    if (edit === "1" && eventId) {
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title || "");
          setDescription(data.description || "");
          // candidateDates: ["YYYY-MM-DDTHH:mm"]
          if (Array.isArray(data.candidateDates)) {
            setCandideDates(
              data.candidateDates.map((dt: string) => {
                const [date, time] = dt.split("T");
                return {
                  date,
                  time: time || "09:00",
                  displayTime: "",
                  source: 'individual'
                };
              })
            );
          }
        });
    } else {
      resetForm();
    }
  }, [edit, eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const creatorId = "dummy-user-id";
    const formattedDates = candidateDates.map(cd => `${cd.date}T${cd.time}`);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, candidateDates: formattedDates, creatorId }),
    });
    if (res.ok) {
      const data = await res.json();
      setShareUrl(data.shareUrl || "");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "2rem auto", padding: 24, background: "#f5fff5", borderRadius: 12, boxShadow: "0 2px 8px #c8e6c9" }}>
      <h2>イベント作成</h2>
      <form onSubmit={handleSubmit}>
        {/* 基本情報 */}
        <div style={{ marginBottom: 24 }}>
          <input type="text" placeholder="イベント名" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: "100%", marginBottom: 12, padding: 8, borderRadius: 6, border: "1px solid #a5d6a7" }} />
          <textarea placeholder="詳細" value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%", marginBottom: 12, padding: 8, borderRadius: 6, border: "1px solid #a5d6a7", minHeight: 80 }} />
        </div>
        {/* 1. 曜日時間帯で一括指定 */}
        <div style={{ marginBottom: 32, padding: 16, border: "2px solid #a5d6a7", borderRadius: 8 }}>
          <h3 style={{ margin: "0 0 16px 0" }}>🔁 曜日時間帯で一括指定</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8 }}>期間設定:</label>
              <input type="date" value={bulkStartDate} onChange={e => setBulkStartDate(e.target.value)} style={{ width: "100%", padding: 4, marginBottom: 8, borderRadius: 4, border: "1px solid #a5d6a7" }} />
              <input type="date" value={bulkEndDate} onChange={e => setBulkEndDate(e.target.value)} style={{ width: "100%", padding: 4, borderRadius: 4, border: "1px solid #a5d6a7" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8 }}>時間帯:</label>
              <select value={bulkTimeSlot} onChange={e => setBulkTimeSlot(e.target.value)} style={{ width: "100%", padding: 4, marginBottom: 8, borderRadius: 4, border: "1px solid #a5d6a7" }}>
                <option value="morning">午前 (9:00-12:00)</option>
                <option value="afternoon">午後 (13:00-17:00)</option>
                <option value="allday">終日 (9:00-17:00)</option>
                <option value="custom">カスタム時間</option>
              </select>
              {bulkTimeSlot === "custom" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={customStartTime} onChange={e => setCustomStartTime(e.target.value)} style={{ flex: 1, padding: 4, borderRadius: 4, border: "1px solid #a5d6a7" }}>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <span>〜</span>
                  <select value={customEndTime} onChange={e => setCustomEndTime(e.target.value)} style={{ flex: 1, padding: 4, borderRadius: 4, border: "1px solid #a5d6a7" }}>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8 }}>曜日選択:</label>
            <div style={{ display: "flex", gap: 8 }}>
              {weekdays.map((day, index) => (
                <label key={index} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedWeekdays.includes(index)} onChange={e => {
                    if (e.target.checked) {
                      setSelectedWeekdays([...selectedWeekdays, index]);
                    } else {
                      setSelectedWeekdays(selectedWeekdays.filter(d => d !== index));
                    }
                  }} style={{ marginRight: 4 }} />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <button type="button" onClick={generateBulkDates} disabled={selectedWeekdays.length === 0} style={{ padding: "8px 16px", background: selectedWeekdays.length > 0 ? "#81c784" : "#ccc", color: "#fff", border: "none", borderRadius: 4, cursor: selectedWeekdays.length > 0 ? "pointer" : "not-allowed" }}>候補日を生成</button>
        </div>
        {/* 2. カレンダーから個別に指定 */}
        <div style={{ marginBottom: 32, padding: 16, border: "2px solid #a5d6a7", borderRadius: 8 }}>
          <h3 style={{ margin: "0 0 16px 0" }}>📅 カレンダーから個別に指定</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button type="button" onClick={() => changeMonth(-1)} style={{ padding: "4px 8px", border: "1px solid #a5d6a7", borderRadius: 4, background: "#fff" }}>←</button>
            <span style={{ fontWeight: "bold" }}>{currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月</span>
            <button type="button" onClick={() => changeMonth(1)} style={{ padding: "4px 8px", border: "1px solid #a5d6a7", borderRadius: 4, background: "#fff" }}>→</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 16 }}>
            {weekdays.map(day => (
              <div key={day} style={{ padding: 8, textAlign: "center", fontWeight: "bold", background: "#e8f5e8" }}>{day}</div>
            ))}
            {calendarDates.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDate && selectedDate.getTime() === date.getTime();
              const isAlreadyAdded = candidateDates.some(cd => cd.date === formatDate(date));
              return (
                <div
                  key={index}
                  style={{
                    padding: 8,
                    textAlign: "center",
                    cursor: isCurrentMonth ? "pointer" : "default",
                    background: isSelected ? "#81c784" : isAlreadyAdded ? "#ffeb3b" : isCurrentMonth ? "#fff" : "#f5f5f5",
                    color: isCurrentMonth ? "#000" : "#999",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    userSelect: "none"
                  }}
                  onClick={() => isCurrentMonth && handleDateClick(date)}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
          {selectedDate && (
            <div style={{ padding: 16, background: "#e8f5e8", borderRadius: 6 }}>
              <div style={{ marginBottom: 12 }}><strong>選択した日付: {formatDate(selectedDate)}</strong></div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 8 }}>時間設定:</label>
                <select value={individualTimeType} onChange={e => setIndividualTimeType(e.target.value)} style={{ width: "100%", padding: 4, marginBottom: 8, borderRadius: 4, border: "1px solid #a5d6a7" }}>
                  <option value="none">時間指定なし</option>
                  <option value="morning">午前 (9:00-12:00)</option>
                  <option value="afternoon">午後 (13:00-17:00)</option>
                  <option value="allday">終日 (9:00-17:00)</option>
                  <option value="custom">カスタム時間</option>
                </select>
                {individualTimeType === "custom" && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <select value={individualStartTime} onChange={e => setIndividualStartTime(e.target.value)} style={{ flex: 1, padding: 4, borderRadius: 4, border: "1px solid #a5d6a7" }}>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <span>〜</span>
                    <select value={individualEndTime} onChange={e => setIndividualEndTime(e.target.value)} style={{ flex: 1, padding: 4, borderRadius: 4, border: "1px solid #a5d6a7" }}>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={addIndividualDate} style={{ padding: "8px 16px", background: "#81c784", color: "#fff", border: "none", borderRadius: 4 }}>候補日に追加</button>
                <button type="button" onClick={() => addTimePreset('morning')} style={{ padding: "6px 12px", background: "#e8f5e8", border: "1px solid #a5d6a7", borderRadius: 4, cursor: "pointer" }}>午前で追加</button>
                <button type="button" onClick={() => addTimePreset('afternoon')} style={{ padding: "6px 12px", background: "#e8f5e8", border: "1px solid #a5d6a7", borderRadius: 4, cursor: "pointer" }}>午後で追加</button>
                <button type="button" onClick={() => addTimePreset('allday')} style={{ padding: "6px 12px", background: "#e8f5e8", border: "1px solid #a5d6a7", borderRadius: 4, cursor: "pointer" }}>終日で追加</button>
              </div>
            </div>
          )}
        </div>
        {/* 3. 候補日一覧 */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px 0" }}>📋 候補日一覧 ({candidateDates.length}件)</h3>
          {candidateDates.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", color: "#666", background: "#f9f9f9", borderRadius: 6 }}>曜日時間帯一括指定またはカレンダー個別指定で候補日を追加してください</div>
          ) : (
            <div style={{ border: "1px solid #a5d6a7", borderRadius: 6 }}>
              {sortedCandidates.map((candidate, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", padding: 12, borderBottom: index < sortedCandidates.length - 1 ? "1px solid #e0e0e0" : "none" }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <strong>{candidate.date}</strong>
                    {candidate.displayTime && (
                      <span style={{ marginLeft: 8, color: "#666" }}>{candidate.displayTime}</span>
                    )}
                  </div>
                  <button type="button" onClick={() => removeCandidate(candidateDates.indexOf(candidate))} style={{ padding: "4px 8px", background: "#f44336", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>削除</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={candidateDates.length === 0} style={{ width: "100%", background: candidateDates.length > 0 ? "#81c784" : "#ccc", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontWeight: "bold", fontSize: 16, cursor: candidateDates.length > 0 ? "pointer" : "not-allowed" }}>イベントを作成 ({candidateDates.length}件の候補日)</button>
      </form>
      {shareUrl && (
        <div style={{ marginTop: 16, padding: 16, background: "#e8f5e8", borderRadius: 6 }}>
          <strong>✅ イベントが作成されました！</strong><br />
          <span>共有URL: </span>
          <a href={shareUrl} style={{ color: "#388e3c", textDecoration: "underline" }}>{shareUrl}</a>
        </div>
      )}

      {/* 時間違い重複時のモーダル */}
      {showTimeModal && pendingCandidate && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", padding: 32, borderRadius: 8, minWidth: 320, boxShadow: "0 2px 8px #888" }}>
            <div style={{ marginBottom: 24 }}>
              <strong>同じ日付で他の時間帯が既に登録されています。<br />この時間帯で追加しますか？</strong>
              <div style={{ marginTop: 12, color: '#388e3c' }}>
                {pendingCandidate.date} {pendingCandidate.displayTime || pendingCandidate.time}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <button
                onClick={() => {
                  setCandideDates([...candidateDates, pendingCandidate]);
                  setShowTimeModal(false);
                  setSelectedDate(null);
                  setPendingCandidate(null);
                }}
                style={{ padding: "8px 24px", background: "#81c784", color: "#fff", border: "none", borderRadius: 4, fontWeight: "bold" }}
              >OK</button>
              <button
                onClick={() => {
                  setShowTimeModal(false);
                  setPendingCandidate(null);
                }}
                style={{ padding: "8px 24px", background: "#f44336", color: "#fff", border: "none", borderRadius: 4, fontWeight: "bold" }}
              >日付を変更する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
