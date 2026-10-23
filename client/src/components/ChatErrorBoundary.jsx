import { Component } from "react";

export default class ChatErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Chat view render error:", error);
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="flex min-w-0 flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-6 text-center">
          <h2 className="text-lg font-semibold text-white">This chat could not be loaded</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">A saved message or audio clip was damaged. Clear this character's chat to recover it.</p>
          <button onClick={this.reset} className="mt-5 rounded-xl bg-red-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-red-300">Clear chat and recover</button>
        </div>
      </main>
    );
  }
}
