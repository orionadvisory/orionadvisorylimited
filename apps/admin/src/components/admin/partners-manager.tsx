"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@orion/ui/components/ui/button";
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";

interface PartnerItem {
  id: string;
  name: string;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50";

const iconBtn =
  "w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors";

export default function PartnersManager({
  initial,
  webUrl,
}: {
  initial: PartnerItem[];
  webUrl: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<PartnerItem[]>(initial);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const logoSrc = (id: string) => `${webUrl}/api/partners/${id}/logo`;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("logo", file);
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add organization");
      setItems((prev) => [...prev, { id: data.id, name: name.trim() }]);
      setName("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add organization");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this organization?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete");
      }
      setItems((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  const reorder = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setBusy(true);
    try {
      await fetch("/api/admin/partners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next.map((p) => p.id) }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-gray-100 p-6 space-y-4"
      >
        <h2 className="text-base font-semibold text-gray-900">
          Add organization
        </h2>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            PNG, SVG, JPG or WebP. Max 3 MB. Only the logo is shown on the site.
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={busy || !name.trim() || !file}
          size="md"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Add organization
        </Button>
      </form>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Organizations ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">
            No organizations yet. Add one above to show it on the landing page.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-3"
              >
                <div className="w-24 h-12 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoSrc(p.id)}
                    alt={p.name}
                    className="max-h-10 max-w-[5.5rem] object-contain"
                  />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                  {p.name}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => reorder(i, -1)}
                    disabled={i === 0 || busy}
                    className={iconBtn}
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(i, 1)}
                    disabled={i === items.length - 1 || busy}
                    className={iconBtn}
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={busy}
                    className={`${iconBtn} text-red-400 hover:text-red-600`}
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
