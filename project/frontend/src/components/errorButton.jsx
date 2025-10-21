

export default function ErrorButton() {
  return (
    <button
      onClick={() => {
        throw new Error("This is second first error!");
      }}
    >
      Break the world
    </button>
  );
}