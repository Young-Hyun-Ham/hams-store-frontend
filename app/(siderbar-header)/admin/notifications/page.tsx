// app/admin/notifications/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type NotificationRow = {
  id: string;
  order_id: string;
  user_id: string;
  channel: string;
  title: string;
  body: string;
  send_status: 'queued' | 'sent' | 'failed';
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
};

export default function AdminNotificationsPage() {
  const [orderId, setOrderId] = useState('');
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  async function load() {
    setLoading(true);
    setMsg('');
    try {
      const qs = new URLSearchParams();
      if (orderId.trim()) qs.set('orderId', orderId.trim());
      qs.set('limit', '200');
      const r = await fetch(`${apiBase}/admin/notifications?${qs.toString()}`, {
        cache: 'no-store',
      });
      const j = await r.json();
      setRows(j.notifications || []);
    } catch (e: any) {
      setMsg(e?.message || 'load error');
    } finally {
      setLoading(false);
    }
  }

  async function dispatchNow() {
    setLoading(true);
    setMsg('');
    try {
      const r = await fetch(`${apiBase}/admin/notifications/dispatch?limit=50`, {
        method: 'POST',
      });
      const j = await r.json();
      setMsg(`디스패치 완료: processed=${j.processed}, sent=${j.sent}, failed=${j.failed}`);
      await load();
    } catch (e: any) {
      setMsg(e?.message || 'dispatch error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const badge = (s: NotificationRow['send_status']) => {
    const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';
    if (s === 'sent') return <span className={`${base} bg-green-100 text-green-700`}>SENT</span>;
    if (s === 'failed') return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
    return <span className={`${base} bg-yellow-100 text-yellow-800`}>QUEUED</span>;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">orderId (선택)</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="주문 ID로 필터"
            className="border rounded-md px-3 py-2 w-[360px] max-w-full"
          />
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="rounded-md px-4 py-2 border bg-white hover:bg-gray-50"
        >
          조회
        </button>

        <button
          onClick={dispatchNow}
          disabled={loading}
          className="rounded-md px-4 py-2 bg-black text-white hover:opacity-90"
        >
          queued 발송(디스패치)
        </button>

        {msg ? <div className="text-sm text-gray-700">{msg}</div> : null}
      </div>

      <div className="mt-4 border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3">상태</th>
                <th className="text-left p-3">주문ID</th>
                <th className="text-left p-3">유저ID</th>
                <th className="text-left p-3">제목/내용</th>
                <th className="text-left p-3">생성</th>
                <th className="text-left p-3">발송</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{badge(r.send_status)}</td>
                  <td className="p-3 font-mono text-xs">{r.order_id}</td>
                  <td className="p-3 font-mono text-xs">{r.user_id}</td>
                  <td className="p-3">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-gray-600">{r.body}</div>
                    {r.send_status === 'failed' && r.error_message ? (
                      <div className="mt-1 text-red-700 text-xs whitespace-pre-wrap">
                        {r.error_message}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3 text-gray-600">{r.created_at}</td>
                  <td className="p-3 text-gray-600">{r.sent_at || '-'}</td>
                </tr>
              ))}
              {!rows.length && !loading ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    데이터 없음
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
