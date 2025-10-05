type Props = { onStart: () => void };

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="screen center">
      <div className="card" style={{ textAlign: "center" }}>
        <h1 style={{ marginTop: 0 }}>Meteor Madness</h1>
        <p>Welcome. Click to begin.</p>
        <button className="btn btn-primary" onClick={onStart}>
          Begin
        </button>
      </div>
    </div>
  );
}
