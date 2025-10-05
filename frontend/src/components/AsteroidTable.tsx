import React, { useEffect, useMemo, useState } from "react";

export type Asteroid = {
  id: number; // no se muestra
  name: string;
  estimated_diameter_km: number;
  is_potentially_hazardous: boolean;
  close_approach_date_full: string;
  velocity_km_s: number;
  miss_distance_km: number;
};

type NasaClosestResponse = {
  range: [string, string];
  count: number;
  asteroids: Asteroid[];
};

type Props = {
  className?: string;
  endpoint?: string;
  postEndpoint?: string;
};

const DEFAULT_GET = "http://192.168.100.32:8000/api/nasa/closest";
const DEFAULT_POST = "http://192.168.100.32:8000/api/nasa/asteroid-selection";

const AsteroidTable: React.FC<Props> = ({
  className,
  endpoint = DEFAULT_GET,
  postEndpoint = DEFAULT_POST,
}) => {
  const [rows, setRows] = useState<Asteroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<number | null>(null);
  const [postMsg, setPostMsg] = useState<string | null>(null);
  const [postErr, setPostErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Asteroid>("close_approach_date_full");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // --- GET de los asteroides ---
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(endpoint, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: NasaClosestResponse = await res.json();
        setRows(json.asteroids ?? []);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message || "Error al cargar datos del backend");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [endpoint]);

  // --- Filtro y ordenamiento ---
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = rows;
    if (q) {
      arr = arr.filter((a) =>
        [a.name, a.close_approach_date_full].some((v) =>
          v.toLowerCase().includes(q)
        )
      );
    }
    const sorted = [...arr].sort((a, b) => {
      const A = a[sortKey] as any;
      const B = b[sortKey] as any;
      if (typeof A === "number" && typeof B === "number")
        return sortDir === "asc" ? A - B : B - A;
      return sortDir === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
    return sorted;
  }, [rows, search, sortKey, sortDir]);

  const setSort = (key: keyof Asteroid) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // --- POST al hacer click en una fila ---
  const handleRowClick = async (a: Asteroid) => {
    setPostingId(a.id);
    setPostMsg(null);
    setPostErr(null);
    try {
      const res = await fetch(postEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, name: a.name }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPostMsg(`Enviado correctamente: ${a.name}`);
    } catch (e: any) {
      setPostErr(e.message || "Error al enviar al backend");
    } finally {
      setPostingId(null);
      setTimeout(() => setPostMsg(null), 2500);
    }
  };

  const fmtNumber = (n: number, digits = 0) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);

  if (loading) return <div>Cargando asteroides…</div>;
  if (error)
    return (
      <div style={{ color: "#b00020" }}>Error: {error}</div>
    );

  return (
    <div className={className}>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o fecha…"
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            flex: 1,
            maxWidth: 360,
          }}
        />
      </div>

      {postMsg && (
        <div style={{ color: "#065f46", background: "#d1fae5", padding: 6, borderRadius: 8, marginBottom: 8 }}>
          {postMsg}
        </div>
      )}
      {postErr && (
        <div style={{ color: "#991b1b", background: "#fee2e2", padding: 6, borderRadius: 8, marginBottom: 8 }}>
          {postErr}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", minWidth: 760, width: "100%" }}>
          <thead>
            <tr>
              <Th onClick={() => setSort("name")} active={sortKey === "name"} dir={sortDir}>Nombre</Th>
              <Th onClick={() => setSort("estimated_diameter_km")} active={sortKey === "estimated_diameter_km"} dir={sortDir}>Diámetro (km)</Th>
              <Th onClick={() => setSort("is_potentially_hazardous")} active={sortKey === "is_potentially_hazardous"} dir={sortDir}>Peligroso</Th>
              <Th onClick={() => setSort("close_approach_date_full")} active={sortKey === "close_approach_date_full"} dir={sortDir}>Fecha de acercamiento</Th>
              <Th onClick={() => setSort("velocity_km_s")} active={sortKey === "velocity_km_s"} dir={sortDir}>Velocidad (km/s)</Th>
              <Th onClick={() => setSort("miss_distance_km")} active={sortKey === "miss_distance_km"} dir={sortDir}>Distancia (km)</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => handleRowClick(a)}
                style={{
                  cursor: postingId ? "wait" : "pointer",
                  background: postingId === a.id ? "#f0f9ff" : undefined,
                }}
              >
                <Td strong>{a.name}</Td>
                <Td>{fmtNumber(a.estimated_diameter_km, 3)}</Td>
                <Td>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                      background: a.is_potentially_hazardous
                        ? "#fee2e2"
                        : "#dcfce7",
                      color: a.is_potentially_hazardous
                        ? "#b91c1c"
                        : "#166534",
                    }}
                  >
                    {a.is_potentially_hazardous ? "Sí" : "No"}
                  </span>
                </Td>
                <Td>{a.close_approach_date_full}</Td>
                <Td>{fmtNumber(a.velocity_km_s, 2)}</Td>
                <Td>{fmtNumber(a.miss_distance_km)}</Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td colSpan={6} align="center">
                  No hay resultados con ese filtro.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thBase: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  borderBottom: "1px solid #eee",
  fontWeight: 600,
  fontSize: 13,
  whiteSpace: "nowrap",
};

const tdBase: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
  fontSize: 14,
  verticalAlign: "middle",
};

const Th: React.FC<{ children: React.ReactNode; onClick?: () => void; active?: boolean; dir?: "asc" | "desc"; }> = ({ children, onClick, active, dir }) => (
  <th
    onClick={onClick}
    style={{
      ...thBase,
      cursor: onClick ? "pointer" : "default",
      userSelect: "none",
    }}
  >
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      {children}
      {active && <span style={{ fontSize: 10 }}>{dir === "asc" ? "▲" : "▼"}</span>}
    </span>
  </th>
);

const Td: React.FC<{ children: React.ReactNode; strong?: boolean; align?: "left" | "right" | "center"; colSpan?: number; }> = ({ children, strong, align = "left", colSpan }) => (
  <td style={{ ...tdBase, fontWeight: strong ? 600 : 400, textAlign: align }} colSpan={colSpan}>
    {children}
  </td>
);

export default AsteroidTable;
