type Props = {
  onCustom: () => void;
  onRequests: () => void;
};

export default function MainMenu({ onCustom, onRequests }: Props) {
  return (
    <div className="screen center">
      <div className="card" style={{ textAlign: "center" }}>
        <h2>Selecciona una opción</h2>
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={onCustom}>
            Meteorito personalizado
          </button>
          <button className="btn btn-secondary" onClick={onRequests}>
            Solicitudes de meteoritos
          </button>
        </div>
      </div>
    </div>
  );
}
