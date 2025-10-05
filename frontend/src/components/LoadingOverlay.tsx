type Props = { text?: string };

export default function LoadingOverlay({ text = "Cargando…" }: Props) {
  return (
    <div className="screen center">
      <div className="card" style={{ textAlign: "center" }}>
        <div className="spinner" />
        <p>{text}</p>
      </div>
    </div>
  );
}
