export async function fetchMeteorNames(): Promise<string[]> {
  const res = await fetch("/api/meteor-names");
  if (!res.ok) throw new Error("Error al cargar nombres");
  return res.json();
}
