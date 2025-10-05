type Props = { onStart: () => void };

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="screen center">
      <div className="card" style={{ textAlign: "center" }}>
        <h1 style={{ marginTop: 0 }}>Meteor Analisis Simulator</h1>
        <p>Click to Start</p>
        <button className="btn btn-primary" onClick={onStart}>
          start
        </button>
      </div>
    </div>
  );
}
